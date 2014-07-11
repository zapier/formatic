'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

var requireDir = require('require-dir');

requireDir('./tasks');

gulp.task('lint', function () {
  return gulp.src(['gulpfile.js', 'lib/**/*.js'])
    .pipe(plugins.eslint())
    .pipe(plugins.eslint.format());
});

gulp.task('watch', ['bundle-watch']);

gulp.task('build', ['build-dev', 'build-prod']);

gulp.task('live', ['watch', 'server-live-app', 'server-live-reload']);

gulp.task('default', ['build']);
