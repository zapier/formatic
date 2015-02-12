'use strict'

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var browserify = require('browserify');
var source = require('vinyl-source-stream');

gulp.task('docs-clean', function () {
  return gulp
    .src([ './build-docs' ], {
      read: false
    })
    .pipe(plugins.clean());
});

gulp.task('docs-copy', ['docs-clean'], function () {
  return gulp.src(['./docs/assets/**/*.*'])
    .pipe(gulp.dest('./build-docs'));
});

gulp.task('docs-bundle', ['docs-clean'], function () {
  return browserify({entries: ['./docs/index.js'], ignoreTransform: ['browserify-shim']})
    .add('./docs/index.js')
    .require('./docs/index.js')
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./build-docs/lib'));
});

gulp.task('docs-annotated-source-build', ['docs-clean', 'docs-copy'], function () {
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

var RootClass = require('../docs/components/root');

var DOCTYPE = '<!doctype html>';

Object.keys(RootClass.pages).forEach(function (name) {
  var page = RootClass.pages[name];
  gulp.task('docs-site:' + name, ['docs-clean', 'docs-copy', 'docs-bundle'], function () {
    var html = RootClass.renderToString(name);
    return plugins.file(page.filename, DOCTYPE + '\n' + html, {src: true})
      .pipe(gulp.dest('./build-docs'));
  });
});

var pageTasks = Object.keys(RootClass.pages).map(function (name) {
  return 'docs-site:' + name;
});

gulp.task('docs-site', pageTasks);

gulp.task('docs-build', ['docs-site', 'docs-annotated-source-build']);

gulp.task('docs-push', ['docs-build'], function () {
  return gulp.src('./build-docs/**/*')
      .pipe(plugins.ghPages());
});
