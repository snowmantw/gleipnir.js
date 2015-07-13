'use strict';

import { Language } from 'src/rune/language.js';
import { Basic as BasicState } from 'src/state/basic.js';

/**
 * Use this builder to build states in a component.
 */
export function State() {
  this.context = {
    _info: {}
  };
  this.stack = [];
  // With this helper we get the evaluator.
  this._evaluator = (new Language.Evaluate())
    .analyzer(this._analyzer.bind(this))
    .interpreter(this._interpret.bind(this));
  this._state = null;
}

// The language interface.
State.prototype.start = Language.define('start' ,'begin');
State.prototype.component = Language.define('component' ,'push');
State.prototype.events = Language.define('events', 'push');
State.prototype.interrupts = Language.define('interrupts', 'push');
State.prototype.sources = Language.define('sources', 'push');
State.prototype.type = Language.define('type', 'push');
State.prototype.handler = Language.define('handler', 'push');
State.prototype.methods = Language.define('methods', 'push');
// To build a constructor + prototype
State.prototype.build = Language.define('build', 'exit');
// Besides the constructor and prototype, create an instance and return it.
State.prototype.instance = Language.define('instance', 'exit');

// The private methods.
State.prototype.onchange = function(context, node, stack) {
  // When it's changed, evaluate it with analyzers & interpreter.
  return this._evaluator(context, node, stack);
};

State.prototype._analyzer = function(context, node, stack) {
  if ('start' !== node.type && !context.started) {
    throw new Error(`Before '${node.type}', should start the builder first`);
  }
  switch(node.type) {
    case 'start':
      context.started = true;
      break;
    case 'component':
      if (1 !== node.args.length || 'object' !== typeof node.args[0] ||
          'function' !== typeof node.args[0].transferTo) {
        throw new Error(` '${node.type}'
          expect to be a component with method 'transferTo'`);
      }
      break;
    case 'type':
      if (1 !== node.args.length || 'string' !== typeof node.args[0]) {
        throw new Error(` '${node.type}'
          expect to have a string as the state type`);
      }
      break;
    case 'events':
    case 'interrupts':
    case 'sources':
      if (!node.args[0] || !Array.isArray(node.args[0])) {
        throw new Error(` '${node.type}'
          expects to have an array argument`);
      }
      break;
    case 'handler':
      if (!node.args[0] || 'function' !== typeof node.args[0]) {
        throw new Error(` '${node.type}'
          expect to have an function argument`);
      }
      break;
    case 'methods':
      if (!node.args[0] || 'object' !== typeof node.args[0]) {
        throw new Error(` '${node.type}'
          expect to have an map of functions`);
      }
      break;
    case 'build':
    case 'instance':
      // Check if necessary properties are missing.
      // Currently only 'type' is necessary.
      if (!context._info.type || 'string' !== typeof context._info.type) {
        throw new Error(`A state should at least with type`);
      }
      break;
  }
};

/**
 * As an ordinary interpreting function: do some effects according to the node,
 * and return the final stack after ending.
 */
State.prototype._interpret = function(context, node, stack) {
  if ('start' === node.type) {
    return;
  }
  // If the information are gathered, according to the information
  // user gave to build a state.
  if ('build' !== node.type && 'instance' !== node.type) {
    // Since all these methods are only need one argument.
    context._info[node.type] = node.args[0];
    return;
  }
  var _info = context._info;
  context._state = function() {
    BasicState.apply(this, arguments);
    this.configs.type = _info.type;
    this.configs.stream.events = _info.events || [];
    this.configs.stream.interrupts = _info.interrupts || [];
    this.configs.stream.sources = _info.sources || [];
    this.handleSourceEvent = _info.handler.bind(this);
  };
  context._state.prototype = Object.create(BasicState.prototype);
  if (_info.methods) {
    Object.keys(_info.methods).forEach(function(methodName) {
      context._state.prototype[methodName] = _info.methods[methodName];
    });
  }
  if ('build' === node.type) {
    // The only one node on the stack would be returned.
    stack = [ context._state ];
    return stack;
  }
  if ('instance' === node.type) {
    if ('object' !== typeof _info.component ||
        'function' !== typeof _info.component.transferTo) {
      throw new Error(`A state instance should have a component`);
    }
    stack = [ new context._state(_info.component) ];
    return stack;
  }
};
