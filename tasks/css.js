'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

gulp.task('css-copy', function () {
  return gulp.src(['./style/*.css'])
    .pipe(gulp.dest('./live/style'));
});

gulp.task('css-watch', function () {
  return gulp.watch(['./style/*.css'], ['css-copy']);
});
