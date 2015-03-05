'use strict';

var gulp = require('gulp');

gulp.task('build', ['lint', 'bundle-dev', 'bundle-prod']);
