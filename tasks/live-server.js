'use strict';

var express = require('express');
var tinylr = require('tiny-lr');
var chokidar = require('chokidar');

var LR_PORT = 35729;
var APP_PORT = 3000;

setTimeout(function () {
  var app = express();

  app
    .use(require('connect-livereload')())
    .use('/', express.static('./live'))
    .use('/formatic', express.static('./build-docs'))
    .listen(APP_PORT, function() {
      console.log('app server listening on %d', APP_PORT);
    });

  var lr = tinylr();
  lr.listen(LR_PORT, function () {
    console.log('reload server listening on %d', LR_PORT);
  });

  var watcher = chokidar.watch('./live', {ignored: /live\/bower_components\//});

  watcher.on('ready', function () {
    watcher.on('all', function (event, path) {
      console.log('reloading: ', path);
      lr.changed({
        body: {
          files: [path]
        }
      });
    });
  });
}, 5000);
