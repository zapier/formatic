'use strict';

const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();
const run = require('run-sequence');

gulp.task('docs-build-annotated-source', plugins.shell.task(
  'groc index.js "lib/**/*.js" -o ./live/formatic/annotated-source'
));

gulp.task('docs-build-site', plugins.shell.task(
  'node ./scripts/build-docs'
));

gulp.task('docs-build', ['copy-docs-all', 'docs-build-site', 'docs-build-annotated-source', 'bundle-docs']);

gulp.task('docs-gh-pages', ['docs-build'], function () {
  return gulp.src('./live/formatic/**/*')
      .pipe(plugins.ghPages());
});

gulp.task('docs-publish', function (done) {
  run(
    'clean-docs',
    'docs-gh-pages',
    done
  );
});
