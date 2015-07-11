'use strict';

/* globals require */
/* Serves as the only one file Karma would take */
var context = require.context('.', true, /.+\_spec\.js?$/);
context.keys().forEach(context);
module.exports = context;

