'use strict';

require('6to5/register');

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

var requireDir = require('require-dir');

requireDir('./tasks');

gulp.task('lint', function () {
  return gulp.src(['gulpfile.js', 'lib/**/*.js'])
    .pipe(plugins.eslint())
    .pipe(plugins.eslint.format());
});

gulp.task('test-watch', function () {
  return gulp.watch(['./live/lib/formatic.js', './__tests__/**/*.js'], ['test']);
});

gulp.task('watch', ['bundle-watch', 'test-watch', 'html-watch', 'css-watch']);

gulp.task('build', ['build-dev', 'build-prod', 'build-prod-min']);

gulp.task('live', ['copy-watch', 'watch', 'server-live-app', 'server-live-reload']);

gulp.task('test', ['lint'], plugins.shell.task([
  'npm test'
]));

gulp.task('docs', ['docs-push']);

gulp.task('default', ['build']);
