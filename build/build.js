/*jslint node: true */
'use strict';

/**
 * The build system should:
 *
 * 0. Copy files into 'build_stage' directory.
 * 1. Do jshint and other checks.
 * 2. Invoke Babel to compile all scripts and put them under the same
 *    directories (if the option of no Babel is set then do nothing
 *    at this step).
 * 3. Call rjs to minimize it at the top of 'build_stage' directory.
 *
 * TODO: If we add more functions than this, we should refactor it with
 * one or several build modules.
 */
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var gutil = require('gulp-util');
var streamqueue = require('streamqueue');
var symlink = require('gulp-symlink');
var karma = require('gulp-karma');
var watch = require('gulp-watch');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var babel = require('gulp-babel');
var gclean = require('gulp-clean');

/**
 * For paths, please make sure they're all resolved.
 */
var Builder = function(configs) {
  var path = require('path');
  configs = configs || {};
  this.configs = {};
  this.configs.path = configs.path || {
    root: path.resolve(__dirname + '/../') + '/',
    stage: path.resolve(__dirname + '/../build_stage/') + '/',
    source: path.resolve(__dirname + '/../src/') + '/',
    test: path.resolve(__dirname + '/../test/') + '/',
    karmaconfig: path.resolve(__dirname + '/../karma.conf.js') + '/',
    dist: path.resolve(__dirname + '/../dist/') + '/'
  };
  this.configs.name = configs.name || {
    dist: 'gleipnir.js',
    source: 'src',
    test: 'test'
  };
};

Builder.prototype.setup = function() {

  gulp.task('clean-stage', (function() {
    return gulp.src(this.configs.path.stage, { read: false })
      .pipe(gclean());
  }).bind(this));

  gulp.task('stage', ['clean-stage'], (function() {
    this.configs.path.stagetest =
      this.configs.path.stage + this.configs.name.test + '/';
    this.configs.path.stagesrc =
      this.configs.path.stage + this.configs.name.src + '/';
    var fs = require('fs');
    fs.mkdirSync(this.configs.path.stage);
    return gulp.src([this.configs.path.test + '**/*.js',
                     this.configs.path.source + '**/*.js'])
      .pipe(gulp.dest(this.configs.path.stage));
  }).bind(this));

  gulp.task('jshint', (function() {
    // if we are going to lint against multiple path, just append another
    // gulp.src('another_path/*.js') in argument list of streamqueue
    return streamqueue({objectMode: true},
       gulp.src([this.configs.path.test + '**/*.js',
                 this.configs.path.source + '**/*.js']))
      .pipe(jshint()).pipe(jshint.reporter(stylish));
  }).bind(this));

  // We always run 'jshint' before 'test'.
  gulp.task('test', ['jshint'], (function() {
    return gulp.src(this.configs.path.test + '**/*.js', { read: false })
    .pipe(karma({
      configFile: this.configs.path.karmaconfig,
      action: 'run'
    }))
    .on('error', gutil.log);
  }).bind(this));

  gulp.task('default', ['test']);

  gulp.task('watch', (function() {
    watch([this.configs.path.test + '**/*.js',
           this.configs.path.source + '**/*.js'],
    function() {
      gulp.start('unit-test');
    });
  }).bind(this));

  gulp.task('hook', (function () {
      return gulp.src('.pre-commit')
          .pipe(symlink('.git/hooks/pre-commit', {force: true}));
  }).bind(this));

  // We don't need to babel tests, since Karma would do that.
  gulp.task('dist', ['stage'], (function() {
    return gulp.src(this.configs.path.stagesrc+ '**/*.js')
      .pipe(sourcemaps.init())
      .pipe(babel())
      .pipe(concat(this.configs.name.dist))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(this.configs.path.dist));
  }).bind(this));
};

module.exports = Builder;
