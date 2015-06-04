'use strict';

/**
 * Warning: don't do any actual build things in this file.
 * Add or modify features in the 'build' directory.
 */
var Builder = require(__dirname + '/build/build.js');
var Config = require(__dirname + '/build/config.js');

(new Builder(
  (new Config()).collect().parse()))
.setup();
