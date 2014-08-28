'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

gulp.task('html-copy', function () {
  return gulp.src(['./demo/*.html'])
    .pipe(gulp.dest('./live'));
});

gulp.task('html-watch', function () {
  return gulp.watch(['./demo/*.html'], ['html-copy']);
});
