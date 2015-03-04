'use strict';

var gulp = require('gulp');
var express = require('express');
var tinylr = require('tiny-lr');
var gaze = require('gaze');

var LR_PORT = 35729;
var APP_PORT = 3000;

gulp.task('server-express', ['copy-all', 'copy-docs-all'], function (done) {
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
  lr.listen(LR_PORT, function () {
    console.log('reload server listening on %d', LR_PORT);

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

gulp.task('server-live', ['server-express', 'server-livereload']);
