import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import { fileURLToPath } from 'node:url';

const sourceFiles = [
  'apps/**/*.{ts,tsx,js,jsx,mjs,cjs}',
  'libraries/**/*.{ts,tsx,js,jsx,mjs,cjs}',
];
const reactFiles = [
  'apps/frontend/**/*.{ts,tsx,js,jsx}',
  'apps/extension/**/*.{ts,tsx,js,jsx}',
  'libraries/react-shared-libraries/**/*.{ts,tsx,js,jsx}',
];

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/build/**',
      '**/out/**',
      '**/coverage/**',
      '**/*.d.ts',
    ],
  },
  {
    files: sourceFiles,
    linterOptions: { reportUnusedDisableDirectives: true },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: [
          './tsconfig.check.frontend.json',
          './tsconfig.check.backend.json',
          './tsconfig.check.extension.json',
        ],
        tsconfigRootDir: fileURLToPath(new URL('.', import.meta.url)),
      },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      ...js.configs.recommended.rules,
      ...tsPlugin.configs['eslint-recommended'].overrides[0].rules,
      ...tsPlugin.configs['recommended-type-checked'].rules,
      // TypeScript resolves globals and value/type namespaces without no-undef false positives.
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': [
        'error',
        { ignoreVoid: false },
      ],
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variableLike',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
        },
        { selector: 'typeLike', format: ['PascalCase'] },
        { selector: 'typeParameter', format: ['PascalCase'] },
      ],
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
      'no-duplicate-imports': 'error',
      'no-await-in-loop': 'error',
      'no-async-promise-executor': 'error',
      'no-promise-executor-return': 'error',
      'no-constructor-return': 'error',
      'no-self-compare': 'error',
      'no-template-curly-in-string': 'error',
      'array-callback-return': 'error',
      complexity: ['error', 20],
      'max-depth': ['error', 4],
      'max-params': ['error', 5],
    },
  },
  {
    files: reactFiles,
    plugins: { react, 'react-hooks': reactHooks },
    settings: { react: { version: 'detect' } },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-hooks/exhaustive-deps': 'error',
      'react/jsx-key': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-undef': 'error',
      'react/no-array-index-key': 'error',
      'react/no-direct-mutation-state': 'error',
      'react/no-unstable-nested-components': ['error', { allowAsProps: false }],
      'react/jsx-no-constructed-context-values': 'error',
    },
  },
];
