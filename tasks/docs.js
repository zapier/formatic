'use strict'

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

gulp.task('docs-clean', function () {
  return gulp
    .src([ './build-docs' ], {
      read: false
    })
    .pipe(plugins.clean());
});

gulp.task('annotated-source-build', ['docs-clean'], function () {
  return gulp
    .src([
      'index.js',
      'lib/**/*.js'

      // , 'README.md'
      //, 'examples/*.js', 'examples.md'
    ])
    .pipe(plugins.groc({
        out: './build-docs/annotated-source'
    }));
});

gulp.task('docs-build', ['annotated-source-build']);

gulp.task('docs-push', ['annotated-source-build'], function () {
  return gulp.src('./build-docs/**/*')
      .pipe(plugins.ghPages());
});
