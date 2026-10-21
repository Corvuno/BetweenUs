import sonarjs from 'eslint-plugin-sonarjs';
import globals from 'globals';
import js from '@eslint/js';

// The app is plain <script> files that share top-level names, loaded in a fixed order
// (see between-us.html). So: sourceType "script", and no-undef / cross-file unused-name
// checks are left to the type check (jsconfig.json), which sees all files together.
export default [
  { ignores: ['node_modules/**', 'tests/**', 'dist/**', 'scripts/**', '**/*.mjs', '.claude/**'] },
  js.configs.recommended,
  sonarjs.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: { ecmaVersion: 2023, sourceType: 'script', globals: { ...globals.browser } },
    rules: {
      'no-undef': 'off',
      // Top-level names shared between the script files are the design, not an accident.
      'sonarjs/no-implicit-global': 'off',
      // Math.random only shuffles cards; nothing security-related.
      'sonarjs/pseudo-random': 'off',
      'no-unused-vars': ['error', { vars: 'local', args: 'none' }],
    },
  },
  { files: ['sw.js'], languageOptions: { globals: { ...globals.serviceworker } } },
  // The question text is data, not logic.
  { files: ['questions.js'], rules: { 'sonarjs/no-duplicate-string': 'off' } },
];
