const babelConfig = require('./babel.config');
require('@babel/register')({
  babelrc: false,
  presets: [['next/babel', { 'preset-env': { modules: 'commonjs' } }]],
  plugins: babelConfig.plugins,
});
require('./server');
