import { defineConfig, type Options } from 'tsup'
import { bundleless } from 'tsup-plugin-bundleless'

const commonConfig = (_option: Options): Options => {
  return {
    clean: false,
    sourcemap: false,
    dts: true,
    minify: false,
    external: [/^virtual:.*/, 'react', 'react-dom', 'react-router', 'react-router-dom'],
    shims: true,
    treeshake: true,
    splitting: true,
  }
}

export const tsup = defineConfig((option) => {
  return [
    {
      ...commonConfig(option),
      entry: {
        'node/index': './src/node/index.ts',
      },
      format: ['esm', 'cjs'],
      target: 'node16',
      platform: 'node',
    },
    {
      ...commonConfig(option),
      entry: ['./src/client/**/*.{ts,tsx}'],
      outDir: 'dist/client',
      format: ['esm'],
      platform: 'neutral',
      ...bundleless(),
    },
    {
      ...commonConfig(option),
      entry: ['./src/client/index.ts'],
      outDir: 'dist/client',
      format: ['cjs'],
      platform: 'neutral',
    },
  ]
})
