var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var portscanner = require('portscanner');
var config = require('./webpack.config');
var open = require('open');

const ipAddress = '127.0.0.1';

portscanner.findAPortNotInUse(3000, 3100, ipAddress, function(portErr, port) {

  config.entry[0] = config.entry[0].replace('3000', port);

  console.log(config.entry);

  var server = new WebpackDevServer(webpack(config), {
    publicPath: config.output.publicPath,
    hot: true,
    historyApiFallback: true
  });

  server.listen(port, ipAddress, function (err) {
    if (err) {
      console.log(err);
    }

    console.log(`Listening at ${ipAddress}:` + port);

    open(`http://${ipAddress}:${port}/demo/index.html`);
  });
});
