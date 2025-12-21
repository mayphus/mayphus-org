import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  { ignores: ['build/**', '.cache/**', 'public/**'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,ts,jsx,tsx,mjs}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        URL: 'readonly',
        navigator: 'readonly',
        window: 'readonly',
        document: 'readonly',
        Response: 'readonly',
        Request: 'readonly',
        fetch: 'readonly',
        Headers: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'prefer-const': 'error',
      'no-console': 'off',
      // 'indent': ['error', 2, { SwitchCase: 1 }], // Prettier usually handles indent
    }
  }
];