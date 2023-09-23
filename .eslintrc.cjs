module.exports = {
  extends: ['@antfu', 'prettier'],
  plugins: ['prettier'],
  ignorePatterns: ['**/*.md', '**/*.json', '**/*.yml'],
  rules: {
    'prettier/prettier': ['error', { semi: false, singleQuote: true }],
  },
}
