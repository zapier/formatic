var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var portscanner = require('portscanner');
var config = require('./webpack.config');

var server = new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: true
});

portscanner.findAPortNotInUse(3000, 3100, '127.0.0.1', function(portErr, port) {
  server.listen(port, '127.0.0.1', function (err) {
    if (err) {
      console.log(err);
    }

    console.log('Listening at localhost:' + port);
  });
});
