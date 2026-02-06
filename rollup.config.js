import typescript from '@rollup/plugin-typescript';

export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.esm.js',
      format: 'es'
    },
    plugins: [typescript({ tsconfig: './tsconfig.json' })]
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.cjs',
      format: 'cjs'
    },
    plugins: [typescript({ tsconfig: './tsconfig.json' })]
  }
];
