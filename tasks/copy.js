'use strict';

var gulp = require('gulp');
var sh = require('shelljs');

gulp.task('copy-build', ['mkdir-live'], function () {
  sh.cp('-f', './build/formatic-dev.js', './live/lib');
});

gulp.task('copy-demo', ['mkdir-live'], function () {
  sh.cp('-f', './demo/*.html', './live');
});

gulp.task('copy-style', ['mkdir-live'], function () {
  sh.cp('-rf', './style', './live');
});

gulp.task('copy-all', ['copy-build', 'copy-demo', 'copy-style']);

gulp.task('copy-docs-build', ['mkdir-live-docs'], function () {
  sh.cp('-f', './build/formatic-dev.js', './live/formatic/lib');
});

gulp.task('copy-docs-assets', ['mkdir-live-docs'], function () {
  sh.cp('-rf', './docs/assets/*', './live/formatic');
});

gulp.task('copy-docs-style', ['mkdir-live-docs'], function () {
  sh.cp('-rf', './style/*.css', './live/formatic/css');
});

gulp.task('copy-docs-all', ['copy-docs-assets', 'copy-docs-style', 'copy-docs-assets']);
