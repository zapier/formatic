'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

var browserify = require('browserify');
var source = require('vinyl-source-stream');
var watchify = require('watchify');

gulp.task('bundle-dev', function () {
  return browserify({entries: ['./index.js'], debug: true, standalone: 'Formatic'})
    .add('./index.js')
    .require('./index.js', {expose: 'formatic'})
    .external(['underscore', 'react', 'react/addons'])
    .bundle()
    .pipe(source('formatic-dev.js'))
    .pipe(gulp.dest('./build'));
});

// Currently unused, probably can delete.

// gulp.task('bundle-prod', ['lint'], function () {
//   return browserify({entries: ['./index.js'], standalone: 'Formatic'})
//     .add('./index.js')
//     .require('./index.js', {expose: 'formatic'})
//     .external(['underscore', 'react', 'react/addons'])
//     .bundle()
//     .pipe(source('formatic.js'))
//     .pipe(gulp.dest('./build'));
// });

gulp.task('bundle-prod-min', ['lint'], function () {
  return browserify({entries: ['./index.js'], standalone: 'Formatic'})
    .add('./index.js')
    .require('./index.js', {expose: 'formatic'})
    .external(['underscore', 'react', 'react/addons'])
    .bundle()
    .pipe(source('formatic-min.js'))
    .pipe(plugins.streamify(plugins.uglify()))
    .pipe(gulp.dest('./build'));
});

gulp.task('bundle-watch', function () {
  var b = browserify({
    cache: {},
    packageCache: {},
    fullPaths: true,
    entries: ['./index.js'],
    debug: true,
    standalone: 'Formatic'
  });
  //b = b.require('./index.js', {expose: 'formatic'});

  // var bundler = watchify({entries: ['./index.js'], debug: true})
  //   .require('./index.js', {expose: 'formatic'})
  //   .external(['underscore', 'react', 'react/addons']);

  var bundler = watchify(b);

  bundler
    // This line is goofy workaround for watchify bug that breaks next line.
    .add('./index.js')
    // Only this should be necessary.
    .require('./index.js', {expose: 'formatic'})
    .external(['underscore', 'react', 'react/addons'])
    .transform({global: true}, 'browserify-shim');

  var rebundle = function () {
    var bundle = bundler.bundle();

    bundle.on('error', function (err) {
      console.log(err);
    });

    return bundle
      .pipe(source('formatic-dev.js'))
      .pipe(plugins.rename('formatic.js'))
      .pipe(gulp.dest('./live/lib'));
  };

  bundler.on('update', rebundle);



  return rebundle();
});
