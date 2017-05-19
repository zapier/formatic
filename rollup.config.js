import babel from 'rollup-plugin-babel';

export default {
  entry: './lib/formatic.js',
  format: 'cjs',
  external: [
    'classnames',
    'deep-equal',
    'object-assign',
    'react',
    'react-addons-css-transition-group',
    'react-addons-update',
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
