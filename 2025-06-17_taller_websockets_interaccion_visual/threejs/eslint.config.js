module.exports = {
  env: {
    browser: true,
    es2020: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    'no-unused-vars': ['warn', { varsIgnorePattern: '^React$' }],
    'no-console': 'off',
  },
  globals: {
    React: 'readonly',
  },
}
