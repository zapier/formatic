/* global __dirname */
require('es6-promise').polyfill();

const path = require('path');
const webpack = require('webpack');

const publicPath = '/static';

module.exports = {
  devtool: 'source-map',
  entry: [
    'webpack-dev-server/client?http://localhost:3000',
    'webpack/hot/only-dev-server',
    './demo/index.js',
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath,
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        loader: 'eslint-loader',
        include: [path.join(__dirname, 'lib'), path.join(__dirname, 'demo')],
      },
      {
        test: /\.js$/,
        loaders: ['react-hot-loader/webpack', 'babel-loader'],
        include: [path.join(__dirname, 'lib'), path.join(__dirname, 'demo')],
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader?importLoaders=1',
      },
    ],
  },
  devServer: {
    historyApiFallback: true,
    hot: true,
    open: true,
    openPage: 'demo/index.html',
    publicPath,
  },
};
