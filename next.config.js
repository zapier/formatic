/* global __dirname */
const withCSS = require('@zeit/next-css');
const webpack = require('webpack');
const path = require('path');
const withCustomBabelConfigFile = require('next-plugin-custom-babel-config');

const assetPrefix = process.env.NODE_ENV === 'production' ? '/formatic' : '';

module.exports = withCustomBabelConfigFile(
  withCSS({
    webpack(config) {
      config.externals = config.externals || {};
      config.externals.fs = 'fs';

      config.module = config.module || {};
      config.module.rules = config.module.rules || [];
      config.module.rules.push({
        test: /\.svg$/,
        use: [
          {
            loader: 'react-svg-loader',
            options: {
              svgo: {
                plugins: [
                  { removeXMLNS: true },
                  { removeDimensions: true },
                  { removeTitle: true },
                ],
              },
            },
          },
        ],
      });

      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env.ASSET_PREFIX': JSON.stringify(assetPrefix),
        })
      );

      config.resolve = config.resolve || {};
      config.resolve.alias = config.resolve.alias || {};
      config.resolve.alias['@'] = __dirname;

      return config;
    },
    assetPrefix,
    babelConfigFile: path.resolve('./babel.config.next.js'),
  })
);
