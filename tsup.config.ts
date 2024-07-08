import { defineConfig } from 'tsup'

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  minify: true,
  sourcemap: true,
  splitting: false,
  esbuildOptions: (options) => {
    if (options.format === 'cjs') {
      options.footer = {
        // This ensures publishing this as a CJS library with a default export.
        // @see https://github.com/evanw/esbuild/issues/1182#issuecomment-1011414271
        js: 'module.exports = module.exports.default;',
      }
    }
  },
})
