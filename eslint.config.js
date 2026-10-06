import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  { ignores: ['dist', 'dist-ssr', 'node_modules', 'playwright-report', 'test-results', 'qa-screenshots', 'public', 'src/generated', '.venv', 'content'] },
  {
    files: ['**/*.{js,jsx,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs['recommended-latest'].rules,
      'react-refresh/only-export-components': ['error', { allowConstantExport: true }],
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['src/main.jsx', 'src/entry-server.jsx', 'src/App.jsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  {
    files: ['*.config.js', 'scripts/**/*.mjs', 'scripts/**/*.js', 'e2e/**/*.js', 'src/**/*.test.js'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
  {
    // The service worker template runs in a worker scope.
    files: ['scripts/sw.template.js', 'src/lib/runners/*.worker.js'],
    languageOptions: { globals: { ...globals.serviceworker } },
  },
];
