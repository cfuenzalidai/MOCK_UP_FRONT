import js from '@eslint/js';
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  { ignores: ['dist/**', 'node_modules/**', '.yarn/**', 'coverage/**'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      import: importPlugin,
      'react-refresh': reactRefresh,
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        node: { extensions: ['.js', '.jsx', '.mjs'] },
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,

      // Import resolver
      'import/no-unresolved': ['error', { commonjs: true, caseSensitive: true }],
      'import/extensions': 'off',

      // DX
      'no-irregular-whitespace': 'error',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'react/prop-types': 'off', // usa TS o añade PropTypes más adelante

      // Vite Fast Refresh
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      'max-len': ['error', {
        code: 150,
        tabWidth: 2,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreComments: false,
      }],

      // Airbnb-like style enforcements (camelCase, prefer-const, no-var, etc.)
      'camelcase': ['error', { properties: 'always', ignoreDestructuring: false }],
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      'prefer-template': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'comma-dangle': ['error', 'always-multiline'],
      'quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
      'semi': ['error', 'always'],
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],


    },
  },
  // Silenciar Fast Refresh en archivos no-componentes concretos si molestan
  {
    files: ['src/context/**'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
];
