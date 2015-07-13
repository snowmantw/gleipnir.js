'use strict';

import { Language } from 'src/rune/language.js';
import { Basic as BasicState  } from 'src/state/basic.js';
import { Basic as BasicComponent } from 'src/component/basic.js';

export function Component() {
  this.context = {
    _info: {}
  };
  this.stack = [];
  this._evaluator = (new Language.Evaluate())
    .analyzer(this._analyzer.bind(this))
    .interpreter(this._interpret.bind(this));
  this._component = null;
}

// The language interface.
Component.prototype.start = Language.define('start', 'begin');
Component.prototype.type = Language.define('type', 'push');
Component.prototype.configs = Language.define('configs', 'push');
// Set the default resources.
Component.prototype.resources = Language.define('resources', 'push');
Component.prototype.logger = Language.define('logger', 'push');
Component.prototype.methods = Language.define('methods', 'push');
// The setup state. Should give the constructor.
Component.prototype.setup = Language.define('setup', 'push');
// To build a constructor + prototype
Component.prototype.build = Language.define('build', 'exit');
// Besides the constructor and prototype, create an instance and return it.
Component.prototype.instance = Language.define('instance', 'exit');

// The private methods.
Component.prototype.onchange = function(context, node, stack) {
  // When it's changed, evaluate it with analyzers & interpreter.
  return this._evaluator(context, node, stack);
};

Component.prototype._analyzer = function(context, node, stack) {
  if ('start' !== node.type && !context.started) {
    throw new Error(`Before '${node.type}', should start the builder first`);
  }
  switch(node.type) {
    case 'start':
      context.started = true;
      break;
    case 'type':
      if (1 !== node.args.length || 'string' !== typeof node.args[0]) {
        throw new Error(` '${node.type}'
          expect to have a string as the component type`);
      }
      break;
    case 'build':
    case 'instance':
      // Check if necessary properties are missing.
      // Currently, 'setup' and 'type' is necessary.
      if (!context._info.type || 'string' !== typeof context._info.type) {
        throw new Error(`A state should at least with type`);
      }
      if (!context._info.setup || context._info.setup instanceof BasicState) {
        throw new Error(`A state should at least with setup state`);
      }
      break;
  }
};

/**
 * As an ordinary interpreting function: do some effects according to the node,
 * and return the final stack after ending.
 */
Component.prototype._interpret = function(context, node, stack) {
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
  context._component = function(view) {
    BasicComponent.apply(this, arguments);
    this.resources = _info.resources || this.resources;
    this.configs = _info.configs || this.configs;
    this.logger = _info.logger || this.logger;
    this.type = _info.type;
    this._setupState = new _info.setup(this);
  };
  context._component.prototype = Object.create(BasicComponent.prototype);
  if (_info.methods) {
    Object.keys(_info.methods).forEach(function(methodName) {
      context._component.prototype[methodName] = _info.methods[methodName];
    });
  }
  if ('build' === node.type) {
    // The only one node on the stack would be returned.
    stack = [ context._component ];
    return stack;
  }
  if ('instance' === node.type) {
    // Since 'instance' may pass some arguments to the constructor,
    // we need to apply it rather than new it.
    var target = Object.create(context._component.prototype);
    context._component.apply(target, node.args);
    stack = [ target ];
    return stack;
  }
};
