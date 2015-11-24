'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

gulp.task('bundle-dev', plugins.shell.task(
  'browserify -e index.js -d -s Formatic -o build/formatic-dev.js'
));

gulp.task('bundle-prod', plugins.shell.task([
  'browserify -e index.js -s Formatic',
  'uglifyjs -o build/formatic-min.js'
].join(' | ')));

gulp.task('bundle-docs', plugins.shell.task([
  'browserify -e docs/index.js --ignore-transform=browserify-shim',
  'uglifyjs -o live/formatic/lib/bundle.js'
].join(' | ')));
