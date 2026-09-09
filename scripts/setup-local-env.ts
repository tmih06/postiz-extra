import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dir, '..');
const envPath = resolve(root, '.env');

if (existsSync(envPath)) {
  console.log('Keeping existing .env unchanged.');
} else {
  const uploads = resolve(root, 'tmp/uploads');
  const overrides: Record<string, string> = {
    DATABASE_URL:
      'postgresql://postiz-local:postiz-local-pwd@127.0.0.1:15432/postiz-db-local',
    REDIS_URL: 'redis://127.0.0.1:16379',
    JWT_SECRET: randomBytes(48).toString('hex'),
    MAIN_URL: 'http://localhost:4200',
    FRONTEND_URL: 'http://localhost:4200',
    NEXT_PUBLIC_BACKEND_URL: 'http://localhost:3000',
    BACKEND_INTERNAL_URL: 'http://localhost:3000',
    STORAGE_PROVIDER: 'local',
    UPLOAD_DIRECTORY: uploads,
    NEXT_PUBLIC_UPLOAD_STATIC_DIRECTORY: '/uploads',
    NOT_SECURED: 'true',
    TEMPORAL_ADDRESS: '127.0.0.1:17233',
    TEMPORAL_NAMESPACE: 'default',
  };
  const template = readFileSync(resolve(root, '.env.example'), 'utf8');
  const lines = template.split('\n').filter((line) => {
    const key = line.match(/^#?([A-Z][A-Z0-9_]*)=/)?.[1];
    return !key || !(key in overrides);
  });
  const settings = Object.entries(overrides).map(
    ([key, value]) => `${key}=${JSON.stringify(value)}`
  );
  mkdirSync(uploads, { recursive: true });
  // Exclusive creation protects existing credentials even if setup runs twice.
  writeFileSync(envPath, `${lines.join('\n')}\n${settings.join('\n')}\n`, {
    flag: 'wx',
    mode: 0o600,
  });
  console.log('Created private .env for the isolated local Docker stack.');
}
