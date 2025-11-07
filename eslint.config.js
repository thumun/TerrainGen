import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier/flat';
import { importX } from 'eslint-plugin-import-x';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const GLOB_EXCLUDE = [
  '**/.nx/**',
  '**/.svelte-kit/**',
  '**/build/**',
  '**/coverage/**',
  '**/dist/**',
  '**/snap/**',
  '**/vite.config.*.timestamp-*.*',
];

const importRules = {
  'import-x/order': [
    'warn',
    {
      alphabetize: { order: 'asc' },
      'newlines-between': 'always',
    },
  ],
};

export default defineConfig([
  {
    name: 'ignores',
    ignores: GLOB_EXCLUDE,
  },
  {
    name: 'javascript',
    files: ['**/*.js'],
    extends: [eslint.configs.recommended, importX.flatConfigs.recommended, prettierConfig],
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
      },
    },
    rules: { ...importRules },
  },
  {
    name: 'javascript/typescript',
    files: ['**/*.{ts,tsx}'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      reactHooks.configs.flat.recommended,
      importX.flatConfigs.recommended,
      importX.flatConfigs.typescript,
      prettierConfig,
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
    rules: { ...importRules },
  },
]);
