import babel from 'rollup-plugin-babel';

export default {
  entry: './lib/formatic.js',
  format: 'cjs',
  external: [
    'classnames',
    'create-react-class',
    'deep-equal',
    'object-assign',
    'react',
    'react-transition-group',
    'immutability-helper',
    'react-dom',
    'react-scroll-lock'
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
