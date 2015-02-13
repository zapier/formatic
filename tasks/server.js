'use strict';

var gulp = require('gulp');
var express = require('express');
var tinylr = require('tiny-lr');

var LR_PORT = 35729;
var APP_PORT = 3000;

gulp.task('server-live-app', function (done) {
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

gulp.task('server-live-reload', function (done) {
  var lr = tinylr();
  lr.listen(LR_PORT, function () {
    console.log('reload server listening on %d', LR_PORT);
    done();
  });
  gulp.watch(['live/*.html', 'live/style/*.css', 'live/lib/formatic.js'], function (evt) {

    console.log(evt.path)
    lr.changed({
      body: {
        files: [evt.path]
      }
    });
  });
});
