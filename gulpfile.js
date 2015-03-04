'use strict';

var gulp = require('gulp');

var requireDir = require('require-dir');
var plugins = require('gulp-load-plugins')();

requireDir('./tasks');

gulp.task('lint', plugins.shell.task(
  'npm run lint'
));

gulp.task('test', ['lint'], plugins.shell.task(
  'npm run test'
));
