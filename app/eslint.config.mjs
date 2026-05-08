import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginNode from 'eslint-plugin-n';
import eslintPluginImport from 'eslint-plugin-import';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

export default [
  eslint.configs.recommended,
  ...nextCoreWebVitals,
  ...nextTypescript,
  eslintConfigPrettier,
  {
    plugins: {
      n: eslintPluginNode,
      import: eslintPluginImport,
    },
  },
  {
    ignores: ['**/*.js', '**/*.jsx', '**/*.mjs', 'node_modules', '.next', '.react-email', 'prisma/client'],
  },
  {
    files: ['*.ts', '*.tsx'],
  },
  {
    languageOptions: {
      globals: {
        process: 'readonly',
        console: 'readonly',
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-redeclare': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/triple-slash-reference': 'off',
      'import/default': 'off',
      'import/named': 'off',
      'import/no-extraneous-dependencies': 'off',
      'import/no-named-as-default': 'off',
      'import/no-unresolved': 'off',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'unknown'],
          'newlines-between': 'never',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'n/no-extraneous-import': 'off',
      'n/no-missing-import': 'off',
      'n/no-process-exit': 'off',
      'n/no-unsupported-features/node-builtins': 'off',
      'no-else-return': 'error',
      'no-empty': 'off',
      'no-empty-pattern': 'off',
      'no-fallthrough': 'off',
      'no-nested-ternary': 'off',
      'no-process-env': 'off',
      'no-prototype-builtins': 'off',
      'no-unneeded-ternary': 'error',
      'no-unsafe-optional-chaining': 'off',
      'no-warning-comments': 'off',
      'prefer-destructuring': 'off',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'sort-imports': 'off',
      'spaced-comment': ['error', 'always', { markers: ['/'] }],
    },
  },
];
