const withCSS = require('@zeit/next-css');

module.exports = withCSS({
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

    return config;
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/formatic' : '',
});
