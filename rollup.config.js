import babel from 'rollup-plugin-babel';

export default {
  entry: './lib/formatic.js',
  format: 'cjs',
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
    'react-transition-group'
  ],
  plugins: [
    babel({
      babelrc: false,
      presets: [
        ['es2015', {modules: false}],
        ['react']
      ],
      plugins: ['external-helpers']
    }),
  ],
  dest: './build/lib/index.js'
};
