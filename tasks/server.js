'use strict';

var gulp = require('gulp');
var express = require('express');
var tinylr = require('tiny-lr');
var gaze = require('gaze');
var portscanner = require('portscanner')

var LR_PORT = 35729;
var APP_PORT = 3000;

gulp.task('server-express', ['copy-all-after-bundle', 'copy-docs-all-after-bundle'], function (done) {
  var app = express();

  app
    .use(require('connect-livereload')())
    .use('/', express.static('./live'))
    .use('/formatic', express.static('./build-docs'))
    .listen(APP_PORT, function() {
      console.log('app server listening on %d', APP_PORT);
      done();
    });
});

gulp.task('server-livereload', ['watch'], function (done) {
  var lr = tinylr();
  portscanner.findAPortNotInUse(LR_PORT + 1, LR_PORT + 1000, '127.0.0.1', function(portErr, port) {

    if (portErr) {
      done(portErr);
    }

    lr.listen(port, function () {
      console.log('reload server listening on %d', port);

      gaze([
        './live/*.html', './live/lib/*.js', '.live/style/*.css',
        './live/formatic/*.html', './live/formatic/lib/*.js', './live/formatic/css/*.css'
      ], function (err, watcher) {
        watcher.on('all', function (event, path) {
          console.log('reloading: ', path);
          lr.changed({
            body: {
              files: [path]
            }
          });
        });
        done(err);
      });
    });
  });
});

gulp.task('server-live', ['server-express', 'server-livereload']);
