'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

gulp.task('build-dev', ['bundle-dev']);

gulp.task('copy-build', ['bundle-prod'], function () {
  return gulp.src(['./build/formatic-min.js'])
    .pipe(plugins.rename(function (path) {
      if (path.basename.indexOf('-min')) {
        path.basename = path.basename.replace('-min', '');
      }
    }))
    .pipe(gulp.dest('./demo/lib'));
});

gulp.task('build-prod', ['bundle-prod', 'copy-build']);
