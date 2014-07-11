'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

var browserify = require('browserify');
var source = require('vinyl-source-stream');
var watchify = require('watchify');

gulp.task('bundle-dev', function () {
  return browserify({entries: ['./index.js']})
    .require('./index.js', {expose: 'formatic'})
    .bundle({debug: true})
    .pipe(source('formatic-dev.js'))
    .pipe(gulp.dest('./'));
});

gulp.task('bundle-prod', ['lint'], function () {
  return browserify({entries: ['./index.js']})
    .require('./index.js', {expose: 'formatic'})
    .bundle()
    .pipe(source('formatic-min.js'))
    .pipe(plugins.streamify(plugins.uglify()))
    .pipe(gulp.dest('./'));
});

gulp.task('bundle-watch', function () {
  var bundler = watchify({entries: ['./index.js']})
    .require('./index.js', {expose: 'formatic'});

  var rebundle = function () {
    var bundle = bundler.bundle({debug: true});

    bundle.on('error', function (err) {
      console.log(err);
    });

    return bundle
      .pipe(source('formatic-dev.js'))
      .pipe(gulp.dest('./'));
  };

  bundler.on('update', rebundle);



  return rebundle();
});
