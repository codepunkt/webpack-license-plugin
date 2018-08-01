const { compact, findLastIndex, map, startsWith } = require('lodash')
const { sep } = require('path')

module.exports = function(modules) {
  return compact(
    map(modules, module => {
      const context = module.context
      const contextArr = context.split(sep)
      const lastIndex = findLastIndex(contextArr, s => s === 'node_modules')

      if (lastIndex === -1) {
        return null
      }

      let name = contextArr[lastIndex + 1]
      let path = contextArr.slice(0, lastIndex + 2).join(sep)

      // scoped package
      if (startsWith(name, '@')) {
        name = `${name}/${contextArr[lastIndex + 2]}`
        path = contextArr.slice(0, lastIndex + 3).join(sep)
      }

      return { name, path }
    }),
  )
}
