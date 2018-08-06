const getCompilationMeta = require('../lib/getCompilationMeta')
const { sep } = require('path')

describe('getCompilationMeta', () => {
  test('returns sorted, flattened and unique package meta for all chunks', () => {
    const base = ['home', 'codepunkt', 'projects', 'monorepo'].join(sep)
    const compilation = {
      chunks: [
        {
          modules: [
            [base, 'packages', 'client', 'src'].join(sep),
            [base, 'node_modules', 'package-b'].join(sep),
            [base, 'node_modules', '@scope', 'package-d'].join(sep),
            [base, 'node_modules', '@scope', 'package-c', 'dist'].join(sep),
          ].map(context => ({ context })),
        },
        {
          modules: [
            [base, 'node_modules', 'package-a', 'dist'].join(sep),
            [base, 'packages', 'client'].join(sep),
            [base, 'node_modules', '@scope', 'package-d'].join(sep),
            [
              base,
              'node_modules',
              'package-e',
              'node_modules',
              'package-f',
            ].join(sep),
          ].map(context => ({ context })),
        },
      ],
    }

    expect(getCompilationMeta(compilation)).toEqual([
      {
        name: '@scope/package-c',
        path: [base, 'node_modules', '@scope', 'package-c'].join(sep),
      },
      {
        name: '@scope/package-d',
        path: [base, 'node_modules', '@scope', 'package-d'].join(sep),
      },
      {
        name: 'package-a',
        path: [base, 'node_modules', 'package-a'].join(sep),
      },
      {
        name: 'package-b',
        path: [base, 'node_modules', 'package-b'].join(sep),
      },
      {
        name: 'package-f',
        path: [
          base,
          'node_modules',
          'package-e',
          'node_modules',
          'package-f',
        ].join(sep),
      },
    ])
  })
})
