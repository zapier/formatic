'use strict';

var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

gulp.task('build', function () {
  return browserify({entries: ['./index.js']})
    .require('./index.js', {expose: 'formyst'})
    .bundle({debug: true})
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./'));
});

gulp.task('default', ['build']);
