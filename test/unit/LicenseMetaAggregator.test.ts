import defaultOptions from '../../src/defaultOptions'
import LicenseMetaAggregator from '../../src/LicenseMetaAggregator'
import IAlertAggregator from '../../src/types/IAlertAggregator'
import ILicenseIdentifier from '../../src/types/ILicenseIdentifier'
import ILicenseTextReader from '../../src/types/ILicenseTextReader'
import IPackageJsonReader from '../../src/types/IPackageJsonReader'

const MockLicenseIdentifier = jest.fn<ILicenseIdentifier>(i => i)
const MockLicenseTextReader = jest.fn<ILicenseTextReader>(i => i)
const MockPackageJsonReader = jest.fn<IPackageJsonReader>(i => i)
const MockAlertAggregator = jest.fn<IAlertAggregator>(i => i)

describe('LicenseMetaAggregator', () => {
  let instance: LicenseMetaAggregator

  beforeEach(() => {
    instance = new LicenseMetaAggregator(
      null,
      null,
      defaultOptions,
      new MockLicenseIdentifier({ identifyLicense: () => 'MIT' }),
      new MockLicenseTextReader({ readLicenseText: () => 'MIT text' }),
      new MockPackageJsonReader({
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
