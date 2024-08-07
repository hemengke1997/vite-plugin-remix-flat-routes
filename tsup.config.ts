import { defineConfig, type Options } from 'tsup'

const commonConfig = (option: Options): Options => {
  return {
    clean: false,
    sourcemap: !!option.watch,
    dts: true,
    minify: false,
    external: [/^virtual:.*/, 'react', 'react-router-dom'],
    shims: true,
    splitting: true,
    treeshake: true,
  }
}

export const tsup = defineConfig((option) => [
  {
    entry: {
      'node/index': './src/node/index.ts',
    },
    format: ['esm'],
    target: 'node16',
    platform: 'node',
    ...commonConfig(option),
  },
  {
    entry: {
      'node/index': './src/node/index.ts',
    },
    format: ['cjs'],
    target: 'node16',
    platform: 'node',
    ...commonConfig(option),
  },
  {
    entry: {
      'client/index': './src/client/index.ts',
    },
    format: ['esm', 'cjs'],
    platform: 'neutral',
    ...commonConfig(option),
  },
])
