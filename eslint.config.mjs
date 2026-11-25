import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-config-prettier/flat';
import globals from 'globals';

export default defineConfig([
  globalIgnores([
    '.next/**',
    'out/**',
    'node_modules/**',
    'public/**',
    'playwright-report/**',
    'test-results/**',
    '.lighthouseci/**',
    'next-env.d.ts',
  ]),
  // Next.js (React, hooks, Core Web Vitals) + TypeScript rules
  ...nextVitals,
  ...nextTs,
  // The full jsx-a11y recommended set (Next only enables a handful of its rules).
  // The plugin itself is registered by the Next config above.
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
      // scrollable regions (role="region" + aria-label) must be focusable for keyboard users
      'jsx-a11y/no-noninteractive-tabindex': ['error', { roles: ['tabpanel', 'region'] }],
    },
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  // Node scripts and tests
  {
    files: ['scripts/**/*.mjs', '*.config.{mjs,ts}', 'e2e/**/*.ts'],
    languageOptions: { globals: { ...globals.node } },
  },
  // Formatting is Prettier's job
  prettier,
]);
