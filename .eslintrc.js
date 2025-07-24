module.exports = {
  root: true,
  ignorePatterns: [
    'dist/',
    'node_modules/',
    'coverage/',
    'tests/load/streaming.k6.js',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: [
    '@typescript-eslint',
    'import',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'warn',
    'no-console': 'warn',
    'semi': ['error', 'always'],
    'quotes': ['error', 'single'],
    'curly': 'error',
    'import/order': [
      'warn',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling', 'index'],
          'object',
          'type',
        ],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    'import/no-unresolved': 'error',
    'import/newline-after-import': 'error',
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.spec.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off',
      },
    },
  ],
};
