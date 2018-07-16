'use strict';

const gulp = require('gulp');
const sh = require('shelljs');

gulp.task('clean-docs', function() {
  sh.rm('-rf', './live/formatic/*');
});
