module.exports = {
  root: true,
  overrides: [
    {
      files: ['e2e-tests/**/*.{ts,tsx}', 'playwright.config.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        warnOnUnsupportedTypeScriptVersion: false,
      },
      env: {
        es2022: true,
        node: true,
      },
    },
  ],
};
