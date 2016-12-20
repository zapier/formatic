var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var portscanner = require('portscanner');
var config = require('./webpack.config');

portscanner.findAPortNotInUse(3000, 3100, '127.0.0.1', function(portErr, port) {

  config.entry[0] = config.entry[0].replace('3000', port);

  console.log(config.entry);

  var server = new WebpackDevServer(webpack(config), {
    publicPath: config.output.publicPath,
    hot: true,
    historyApiFallback: true
  });

  server.listen(port, '127.0.0.1', function (err) {
    if (err) {
      console.log(err);
    }

    console.log('Listening at localhost:' + port);
  });
});
