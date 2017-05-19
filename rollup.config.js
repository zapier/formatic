import babel from 'rollup-plugin-babel';

export default {
  entry: 'lib/formatic.js',
  format: 'cjs',
  external: [
    'react',
    'react-dom'
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
  dest: 'build/lib/index.js'
};
