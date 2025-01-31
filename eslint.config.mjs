import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginNode from 'eslint-plugin-n';

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    plugins: {
      n: eslintPluginNode,
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
      'app',
      'docs',
      'helm',
      'site',
      'localdev/ches-mock/build',
      'localdev/keycloak-provision/build',
      'localdev/m365mock/build',
      'localdev/mnt',
      'localdev/nats-provision/build',
      'terraform',
    ],
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
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/prefer-namespace-keyword': 'off',
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
    },
  },
];
