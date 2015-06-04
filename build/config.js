'use strict';

var Config = function() {
  var config = {};
  config.path = {
    root: __dirname + '/../',
    stage: __dirname + '/../build_stage',
    source: __dirname + '/../src/',
    test: __dirname + '/../test/',
    karmaconfig: __dirname + '/../karma.conf.js',
    dist: __dirname + '/../dist/'
  };
  // Collected from the environment.
  this.opts = null;
};


/**
 * Collect arguments from the environment.
 */
Config.prototype.collect = function() {
  this.opts = require("nomnom")
   .option('pathStage', {
      full: 'path-stage',
      help: 'Set the build stage directory. Build system only touch files ' +
            'in the directory, rather than the original files'
   })
   .option('pathDist', {
      full: 'path-dist',
      help: 'Set the dist directory. Build system builds a final concated ' +
            'version in that.'
   })
   .parse();
   return this;
};

Config.prototype.parse = function() {
  if (this.opts.pathStage) {
    this.config.path.stage = this.opts.pathStage;
  }

  if (this.opts.pathDist) {
    this.config.path.dist = this.opts.pathDist;
  }
};
module.exports = Config;
