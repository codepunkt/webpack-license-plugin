const { flatten, map, orderBy, uniqBy } = require('lodash')
const getChunkMeta = require('./getChunkMeta')

module.exports = function(compilation) {
  return orderBy(
    uniqBy(
      flatten(
        map(compilation.chunks, chunk =>
          getChunkMeta(chunk.getModules ? chunk.getModules() : chunk.modules)
        )
      ),
      'name'
    ),
    'name'
  )
}
