'use strict';

const gulp = require('gulp');
const jshint = require('gulp-jshint');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const browser = require('browser-sync');


gulp.task('build', done => {
  const src = './path.js';
  const dest = './';

  return gulp.src(src)
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter())
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(dest)) && done();
});


gulp.task('server', done => {
  return browser.init({
    server: {
      baseDir: './',
      index: 'index.html'
    },
    startPath: 'test/index.html'
  }) && done();
});
