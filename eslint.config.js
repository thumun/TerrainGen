import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import importX from 'eslint-plugin-import-x';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

const GLOB_EXCLUDE = [
  '**/.nx/**',
  '**/.svelte-kit/**',
  '**/build/**',
  '**/coverage/**',
  '**/dist/**',
  '**/snap/**',
  '**/vite.config.*.timestamp-*.*',
];

export default defineConfig([
  {
    name: 'ignores',
    ignores: GLOB_EXCLUDE,
  },
  {
    name: 'javascript/typescript',
    files: ['**/*.{js,ts,tsx}'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      reactHooks.configs.flat.recommended,
      importX.flatConfigs.recommended,
      importX.flatConfigs.typescript,
    ],
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 2020,
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        parser: tseslint.parser,
      },
      globals: {
        ...globals.browser,
      },
    },
    rules: {},
  },
]);
