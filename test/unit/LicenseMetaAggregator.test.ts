import defaultOptions from '../../src/defaultOptions'
import LicenseMetaAggregator from '../../src/LicenseMetaAggregator'
import ILicenseIdentifier from '../../src/types/ILicenseIdentifier'
import ILicenseTextReader from '../../src/types/ILicenseTextReader'
import IPackageJsonReader from '../../src/types/IPackageJsonReader'

const MockLicenseIdentifier = jest.fn<ILicenseIdentifier, any[]>(i => i)
const MockLicenseTextReader = jest.fn<ILicenseTextReader, any[]>(i => i)
const MockPackageJsonReader = jest.fn<IPackageJsonReader, any[]>(i => i)

const mockPackageJsonReader = new MockPackageJsonReader({
  readPackageJson: name => ({
    name,
    version: '16.6.0',
    author: '@iamdevloper',
    repository: { url: 'git@github.com:facebook/react.git' },
  }),
})
const mockLicenseIdentifier = new MockLicenseIdentifier({
  identifyLicense: () => 'MIT',
})
const mockLicenseTextReader = new MockLicenseTextReader({
  readLicenseText: () => 'MIT text',
})

describe('LicenseMetaAggregator', () => {
  let instance: LicenseMetaAggregator

  beforeEach(() => {
    instance = new LicenseMetaAggregator(
      null,
      null,
      defaultOptions,
      mockPackageJsonReader,
      mockLicenseIdentifier,
      mockLicenseTextReader
    )
  })

  describe('aggregateMeta', () => {
    test('returns license meta for the given modules', async () => {
      const meta = await instance.aggregateMeta(['react-dom', 'react'])

      expect(meta).toEqual([
        {
          author: '@iamdevloper',
          license: 'MIT',
          licenseText: 'MIT text',
          name: 'react',
          repository: 'https://github.com/facebook/react',
          source: 'https://registry.npmjs.org/react/-/react-16.6.0.tgz',
          version: '16.6.0',
        },
        {
          author: '@iamdevloper',
          license: 'MIT',
          licenseText: 'MIT text',
          name: 'react-dom',
          repository: 'https://github.com/facebook/react',
          source: 'https://registry.npmjs.org/react-dom/-/react-dom-16.6.0.tgz',
          version: '16.6.0',
        },
      ])
    })

    test('excludes license meta for excluded packages', async () => {
      instance = new LicenseMetaAggregator(
        null,
        null,
        {
          ...defaultOptions,
          excludedPackageTest: (packageName, version) =>
            packageName === 'react-dom' && version === '16.6.0',
        },
        mockPackageJsonReader,
        mockLicenseIdentifier,
        mockLicenseTextReader
      )

      const meta = await instance.aggregateMeta([
        'react',
        'react-dom',
        'styled-components',
      ])

      expect(meta).toEqual([
        expect.objectContaining({
          name: 'react',
        }),
        expect.objectContaining({
          name: 'styled-components',
        }),
      ])
    })

    test('deduplicates package/version identifiers', async () => {
      const meta = await instance.aggregateMeta([
        'react-dom',
        'react',
        'react-dom',
      ])

      expect(meta).toEqual([
        {
          author: '@iamdevloper',
          license: 'MIT',
          licenseText: 'MIT text',
          name: 'react',
          repository: 'https://github.com/facebook/react',
          source: 'https://registry.npmjs.org/react/-/react-16.6.0.tgz',
          version: '16.6.0',
        },
        {
          author: '@iamdevloper',
          license: 'MIT',
          licenseText: 'MIT text',
          name: 'react-dom',
          repository: 'https://github.com/facebook/react',
          source: 'https://registry.npmjs.org/react-dom/-/react-dom-16.6.0.tgz',
          version: '16.6.0',
        },
      ])
    })
  })

  describe('getAuthor', () => {
    test('parses string author', () => {
      expect(instance.getAuthor({ author: 'foo' })).toEqual('foo')
    })

    test('parses object author', () => {
      expect(instance.getAuthor({ author: { name: 'foo' } })).toEqual('foo')
    })

    test('parses object author with email', () => {
      expect(
        instance.getAuthor({ author: { name: 'foo', email: 'bar' } })
      ).toEqual('foo <bar>')
    })

    test('parses object author with url', () => {
      expect(
        instance.getAuthor({ author: { name: 'foo', url: 'baz' } })
      ).toEqual('foo (baz)')
    })

    test('parses object author with url and email', () => {
      expect(
        instance.getAuthor({
          author: { name: 'foo', email: 'bar', url: 'baz' },
        })
      ).toEqual('foo <bar> (baz)')
    })
  })

  describe('getRepository', () => {
    test("returns null repository field doesn't exist", () => {
      expect(instance.getRepository({})).toEqual(null)
      expect(instance.getRepository({ repository: null })).toEqual(null)
    })

    test('parses object author', () => {
      expect(
        instance.getRepository({
          repository: { url: 'git@github.com:facebook/react.git' },
        })
      ).toEqual('https://github.com/facebook/react')
    })
  })
})
