module.exports = {
  root: true,
  env: { node: true, es2022: true },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  parserOptions: { project: null },
  ignorePatterns: [
    'node_modules/**',
    'dist/**',
    'coverage/**'
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off'
  }
};
