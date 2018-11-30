import { sep } from 'path'
import getChunkMeta from '../src/getChunkMeta'

describe('getChunkMeta', () => {
  test('returns names and directories of packages contained in the chunks modules', () => {
    const base = ['home', 'codepunkt', 'projects', 'monorepo'].join(sep)
    const modules = [
      [base, 'node_modules', 'package-a', 'dist'].join(sep),
      [base, 'packages', 'client'].join(sep),
      [base, 'packages', 'client', 'src'].join(sep),
      [base, 'node_modules', 'package-b'].join(sep),
      [base, 'node_modules', '@scope', 'package-c', 'dist'].join(sep),
      [base, 'node_modules', '@scope', 'package-d'].join(sep),
      [base, 'node_modules', 'package-e', 'node_modules', 'package-f'].join(
        sep
      ),
    ].map(context => ({ context }))

    expect(getChunkMeta(modules)).toMatchSnapshot()
  })
})
