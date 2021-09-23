module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
    'plugin:import/typescript',  
    'plugin:prettier/recommended'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json'
  },
  plugins: [
    '@typescript-eslint',
    'import'
  ],
  rules: {
    'no-await-in-loop': 'warn',
    'no-restricted-syntax': 'warn',
    'consistent-return': 'warn',
    'array-callback-return': 'warn',
    'no-useless-return': 'off',
    'max-len': [
      'warn',
      {
        code: 200,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreComments: true
      }
    ],
  },
};
