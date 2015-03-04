'use strict';

var gulp = require('gulp');
var sh = require('shelljs');

gulp.task('clean-docs', function () {
  sh.rm('-rf', './live/formatic/*');
});
