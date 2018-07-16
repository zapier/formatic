const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const portscanner = require('portscanner');
const config = require('./webpack.config');
const open = require('open');

const ipAddress = '127.0.0.1';

portscanner.findAPortNotInUse(3000, 3100, ipAddress, function(portErr, port) {
  config.entry[0] = config.entry[0].replace('3000', port);

  const server = new WebpackDevServer(webpack(config), {
    publicPath: config.output.publicPath,
    hot: true,
    historyApiFallback: true,
  });

  server.listen(port, ipAddress, function(err) {
    if (err) {
      console.error(err);
    }

    console.error(`Listening at ${ipAddress}:` + port);

    open(`http://${ipAddress}:${port}/demo/index.html`);
  });
});
