module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended'
  ],
  parserOptions: { project: null },
  ignorePatterns: [
    '.next/**',
    'node_modules/**',
    'dist/**',
    'coverage/**'
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off'
  }
};
