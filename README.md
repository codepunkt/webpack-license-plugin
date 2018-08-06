<p align="center"><img title="webpack-license-plugin logo" alt="webpack-license-plugin logo" src="logo.svg" width="600" style="margin-top:20px;"></p>

---

[![npm version](https://badge.fury.io/js/webpack-license-plugin.svg)](https://badge.fury.io/js/webpack-license-plugin) [![CircleCI](https://circleci.com/gh/codepunkt/webpack-license-plugin/tree/master.svg?style=shield)](https://circleci.com/gh/codepunkt/webpack-license-plugin/tree/master) [![Greenkeeper badge](https://badges.greenkeeper.io/codepunkt/webpack-license-plugin.svg)](https://greenkeeper.io/)

Extracts OSS licensing information about the npm packages in your webpack output. The underlying license parsing is done by [license-checker](https://github.com/davglass/license-checker).

## Installation

```bash
npm install --save-dev webpack-license-plugin
```

## Usage

```js
const LicensePlugin = require('webpack-license-plugin')

module.exports = {
  plugins: [new LicensePlugin()],
}
```

This plugin will create a file called `oss-licenses.json` that contains license related information about all of the npm packages in your webpack output.

It will help you:

1. Realize what npm packages your bundle consists of
2. Find out under which licenses these packages are available

## Options

```js
new LicensePlugin(options?: object)
```

|      Name       |                Type                | Description                                                                                                              |
| :-------------: | :--------------------------------: | :----------------------------------------------------------------------------------------------------------------------- |
| **`fileName`**  |              `String`              | Default: `oss-licenses.json`. Path to the output file that will be generated. Relative to the bundle output directory.   |
| **`logLevel`**  | One of `none`, `info` or `verbose` | Default: `info`. Used to control how much details the plugin outputs.                                                    |
| **`overrides`** |          `Object`           | Default: `{}`. Object with licenses to override. Keys have the format `<name>@<version>`, values are valid [spdx license expressions](https://spdx.org/spdx-specification-21-web-version#h.jxpfx0ykyb60). This can be helpful when license information is inconclusive and has been manually checked. |
| **`blacklist`** |          `Array<string>`           | Default: `[]`. Fail (exit with code 1) on the first occurrence of a package with one of the licenses in the given array. |

### Example with custom options

This example has verbose logging output on the terminal, writes the result to a file named `meta/licenses.json` in the output directory, fails whenever it encounters one of the given licenses and overrides the license of the package `fuse.js@3.2.1`.

```js
const LicensePlugin = require('webpack-license-plugin')

module.exports = {
  plugins: [
    new LicensePlugin({
      fileName: 'meta/licenses.json',
      logLevel: 'verbose',
      blacklist: ['GPL', 'AGPL', 'LGPL', 'NGPL'],
      overrides: {
        // has "Apache" in package.json, but Apache-2.0 text in LICENSE file
        'fuse.js@3.2.1': 'Apache-2.0'
      },
    }),
  ],
}
```

## Example file

This is a small example of a resulting file. It lists a license summary and additional details for every npm package that was found to be part of the webpack output:

- package name
- package version
- package author _(if available in the package's meta data)_
- page repository _(if available in the package's meta data)_
- package url on npm registry
- license
- licenseText _(if a `/^licen[cs]e/i` file was found in the package's root)_

```json
{
  "summary": {
    "MIT": 4
  },
  "packages": [
    {
      "name": "fbjs",
      "version": "0.8.17",
      "repository": "https://github.com/facebook/fbjs",
      "source": "https://registry.npmjs.org/fbjs/-/fbjs-0.8.17.tgz",
      "license": "MIT",
      "licenseText": "..."
    },
    {
      "name": "object-assign",
      "version": "4.1.1",
      "author": "Sindre Sorhus",
      "repository": "https://github.com/sindresorhus/object-assign",
      "source": "https://registry.npmjs.org/object-assign/-/object-assign-4.1.1.tgz",
      "license": "MIT",
      "licenseText": "..."
    },
    {
      "name": "react-dom",
      "version": "16.4.2",
      "repository": "https://github.com/facebook/react",
      "source": "https://registry.npmjs.org/react-dom/-/react-dom-16.4.2.tgz",
      "license": "MIT",
      "licenseText": "..."
    },
    {
      "name": "react",
      "version": "16.4.2",
      "repository": "https://github.com/facebook/react",
      "source": "https://registry.npmjs.org/react/-/react-16.4.2.tgz",
      "license": "MIT",
      "licenseText": "..."
    }
  ]
}
```
