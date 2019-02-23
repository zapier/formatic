import babel from 'rollup-plugin-babel';

const baseConfig = {
  external: [
    'classnames',
    'create-react-class',
    'deep-equal',
    'immutability-helper',
    'object-assign',
    'prop-types',
    'react',
    'react-dom',
    'react-scroll-lock',
    'react-transition-group',
  ],
  plugins: [
    babel({
      babelrc: false,
    }),
  ],
};

export default [
  {
    ...baseConfig,

    input: './src/formatic.cjs.js',

    output: {
      format: 'cjs',
      file: './build/lib/index.cjs.js',
    },
  },
  {
    ...baseConfig,

    input: './src/formatic.js',

    output: {
      format: 'esm',
      file: './build/lib/index.esm.js',
    },
  },
];
