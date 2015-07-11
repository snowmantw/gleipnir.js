'use strict';

/**
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
var rseq = require('run-sequence')
var header = require('gulp-header');
var webpack = require('webpack-stream');
var glob = require('glob');

/**
 * For paths, please make sure they're all resolved.
 */
var Builder = function(configs) {
  var path = require('path');
  configs = configs || {};
  // TODO: complete the config
  this.configs = {};
  this.configs.path = configs.path || {
    root: path.resolve(__dirname + '/../') + '/',
    stage: path.resolve(__dirname + '/../build_stage/') + '/',
    source: path.resolve(__dirname + '/../src/') + '/',
    test: path.resolve(__dirname + '/../test/') + '/',
    karmaconfig: path.resolve(__dirname + '/../karma.conf.js'),
    dist: path.resolve(__dirname + '/../dist/') + '/',
    webpackconfig: path.resolve(__dirname + '/../webpack.conf.js')
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

  gulp.task('clean-dist', (function() {
    return gulp.src(this.configs.path.dist, { read: false })
      .pipe(gclean());
  }).bind(this));

  gulp.task('create-stage', (function(cb) {
    var fs = require('fs');
    fs.mkdir(this.configs.path.stage, cb);
  }).bind(this));

  gulp.task('create-dist', (function(cb) {
    var fs = require('fs');
    fs.mkdir(this.configs.path.dist, cb);
  }).bind(this));

  gulp.task('stage-src', (function() {
    this.configs.path.stagesrc =
      this.configs.path.stage + this.configs.name.source + '/';

    return gulp.src(this.configs.path.source + '**/*.js')
      .pipe(gulp.dest(this.configs.path.stagesrc));
  }).bind(this));

  gulp.task('stage-test', (function() {
    this.configs.path.stagetest =
      this.configs.path.stage + this.configs.name.test + '/';

    return gulp.src(this.configs.path.test + '**/*.js')
      .pipe(gulp.dest(this.configs.path.stagetest));
  }).bind(this));

  gulp.task('stage', (function(cb) {
    rseq('clean-stage', 'create-stage', 'stage-src', 'stage-test', cb);
  }).bind(this));

  gulp.task('jshint', (function() {
    return streamqueue({objectMode: true},
       gulp.src([this.configs.path.test + '**/*.js',
                 this.configs.path.source + '**/*.js']))
      .pipe(jshint()).pipe(jshint.reporter(stylish));
  }).bind(this));

  // We always run 'jshint' before 'test'.
  gulp.task('test', ['jshint'], (function() {
    // XXX: a sad trick from https://github.com/lazd/gulp-karma/issues/7
    var files = ["undefined.js"];
    return gulp.src(files)
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
      gulp.start('test');
    });
  }).bind(this));

  gulp.task('hook', (function () {
      return gulp.src('.pre-commit')
          .pipe(symlink('.git/hooks/pre-commit', {force: true}));
  }).bind(this));

  gulp.task('transform', ['stage'], (function() {
    var pkg = require(this.configs.path.root + 'package.json');
    var banner = ['/**',
      ' * <%= pkg.name %> - <%= pkg.description %>',
      ' * @version v<%= pkg.version %>',
      ' * @link <%= pkg.homepage %>',
      ' * @license <%= pkg.license %>',
      ' */',
      ''].join('\n');
    var files = glob.sync(this.configs.path.stagesrc + '**/*.js');
    return gulp.src(files)
      .pipe(webpack(require(this.configs.path.webpackconfig)(this.configs)))
      .pipe(header(banner, { pkg : pkg } ))
      .pipe(gulp.dest(this.configs.path.dist));
  }).bind(this));
};

module.exports = Builder;
