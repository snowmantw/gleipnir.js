'use strict';

/**
 * To log state transferring in a proper way, rather dump raw console
 * messages and then overwhelm it.
 */
export function Logger() {}

Logger.prototype.start =
function lss_start(configs) {
  this.stateStack = [];
  this.configs = {
    verbose: false || configs.verbose,
    warning: false || configs.warning,
    error: true && configs.error,
    graph: false || configs.graph,
    debug: true && configs.debug,
    reporter: configs.reporter || this.consoleReporter.bind(this)
  };
  return this;
};

Logger.prototype.debug =
function lss_debug() {
  if (this.configs.debug) {
    this.log.apply(this, ['[I] '].concat(Array.from(arguments)));
  }
  return this;
};

Logger.prototype.verbose =
function lss_verbose() {
  if (this.configs.verbose) {
    this.log.apply(this, ['[V] '].concat(Array.from(arguments)));
  }
  return this;
};

Logger.prototype.warning = function lss_warning() {
  if (this.configs.warning || this.configs.verbose) {
    this.log.apply(this, ['[!] '].concat(Array.from(arguments)));
  }
  return this;
};

Logger.prototype.error =
function lss_error() {
  if (this.configs.error || this.configs.warning ||
      this.configs.verbose) {
    this.log.apply(this, ['[E] '].concat(Array.from(arguments)));
  }
  return this;
};

/**
 * Print the stack. For example:
 *
 *  logger.debug('the thing at stack: ').stack()
 *
 * would print out the message and the stack.
 */
Logger.prototype.stack = function lss_stack() {
  this.log((new Error()).stack);
  return this;
};

/**
 * Log the transferring manipulation.
 *
 * To log the conditions, this function would stringify the conditions
 * and then parse it to do the deep copy. So please turn off the
 * `config.debug` in production mode.
 *
 * @param from {string} - from state type
 * @param to {string} - to state type
 * @param conditions {object} - under what conditions we do the transferring
 */
Logger.prototype.transfer =
function lss_transfer(from, to, conditions = {}) {
  if (!this.configs.debug) {
    return;
  }
  var transferDetails = {
    from: from,
    to: to,
    conditions: JSON.parse(JSON.stringify(conditions))
  };
  if (this.configs.graph) {
    this.stateStack.push(transferDetails);
  }
  this.debug(`State transfer: from ${from} to ${to} because of:`,
    transferDetails.conditions);
  return this;
};

/**
 * To get the graph. The array it return would be:
 *
 *     [ 'foo', {conditions}, 'bar', {conditions}, 'gamma'...]
 *
 * which can be rendered as a real graph.
 */
Logger.prototype.graph =
function lss_graph() {
  return this.stateStack.reduce((prev, info) => {
    return prev.concat([info.from, info.conditions, info.to]);
  }, []);
};

Logger.prototype.log =
function lss_log() {
  var reporter = this.configs.reporter;
  reporter.apply(this, arguments);
  return this;
};

Logger.prototype.stop =
function lss_stop() {
  this.stateStack.length = 0;
  return this;
};

Logger.prototype.consoleReporter =
function lss_consoleReporter() {
  console.log.apply(console, arguments);
  return this;
};
