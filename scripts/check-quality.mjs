import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { setPriority } from 'node:os';
import { dirname, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('..', import.meta.url));
const scopes = {
  frontend: [
    'apps/frontend',
    'libraries/react-shared-libraries',
    'libraries/helpers',
  ],
  backend: [
    'apps/backend',
    'apps/orchestrator',
    'apps/commands',
    'apps/sdk',
    'libraries/nestjs-libraries',
    'libraries/helpers',
  ],
  extension: ['apps/extension'],
};
const scope = process.argv[2];
if (
  !['all', 'frontend', 'backend'].includes(scope) ||
  process.argv.length !== 3
) {
  console.error('Usage: node scripts/check-quality.mjs <frontend|backend|all>');
  process.exit(2);
}

// Keep interactive work responsive with lower CPU priority. Checks run sequentially with an 8GB ceiling to protect the system.
const isCI = process.env.CI === 'true' || process.env.CI === '1' || Boolean(process.env.GITHUB_ACTIONS);
if (!isCI) {
  setPriority(0, 10);
}

const selected = scope === 'all' ? Object.keys(scopes) : [scope];
const paths = [...new Set(selected.flatMap((name) => scopes[name]))];
const checks = selected.map((name) => ({
  name: `TypeScript (${name})`,
  package: 'typescript',
  executable: 'bin/tsc',
  args: ['--project', `tsconfig.check.${name}.json`, '--pretty', 'false'],
}));
checks.push(
  {
    name: 'ESLint (zero warnings)',
    package: 'eslint',
    executable: 'bin/eslint.js',
    args: ['--config', 'eslint.config.mjs', '--max-warnings', '0', ...paths],
  },
  {
    name: 'Duplication (zero tolerance, 10 lines / 100 tokens minimum)',
    package: 'jscpd',
    executable: 'bin/jscpd',
    args: ['--config', '.jscpd.json', ...paths],
  }
);

// Run sequentially. Abort on resource failures instead of launching another heavy stage.
const failures = [];
for (const check of checks) {
  console.log(`\n=== ${check.name} ===`);
  try {
    const result = spawnSync(
      process.execPath,
      [
        '--max-old-space-size=8192',
        resolve(
          dirname(require.resolve(`${check.package}/package.json`)),
          check.executable
        ),
        ...check.args,
      ],
      {
        cwd: root,
        stdio: 'inherit',
        env: {
          ...process.env,
          ESLINT_USE_FLAT_CONFIG: 'true',
        },
        // No timeout limit; runs to completion without killing long stages
      }
    );
    if (result.error) console.error(result.error.message);
    if (result.status !== 0) failures.push(check.name);
    if (
      result.error ||
      result.signal ||
      result.status === 134 ||
      result.status === 137
    ) {
      console.error(
        'Checker stopped by a resource limit or signal; remaining stages were not run.'
      );
      break;
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    failures.push(check.name);
  }
}

if (failures.length) {
  console.error(`\nQuality check failed: ${failures.join('; ')}.`);
  process.exitCode = 1;
} else {
  console.log('\nAll quality checks passed.');
}
