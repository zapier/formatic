'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var gaze = require('gaze');
var run = require('run-sequence');

gulp.task('watch-bundle', function (done) {
  gaze('build/formatic-dev.js', function (err, watcher) {
    watcher.on('all', function () {
      watcher.close();
      done(err);
    });
  });
  plugins.run('watchify -e index.js -d -s Formatic -x underscore -x react -x react/addons -o build/formatic-dev.js').exec();
});

gulp.task('watch-build', ['watch-bundle'], function () {
  return gulp.watch(['./build/formatic-dev.js'], ['copy-build']);
});

gulp.task('watch-test-run-test-before-watch', ['watch-bundle'], function (done) {
  run('test', done);
});

gulp.task('watch-test', ['watch-test-run-test-before-watch'], function () {
  return gulp.watch(['./build/formatic-dev.js', '__tests__/**/*.js'], ['test']);
});

gulp.task('watch-demo', ['copy-demo'], function () {
  return gulp.watch(['./demo/*.html'], ['copy-demo']);
});

gulp.task('watch-style', ['copy-style'], function () {
  return gulp.watch(['./style/*.css'], ['copy-style']);
});

gulp.task('watch-docs-bundle', function (done) {
  gaze('live/formatic/lib/bundle.js', function (err, watcher) {
    watcher.on('all', function () {
      watcher.close();
      done(err);
    });
  });
  plugins.run('watchify -e docs/index.js -d --ignore-transform=browserify-shim -o live/formatic/lib/bundle.js').exec();
});

gulp.task('watch-docs-build', ['watch-docs-bundle'], function () {
  return gulp.watch(['live/formatic/lib/bundle.js'], ['docs-build-site']);
});

gulp.task('watch', ['watch-bundle', 'watch-docs-build', 'watch-demo', 'watch-style', 'watch-test', 'watch-docs-build']);
