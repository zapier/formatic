'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

var tinylr = require('tiny-lr');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

var requireDir = require('require-dir');

var LR_PORT = 32579;
var APP_PORT = 3000;

requireDir('./tasks');

gulp.task('lint', function () {
  return gulp.src(['gulpfile.js', 'lib/**/*.js'])
    .pipe(plugins.eslint())
    .pipe(plugins.eslint.format());
});

gulp.task('server-live', function () {
  var app = express();

  app
    .use(bodyParser())
    .use(tinylr.middleware({ app: app }))
    .listen(LR_PORT, function() {
      console.log('listening on %d', LR_PORT);
    });
});

gulp.task('server-app', function () {
  var app = express();

  app
    .use(bodyParser())
    .use(express.static(path.resolve('./')))
    .listen(APP_PORT, function() {
      console.log('listening on %d', APP_PORT);
    });
});

gulp.task('live', ['watch', 'server-app', 'server-live'], function () {
  var lr = tinylr();
  lr.listen(35729);
  gulp.watch(['index.html', 'formatic-dev.js'], function (evt) {
    lr.changed({
      body: {
        files: [evt.path]
      }
    });
  });
});

gulp.task('watch', ['bundle-watch']);

gulp.task('build', ['build-dev', 'build-prod']);

gulp.task('default', ['build']);
