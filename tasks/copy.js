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

gulp.task('css-copy', function () {
  return gulp.src(['./style/*.css'])
    .pipe(gulp.dest('./live/style'));
});

gulp.task('css-watch', function () {
  return gulp.watch(['./style/*.css'], ['css-copy']);
});

gulp.task('bower-copy', function () {
  return gulp.src(['./demo/bower_components/**/*.*'])
    .pipe(gulp.dest('./live/bower_components'));
});

gulp.task('copy-watch', ['bower-copy', 'html-watch', 'css-watch']);
