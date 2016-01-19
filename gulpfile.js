'use strict';

const gulp = require('gulp');
const jshint = require('gulp-jshint');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const browser = require('browser-sync');


/**
 * TODO:
 * 1. js file lint
 * 2. js file minify
 */

gulp.task('js', done => {
  let src = 'dist/path.js';
  let dest = 'dist';

  gulp.src(src)
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(dest));
});


gulp.task('server', done => {
  return browser.init({
    server: {
      baseDir: 'dist',
      index: 'index.html'
    },
    startPath: '/test/index.html'
  }) && done();
});
