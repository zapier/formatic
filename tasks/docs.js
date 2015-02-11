'use strict'

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

gulp.task('docs-clean', function () {
  return gulp
    .src([ './docs' ], {
      read: false
    })
    .pipe(plugins.clean());
});

gulp.task('annotated-source-build', ['docs-clean'], function () {
  return gulp
    .src([
      'lib/**/*.js', 'README.md', 'examples/*.js', 'examples.md'
    ])
    .pipe(plugins.groc({
        out: './docs/annotated-source'
    }));
});

gulp.task('docs-build', ['annotated-source-build']);

gulp.task('docs-push', ['annotated-source-build'], function () {
  return gulp.src('./docs/**/*')
      .pipe(plugins.ghPages());
});
