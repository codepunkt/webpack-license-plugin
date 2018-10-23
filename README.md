<p align="center"><img title="webpack-license-plugin logo" alt="webpack-license-plugin logo" src="https://cdn.rawgit.com/codepunkt/webpack-license-plugin/4dac378d/logo.svg" width="600" style="margin-top:20px;"></p>

---

<div align="center">

[![npm version](https://badge.fury.io/js/webpack-license-plugin.svg)](https://badge.fury.io/js/webpack-license-plugin) [![CircleCI](https://circleci.com/gh/codepunkt/webpack-license-plugin/tree/master.svg?style=shield)](https://circleci.com/gh/codepunkt/webpack-license-plugin/tree/master) [![Coverage Status](https://coveralls.io/repos/github/codepunkt/webpack-license-plugin/badge.svg?branch=master)](https://coveralls.io/github/codepunkt/webpack-license-plugin?branch=master) [![Greenkeeper badge](https://badges.greenkeeper.io/codepunkt/webpack-license-plugin.svg)](https://greenkeeper.io/) [![Contact on Twitter](https://img.shields.io/twitter/follow/code_punkt.svg?style=flat&label=Contact%20on%20Twitter)](https://twitter.com/code_punkt/)

</div>

This plugin extracts OSS licensing information about all of the npm packages in your webpack output.

It will help you

- 📦 discover every npm package used in your output
- 🕵️ find out how it is licensed
- 📈 summarize the number of packages for each license
- ❌ cancel builds that include blacklisted licenses
- 📃 create a customized inventory report or BOM (_bill of materials_) in `json`, `html`, `csv` or other formats

# Installation & Usage

### → Step 1

Install `webpack-license-plugin` as a development dependency to your current project by running this command:

```bash
npm install --save-dev webpack-license-plugin
```

> ⚠️ Make sure run this command in your projects folder (where the `package.json` of your project is)

### → Step 2

Use `webpack-license-plugin` in your webpack configuration by adding it to the `plugins` array.

```js
const LicensePlugin = require('webpack-license-plugin')

module.exports = {
  plugins: [
    // there might be other plugins here
    new LicensePlugin()
  ],
}
```

# Options

Options are given as an `Object` to the first parameter of the `LicensePlugin` constructor:

```js
new LicensePlugin({ outputFilename: 'thirdPartyNotice.json' })
```

The available options are:

|      Name       |                Type                | Description                                                                                                              |
| :------------- | :-------------------------------- | :----------------------------------------------------------------------------------------------------------------------- |
| **`outputFilename`** | `string` | Default: `oss-licenses.json`. Path to the output file that will be generated. Relative to the bundle output directory. |
| **`outputTransform`** | `function` | Default: `null`. When this option is set, the given function is invoked with two parameters: `output` and `addFile`. Transform the `output` string to your desired output and return it so it gets written to `outputFilename`. When you want to add more than a single file to the webpack build output, you can call the `addFile` method with fileName and string contents for every additional file. The `outputTransform` method can be `async` or return a `Promise` that resolves to the file contents. |
| **`logLevel`**  | `none`, `info` or `verbose` | Default: `info`. Used to control how much details the plugin outputs.  |
| **`overrides`** | `object` | Default: `{}`. Object with licenses to override. Keys have the format `<name>@<version>`, values are valid [spdx license expressions](https://spdx.org/spdx-specification-21-web-version#h.jxpfx0ykyb60). This can be helpful when license information is inconclusive and has been manually checked. |
| **`blacklist`** | `string[]` | Default: `[]`. Fail (exit with code 1) on the first occurrence of a package with one of the licenses in the given array. |

### Example with custom options

This example has verbose logging output on the terminal, writes the result to a file named `meta/licenses.json` in the output directory, fails whenever it encounters one of the given licenses and overrides the license of the package `fuse.js@3.2.1`.

```js
const LicensePlugin = require('webpack-license-plugin')

module.exports = {
  // ...
  plugins: [
    new LicensePlugin({
      outputFilename: 'meta/licenses.json',
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

# Default output

When the `outputTransform` option is not set, the output is a `json` file in the webpack build output directory. It consists of a license summary where the amount of packages that are licensed under a specific license is summarized and a package list that lists a few details for every npm package that was found to be part of the webpack output:

| | Name | Description |
| :-- | :------------- | :-------------------------------- |
| 🆔 | **`name`**  | package name |
| 🔢 | **`version`**  | package version |
| 👩 | **`author`** | author listed in `package.json` _(if available)_ |
| 🔗 | **`repository`** | repository url listed in `package.json` _(if available)_ |
| 📦 | **`source`** | package tarball url on npm registry |
| 🕵️ | **`license`** | the license listed in `package.json`. If it's not available or not a valid [spdx license expression](https://spdx.org/spdx-specification-21-web-version#h.jxpfx0ykyb60), additional files such as `LICENSE` or `README` are being looked at in order to parse the license data from them. _(this will be shown with a * next to the name of the license and may require further manual verification)_ |
| 📃 | **`licenseText`** | the license text read from a file matching `/^licen[cs]e/i` in the package's root |

### Example output file
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


# Templated output
When the `outputTransform` option is set, the output shown above is passed into that function as a string and the returned value is written to the `outputFilename`.

This way, the output can be formatted to anything you might need.

### Example: Package list as CSV

```js
const LicensePlugin = require('webpack-license-plugin')

const csvTransform = (output) => {
  const keys = ['name', 'version', 'license']
  const packages = JSON.parse(output).packages

  return [
    '"sep=,"',
    keys.join(','),
    ...packages.map(pckg => keys.map(key => `="${pckg[key]}"`).join(',')),
  ].join('\n')
}

module.exports = {
  // ...
  plugins: [
    new LicensePlugin({
      outputFilename: 'oss-licenses.csv',
      outputTransform: csvTransform
    }),
  ],
}
```

### Example: Package list as HTML and JSON

```html
<!-- template.ejs -->

<table>
  <tr>
    <th>name</th>
    <th>version</th>
    <th>license</th>
  </tr>
  <% packages.forEach(function(package) { %>
    <tr>
      <td><%= package.name %></td>
      <td><%= package.version %></td>
      <td><%= package.license %></td>
    </tr>
  <% }); %>
</table>
```

```js
const ejs = require('ejs')
const LicensePlugin = require('webpack-license-plugin')

module.exports = {
  // ...
  plugins: [
    new LicensePlugin({
      outputFilename: 'oss-licenses.html',
      outputTransform: async (output, addFile) => {
        addFile('oss-licenses.json', output)
        const packages = JSON.parse(output).packages
        return await ejs.renderFile('template.ejs', { packages }, { async: true })
      }
    }),
  ],
}
```

### Your transforms

> 🗨️ Anything is possible. Be sure to let [me](https://twitter.com/code_punkt) and others know what you've built!
