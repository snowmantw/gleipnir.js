'use strict';

import { Language } from 'src/rune/language.js';

/**
 * This language interface would provide callable methods of the Process eDSL.
 *
 * The difference between interfance & runtime is:
 *
 *  Interface: manage the stack and provides analyzers if it's necessary.
 *  Runtime: evaluate every change (node) of the stack.
 *
 * So this interface would check if there are any 'syntax' error during compose
 * the eDSL instance. For example, the analyzer of the interface could report
 * this kind of error:
 *
 *  process.stop().start().next();    // ERROR: 'stop' before 'start'
 *
 * And since the interface would not evaluate nodes, it would forward stack
 * changes to the runtime.
 */
export function Interface(runtime) {
  // Required by the 'Language' module.
  this.context = {
    started: false,
    stopped: false
  };
  this.stack = [];
  this._runtime = runtime;
  this._evaluator = (new Language.Evaluate())
    .analyzer(this._analyzeOrder.bind(this))
    .intepreter(this._interpret.bind(this));
}

Interface.prototype.start = Language.define('start', 'begin');
Interface.prototype.stop = Language.define('stop', 'push');
Interface.prototype.destroy = Language.define('destroy', 'push');
Interface.prototype.next = Language.define('next', 'push');
Interface.prototype.shift = Language.define('shift', 'push');
Interface.prototype.rescue = Language.define('rescue', 'push');
Interface.prototype.wait = Language.define('wait', 'push');

// It's not a method owns semantics meaning of the eDSL, but a method
// interacts with the metalangauge, so define it in this way.
Interface.prototype.until =
function() {
  return this._runtime.until.apply(this._runtime, arguments);
};

Interface.prototype.onchange = function(context, node, stack) {
  // When it's changed, evaluate it with analyzers & interpreter.
  return this._evaluator(context, node, stack);
};

Interface.prototype._interpret = function(context, node, stack) {
  // Well in this eDSL we delegate the interpretion to the runtime.
  return this._runtime.onchange.apply(this._runtime, arguments);
};

// In this eDSL we now only have this analyzer. Could add more and register it
// in the contruction of 'this._evaluator'.
Interface.prototype._analyzeOrder = function(context, change, stack) {
  if ('start' === change.type) {
    context.started = true;
  } else if ('stop') {
    context.stopped = true;
  }
  if ('start' === change.type && context.stopped) {
    throw new Error('Should not start a process again' +
        'after it\'s already stopped');
  } else if ('next' === change.type && !context.started) {
    throw new Error('Should not concat steps while it\'s not started');
  } else if ('stop' === change.type && !context.started) {
    throw new Error('Should not stop a process before it\'s started');
  }
};
