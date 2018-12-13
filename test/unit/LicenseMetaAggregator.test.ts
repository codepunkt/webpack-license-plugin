import defaultOptions from '../../src/defaultOptions'
import LicenseMetaAggregator from '../../src/LicenseMetaAggregator'
import ILicenseIdentifier from '../../src/types/ILicenseIdentifier'
import ILicenseTextReader from '../../src/types/ILicenseTextReader'
import IPackageJsonReader from '../../src/types/IPackageJsonReader'

const LicenseIdentifier = jest.fn<ILicenseIdentifier>(() => ({
  identifyLicense: jest.fn().mockImplementation(() => 'MIT'),
}))
const LicenseTextReader = jest.fn<ILicenseTextReader>(() => ({
  readLicenseText: jest.fn().mockImplementation(() => 'MIT text'),
}))
const PackageJsonReader = jest.fn<IPackageJsonReader>(
  ({ readPackageJson }) => ({
    readPackageJson: jest.fn().mockImplementation(readPackageJson),
  })
)

describe('LicenseMetaAggregator', () => {
  let instance: LicenseMetaAggregator

  beforeEach(() => {
    instance = new LicenseMetaAggregator(
      null,
      new LicenseIdentifier(),
      new LicenseTextReader(),
      new PackageJsonReader({
        readPackageJson: name => ({
          name,
          version: '16.6.0',
          author: '@iamdevloper',
          repository: { url: 'git@github.com:facebook/react.git' },
        }),
      })
    )
  })

  describe('aggregateMeta', () => {
    test('returns license meta for the given modules', () => {
      const meta = instance.aggregateMeta(
        ['react-dom', 'react'],
        defaultOptions
      )

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
