# 4.2.0

- added `includePackages` option (thanks to @WIStudent)

# 4.1.4

- provide compatibility starting from Node 12 via package.json `engines` field
  because `yarn` v1 seems to enforce those even on a projects dependencies

# 4.1.3

- got rid of some webpack 5 deprecation warnings
- fixed multiple entry module error [#435](https://github.com/codepunkt/webpack-license-plugin/issues/435)