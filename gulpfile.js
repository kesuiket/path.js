'use strict';

const gulp = require('gulp');
const jshint = require('gulp-jshint');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');


/**
 * TODO:
 * 1. js file lint
 * 2. js file minify
 */

gulp.task('js', () => {
  let src = 'dist/**/*.js';
  let dest = 'dist';

  gulp.src(src)
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(dest));
});
