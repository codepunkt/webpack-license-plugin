module.exports = {
  extends: ['@antfu', 'prettier'],
  plugins: ['prettier'],
  ignorePatterns: ['*.md', '*.yml', '*.yuml'],
  rules: {
    'prettier/prettier': ['error', { semi: false, singleQuote: true }],
  },
}
