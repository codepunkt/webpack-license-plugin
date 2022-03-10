# 4.2.2

- fixed a bug where the plugin was missing omitting dependencies (thanks to [@WIStudent](https://github.com/WIStudent))

# 4.2.1

- collect filenames and licenses from child compilers (thanks to [@WIStudent](https://github.com/WIStudent))

# 4.2.0

- added `includePackages` option (thanks to [@WIStudent](https://github.com/WIStudent))

# 4.1.4

- provide compatibility starting from Node 12 via package.json `engines` field
  because `yarn` v1 seems to enforce those even on a projects dependencies

# 4.1.3

- got rid of some webpack 5 deprecation warnings
- fixed multiple entry module error [#435](https://github.com/codepunkt/webpack-license-plugin/issues/435)
