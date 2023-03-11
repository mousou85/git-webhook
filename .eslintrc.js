module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'import'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    'import/no-unresolved': 'error',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'prefer-const': 0,
    'prettier/prettier': ['error', {endOfLine: 'auto'}],
    '@typescript-eslint/no-inferrable-types': 0,
    '@typescript-eslint/ban-types': 0,
    'import/order': [
      'error',
      {
        alphabetize: {order: 'asc'},
        groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
        pathGroups: [
          {
            pattern: '@app/**/*.ts',
            group: 'internal',
          },
          {
            pattern: '@config/**/*.ts',
            group: 'internal',
          },
          {
            pattern: '@app/**/*.ts',
            group: 'internal',
          },
          {
            pattern: '@db/**/*.ts',
            group: 'internal',
          },
          {
            pattern: '@common/**/*.ts',
            group: 'internal',
          },
        ],
        'newlines-between': 'always',
      },
    ],
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: false,
        project: './tsconfig.json',
      },
    },
  },
};
