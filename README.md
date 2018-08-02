# WebpackLicensePlugin

Extracts OSS license information of the npm packages in your webpack output.

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
new BundleAnalyzerPlugin(options?: object)
```

|      Name      |                Type                | Description                                                                                                            |
| :------------: | :--------------------------------: | :--------------------------------------------------------------------------------------------------------------------- |
| **`fileName`** |              `String`              | Default: `oss-licenses.json`. Path to the output file that will be generated. Relative to the bundle output directory. |
| **`logLevel`** | One of `none`, `info` or `verbose` | Default: `info`. Used to control how much details the plugin outputs.                                                  |

## Example output file

```json
[
  {
    "name": "fbjs",
    "version": "0.8.17",
    "repository": "https://github.com/facebook/fbjs",
    "source": "https://registry.npmjs.org/fbjs/-/fbjs-0.8.17.tgz",
    "license": "MIT",
    "licenseText": "MIT License\n\nCopyright (c) 2013-present, Facebook, Inc.\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n"
  },
  {
    "name": "object-assign",
    "version": "4.1.1",
    "repository": "https://github.com/sindresorhus/object-assign",
    "source": "https://registry.npmjs.org/object-assign/-/object-assign-4.1.1.tgz",
    "license": "MIT",
    "licenseText": "The MIT License (MIT)\n\nCopyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in\nall copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\nTHE SOFTWARE.\n"
  },
  {
    "name": "react-dom",
    "version": "16.4.2",
    "repository": "https://github.com/facebook/react",
    "source": "https://registry.npmjs.org/react-dom/-/react-dom-16.4.2.tgz",
    "license": "MIT",
    "licenseText": "MIT License\n\nCopyright (c) 2013-present, Facebook, Inc.\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.\n"
  },
  {
    "name": "react",
    "version": "16.4.2",
    "repository": "https://github.com/facebook/react",
    "source": "https://registry.npmjs.org/react/-/react-16.4.2.tgz",
    "license": "MIT",
    "licenseText": "MIT License\n\nCopyright (c) 2013-present, Facebook, Inc.\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.\n"
  }
]
```
