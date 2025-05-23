import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginNode from 'eslint-plugin-n';
import eslintPluginUnusedImports from 'eslint-plugin-unused-imports';

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    plugins: {
      n: eslintPluginNode,
      'unused-imports': eslintPluginUnusedImports,
    },
  },
  {
    ignores: [
      '**/*.json',
      '**/*.jsx',
      '**/*.md',
      '**/*.mjs',
      '**/*.tsx',
      '**/*.yml',
      '**/node_modules',
      '.git/',
      '.swc',
      '.vscode',
      'app/.next',
      'app/prisma/client',
      'docs',
      'helm',
      'site',
      'sandbox/ches-mock/build',
      'sandbox/keycloak-provision/build',
      'sandbox/m365mock/build',
      'sandbox/mnt',
      'sandbox/nats-provision/build',
      'terraform',
    ],
  },
  {
    files: ['*.js', '*.ts'],
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
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/prefer-namespace-keyword': 'off',
      'no-fallthrough': 'off',
      'no-prototype-builtins': 'off',
      'no-undef': 'off',
      'no-await-in-loop': 'off',
      'no-console': 'off',
      'no-continue': 'off',
      'no-else-return': 'error',
      'no-empty': 'off',
      'no-loop-func': 'off',
      'no-plusplus': 'off',
      'no-restricted-syntax': 'off',
      'no-underscore-dangle': 'off',
      'no-unneeded-ternary': 'error',
      'no-warning-comments': 'off',
      'prefer-destructuring': 'off',
      'sort-imports': 'off',
      'spaced-comment': ['error', 'always', { markers: ['/'] }],
      'unused-imports/no-unused-imports': 'error',
      'no-unused-vars': 'off',
    },
  },
];
