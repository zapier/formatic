require('es6-promise').polyfill();

var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'source-map',
  entry: [
    'webpack-dev-server/client?http://localhost:3000',
    'webpack/hot/only-dev-server',
    './demo/index.js'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['react-hot-loader/webpack', 'babel-loader'],
      include: [path.join(__dirname, 'lib'), path.join(__dirname, 'demo')]
    }, {
      test: /\.css$/,
      loader: 'style-loader!css-loader?importLoaders=1'
    }],

    preLoaders: [
      {
        test: /\.js$/,
        loader: 'eslint-loader',
        include: [path.join(__dirname, 'lib'), path.join(__dirname, 'demo')]
      }
    ]
  }
};
