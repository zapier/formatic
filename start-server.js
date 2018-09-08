require('@babel/register')({
  babelrc: false,
  presets: [['next/babel', { 'preset-env': { modules: 'commonjs' } }]],
});
require('./server');
