'use strict';

var gulp = require('gulp');
var sh = require('shelljs');

gulp.task('mkdir-live', function () {
  sh.mkdir('-p', './live/lib');
});

gulp.task('mkdir-live-docs', function () {
  sh.mkdir('-p', './live/formatic/lib');
  sh.mkdir('-p', './live/formatic/css');
});
