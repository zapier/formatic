module.exports = {
  webpack(config) {
    config.externals = config.externals || {};
    config.externals.fs = 'fs';
    return config;
  },
};
