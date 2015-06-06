/**
 * gleipnir.js - Gleipnir.js - a library for UI programming
 * @version v0.0.1
 * @link 
 * @license Apache 2.0
 */
define(['exports', 'src/rune/language.js', 'src/state/basic_state.js', 'src/component/basic_component.js'], function (exports, _srcRuneLanguageJs, _srcStateBasic_stateJs, _srcComponentBasic_componentJs) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.Builder = Builder;

  function Builder() {
    this.context = {
      _info: {}
    };
    this.stack = [];
    this._evaluator = new _srcRuneLanguageJs.Language.Evaluate().analyzer(this._analyzer.bind(this)).interpreter(this._interpret.bind(this));
    this._component = null;
  }

  // The language interface.
  Builder.prototype.start = _srcRuneLanguageJs.Language.define('start', 'begin');
  Builder.prototype.type = _srcRuneLanguageJs.Language.define('type', 'push');
  Builder.prototype.configs = _srcRuneLanguageJs.Language.define('configs', 'push');
  // Set the default resources.
  Builder.prototype.resources = _srcRuneLanguageJs.Language.define('resources', 'push');
  Builder.prototype.logger = _srcRuneLanguageJs.Language.define('logger', 'push');
  Builder.prototype.methods = _srcRuneLanguageJs.Language.define('methods', 'push');
  // The setup state. Should give the constructor.
  Builder.prototype.setup = _srcRuneLanguageJs.Language.define('setup', 'push');
  // To build a constructor + prototype
  Builder.prototype.build = _srcRuneLanguageJs.Language.define('build', 'exit');
  // Besides the constructor and prototype, create an instance and return it.
  Builder.prototype.instance = _srcRuneLanguageJs.Language.define('instance', 'exit');

  // The private methods.
  Builder.prototype.onchange = function (context, node, stack) {
    // When it's changed, evaluate it with analyzers & interpreter.
    return this._evaluator(context, node, stack);
  };

  Builder.prototype._analyzer = function (context, node, stack) {
    if ('start' !== node.type && !context.started) {
      throw new Error('Before \'' + node.type + '\', should start the builder first');
    }
    switch (node.type) {
      case 'start':
        context.started = true;
        break;
      case 'type':
        if (1 !== node.args.length || 'string' !== typeof node.args[0]) {
          throw new Error(' \'' + node.type + '\'\n          expect to have a string as the component type');
        }
        break;
      case 'build':
      case 'instance':
        // Check if necessary properties are missing.
        // Currently, 'setup' and 'type' is necessary.
        if (!context._info.type || 'string' !== typeof context._info.type) {
          throw new Error('A state should at least with type');
        }
        if (!context._info.setup || context._info.setup instanceof _srcStateBasic_stateJs.BasicState) {
          throw new Error('A state should at least with setup state');
        }
        break;
    }
  };

  /**
   * As an ordinary interpreting function: do some effects according to the node,
   * and return the final stack after ending.
   */
  Builder.prototype._interpret = function (context, node, stack) {
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
    context._component = function (view) {
      _srcComponentBasic_componentJs.BasicComponent.apply(this, arguments);
      this.resources = _info.resources || this.resources;
      this.configs = _info.configs || this.configs;
      this.logger = _info.logger || this.logger;
      this.type = _info.type;
      this._setupState = new _info.setup(this);
    };
    context._component.prototype = Object.create(_srcComponentBasic_componentJs.BasicComponent.prototype);
    if (_info.methods) {
      Object.keys(_info.methods).forEach(function (methodName) {
        context._component.prototype[methodName] = _info.methods[methodName];
      });
    }
    if ('build' === node.type) {
      // The only one node on the stack would be returned.
      stack = [context._component];
      return stack;
    }
    if ('instance' === node.type) {
      // Since 'instance' may pass some arguments to the constructor,
      // we need to apply it rather than new it.
      var target = Object.create(context._component.prototype);
      context._component.apply(target, node.args);
      stack = [target];
      return stack;
    }
  };
});
define(['exports', 'src/rune/language.js', 'src/state/basic_state.js'], function (exports, _srcRuneLanguageJs, _srcStateBasic_stateJs) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.Builder = Builder;

  /**
   * Use this builder to build states in a component.
   */

  function Builder() {
    this.context = {
      _info: {}
    };
    this.stack = [];
    // With this helper we get the evaluator.
    this._evaluator = new _srcRuneLanguageJs.Language.Evaluate().analyzer(this._analyzer.bind(this)).interpreter(this._interpret.bind(this));
    this._state = null;
  }

  // The language interface.
  Builder.prototype.start = _srcRuneLanguageJs.Language.define('start', 'begin');
  Builder.prototype.component = _srcRuneLanguageJs.Language.define('component', 'push');
  Builder.prototype.events = _srcRuneLanguageJs.Language.define('events', 'push');
  Builder.prototype.interrupts = _srcRuneLanguageJs.Language.define('interrupts', 'push');
  Builder.prototype.sources = _srcRuneLanguageJs.Language.define('sources', 'push');
  Builder.prototype.type = _srcRuneLanguageJs.Language.define('type', 'push');
  Builder.prototype.handler = _srcRuneLanguageJs.Language.define('handler', 'push');
  Builder.prototype.methods = _srcRuneLanguageJs.Language.define('methods', 'push');
  // To build a constructor + prototype
  Builder.prototype.build = _srcRuneLanguageJs.Language.define('build', 'exit');
  // Besides the constructor and prototype, create an instance and return it.
  Builder.prototype.instance = _srcRuneLanguageJs.Language.define('instance', 'exit');

  // The private methods.
  Builder.prototype.onchange = function (context, node, stack) {
    // When it's changed, evaluate it with analyzers & interpreter.
    return this._evaluator(context, node, stack);
  };

  Builder.prototype._analyzer = function (context, node, stack) {
    if ('start' !== node.type && !context.started) {
      throw new Error('Before \'' + node.type + '\', should start the builder first');
    }
    switch (node.type) {
      case 'start':
        context.started = true;
        break;
      case 'component':
        if (1 !== node.args.length || 'object' !== typeof node.args[0] || 'function' !== typeof node.args[0].transferTo) {
          throw new Error(' \'' + node.type + '\'\n          expect to be a component with method \'transferTo\'');
        }
        break;
      case 'type':
        if (1 !== node.args.length || 'string' !== typeof node.args[0]) {
          throw new Error(' \'' + node.type + '\'\n          expect to have a string as the state type');
        }
        break;
      case 'events':
      case 'interrupts':
      case 'sources':
        if (!node.args[0] || !Array.isArray(node.args[0])) {
          throw new Error(' \'' + node.type + '\'\n          expects to have an array argument');
        }
        break;
      case 'handler':
        if (!node.args[0] || 'function' !== typeof node.args[0]) {
          throw new Error(' \'' + node.type + '\'\n          expect to have an function argument');
        }
        break;
      case 'methods':
        if (!node.args[0] || 'object' !== typeof node.args[0]) {
          throw new Error(' \'' + node.type + '\'\n          expect to have an map of functions');
        }
        break;
      case 'build':
      case 'instance':
        // Check if necessary properties are missing.
        // Currently only 'type' is necessary.
        if (!context._info.type || 'string' !== typeof context._info.type) {
          throw new Error('A state should at least with type');
        }
        break;
    }
  };

  /**
   * As an ordinary interpreting function: do some effects according to the node,
   * and return the final stack after ending.
   */
  Builder.prototype._interpret = function (context, node, stack) {
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
    context._state = function () {
      _srcStateBasic_stateJs.BasicState.apply(this, arguments);
      this.configs.type = _info.type;
      this.configs.stream.events = _info.events || [];
      this.configs.stream.interrupts = _info.interrupts || [];
      this.configs.stream.sources = _info.sources || [];
      this.handleSourceEvent = _info.handler.bind(this);
    };
    context._state.prototype = Object.create(_srcStateBasic_stateJs.BasicState.prototype);
    if (_info.methods) {
      Object.keys(_info.methods).forEach(function (methodName) {
        context._state.prototype[methodName] = _info.methods[methodName];
      });
    }
    if ('build' === node.type) {
      // The only one node on the stack would be returned.
      stack = [context._state];
      return stack;
    }
    if ('instance' === node.type) {
      if ('object' !== typeof _info.component || 'function' !== typeof _info.component.transferTo) {
        throw new Error('A state instance should have a component');
      }
      stack = [new context._state(_info.component)];
      return stack;
    }
  };
});
define(['exports', 'src/logger/state.js'], function (exports, _srcLoggerStateJs) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.BasicComponent = BasicComponent;

  /**
   * Component provides:
   *
   * 1. Resource keeper: to let all states share the same resources (cache).
   * 2. Reference to the current activate state: so that parent component can
   *    command and wait the sub-components to do things without tracking the
   *    actual active state.
   *
   * Every states of this component would receive the Component instance as
   * a way to access these common resources & properties. And every state
   * transferring would done by the 'transferTo' method in this component,
   * so that the component can update the active state correctly.
   */

  /**
   * The argument 'view' is the only thing parent component needs to manage.
   * Please note that the 'view' isn't for UI rendering, although that
   * UI view is the most common of them. User could chose other views like
   * data-view or debugging-view to contruct the program. It would still
   * be "rendered" (perform the effect), but how to synthesize the effects
   * of parent and children now is the user's duty. For example, if we have a
   * 'console-view' to print out things instead of rendering UI, should it
   * print text from children first? Or the parent, since it's a wrapping
   * object, should info the user its status earlier than its children?
   * These behaviors should be encapsulated inside the 'view', and be
   * handled at the underlying level.
   */

  function BasicComponent(view) {
    this._subcomponents = null;
    this._activeState = null;
    // Concrete components should extend these to let States access them.
    // The first state component kick off should take responsibility for
    // initializing these things.
    //
    // Resources is for external resources like settings value or DOM elements.
    this.resources = {
      elements: {}
    };
    this.configs = {
      logger: {
        debug: false // turn on it when we're debugging this component
      }
    };

    // The default logger.
    // A customized logger is accetable if it's with the 'transfer' method
    // for logging the state transferring.
    this.logger = new _srcLoggerStateJs.Logger();
    this.view = view;
    // Should at least appoint these.
    this.type = null;
    this._setupState = null;
  }

  /**
   * State' phase is the component's phase.
   */
  BasicComponent.prototype.phase = function () {
    return this._activeState.phase();
  };

  /**
   * Every state of this component should call the method to do transferring,
   * so that the component can update the 'activeState' correctly.
   *
   * The order of transferring is:
   *
   *  [current.stop] -> [next.start] -> (call)[previous.destroy]
   *
   * Note this function may return a nullized process if it's transferring,
   * so the user must detect if the return thing is a valid process
   * could be chained, or pre-check it with the property.
   */
  BasicComponent.prototype.transferTo = function (clazz) {
    var reason = arguments[1] === undefined ? {} : arguments[1];

    var nextState = new clazz(this);
    var currentState = this._activeState;
    this._activeState = nextState;
    this.logger.transfer(currentState.configs.type, nextState.configs.type, reason);
    return currentState.stop().next(function () {
      return nextState.start();
    });
  };

  /**
   * Would receive resources from parent and *extends* the default one.
   * After that, transfer to the next state, which is usually an initialization
   * state, that would do lots of sync/async things to update the
   * resources & properties.
   *
   * However, since basic component couldn't know what is the
   * initialization state, so that the concrete component should
   * implement the setup function, which would return the state after
   * receive the component instance.
   */
  BasicComponent.prototype.start = function (resources) {
    this.logger.start(this.configs.logger);
    if (resources) {
      for (var key in this.resources) {
        if ('undefined' !== typeof resources[key]) {
          this.resources[key] = resources[key];
        }
      }
    }
    // Get the initialization state and let it fetch & set all.
    // 'initializeStateMachine', if Java doomed the world.
    // (and this is ECMAScript, a language (partially) inspired by Scheme!).
    this._activeState = this._setupState;
    return this._activeState.start();
  };

  BasicComponent.prototype.stop = function () {
    return this._activeState.stop().next(this.waitComponents.bind(this, 'stop'));
  };

  BasicComponent.prototype.destroy = function () {
    var _this = this;

    return this._activeState.destroy().next(this.waitComponents.bind(this, 'destroy')).next(function () {
      _this.logger.stop();
    }); // Logger need add phase support.
  };

  BasicComponent.prototype.live = function () {
    return this._activeState.until('stop');
  };

  BasicComponent.prototype.exist = function () {
    return this._activeState.until('destroy');
  };

  /**
   * Can command all sub-components with one method and its arguments.
   * For example, to 'start', or 'stop' them.
   * Will return a Promise only be resolved after all sub-components
   * executed the command. For example:
   *
   * subcomponents: {
   *    buttons: [ButtonFoo, ButtonBar]
   *    submit: Submit
   * }
   * var promised = parent.waitComponents(parent.stop.bind(parent));
   *
   * The promised would be resolved only after ButtonFoo, ButtonBar and Submit
   * are all stopped.
   *
   * And since for states the sub-components is delegated to Component,
   * state should only command these sub-components via this method,
   * or access them individually via the component instance set at the
   * setup stage.
   */
  BasicComponent.prototype.waitComponents = function (method, args) {
    var _this2 = this;

    if (!this._subcomponents) {
      return Promise.resolve();
    }
    var waitPromises = Object.keys(this._subcomponents).reduce(function (steps, name) {
      var instance = _this2._subcomponents[name];
      // If the entry of the component actually contains multiple subcomponents.
      // We need to apply the method to each one and concat all the result
      // promises with our main array of applies.
      if (Array.isArray(instance)) {
        var applies = instance.map(function (subcomponent) {
          return subcomponent[method].apply(subcomponent, args);
        });
        return steps.concat(applies);
      } else {
        return steps.concat([instance[method].apply(instance, args)]);
      }
    }, []);
    return Promise.all(waitPromises);
  };

  /**
   * Forward the data to render the view.
   * If it's a real UI view and with tech like virtual DOM in React.js,
   * we could perform a high-efficiency rendering while keep the client code
   * as simple as possible.
   *
   * The target is an optional 'canvas' of the rendering target. It would,
   * if the view is an UI view for example, 'erase' it and render new content
   * each time this function get invoked. However, since we have not only
   * UI view, some targeting 'canvas' could be more tricky, like FileObject,
   * Blob, sound system, etc.
   */
  BasicComponent.prototype.render = function (props, target) {
    return this.view.render(props, target);
  };
});
define(['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.BasicStore = BasicStore;
  /**
   * Component should control its resources only via methods
   * defined here. This is just a empty interface that required
   * by BasicComponent. In this way, we could see how to implement
   * the same architecture for real components.
   **/

  function BasicStore() {
    // Resources include DOM elements and other stuff that component
    // need to require them from the 'outside'. So even it's only a string,
    // if the one comes from System settings or XHR, it should be a resource
    // item and to be managed here.
    this.resources = {};
  }
});
define(['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.Logger = Logger;
  /**
   * To log state transferring in a proper way, rather dump raw console
   * messages and then overwhelm it.
   */

  function Logger() {}

  Logger.prototype.start = function lss_start(configs) {
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

  Logger.prototype.debug = function lss_debug() {
    if (this.configs.debug) {
      this.log.apply(this, ['[I] '].concat(Array.from(arguments)));
    }
    return this;
  };

  Logger.prototype.verbose = function lss_verbose() {
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

  Logger.prototype.error = function lss_error() {
    if (this.configs.error || this.configs.warning || this.configs.verbose) {
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
    this.log(new Error().stack);
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
  Logger.prototype.transfer = function lss_transfer(from, to) {
    var conditions = arguments[2] === undefined ? {} : arguments[2];

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
    this.debug('State transfer: from ' + from + ' to ' + to + ' because of:', transferDetails.conditions);
    return this;
  };

  /**
   * To get the graph. The array it return would be:
   *
   *     [ 'foo', {conditions}, 'bar', {conditions}, 'gamma'...]
   *
   * which can be rendered as a real graph.
   */
  Logger.prototype.graph = function lss_graph() {
    return this.stateStack.reduce(function (prev, info) {
      return prev.concat([info.from, info.conditions, info.to]);
    }, []);
  };

  Logger.prototype.log = function lss_log() {
    var reporter = this.configs.reporter;
    reporter.apply(this, arguments);
    return this;
  };

  Logger.prototype.stop = function lss_stop() {
    this.stateStack.length = 0;
    return this;
  };

  Logger.prototype.consoleReporter = function lss_consoleReporter() {
    console.log.apply(console, arguments);
    return this;
  };
});
define(['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.Language = Language;
  /**
   * Generic builder that would push nodes into the eDSL stack.
   * User could inherit this to define the new eDSL.
   * ---
   * The default semantics only contain these operations:
   *
   * 1. [push] : push to the current stack
   * 2. [begin]: create a new stack and switch to it,
   *             and then push the node into the stack.
   * 3. [end]  : after push the node into the stack,
   *             change the current stack to the previous one.
   * 4. [exit] : exit the context of this eDSL; the last result
   *             of it would be passed to the return value of
   *             this chain.
   *
   * Stack could be nested: when [begin] a new stack in fact it would
   * push the stack into the previous one. So the stack comprise
   * [node] and [stack].
   * ---
   * Although the eDSL instance should wrap these basic operations
   * to manipulate the stack, they all need to convert the method
   * call to nodes. So 'Language' provide a way to simplify the work: if
   * the instance call the [define] method the name of the method,
   * it could associate the operand of the eDSL with the stack manipulation.
   * For example:
   *
   *    var eDSL = function() {};
   *    eDSL.prototype.transaction = Language.define('transaction', 'begin');
   *    eDSL.prototype.pre = Language.define('pre', 'push');
   *    eDSL.prototype.perform = Language.define('perform', 'push');
   *    eDSL.prototype.post = Language.define('post', 'end');
   *
   * Then the eDSL could be used as:
   *
   *    (new eDSL)
   *      .transaction()
   *      .pre(cb)
   *      .perform(cb)
   *      .post(cb)
   *
   * And the stack would be:
   *
   *    [
   *      node<'transaction',>
   *      node<'pre', cb>
   *      node<'preform', cb>
   *      node<'post', cb>
   *    ]
   *
   * However, this simple approach the semantics rules and analyzers to
   * guarantee the stack is valid. For example, if we have a malformed
   * stack because of the following eDSL program:
   *
   *    (new eDSL)
   *      .post(cb)
   *      .pre(cb)
   *      .perform(cb)
   *      .transaction()
   *
   * The runtime may report errot because when '.post(cb)' there is no stack
   * created by the beginning step, namely the '.pre(cb)' in our case.
   * Nevertheless, the error message is too low-level for the language user,
   * since they should care no stack things and should only care about the eDSL
   * itself.
   *
   * The solution is to provide a basic stack ordering analyzer and let the
   * language decide how to describe the error. And since we don't have
   * any context information about variables, scope and other elements
   * as a complete programming language, we only need to guarantee the order is
   * correct, and make incorrect cases meaningful. Moreover, since the analyzer
   * needs to analyze the states whenever the incoming node comes, it is in fact
   * an evaluation process, so user could combine the analyzing and interpreting
   * phase into the same function. For example:
   *
   *    runtime.onchange((context, node, stack) => {
   *        // If the change is to switch to a new stack,
   *        // the 'stack' here would be the new stack.
   *        var {type, args} = node;
   *        if ('pre' === type) {
   *          context.init = true;
   *        } else if ('post' === type && !context.init) {
   *          throw new Error('There must be one "pre" node before the "post".');
   *        }
   *    });
   *
   * With such feature, if the incoming node or the stack is malformed,
   * it should throw the error. The error captured by the instance like this
   * could be a 'compilation error'.
   *
   * The noticeable fact is The callback of the 'onchange' is actually a reducer,
   * so user could treat the process of this evaluation & analyzing as a reducing
   * process on an infinite stream. And since we have a stack machine, if the
   * reducer return nothing, the stack would be empty. Otherwise, if the reducer
   * return a new stack, it would replace the old one.
   *
   * And please note the example is much simplified. For the
   * real eDSL it should be used only as an entry to dispatch the change to
   * the real handlers, which may comprise several states and components.
   */

  function Language() {}

  /**
   * Helper method to build interface of a specific DSL. It would return a method
   * of the DSL and then the interface could attach it.
   *
   * The returning function would assume that the 'this' inside it is the runtime
   * of the language. And since the method it returns would require to access some
   * members of the 'this', the 'this' should have 'this.stack' and 'this.context'
   * as the method requires.
   *
   * If it's an 'exit' node, means the session is ended and the interpreter should
   * return a stack contains only one node as the result of the session, or the
   * session returns nothing.
   *
   * Please note that from the description above, 'end' means stack (substack)
   * ends. It's totally irrelevant to 'exit'.
   */
  Language.define = function (method, as) {
    return function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var node, resultstack;
      switch (as) {
        case 'push':
          node = new Language.Node(method, args, this.stack);
          this.stack.push(node);
          resultstack = this.onchange(this.context, node, this.stack);
          break;
        case 'begin':
          this._prevstack = this.stack;
          this.stack = [];
          node = new Language.Node(method, args, this.stack);
          this.stack.push(node); // as the first node of the new stack.
          resultstack = this.onchange(this.context, node, this.stack);
          break;
        case 'end':
          node = new Language.Node(method, args, this.stack);
          this.stack.push(node); // the last node of the stack.
          this.stack = this._prevstack; // switch back to the previous stack.
          resultstack = this.onchange(this.context, node, this.stack);
          break;
        case 'exit':
          node = new Language.Node(method, args, this.stack);
          this.stack.push(node); // the last node of the stack.
          resultstack = this.onchange(this.context, node, this.stack);
          if (!resultstack) {
            throw new Error('\'exit\' node \'' + node.type + '\' should\n            return a resultstack.');
          }
          return resultstack[0];
      }
      // If the handler updates the stack, it would replace the existing one.
      if (resultstack) {
        this.stack = resultstack;
      }
      return this;
    };
  };

  Language.Node = function (type, args, stack) {
    this.type = type;
    this.args = args;
    this.stack = stack;
  };

  Language.Evaluate = function () {
    var context = arguments[0] === undefined ? {} : arguments[0];

    this._analyzers = [];
    this._interpreter = null;
    this._context = context;
  };

  /**
   * Analyzer could receive the stack change from 'Language#evaluate',
   * and it would be called with the arguments as the function describes:
   *
   *     Language.prototype.evaluate((context, change, stack) => {
   *        // ...
   *     });
   *
   * So the analyzer could be:
   *
   *    function(context, change, stack) {
   *      // Do some check and maybe changed the context.
   *      // The next analyzer to the interpreter would accept the alternated
   *      // context as the argument 'context'.
   *      context.someFlag = true;
   *      // When there is wrong, throw it.
   *      throw new Error('Some analyzing error');
   *    };
   *
   * Note that the analyzer ('a') would be invoked with empty 'this' object,
   * so the function relies on 'this' should bind itself first.
   */
  Language.Evaluate.prototype.analyzer = function (a) {
    this._analyzers.push(a);
    return this;
  };

  /**
   * One Evaluate can only have one interpreter, and it would return
   * the function could consume every stack change from 'Language#evaluate'.
   *
   * The code is a little complicated: we have two kinds of 'reducing':
   * one is to reduce all analyzers with the single incoming change,
   * another is to reduce all incoming changes with this analyzers + interpreter.
   *
   * The analyzer and interpreter should change the context, to memorize the
   * states of the evaluation. The difference is interpreter should return one
   * new stack if it needs to update the existing one. The stack it returns would
   * replace the existing one, so anything still in the old one would be wiped
   * out. The interpreter could return nothing ('undefined') to keep the stack
   * untouched.
   *
   * The analyzers and interpreter could change the 'context' pass to them.
   * And since we may update the stack as above, the context should memorize
   * those information not to be overwritten while the stack get wiped out.
   *
   * And if the interpreting node is the exit node of the session, interpreter
   * should return a new stack contains only one final result node. If there
   * is no such node, the result of this session is 'undefined'.
   */
  Language.Evaluate.prototype.interpreter = function (inpt) {
    var _this = this;

    // The customized language should give the default context.
    return function (context, change, stack) {
      try {
        // Analyzers could change the context.
        _this._analyzers.reduce(function (ctx, analyzer) {
          analyzer.call({}, context, change, stack);
        }, context);
      } catch (e) {
        _this._handleError(e, context, change, stack);
      }
      // After analyze it, interpret the node and return the new stack (if any).
      var newStack = inpt(context, change, stack);
      return newStack;
    };
  };

  Language.Evaluate.prototype._handleError = function (err, context, change, stack) {
    // TODO: expand it to provide more sophistic debugging message.
    throw new Error('When change ' + change.type + ' comes error \'' + err + '\' happened');
  };
});
define(['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.SettingsCache = SettingsCache;
  /**
   * A settings getter/setter cache.
   * Provide as few as possible APIs like the native APIs do.
   **/

  function SettingsCache() {
    this.cache = {};
    this.handleSettings = this.handleSettings.bind(this);
  }

  SettingsCache.prototype.get = function (entry) {
    var _this = this;

    if (this.cache[entry]) {
      return Promise.resolve(this.cache[entry]);
    }

    var resolve, reject;
    var promise = new Promise(function (rev, rej) {
      resolve = rev;
      reject = rej;
    });
    var lock = navigator.mozSettings.createLock();
    var req = lock.get(entry);
    req.then(function () {
      _this.cache[entry] = req.result[entry];
      // Once it getted, monitor it to update cache.
      navigator.mozSettings.addObserver(entry, _this.handleSettings);
      resolve(req.result[entry]);
    })['catch'](function () {
      reject(req.error);
    });
    return promise;
  };
  SettingsCache.prototype.set = function (entry, value) {
    var _this2 = this;

    var resolve, reject;
    var promise = new Promise(function (rev, rej) {
      resolve = rev;
      reject = rej;
    });
    var lock = navigator.mozSettings.createLock();
    var reqcontent = {};
    reqcontent[entry] = value;
    var req = lock.set(reqcontent);
    req.then(function () {
      _this2.cache[entry] = value;
      resolve();
    })['catch'](function () {
      reject();
    });
    return promise;
  };
  SettingsCache.prototype.handleSettings = function (evt) {
    var settingsName = evt.settingsName;
    var settingsValue = evt.settingsValue;

    this.cache[settingsName] = settingsValue;
  };
  SettingsCache.prototype.stop = function () {
    var _this3 = this;

    Object.keys(this.cache).forEach(function (entry) {
      navigator.mozSettings.removeObserver(entry, _this3.handleSettings);
    });
  };
});
define(['exports', 'src/source/source_event.js'], function (exports, _srcSourceSource_eventJs) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.DOMEventSource = DOMEventSource;

  /**
   * DOM event source for Stream. One Stream can collect events from multiple
   * sources, which pass different native events (not only DOM events)
   * to Stream.
   **/

  function DOMEventSource(configs) {
    this.configs = {
      events: configs.events || [] };
    this._collector = window.addEventListener.bind(window);
    this._decollector = window.removeEventListener.bind(window);
    this._forwardTo; // The forwarding target.

    // Some API you just can't bind it with the object,
    // but a function.
    this.onchange = this.onchange.bind(this);
  }

  DOMEventSource.prototype.start = function (forwardTo) {
    var _this = this;

    this.configs.events.forEach(function (ename) {
      _this._collector(ename, _this.onchange);
    });
    this._forwardTo = forwardTo;
    return this;
  };

  DOMEventSource.prototype.stop = function () {
    var _this2 = this;

    this._forwardTo = null;
    this.configs.events.forEach(function (ename) {
      _this2._decollector(ename, _this2.onchange);
    });
    return this;
  };

  /**
   * For forwarding to the target.
   */
  DOMEventSource.prototype.onchange = function (domevt) {
    if (this._forwardTo) {
      var sourceEvent = new _srcSourceSource_eventJs.SourceEvent(domevt.type, domevt.detail, domevt);
      this._forwardTo(sourceEvent);
    }
  };
});
define(['exports', 'src/source/source_event.js'], function (exports, _srcSourceSource_eventJs) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.MinuteClockSource = MinuteClockSource;

  /**
   * A source fire events every clock minutes.
   **/

  function MinuteClockSource(configs) {
    this.configs = {
      type: configs.type,
      interval: 60000 // one minute.
    };
    this._tickId = null;
    this._forwardTo = null;
    // Some API you just can't bind it with the object,
    // but a function.
    this.onchange = this.onchange.bind(this);
  }

  MinuteClockSource.prototype.start = function (forwardTo) {
    var _this = this;

    this._forwardTo = forwardTo;
    var seconds = new Date().getSeconds();
    // If it's the #0 second of that minute,
    // immediately tick or we would lost this minute.
    if (0 === seconds) {
      this.onchange();
    }
    // For the first tick we must set timeout for it.
    this._tickId = window.setTimeout(function () {
      _this.tick();
    }, this.calcLeftMilliseconds());
    return this;
  };

  MinuteClockSource.prototype.tick = function () {
    var _this2 = this;

    this.onchange();
    // For the first tick we must set timeout for it.
    this._tickId = window.setTimeout(function () {
      _this2.tick();
    }, this.calcLeftMilliseconds());
  };

  MinuteClockSource.prototype.stop = function () {
    this._forwardTo = null;
    if (this._tickId) {
      window.clearTimeout(this._tickId);
    }
    return this;
  };

  /**
   * For forwarding to the target.
   * When the time is up, fire an event by generator.
   * So that the onchange method would forward it to the target.
   */
  MinuteClockSource.prototype.onchange = function () {
    if (this._forwardTo) {
      this._forwardTo(new _srcSourceSource_eventJs.SourceEvent(this.configs.type));
    }
  };

  MinuteClockSource.prototype.calcLeftMilliseconds = function () {
    var seconds = new Date().getSeconds();
    // If it's at the second 0th of the minute, immediate start to tick.
    var leftMilliseconds = (60 - seconds) * 1000;
    return leftMilliseconds;
  };
});
define(['exports', 'src/source/source_event.js'], function (exports, _srcSourceSource_eventJs) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.SettingSource = SettingSource;

  /**
   * Event source for Stream. One Stream can collect events from multiple
   * sources, which pass different native events (not only DOM events)
   * to Stream.
   **/

  function SettingSource(configs) {
    this.configs = {
      settings: configs.settings || []
    };
    this._collector = navigator.mozSettings.addObserver.bind(navigator.mozSettings);
    this._decollector = navigator.mozSettings.removeObserver.bind(navigator.mozSettings);
    this._forwardTo = null;
    // Some API you just can't bind it with the object,
    // but a function.
    this.onchange = this.onchange.bind(this);
  }

  SettingSource.prototype.start = function (forwardTo) {
    var _this = this;

    this.configs.settings.forEach(function (key) {
      _this._collector(key, _this.onchange);
    });
    this._forwardTo = forwardTo;
    return this;
  };

  SettingSource.prototype.stop = function () {
    var _this2 = this;

    this._forwardTo = null;
    this.configs.settings.forEach(function (key) {
      _this2._decollector(key, _this2.onchange);
    });
    return this;
  };

  /**
   * For forwarding to the target.
   * Would transform the original 'settingName' and 'settingValue' pair as
   * 'type' and 'detail', as the event formant.
   */
  SettingSource.prototype.onchange = function (change) {
    if (this._forwardTo) {
      this._forwardTo(new _srcSourceSource_eventJs.SourceEvent(change.settingName, change.settingValue));
    }
  };
});
define(['exports'], function (exports) {
  'use strict';

  /**
   * A datum that every source would fire.
   **/
  (function (exports) {
    var SourceEvent = function SourceEvent(type, detail, original) {
      this.type = type;
      this.detail = detail;
      this.original = original; // original event, if any.
    };
    exports.SourceEvent = SourceEvent;
  })(window);
});
define(['exports', 'src/stream/stream.js'], function (exports, _srcStreamStreamJs) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.BasicState = BasicState;

  function BasicState(component) {
    // A lock to prevent transferring racing. This is because most of source
    // events are mapped into interrupts to trigger transferrings. To prevent
    // client need to implement this again and again we put the lock here.
    this._transferred = false;
    // Replace with the name of concrete state.
    this.configs = {
      type: 'BasicState',
      // Note the event means events forwarded from sources, not DOM events.
      stream: {
        events: [],
        interrupts: [],
        sources: []
      }
    };
    // Component reference proivdes every resource & property
    // need by all states.
    this.component = component;
  }

  /**
   * Stream' phase is the state's phase.
   */
  BasicState.prototype.phase = function () {
    return this.stream.phase();
  };

  /**
   * Derived states should extend these basic methods.
   */
  BasicState.prototype.start = function () {
    this.stream = new _srcStreamStreamJs.Stream(this.configs.stream);
    return this.stream.start(this.handleSourceEvent.bind(this)).next(this.stream.ready.bind(this.stream));
  };

  BasicState.prototype.stop = function () {
    return this.stream.stop();
  };

  BasicState.prototype.destroy = function () {
    return this.stream.destroy();
  };

  BasicState.prototype.live = function () {
    return this.stream.until('stop');
  };

  BasicState.prototype.exist = function () {
    return this.stream.until('destroy');
  };

  /**
   * Must transfer to next state via component's method.
   * Or the component cannot track the last active state.
   */
  BasicState.prototype.transferTo = function () {
    if (this._transferred) {
      this.logger.debug('Prevent transferring racing');
      var nullifized = new _srcStreamStreamJs.Stream();
      // This would return a process could be concated but would do nothing.
      // It's better to formally provide a API from Process, like
      // Process.maybe() or Process#nullize(), but this is a simplier solution.
      return nullifized.start().next(function () {
        return nullifized.stop();
      });
    }
    // No need to reset it again since a state instance should not be
    // transferred to twice.
    this._transferred = true;
    return this.component.transferTo.apply(this.component, arguments);
  };

  /**
   * If this handler return a Promise, or Process, the underlying Stream
   * can make sure the steps are queued even with asynchronous steps.
   */
  BasicState.prototype.handleSourceEvent = function () {};
});
define(['exports', 'src/stream/process/process.js'], function (exports, _srcStreamProcessProcessJs) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.Stream = Stream;

  /**
   * Combine the abilities of the event handling and asynchronous operations
   * sequentializing together. So that every Stream could:
   *
   * 1. For the ordinary events, append steps to the main Process to queue
   *    the event handlers.
   * 2. For other urgent events (interrupts), immediately execute the event
   *    handler without queuing it.
   * 3. Only receive events when it's 'ready'. Before that, no source events
   *    would be forwarded and handled.
   * 4. Once phase becomes 'stop', no events would be received again.
   *
   * Stream should create with a configs object if user want to set up sources,
   * events and interrupts. If there is no such object, it would act like a
   * Process, and without any function handles events.
   **/

  function Stream() {
    var configs = arguments[0] === undefined ? {} : arguments[0];

    this.configs = {
      events: configs.events || [],
      interrupts: configs.interrupts || []
    };
    if (configs.sources && 0 !== configs.sources.length) {
      this.configs.sources = configs.sources;
    } else {
      this.configs.sources = [];
    }
    this._forwardTo = null;
    // Need to delegate to Source.
    this.onchange = this.onchange.bind(this);
  }

  Stream.prototype.phase = function () {
    return this.process._runtime.states.phase;
  };

  Stream.prototype.start = function (forwardTo) {
    this._forwardTo = forwardTo;
    this.process = new _srcStreamProcessProcessJs.Process();
    this.process.start();
    return this;
  };

  /**
   * Kick off Source and start do things.
   */
  Stream.prototype.ready = function () {
    var _this = this;

    this.configs.sources.forEach(function (source) {
      source.start(_this.onchange);
    });
    return this;
  };

  Stream.prototype.stop = function () {
    this.process.stop();
    this.configs.sources.forEach(function (source) {
      source.stop();
    });
    return this;
  };

  Stream.prototype.destroy = function () {
    this.process.destroy();
    return this;
  };

  Stream.prototype.next = function (step) {
    this.process.next(step);
    return this;
  };

  Stream.prototype.rescue = function (rescuer) {
    this.process.rescue(rescuer);
    return this;
  };

  /**
   * Return a Promise get resolved when the stream turn to
   * the specific phase. For example:
   *
   *    stream.until('stop')
   *          .then(() => { console.log('stream stopped') });
   *    stream.start();
   */
  Stream.prototype.until = function (phase) {
    return this.process.until(phase);
  };

  /**
   * Only when all tasks passed in get resolved,
   * the process would go to the next.
   */
  Stream.prototype.wait = function (tasks) {
    this.process.wait(tasks);
    return this;
  };

  /**
   * It would receive events from Source, and than queue or not queue
   * it, depends on whether the event is an interrupt.
   */
  Stream.prototype.onchange = function (evt) {
    var _this2 = this;

    if ('start' !== this.process._runtime.states.phase) {
      return this;
    }
    if (-1 !== this.configs.interrupts.indexOf(evt.type)) {
      // Interrupt would be handled immediately.
      this._forwardTo(evt);
      return this;
    } else {
      // Event would be handled after queuing.
      // This is, if the event handle return a Promise or Process,
      // that can be fulfilled later.
      this.process.next(function () {
        return _this2._forwardTo(evt);
      });
      return this;
    }
  };
});
define(['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.BasicView = BasicView;
  /**
   * The basic interface of view.
   * View only need to know how to transform data to the
   * synthetic 'effects'.
   *
   * For UI, it means to draw something on the screen.
   * For other views, it means to perform remote queries,
   * play sounds, send commands via network, etc.
   *
   * And how to compose the 'effects' is decided by the component.
   * If one parent need to wait its children, or to collect results
   * from them, the component must derive this view to provide
   * 'then-able' ability to the 'render' method.
   * We don't make any assumptions in this basic interface.
   **/

  function BasicView() {}

  /**
   * If it's a UI view but without virtual DOM,
   * the views must handle detailed DOM manipulations
   * manually. So UI view could be complicated.
   *
   * With virtual DOM it could be very simple, but this depends on the
   * facilities of the project.
   */
  BasicView.prototype.render = function (data) {};
});
define(['exports', 'src/rune/language.js'], function (exports, _srcRuneLanguageJs) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.Interface = Interface;

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

  function Interface(runtime) {
    // Required by the 'Language' module.
    this.context = {
      started: false,
      stopped: false
    };
    this.stack = [];
    this._runtime = runtime;
    this._evaluator = new _srcRuneLanguageJs.Language.Evaluate().analyzer(this._analyzeOrder.bind(this)).interpreter(this._interpret.bind(this));
  }

  Interface.prototype.start = _srcRuneLanguageJs.Language.define('start', 'begin');
  Interface.prototype.stop = _srcRuneLanguageJs.Language.define('stop', 'push');
  Interface.prototype.destroy = _srcRuneLanguageJs.Language.define('destroy', 'push');
  Interface.prototype.next = _srcRuneLanguageJs.Language.define('next', 'push');
  Interface.prototype.shift = _srcRuneLanguageJs.Language.define('shift', 'push');
  Interface.prototype.rescue = _srcRuneLanguageJs.Language.define('rescue', 'push');
  Interface.prototype.wait = _srcRuneLanguageJs.Language.define('wait', 'push');

  // It's not a method owns semantics meaning of the eDSL, but a method
  // interacts with the metalangauge, so define it in this way.
  Interface.prototype.until = function () {
    return this._runtime.until.apply(this._runtime, arguments);
  };

  Interface.prototype.onchange = function (context, node, stack) {
    // When it's changed, evaluate it with analyzers & interpreter.
    return this._evaluator(context, node, stack);
  };

  Interface.prototype._interpret = function (context, node, stack) {
    // Well in this eDSL we delegate the interpretion to the runtime.
    return this._runtime.onchange.apply(this._runtime, arguments);
  };

  // In this eDSL we now only have this analyzer. Could add more and register it
  // in the contruction of 'this._evaluator'.
  Interface.prototype._analyzeOrder = function (context, change, stack) {
    if ('start' === change.type) {
      context.started = true;
    } else if ('stop') {
      context.stopped = true;
    }
    if ('start' === change.type && context.stopped) {
      throw new Error('Should not start a process again' + 'after it\'s already stopped');
    } else if ('next' === change.type && !context.started) {
      throw new Error('Should not concat steps while it\'s not started');
    } else if ('stop' === change.type && !context.started) {
      throw new Error('Should not stop a process before it\'s started');
    }
  };
});
define(['exports', 'src/stream/process/interface.js', 'src/stream/process/runtime.js'], function (exports, _srcStreamProcessInterfaceJs, _srcStreamProcessRuntimeJs) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.Process = Process;

  /**
   * The core component to sequentialize asynchronous steps.
   * Basically it's an 'interruptable promise', but more than be interrupted,
   * it could 'shift' from one to another phase, with the non-preemptive
   * interrupting model.
   *
   * Example:
   *    var process = new Process();
   *    process.start()       // the default phase is 'start'
   *           .next(stepA)
   *           .next(stepB)
   *           ...
   *    // later, some urgent events come
   *    process.stop()       // one of the default three phases
   *           .next(stopStepA)
   *           .next(stopStepB)
   *           ....
   *   // later, some other interrupts come
   *   process.shift('stop', 'dizzy')
   *          .next(dizzyStepA)
   *          .next(dizzyStepB)
   *
   * The phases listed above would immediately interrupt the steps scheduled
   * at the previous phase. However, this is a *non-preemptive* process by
   * default. So, if there is a long-waiting Promise step in the 'start' phase:
   *
   *   process.start()
   *          .next( longlonglongWaitingPromise )   // <--- now it's waiting this
   *          .next( thisStepIsStarving )
   *          .next( andThisOneToo )
   *          .next( poorSteps )
   *          ....
   *   // some urgent event occurs when it goes to the long waiting promise
   *   process.stop()
   *          .next( doThisAsQuickAsPossible )
   *
   * The first step of the 'stop' phase, namely the 'doThisAsQuickAsPossible',
   * would *not* get executed immediately, since the promise is still waiting the
   * last step earlier interruption. So, even the following steps of the 'start'
   * phase would all get dropped, the new phase still need to wait the last one
   * asynchronous step get resolved to get kicked off.
   *
   * ---
   * ## About the non-preemptive model
   *
   * The reason why we can't have a preemptive process is because we couldn't
   * interrupt each single step in the process, so the most basic unit could be
   * interrupted is the step. So, the caveat here is make the step as small as
   * possible, and treat it as some atomic operation that guaranteed to not been
   * interrupted by Process. For example, if we alias 'next' as 'atomic':
   *
   *    process.start()
   *           .atomic(stepA)       // <--- now it's waiting this
   *           .atomic(stepB)
   *
   *   // some urgent event occurs
   *   process.stop()
   *          .atomic( doThisAsQuickAsPossible )
   *
   * It would be better than:
   *
   *    process.start()
   *           .atomic(() => stepA.then(stepB))
   *
   *   // some urgent event occurs
   *   process.stop()
   *          .atomic( doThisAsQuickAsPossible )
   *
   * Since in the second example the first step of the 'stop' phase must wait
   * both the stepA & stepB, while in the first one it only needs to wait stepA.
   * However, this depends on which atomic operations is needed.
   *
   * Nevertheless, user is able to make the steps 'interruptible' via some special
   * methods of the process. That is, to monitor the phase changes to nullify the
   * step:
   *
   *    var process = new Process();
   *    process.start()
   *      .next(() => {
   *        var phaseShifted = false;
   *        process.until('stop')
   *          .next(() => {phaseShifted = true;});
   *        return new Promise((r, rj) => {
   *          setTimeout(() => {
   *            if (phaseShifted) { console.log('do nothing'); }
   *            else              { console.log('do something'); }
   *          }, 1000)
   *        });
   *      })
   *
   *   // some urgent event occurs
   *   process.stop()
   *          .next( doThisAsQuickAsPossible )
   *
   * So that the first step of the 'stop' phase would execute immediately after
   * the phase shifted, since the last step of the previous phase aborted itself.
   * In future the trick to nullify the last step may be included in as a method
   * of Process, but currently the manual detecting is still necessary.
   */

  function Process() {
    this._runtime = new _srcStreamProcessRuntimeJs.Runtime();
    this._interface = new _srcStreamProcessInterfaceJs.Interface(this._runtime);
    return this._interface;
  }

  /**
   * Because DRY.
   */
  Process.defer = function () {
    var resolve, reject;
    var promise = new Promise(function (res, rej) {
      resolve = res;
      reject = rej;
    });
    var result = {
      'resolve': resolve,
      'reject': reject,
      'promise': promise
    };
    return result;
  };

  /* Static version for mimicking Promise.all */
  Process.wait = function () {
    var process = new Process();
    return process.start().wait.apply(process, arguments);
  };
});
define(['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.Runtime = Runtime;

  function Runtime() {
    this.states = {
      phase: null,
      currentPromise: null,
      until: {
        resolver: null,
        phase: null
      },
      // @see: #next
      stepResults: [] };
    this.debugging = {
      // @see: #next
      currentPhaseSteps: 0,
      colors: this.generateDebuggingColor(),
      truncatingLimit: 64
    };
    this.configs = {
      debug: false
    };
  }

  /**
   * When the stack of DSL changes, evaluate the Language.Node.
   * Note: since in this DSL we needn't 'exit' node, we don't handle it.
   * For some other DSL that may return something, the 'exit' node must
   * keep a final stack with only result node inside as ther return value.
   */
  Runtime.prototype.onchange = function (instance, change, stack) {
    // Since we don't need to keep things in stack until we have
    // real analyzers, the 'onchange' handler would return empty stack
    // to let the language runtime clear the stack every instruction.
    this[change.type].apply(this, change.args);
    return [];
  };

  Runtime.prototype.start = function () {
    this.states.phase = 'start';
    this.states.currentPromise = Promise.resolve();
  };

  Runtime.prototype.stop = function () {
    this.shift('start', 'stop');
  };

  Runtime.prototype.destroy = function () {
    this.shift('stop', 'destroy');
  };

  Runtime.prototype.shift = function (prev, current) {
    // Already in.
    if (current === this.states.phase) {
      return;
    }
    if (prev !== this.states.phase) {
      var error = new Error('Must be ' + prev + ' before shift to ' + current + ',\n                     but now it\'s ' + this.states.phase);
      console.error(error);
      throw error;
    }
    this.states.phase = current;
    if (this.until.phase === this.states.phase) {
      this.until.resolver();
    }
    // Concat new step to switch to the 'next promise'.
    this.states.currentPromise = this.states.currentPromise['catch'](function (err) {
      if (!(err instanceof Runtime.InterruptError)) {
        // We need to re-throw it again and bypass the whole
        // phase, until the next phase (final phase) to
        // handle it. Since in Promise, steps after catch would
        // not be affected by the catched error and keep executing.
        throw err;
      }
      // And if it's an interrupt error we do nothing, so that it would
      // make the chain omit this error and execute the following steps.
    });
    // At the moment of shifting, there are no steps belong to the new phase.
    this.debugging.currentPhaseSteps = 0;
  };

  /**
   * Return a Promise that only be resolved when we get shifed to the
   * target phase.
   */
  Runtime.prototype.until = function (phase) {
    var _this = this;

    var promise = new Promise(function (res) {
      _this.states.until.resolver = res;
    });
    return promise;
  };

  /**
   * The 'step' can only be a function return Promise/Process/plain value.
   * No matter a Promise or Process it would return,
   * the chain would concat it as the Promise rule.
   * If it's plain value then this process would ignore it, as
   * what a Promise does.
   *
   * About the resolving values:
   *
   * .next( fnResolveA, fnResolveB )  --> #save [a, b] in this process
   * .next( fnResolveC )              --> #receive [a, b] as first argument
   * .next( fnResolveD )              --> #receive c as first argument
   * .next( fnResolveE, fnResolveF)   --> #each of them receive d as argument
   */
  Runtime.prototype.next = function () {
    var _this2 = this;

    for (var _len = arguments.length, tasks = Array(_len), _key = 0; _key < _len; _key++) {
      tasks[_key] = arguments[_key];
    }

    if (!this.states.currentPromise) {
      throw new Error('Process should initialize with the `start` method');
    }
    // At definition stage, set it's phase.
    // And check if it's a function.
    tasks.forEach(function (task) {
      if ('function' !== typeof task) {
        throw new Error('The task is not a function: ' + task);
      }
      task.phase = _this2.states.phase;
      if (_this2.configs.debug) {
        // Must append stack information here to let debugger output
        // it's defined in where.
        task.tracing = {
          stack: new Error().stack
        };
      }
    });

    // First, concat a 'then' to check interrupt.
    this.states.currentPromise = this.states.currentPromise.then(function () {
      // Would check: if the phase it belongs to is not what we're in,
      // the process need to be interrputed.
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = tasks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var task = _step.value;

          if (_this2.checkInterrupt(task)) {
            throw new Runtime.InterruptError();
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator['return']) {
            _iterator['return']();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    });

    // Read it as:
    // 1. execute all tasks to generate resolvable-promises
    // 2. Promise.all(...) to wait these resolvable-promises
    // 3. append a general error handler after the Promise.all
    //    so that if any error occurs it would print them out
    // So, including the code above, we would have:
    //
    // currentPromise {
    //  [checkInterrupt(tasks)]
    //  [Promise.all([taskA1, taskA2...])]
    //  [error handler] +}
    //
    // The 'checkInterrupt' and 'error handler' wrap the actual steps
    // to do the necessary checks.
    this.states.currentPromise = this.states.currentPromise.then(function () {
      return _this2.generateStep(tasks);
    });
    this.states.currentPromise = this.states.currentPromise['catch'](this.generateErrorLogger({
      'nth-step': this.debugging.currentPhaseSteps
    }));

    // A way to know if these tasks is the first steps in the current phase,
    // and it's also convenient for debugging.
    this.debugging.currentPhaseSteps += 1;
  };

  Runtime.prototype.rescue = function (handler) {
    this.states.currentPromise = this.states.currentPromise['catch'](function (err) {
      if (err instanceof Runtime.InterruptError) {
        // Only built-in phase transferring catch can handle interrupts.
        // Re-throw it until we reach the final catch we set.
        throw err;
      } else {
        handler(err);
      }
    });
  };

  /**
   * An interface to explicitly put multiple tasks execute at one time.
   **/
  Runtime.prototype.wait = function () {
    this.next.apply(this, arguments);
  };

  /**
   * Execute task and get Promises or plain values them return,
   * and then return the wrapped Promise as the next step of this
   * process. The name 'step' indicates the generated Promise,
   * which is one step of the main Promise of the current phase.
   */
  Runtime.prototype.generateStep = function (tasks) {
    var _this3 = this;

    // 'taskResults' means the results of the tasks.
    var taskResults = [];
    if (true === this.configs.debug) {
      this.trace(tasks);
    }

    // So we unwrap the task first, and then put it in the array.
    // Since we need to give the 'currentPromise' a function as what the
    // tasks generate here.
    var chains = tasks.map(function (task) {
      // Reset the registered results.
      // 'previousResults' means the results left by the previous step.
      var previousResults = _this3.states.stepResults;
      var chain;
      // If it has multiple results, means it's a task group
      // generated results.
      if (previousResults.length > 1) {
        chain = task(previousResults);
      } else {
        chain = task(previousResults[0]);
      }
      // Ordinary function returns 'undefine' or other things.
      if (!chain) {
        // It's a plain value.
        // Store it as one of results.
        taskResults.push(chain);
        return Promise.resolve(chain);
      }

      // It's a Process.
      if ('undefined' !== typeof chain._runtime && chain._runtime instanceof Runtime) {
        // Premise: it's a started process.
        return chain._runtime.states.currentPromise.then(function () {
          var guestResults = chain._runtime.states.stepResults;
          // Since we implicitly use 'Promise.all' to run
          // multiple tasks in one step, we need to determinate if
          // there is only one task in the task, or it actually has multiple
          // return values from multiple tasks.
          if (guestResults.length > 1) {
            // We need to transfer the results from the guest Process to the
            // host Process.
            taskResults = taskResults.push(guestResults);
          } else {
            taskResults.push(chain._runtime.states.stepResults[0]);
          }
        });
      } else if (chain.then) {
        // Ordinary promise can be concated immediately.
        return chain.then(function (resolvedValue) {
          taskResults.push(resolvedValue);
        });
      } else {
        // It's a plain value.
        // Store it as one of results.
        taskResults.push(chain);
        return Promise.resolve(chain);
      }
    });
    return Promise.all(chains).then(function () {
      // Because in the previous 'all' we ensure all tasks are executed,
      // and the results of these tasks are collected, so we need
      // to register them as the last results of the last step.
      _this3.states.stepResults = taskResults;
    });
  };

  /** We need this to prevent the step() throw errors.
  * In this catch, we distinguish the interrupt and other errors,
  * and then bypass the former and print the later out.
  *
  * The final fate of the real errors is it would be re-throw again
  * after we print the instance out. We need to do that since after an
  * error the promise shouldn't keep executing. If we don't throw it
  * again, since the error has been catched, the rest steps in the
  * promise would still be executed, and the user-set rescues would
  * not catch this error.
  *
  * As a conclusion, no matter whether the error is an interrupt,
  * we all need to throw it again. The only difference is if it's
  * and interrupt we don't print it out.
  */
  Runtime.prototype.generateErrorLogger = function (debuginfo) {
    return function (err) {
      if (!(err instanceof Runtime.InterruptError)) {
        console.error('ERROR during #' + debuginfo['nth-step'] + '\n          step executes: ' + err.message, err);
      }
      throw err;
    };
  };

  Runtime.prototype.checkInterrupt = function (step) {
    if (step.phase !== this.states.phase) {
      return true;
    }
    return false;
  };

  Runtime.prototype.generateDebuggingColor = function () {
    var colorsets = [{ background: 'red', foreground: 'white' }, { background: 'green', foreground: 'white' }, { background: 'blue', foreground: 'white' }, { background: 'saddleBrown', foreground: 'white' }, { background: 'cyan', foreground: 'darkSlateGray' }, { background: 'gold', foreground: 'darkSlateGray' }, { background: 'paleGreen', foreground: 'darkSlateGray' }, { background: 'plum', foreground: 'darkSlateGray' }];
    var colorset = colorsets[Math.floor(Math.random() * colorsets.length)];
    return colorset;
  };

  Runtime.prototype.trace = function (tasks) {
    var _this4 = this;

    if (false === this.configs.debug) {
      return;
    }
    var log = tasks.reduce(function (mergedMessage, task) {
      var source = String.substring(task.toSource(), 0, _this4.debugging.truncatingLimit);
      var message = ' ' + source + ' ';
      return mergedMessage + message;
    }, '%c ' + tasks[0].phase + '#' + this.debugging.currentPhaseSteps + ' | ');
    // Don't print those inherited functions.
    var stackFilter = new RegExp('^(GleipnirBasic|Process|Stream)');
    var stack = tasks[0].tracing.stack.split('\n').filter(function (line) {
      return '' !== line;
    }).filter(function (line) {
      return !line.match(stackFilter);
    }).join('\n');

    log = log + ' | \n\r' + stack;
    console.log(log, 'background-color: ' + this.debugging.colors.background + ';' + 'color: ' + this.debugging.colors.foreground);
  };

  Runtime.InterruptError = function (message) {
    this.name = 'InterruptError';
    this.message = message || '';
  };

  Runtime.InterruptError.prototype = new Error();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1aWxkZXIvY29tcG9uZW50LmpzIiwiYnVpbGRlci9zdGF0ZS5qcyIsImNvbXBvbmVudC9iYXNpY19jb21wb25lbnQuanMiLCJjb21wb25lbnQvYmFzaWNfc3RvcmUuanMiLCJsb2dnZXIvc3RhdGUuanMiLCJydW5lL2xhbmd1YWdlLmpzIiwic2V0dGluZ3Mvc2V0dGluZ3NfY2FjaGUuanMiLCJzb3VyY2UvZG9tX2V2ZW50X3NvdXJjZS5qcyIsInNvdXJjZS9taW51dGVfY2xvY2tfc291cmNlLmpzIiwic291cmNlL3NldHRpbmdfc291cmNlLmpzIiwic291cmNlL3NvdXJjZV9ldmVudC5qcyIsInN0YXRlL2Jhc2ljX3N0YXRlLmpzIiwic3RyZWFtL3N0cmVhbS5qcyIsInZpZXcvYmFzaWNfdmlldy5qcyIsInN0cmVhbS9wcm9jZXNzL2ludGVyZmFjZS5qcyIsInN0cmVhbS9wcm9jZXNzL3Byb2Nlc3MuanMiLCJzdHJlYW0vcHJvY2Vzcy9ydW50aW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxjQUFZLENBQUM7Ozs7O1VBTUcsT0FBTyxHQUFQLE9BQU87O0FBQWhCLFdBQVMsT0FBTyxHQUFHO0FBQ3hCLFFBQUksQ0FBQyxPQUFPLEdBQUc7QUFDYixXQUFLLEVBQUUsRUFBRTtLQUNWLENBQUM7QUFDRixRQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztBQUNoQixRQUFJLENBQUMsVUFBVSxHQUFHLEFBQUMsSUFBSSxtQkFUaEIsUUFBUSxDQVNpQixRQUFRLEVBQUUsQ0FDdkMsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQ25DLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQzNDLFFBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0dBQ3hCOzs7QUFHRCxTQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxt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LFNBQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsU0FBTyxDQUFDOztBQUV0RSxRQUFJLFdBQVcsR0FBRyxJQUFJLE1BQU0sQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO0FBQ2hFLFFBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBQyxJQUFJLEVBQUs7QUFDOUQsYUFBTyxFQUFFLEtBQUssSUFBSSxDQUFDO0tBQ3BCLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBQyxJQUFJLEVBQUs7QUFDbEIsYUFBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDakMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFZCxPQUFHLEdBQUcsR0FBRyxHQUFHLFNBQVMsR0FBRyxLQUFLLENBQUM7QUFDOUIsV0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsb0JBQW9CLEdBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVSxHQUNyRSxHQUFHLEdBQUcsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0dBQ3ZELENBQUM7O0FBRUYsU0FBTyxDQUFDLGNBQWMsR0FBRyxVQUFTLE9BQU8sRUFBRTtBQUN6QyxRQUFJLENBQUMsSUFBSSxHQUFHLGdCQUFnQixDQUFDO0FBQzdCLFFBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxJQUFJLEVBQUUsQ0FBQztHQUM5QixDQUFDOztBQUVGLFNBQU8sQ0FBQyxjQUFjLENBQUMsU0FBUyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUMiLCJmaWxlIjoiZ2xlaXBuaXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7IExhbmd1YWdlIH0gZnJvbSAnc3JjL3J1bmUvbGFuZ3VhZ2UuanMnO1xuaW1wb3J0IHsgQmFzaWNTdGF0ZSB9IGZyb20gJ3NyYy9zdGF0ZS9iYXNpY19zdGF0ZS5qcyc7XG5pbXBvcnQgeyBCYXNpY0NvbXBvbmVudCB9IGZyb20gJ3NyYy9jb21wb25lbnQvYmFzaWNfY29tcG9uZW50LmpzJztcblxuZXhwb3J0IGZ1bmN0aW9uIEJ1aWxkZXIoKSB7XG4gIHRoaXMuY29udGV4dCA9IHtcbiAgICBfaW5mbzoge31cbiAgfTtcbiAgdGhpcy5zdGFjayA9IFtdO1xuICB0aGlzLl9ldmFsdWF0b3IgPSAobmV3IExhbmd1YWdlLkV2YWx1YXRlKCkpXG4gICAgLmFuYWx5emVyKHRoaXMuX2FuYWx5emVyLmJpbmQodGhpcykpXG4gICAgLmludGVycHJldGVyKHRoaXMuX2ludGVycHJldC5iaW5kKHRoaXMpKTtcbiAgdGhpcy5fY29tcG9uZW50ID0gbnVsbDtcbn1cblxuLy8gVGhlIGxhbmd1YWdlIGludGVyZmFjZS5cbkJ1aWxkZXIucHJvdG90eXBlLnN0YXJ0ID0gTGFuZ3VhZ2UuZGVmaW5lKCdzdGFydCcsICdiZWdpbicpO1xuQnVpbGRlci5wcm90b3R5cGUudHlwZSA9IExhbmd1YWdlLmRlZmluZSgndHlwZScsICdwdXNoJyk7XG5CdWlsZGVyLnByb3RvdHlwZS5jb25maWdzID0gTGFuZ3VhZ2UuZGVmaW5lKCdjb25maWdzJywgJ3B1c2gnKTtcbi8vIFNldCB0aGUgZGVmYXVsdCByZXNvdXJjZXMuXG5CdWlsZGVyLnByb3RvdHlwZS5yZXNvdXJjZXMgPSBMYW5ndWFnZS5kZWZpbmUoJ3Jlc291cmNlcycsICdwdXNoJyk7XG5CdWlsZGVyLnByb3RvdHlwZS5sb2dnZXIgPSBMYW5ndWFnZS5kZWZpbmUoJ2xvZ2dlcicsICdwdXNoJyk7XG5CdWlsZGVyLnByb3RvdHlwZS5tZXRob2RzID0gTGFuZ3VhZ2UuZGVmaW5lKCdtZXRob2RzJywgJ3B1c2gnKTtcbi8vIFRoZSBzZXR1cCBzdGF0ZS4gU2hvdWxkIGdpdmUgdGhlIGNvbnN0cnVjdG9yLlxuQnVpbGRlci5wcm90b3R5cGUuc2V0dXAgPSBMYW5ndWFnZS5kZWZpbmUoJ3NldHVwJywgJ3B1c2gnKTtcbi8vIFRvIGJ1aWxkIGEgY29uc3RydWN0b3IgKyBwcm90b3R5cGVcbkJ1aWxkZXIucHJvdG90eXBlLmJ1aWxkID0gTGFuZ3VhZ2UuZGVmaW5lKCdidWlsZCcsICdleGl0Jyk7XG4vLyBCZXNpZGVzIHRoZSBjb25zdHJ1Y3RvciBhbmQgcHJvdG90eXBlLCBjcmVhdGUgYW4gaW5zdGFuY2UgYW5kIHJldHVybiBpdC5cbkJ1aWxkZXIucHJvdG90eXBlLmluc3RhbmNlID0gTGFuZ3VhZ2UuZGVmaW5lKCdpbnN0YW5jZScsICdleGl0Jyk7XG5cbi8vIFRoZSBwcml2YXRlIG1ldGhvZHMuXG5CdWlsZGVyLnByb3RvdHlwZS5vbmNoYW5nZSA9IGZ1bmN0aW9uKGNvbnRleHQsIG5vZGUsIHN0YWNrKSB7XG4gIC8vIFdoZW4gaXQncyBjaGFuZ2VkLCBldmFsdWF0ZSBpdCB3aXRoIGFuYWx5emVycyAmIGludGVycHJldGVyLlxuICByZXR1cm4gdGhpcy5fZXZhbHVhdG9yKGNvbnRleHQsIG5vZGUsIHN0YWNrKTtcbn07XG5cbkJ1aWxkZXIucHJvdG90eXBlLl9hbmFseXplciA9IGZ1bmN0aW9uKGNvbnRleHQsIG5vZGUsIHN0YWNrKSB7XG4gIGlmICgnc3RhcnQnICE9PSBub2RlLnR5cGUgJiYgIWNvbnRleHQuc3RhcnRlZCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgQmVmb3JlICcke25vZGUudHlwZX0nLCBzaG91bGQgc3RhcnQgdGhlIGJ1aWxkZXIgZmlyc3RgKTtcbiAgfVxuICBzd2l0Y2gobm9kZS50eXBlKSB7XG4gICAgY2FzZSAnc3RhcnQnOlxuICAgICAgY29udGV4dC5zdGFydGVkID0gdHJ1ZTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3R5cGUnOlxuICAgICAgaWYgKDEgIT09IG5vZGUuYXJncy5sZW5ndGggfHwgJ3N0cmluZycgIT09IHR5cGVvZiBub2RlLmFyZ3NbMF0pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAgJyR7bm9kZS50eXBlfSdcbiAgICAgICAgICBleHBlY3QgdG8gaGF2ZSBhIHN0cmluZyBhcyB0aGUgY29tcG9uZW50IHR5cGVgKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2J1aWxkJzpcbiAgICBjYXNlICdpbnN0YW5jZSc6XG4gICAgICAvLyBDaGVjayBpZiBuZWNlc3NhcnkgcHJvcGVydGllcyBhcmUgbWlzc2luZy5cbiAgICAgIC8vIEN1cnJlbnRseSwgJ3NldHVwJyBhbmQgJ3R5cGUnIGlzIG5lY2Vzc2FyeS5cbiAgICAgIGlmICghY29udGV4dC5faW5mby50eXBlIHx8ICdzdHJpbmcnICE9PSB0eXBlb2YgY29udGV4dC5faW5mby50eXBlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQSBzdGF0ZSBzaG91bGQgYXQgbGVhc3Qgd2l0aCB0eXBlYCk7XG4gICAgICB9XG4gICAgICBpZiAoIWNvbnRleHQuX2luZm8uc2V0dXAgfHwgY29udGV4dC5faW5mby5zZXR1cCBpbnN0YW5jZW9mIEJhc2ljU3RhdGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBBIHN0YXRlIHNob3VsZCBhdCBsZWFzdCB3aXRoIHNldHVwIHN0YXRlYCk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgfVxufTtcblxuLyoqXG4gKiBBcyBhbiBvcmRpbmFyeSBpbnRlcnByZXRpbmcgZnVuY3Rpb246IGRvIHNvbWUgZWZmZWN0cyBhY2NvcmRpbmcgdG8gdGhlIG5vZGUsXG4gKiBhbmQgcmV0dXJuIHRoZSBmaW5hbCBzdGFjayBhZnRlciBlbmRpbmcuXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLl9pbnRlcnByZXQgPSBmdW5jdGlvbihjb250ZXh0LCBub2RlLCBzdGFjaykge1xuICBpZiAoJ3N0YXJ0JyA9PT0gbm9kZS50eXBlKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIElmIHRoZSBpbmZvcm1hdGlvbiBhcmUgZ2F0aGVyZWQsIGFjY29yZGluZyB0byB0aGUgaW5mb3JtYXRpb25cbiAgLy8gdXNlciBnYXZlIHRvIGJ1aWxkIGEgc3RhdGUuXG4gIGlmICgnYnVpbGQnICE9PSBub2RlLnR5cGUgJiYgJ2luc3RhbmNlJyAhPT0gbm9kZS50eXBlKSB7XG4gICAgLy8gU2luY2UgYWxsIHRoZXNlIG1ldGhvZHMgYXJlIG9ubHkgbmVlZCBvbmUgYXJndW1lbnQuXG4gICAgY29udGV4dC5faW5mb1tub2RlLnR5cGVdID0gbm9kZS5hcmdzWzBdO1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgX2luZm8gPSBjb250ZXh0Ll9pbmZvO1xuICBjb250ZXh0Ll9jb21wb25lbnQgPSBmdW5jdGlvbih2aWV3KSB7XG4gICAgQmFzaWNDb21wb25lbnQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLnJlc291cmNlcyA9IF9pbmZvLnJlc291cmNlcyB8fCB0aGlzLnJlc291cmNlcztcbiAgICB0aGlzLmNvbmZpZ3MgPSBfaW5mby5jb25maWdzIHx8IHRoaXMuY29uZmlncztcbiAgICB0aGlzLmxvZ2dlciA9IF9pbmZvLmxvZ2dlciB8fCB0aGlzLmxvZ2dlcjtcbiAgICB0aGlzLnR5cGUgPSBfaW5mby50eXBlO1xuICAgIHRoaXMuX3NldHVwU3RhdGUgPSBuZXcgX2luZm8uc2V0dXAodGhpcyk7XG4gIH07XG4gIGNvbnRleHQuX2NvbXBvbmVudC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhc2ljQ29tcG9uZW50LnByb3RvdHlwZSk7XG4gIGlmIChfaW5mby5tZXRob2RzKSB7XG4gICAgT2JqZWN0LmtleXMoX2luZm8ubWV0aG9kcykuZm9yRWFjaChmdW5jdGlvbihtZXRob2ROYW1lKSB7XG4gICAgICBjb250ZXh0Ll9jb21wb25lbnQucHJvdG90eXBlW21ldGhvZE5hbWVdID0gX2luZm8ubWV0aG9kc1ttZXRob2ROYW1lXTtcbiAgICB9KTtcbiAgfVxuICBpZiAoJ2J1aWxkJyA9PT0gbm9kZS50eXBlKSB7XG4gICAgLy8gVGhlIG9ubHkgb25lIG5vZGUgb24gdGhlIHN0YWNrIHdvdWxkIGJlIHJldHVybmVkLlxuICAgIHN0YWNrID0gWyBjb250ZXh0Ll9jb21wb25lbnQgXTtcbiAgICByZXR1cm4gc3RhY2s7XG4gIH1cbiAgaWYgKCdpbnN0YW5jZScgPT09IG5vZGUudHlwZSkge1xuICAgIC8vIFNpbmNlICdpbnN0YW5jZScgbWF5IHBhc3Mgc29tZSBhcmd1bWVudHMgdG8gdGhlIGNvbnN0cnVjdG9yLFxuICAgIC8vIHdlIG5lZWQgdG8gYXBwbHkgaXQgcmF0aGVyIHRoYW4gbmV3IGl0LlxuICAgIHZhciB0YXJnZXQgPSBPYmplY3QuY3JlYXRlKGNvbnRleHQuX2NvbXBvbmVudC5wcm90b3R5cGUpO1xuICAgIGNvbnRleHQuX2NvbXBvbmVudC5hcHBseSh0YXJnZXQsIG5vZGUuYXJncyk7XG4gICAgc3RhY2sgPSBbIHRhcmdldCBdO1xuICAgIHJldHVybiBzdGFjaztcbiAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHsgTGFuZ3VhZ2UgfSBmcm9tICdzcmMvcnVuZS9sYW5ndWFnZS5qcyc7XG5pbXBvcnQgeyBCYXNpY1N0YXRlIH0gZnJvbSAnc3JjL3N0YXRlL2Jhc2ljX3N0YXRlLmpzJztcblxuLyoqXG4gKiBVc2UgdGhpcyBidWlsZGVyIHRvIGJ1aWxkIHN0YXRlcyBpbiBhIGNvbXBvbmVudC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEJ1aWxkZXIoKSB7XG4gIHRoaXMuY29udGV4dCA9IHtcbiAgICBfaW5mbzoge31cbiAgfTtcbiAgdGhpcy5zdGFjayA9IFtdO1xuICAvLyBXaXRoIHRoaXMgaGVscGVyIHdlIGdldCB0aGUgZXZhbHVhdG9yLlxuICB0aGlzLl9ldmFsdWF0b3IgPSAobmV3IExhbmd1YWdlLkV2YWx1YXRlKCkpXG4gICAgLmFuYWx5emVyKHRoaXMuX2FuYWx5emVyLmJpbmQodGhpcykpXG4gICAgLmludGVycHJldGVyKHRoaXMuX2ludGVycHJldC5iaW5kKHRoaXMpKTtcbiAgdGhpcy5fc3RhdGUgPSBudWxsO1xufVxuXG4vLyBUaGUgbGFuZ3VhZ2UgaW50ZXJmYWNlLlxuQnVpbGRlci5wcm90b3R5cGUuc3RhcnQgPSBMYW5ndWFnZS5kZWZpbmUoJ3N0YXJ0JyAsJ2JlZ2luJyk7XG5CdWlsZGVyLnByb3RvdHlwZS5jb21wb25lbnQgPSBMYW5ndWFnZS5kZWZpbmUoJ2NvbXBvbmVudCcgLCdwdXNoJyk7XG5CdWlsZGVyLnByb3RvdHlwZS5ldmVudHMgPSBMYW5ndWFnZS5kZWZpbmUoJ2V2ZW50cycsICdwdXNoJyk7XG5CdWlsZGVyLnByb3RvdHlwZS5pbnRlcnJ1cHRzID0gTGFuZ3VhZ2UuZGVmaW5lKCdpbnRlcnJ1cHRzJywgJ3B1c2gnKTtcbkJ1aWxkZXIucHJvdG90eXBlLnNvdXJjZXMgPSBMYW5ndWFnZS5kZWZpbmUoJ3NvdXJjZXMnLCAncHVzaCcpO1xuQnVpbGRlci5wcm90b3R5cGUudHlwZSA9IExhbmd1YWdlLmRlZmluZSgndHlwZScsICdwdXNoJyk7XG5CdWlsZGVyLnByb3RvdHlwZS5oYW5kbGVyID0gTGFuZ3VhZ2UuZGVmaW5lKCdoYW5kbGVyJywgJ3B1c2gnKTtcbkJ1aWxkZXIucHJvdG90eXBlLm1ldGhvZHMgPSBMYW5ndWFnZS5kZWZpbmUoJ21ldGhvZHMnLCAncHVzaCcpO1xuLy8gVG8gYnVpbGQgYSBjb25zdHJ1Y3RvciArIHByb3RvdHlwZVxuQnVpbGRlci5wcm90b3R5cGUuYnVpbGQgPSBMYW5ndWFnZS5kZWZpbmUoJ2J1aWxkJywgJ2V4aXQnKTtcbi8vIEJlc2lkZXMgdGhlIGNvbnN0cnVjdG9yIGFuZCBwcm90b3R5cGUsIGNyZWF0ZSBhbiBpbnN0YW5jZSBhbmQgcmV0dXJuIGl0LlxuQnVpbGRlci5wcm90b3R5cGUuaW5zdGFuY2UgPSBMYW5ndWFnZS5kZWZpbmUoJ2luc3RhbmNlJywgJ2V4aXQnKTtcblxuLy8gVGhlIHByaXZhdGUgbWV0aG9kcy5cbkJ1aWxkZXIucHJvdG90eXBlLm9uY2hhbmdlID0gZnVuY3Rpb24oY29udGV4dCwgbm9kZSwgc3RhY2spIHtcbiAgLy8gV2hlbiBpdCdzIGNoYW5nZWQsIGV2YWx1YXRlIGl0IHdpdGggYW5hbHl6ZXJzICYgaW50ZXJwcmV0ZXIuXG4gIHJldHVybiB0aGlzLl9ldmFsdWF0b3IoY29udGV4dCwgbm9kZSwgc3RhY2spO1xufTtcblxuQnVpbGRlci5wcm90b3R5cGUuX2FuYWx5emVyID0gZnVuY3Rpb24oY29udGV4dCwgbm9kZSwgc3RhY2spIHtcbiAgaWYgKCdzdGFydCcgIT09IG5vZGUudHlwZSAmJiAhY29udGV4dC5zdGFydGVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBCZWZvcmUgJyR7bm9kZS50eXBlfScsIHNob3VsZCBzdGFydCB0aGUgYnVpbGRlciBmaXJzdGApO1xuICB9XG4gIHN3aXRjaChub2RlLnR5cGUpIHtcbiAgICBjYXNlICdzdGFydCc6XG4gICAgICBjb250ZXh0LnN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY29tcG9uZW50JzpcbiAgICAgIGlmICgxICE9PSBub2RlLmFyZ3MubGVuZ3RoIHx8ICdvYmplY3QnICE9PSB0eXBlb2Ygbm9kZS5hcmdzWzBdIHx8XG4gICAgICAgICAgJ2Z1bmN0aW9uJyAhPT0gdHlwZW9mIG5vZGUuYXJnc1swXS50cmFuc2ZlclRvKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgICcke25vZGUudHlwZX0nXG4gICAgICAgICAgZXhwZWN0IHRvIGJlIGEgY29tcG9uZW50IHdpdGggbWV0aG9kICd0cmFuc2ZlclRvJ2ApO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAndHlwZSc6XG4gICAgICBpZiAoMSAhPT0gbm9kZS5hcmdzLmxlbmd0aCB8fCAnc3RyaW5nJyAhPT0gdHlwZW9mIG5vZGUuYXJnc1swXSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCAnJHtub2RlLnR5cGV9J1xuICAgICAgICAgIGV4cGVjdCB0byBoYXZlIGEgc3RyaW5nIGFzIHRoZSBzdGF0ZSB0eXBlYCk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdldmVudHMnOlxuICAgIGNhc2UgJ2ludGVycnVwdHMnOlxuICAgIGNhc2UgJ3NvdXJjZXMnOlxuICAgICAgaWYgKCFub2RlLmFyZ3NbMF0gfHwgIUFycmF5LmlzQXJyYXkobm9kZS5hcmdzWzBdKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCAnJHtub2RlLnR5cGV9J1xuICAgICAgICAgIGV4cGVjdHMgdG8gaGF2ZSBhbiBhcnJheSBhcmd1bWVudGApO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnaGFuZGxlcic6XG4gICAgICBpZiAoIW5vZGUuYXJnc1swXSB8fCAnZnVuY3Rpb24nICE9PSB0eXBlb2Ygbm9kZS5hcmdzWzBdKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgICcke25vZGUudHlwZX0nXG4gICAgICAgICAgZXhwZWN0IHRvIGhhdmUgYW4gZnVuY3Rpb24gYXJndW1lbnRgKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ21ldGhvZHMnOlxuICAgICAgaWYgKCFub2RlLmFyZ3NbMF0gfHwgJ29iamVjdCcgIT09IHR5cGVvZiBub2RlLmFyZ3NbMF0pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAgJyR7bm9kZS50eXBlfSdcbiAgICAgICAgICBleHBlY3QgdG8gaGF2ZSBhbiBtYXAgb2YgZnVuY3Rpb25zYCk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdidWlsZCc6XG4gICAgY2FzZSAnaW5zdGFuY2UnOlxuICAgICAgLy8gQ2hlY2sgaWYgbmVjZXNzYXJ5IHByb3BlcnRpZXMgYXJlIG1pc3NpbmcuXG4gICAgICAvLyBDdXJyZW50bHkgb25seSAndHlwZScgaXMgbmVjZXNzYXJ5LlxuICAgICAgaWYgKCFjb250ZXh0Ll9pbmZvLnR5cGUgfHwgJ3N0cmluZycgIT09IHR5cGVvZiBjb250ZXh0Ll9pbmZvLnR5cGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBBIHN0YXRlIHNob3VsZCBhdCBsZWFzdCB3aXRoIHR5cGVgKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICB9XG59O1xuXG4vKipcbiAqIEFzIGFuIG9yZGluYXJ5IGludGVycHJldGluZyBmdW5jdGlvbjogZG8gc29tZSBlZmZlY3RzIGFjY29yZGluZyB0byB0aGUgbm9kZSxcbiAqIGFuZCByZXR1cm4gdGhlIGZpbmFsIHN0YWNrIGFmdGVyIGVuZGluZy5cbiAqL1xuQnVpbGRlci5wcm90b3R5cGUuX2ludGVycHJldCA9IGZ1bmN0aW9uKGNvbnRleHQsIG5vZGUsIHN0YWNrKSB7XG4gIGlmICgnc3RhcnQnID09PSBub2RlLnR5cGUpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gSWYgdGhlIGluZm9ybWF0aW9uIGFyZSBnYXRoZXJlZCwgYWNjb3JkaW5nIHRvIHRoZSBpbmZvcm1hdGlvblxuICAvLyB1c2VyIGdhdmUgdG8gYnVpbGQgYSBzdGF0ZS5cbiAgaWYgKCdidWlsZCcgIT09IG5vZGUudHlwZSAmJiAnaW5zdGFuY2UnICE9PSBub2RlLnR5cGUpIHtcbiAgICAvLyBTaW5jZSBhbGwgdGhlc2UgbWV0aG9kcyBhcmUgb25seSBuZWVkIG9uZSBhcmd1bWVudC5cbiAgICBjb250ZXh0Ll9pbmZvW25vZGUudHlwZV0gPSBub2RlLmFyZ3NbMF07XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBfaW5mbyA9IGNvbnRleHQuX2luZm87XG4gIGNvbnRleHQuX3N0YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgQmFzaWNTdGF0ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMuY29uZmlncy50eXBlID0gX2luZm8udHlwZTtcbiAgICB0aGlzLmNvbmZpZ3Muc3RyZWFtLmV2ZW50cyA9IF9pbmZvLmV2ZW50cyB8fCBbXTtcbiAgICB0aGlzLmNvbmZpZ3Muc3RyZWFtLmludGVycnVwdHMgPSBfaW5mby5pbnRlcnJ1cHRzIHx8IFtdO1xuICAgIHRoaXMuY29uZmlncy5zdHJlYW0uc291cmNlcyA9IF9pbmZvLnNvdXJjZXMgfHwgW107XG4gICAgdGhpcy5oYW5kbGVTb3VyY2VFdmVudCA9IF9pbmZvLmhhbmRsZXIuYmluZCh0aGlzKTtcbiAgfTtcbiAgY29udGV4dC5fc3RhdGUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNpY1N0YXRlLnByb3RvdHlwZSk7XG4gIGlmIChfaW5mby5tZXRob2RzKSB7XG4gICAgT2JqZWN0LmtleXMoX2luZm8ubWV0aG9kcykuZm9yRWFjaChmdW5jdGlvbihtZXRob2ROYW1lKSB7XG4gICAgICBjb250ZXh0Ll9zdGF0ZS5wcm90b3R5cGVbbWV0aG9kTmFtZV0gPSBfaW5mby5tZXRob2RzW21ldGhvZE5hbWVdO1xuICAgIH0pO1xuICB9XG4gIGlmICgnYnVpbGQnID09PSBub2RlLnR5cGUpIHtcbiAgICAvLyBUaGUgb25seSBvbmUgbm9kZSBvbiB0aGUgc3RhY2sgd291bGQgYmUgcmV0dXJuZWQuXG4gICAgc3RhY2sgPSBbIGNvbnRleHQuX3N0YXRlIF07XG4gICAgcmV0dXJuIHN0YWNrO1xuICB9XG4gIGlmICgnaW5zdGFuY2UnID09PSBub2RlLnR5cGUpIHtcbiAgICBpZiAoJ29iamVjdCcgIT09IHR5cGVvZiBfaW5mby5jb21wb25lbnQgfHxcbiAgICAgICAgJ2Z1bmN0aW9uJyAhPT0gdHlwZW9mIF9pbmZvLmNvbXBvbmVudC50cmFuc2ZlclRvKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEEgc3RhdGUgaW5zdGFuY2Ugc2hvdWxkIGhhdmUgYSBjb21wb25lbnRgKTtcbiAgICB9XG4gICAgc3RhY2sgPSBbIG5ldyBjb250ZXh0Ll9zdGF0ZShfaW5mby5jb21wb25lbnQpIF07XG4gICAgcmV0dXJuIHN0YWNrO1xuICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgeyBMb2dnZXIgYXMgU3RhdGVMb2dnZXIgfSBmcm9tICdzcmMvbG9nZ2VyL3N0YXRlLmpzJztcblxuLyoqXG4gKiBDb21wb25lbnQgcHJvdmlkZXM6XG4gKlxuICogMS4gUmVzb3VyY2Uga2VlcGVyOiB0byBsZXQgYWxsIHN0YXRlcyBzaGFyZSB0aGUgc2FtZSByZXNvdXJjZXMgKGNhY2hlKS5cbiAqIDIuIFJlZmVyZW5jZSB0byB0aGUgY3VycmVudCBhY3RpdmF0ZSBzdGF0ZTogc28gdGhhdCBwYXJlbnQgY29tcG9uZW50IGNhblxuICogICAgY29tbWFuZCBhbmQgd2FpdCB0aGUgc3ViLWNvbXBvbmVudHMgdG8gZG8gdGhpbmdzIHdpdGhvdXQgdHJhY2tpbmcgdGhlXG4gKiAgICBhY3R1YWwgYWN0aXZlIHN0YXRlLlxuICpcbiAqIEV2ZXJ5IHN0YXRlcyBvZiB0aGlzIGNvbXBvbmVudCB3b3VsZCByZWNlaXZlIHRoZSBDb21wb25lbnQgaW5zdGFuY2UgYXNcbiAqIGEgd2F5IHRvIGFjY2VzcyB0aGVzZSBjb21tb24gcmVzb3VyY2VzICYgcHJvcGVydGllcy4gQW5kIGV2ZXJ5IHN0YXRlXG4gKiB0cmFuc2ZlcnJpbmcgd291bGQgZG9uZSBieSB0aGUgJ3RyYW5zZmVyVG8nIG1ldGhvZCBpbiB0aGlzIGNvbXBvbmVudCxcbiAqIHNvIHRoYXQgdGhlIGNvbXBvbmVudCBjYW4gdXBkYXRlIHRoZSBhY3RpdmUgc3RhdGUgY29ycmVjdGx5LlxuICovXG5cbi8qKlxuICogVGhlIGFyZ3VtZW50ICd2aWV3JyBpcyB0aGUgb25seSB0aGluZyBwYXJlbnQgY29tcG9uZW50IG5lZWRzIHRvIG1hbmFnZS5cbiAqIFBsZWFzZSBub3RlIHRoYXQgdGhlICd2aWV3JyBpc24ndCBmb3IgVUkgcmVuZGVyaW5nLCBhbHRob3VnaCB0aGF0XG4gKiBVSSB2aWV3IGlzIHRoZSBtb3N0IGNvbW1vbiBvZiB0aGVtLiBVc2VyIGNvdWxkIGNob3NlIG90aGVyIHZpZXdzIGxpa2VcbiAqIGRhdGEtdmlldyBvciBkZWJ1Z2dpbmctdmlldyB0byBjb250cnVjdCB0aGUgcHJvZ3JhbS4gSXQgd291bGQgc3RpbGxcbiAqIGJlIFwicmVuZGVyZWRcIiAocGVyZm9ybSB0aGUgZWZmZWN0KSwgYnV0IGhvdyB0byBzeW50aGVzaXplIHRoZSBlZmZlY3RzXG4gKiBvZiBwYXJlbnQgYW5kIGNoaWxkcmVuIG5vdyBpcyB0aGUgdXNlcidzIGR1dHkuIEZvciBleGFtcGxlLCBpZiB3ZSBoYXZlIGFcbiAqICdjb25zb2xlLXZpZXcnIHRvIHByaW50IG91dCB0aGluZ3MgaW5zdGVhZCBvZiByZW5kZXJpbmcgVUksIHNob3VsZCBpdFxuICogcHJpbnQgdGV4dCBmcm9tIGNoaWxkcmVuIGZpcnN0PyBPciB0aGUgcGFyZW50LCBzaW5jZSBpdCdzIGEgd3JhcHBpbmdcbiAqIG9iamVjdCwgc2hvdWxkIGluZm8gdGhlIHVzZXIgaXRzIHN0YXR1cyBlYXJsaWVyIHRoYW4gaXRzIGNoaWxkcmVuP1xuICogVGhlc2UgYmVoYXZpb3JzIHNob3VsZCBiZSBlbmNhcHN1bGF0ZWQgaW5zaWRlIHRoZSAndmlldycsIGFuZCBiZVxuICogaGFuZGxlZCBhdCB0aGUgdW5kZXJseWluZyBsZXZlbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEJhc2ljQ29tcG9uZW50KHZpZXcpIHtcbiAgdGhpcy5fc3ViY29tcG9uZW50cyA9IG51bGw7XG4gIHRoaXMuX2FjdGl2ZVN0YXRlID0gbnVsbDtcbiAgLy8gQ29uY3JldGUgY29tcG9uZW50cyBzaG91bGQgZXh0ZW5kIHRoZXNlIHRvIGxldCBTdGF0ZXMgYWNjZXNzIHRoZW0uXG4gIC8vIFRoZSBmaXJzdCBzdGF0ZSBjb21wb25lbnQga2ljayBvZmYgc2hvdWxkIHRha2UgcmVzcG9uc2liaWxpdHkgZm9yXG4gIC8vIGluaXRpYWxpemluZyB0aGVzZSB0aGluZ3MuXG4gIC8vXG4gIC8vIFJlc291cmNlcyBpcyBmb3IgZXh0ZXJuYWwgcmVzb3VyY2VzIGxpa2Ugc2V0dGluZ3MgdmFsdWUgb3IgRE9NIGVsZW1lbnRzLlxuICB0aGlzLnJlc291cmNlcyA9IHtcbiAgICBlbGVtZW50czoge31cbiAgfTtcbiAgdGhpcy5jb25maWdzID0ge1xuICAgIGxvZ2dlcjoge1xuICAgICAgZGVidWc6IGZhbHNlICAgIC8vIHR1cm4gb24gaXQgd2hlbiB3ZSdyZSBkZWJ1Z2dpbmcgdGhpcyBjb21wb25lbnRcbiAgICB9XG4gIH07XG5cbiAgLy8gVGhlIGRlZmF1bHQgbG9nZ2VyLlxuICAvLyBBIGN1c3RvbWl6ZWQgbG9nZ2VyIGlzIGFjY2V0YWJsZSBpZiBpdCdzIHdpdGggdGhlICd0cmFuc2ZlcicgbWV0aG9kXG4gIC8vIGZvciBsb2dnaW5nIHRoZSBzdGF0ZSB0cmFuc2ZlcnJpbmcuXG4gIHRoaXMubG9nZ2VyID0gbmV3IFN0YXRlTG9nZ2VyKCk7XG4gIHRoaXMudmlldyA9IHZpZXc7XG4gIC8vIFNob3VsZCBhdCBsZWFzdCBhcHBvaW50IHRoZXNlLlxuICB0aGlzLnR5cGUgPSBudWxsO1xuICB0aGlzLl9zZXR1cFN0YXRlID0gbnVsbDtcbn1cblxuLyoqXG4gKiBTdGF0ZScgcGhhc2UgaXMgdGhlIGNvbXBvbmVudCdzIHBoYXNlLlxuICovXG5CYXNpY0NvbXBvbmVudC5wcm90b3R5cGUucGhhc2UgPVxuZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLl9hY3RpdmVTdGF0ZS5waGFzZSgpO1xufTtcblxuLyoqXG4gKiBFdmVyeSBzdGF0ZSBvZiB0aGlzIGNvbXBvbmVudCBzaG91bGQgY2FsbCB0aGUgbWV0aG9kIHRvIGRvIHRyYW5zZmVycmluZyxcbiAqIHNvIHRoYXQgdGhlIGNvbXBvbmVudCBjYW4gdXBkYXRlIHRoZSAnYWN0aXZlU3RhdGUnIGNvcnJlY3RseS5cbiAqXG4gKiBUaGUgb3JkZXIgb2YgdHJhbnNmZXJyaW5nIGlzOlxuICpcbiAqICBbY3VycmVudC5zdG9wXSAtPiBbbmV4dC5zdGFydF0gLT4gKGNhbGwpW3ByZXZpb3VzLmRlc3Ryb3ldXG4gKlxuICogTm90ZSB0aGlzIGZ1bmN0aW9uIG1heSByZXR1cm4gYSBudWxsaXplZCBwcm9jZXNzIGlmIGl0J3MgdHJhbnNmZXJyaW5nLFxuICogc28gdGhlIHVzZXIgbXVzdCBkZXRlY3QgaWYgdGhlIHJldHVybiB0aGluZyBpcyBhIHZhbGlkIHByb2Nlc3NcbiAqIGNvdWxkIGJlIGNoYWluZWQsIG9yIHByZS1jaGVjayBpdCB3aXRoIHRoZSBwcm9wZXJ0eS5cbiAqL1xuQmFzaWNDb21wb25lbnQucHJvdG90eXBlLnRyYW5zZmVyVG8gPSBmdW5jdGlvbihjbGF6eiwgcmVhc29uID0ge30pIHtcbiAgdmFyIG5leHRTdGF0ZSA9IG5ldyBjbGF6eih0aGlzKTtcbiAgdmFyIGN1cnJlbnRTdGF0ZSA9IHRoaXMuX2FjdGl2ZVN0YXRlO1xuICB0aGlzLl9hY3RpdmVTdGF0ZSA9IG5leHRTdGF0ZTtcbiAgdGhpcy5sb2dnZXIudHJhbnNmZXIoY3VycmVudFN0YXRlLmNvbmZpZ3MudHlwZSxcbiAgICAgIG5leHRTdGF0ZS5jb25maWdzLnR5cGUsIHJlYXNvbik7XG4gIHJldHVybiBjdXJyZW50U3RhdGUuc3RvcCgpXG4gICAgLm5leHQoKCkgPT4gbmV4dFN0YXRlLnN0YXJ0KCkpO1xufTtcblxuLyoqXG4gKiBXb3VsZCByZWNlaXZlIHJlc291cmNlcyBmcm9tIHBhcmVudCBhbmQgKmV4dGVuZHMqIHRoZSBkZWZhdWx0IG9uZS5cbiAqIEFmdGVyIHRoYXQsIHRyYW5zZmVyIHRvIHRoZSBuZXh0IHN0YXRlLCB3aGljaCBpcyB1c3VhbGx5IGFuIGluaXRpYWxpemF0aW9uXG4gKiBzdGF0ZSwgdGhhdCB3b3VsZCBkbyBsb3RzIG9mIHN5bmMvYXN5bmMgdGhpbmdzIHRvIHVwZGF0ZSB0aGVcbiAqIHJlc291cmNlcyAmIHByb3BlcnRpZXMuXG4gKlxuICogSG93ZXZlciwgc2luY2UgYmFzaWMgY29tcG9uZW50IGNvdWxkbid0IGtub3cgd2hhdCBpcyB0aGVcbiAqIGluaXRpYWxpemF0aW9uIHN0YXRlLCBzbyB0aGF0IHRoZSBjb25jcmV0ZSBjb21wb25lbnQgc2hvdWxkXG4gKiBpbXBsZW1lbnQgdGhlIHNldHVwIGZ1bmN0aW9uLCB3aGljaCB3b3VsZCByZXR1cm4gdGhlIHN0YXRlIGFmdGVyXG4gKiByZWNlaXZlIHRoZSBjb21wb25lbnQgaW5zdGFuY2UuXG4gKi9cbkJhc2ljQ29tcG9uZW50LnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKHJlc291cmNlcykge1xuICB0aGlzLmxvZ2dlci5zdGFydCh0aGlzLmNvbmZpZ3MubG9nZ2VyKTtcbiAgaWYgKHJlc291cmNlcykge1xuICAgIGZvciAodmFyIGtleSBpbiB0aGlzLnJlc291cmNlcykge1xuICAgICAgaWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgcmVzb3VyY2VzW2tleV0pIHtcbiAgICAgICAgdGhpcy5yZXNvdXJjZXNba2V5XSA9IHJlc291cmNlc1trZXldO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICAvLyBHZXQgdGhlIGluaXRpYWxpemF0aW9uIHN0YXRlIGFuZCBsZXQgaXQgZmV0Y2ggJiBzZXQgYWxsLlxuICAvLyAnaW5pdGlhbGl6ZVN0YXRlTWFjaGluZScsIGlmIEphdmEgZG9vbWVkIHRoZSB3b3JsZC5cbiAgLy8gKGFuZCB0aGlzIGlzIEVDTUFTY3JpcHQsIGEgbGFuZ3VhZ2UgKHBhcnRpYWxseSkgaW5zcGlyZWQgYnkgU2NoZW1lISkuXG4gIHRoaXMuX2FjdGl2ZVN0YXRlID0gdGhpcy5fc2V0dXBTdGF0ZTtcbiAgcmV0dXJuIHRoaXMuX2FjdGl2ZVN0YXRlLnN0YXJ0KCk7XG59O1xuXG5CYXNpY0NvbXBvbmVudC5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5fYWN0aXZlU3RhdGUuc3RvcCgpXG4gICAgLm5leHQodGhpcy53YWl0Q29tcG9uZW50cy5iaW5kKHRoaXMsICdzdG9wJykpO1xufTtcblxuQmFzaWNDb21wb25lbnQucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuX2FjdGl2ZVN0YXRlLmRlc3Ryb3koKVxuICAgIC5uZXh0KHRoaXMud2FpdENvbXBvbmVudHMuYmluZCh0aGlzLCAnZGVzdHJveScpKVxuICAgIC5uZXh0KCgpID0+IHsgdGhpcy5sb2dnZXIuc3RvcCgpOyB9KTsgIC8vIExvZ2dlciBuZWVkIGFkZCBwaGFzZSBzdXBwb3J0LlxufTtcblxuQmFzaWNDb21wb25lbnQucHJvdG90eXBlLmxpdmUgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuX2FjdGl2ZVN0YXRlLnVudGlsKCdzdG9wJyk7XG59O1xuXG5CYXNpY0NvbXBvbmVudC5wcm90b3R5cGUuZXhpc3QgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuX2FjdGl2ZVN0YXRlLnVudGlsKCdkZXN0cm95Jyk7XG59O1xuXG4vKipcbiAqIENhbiBjb21tYW5kIGFsbCBzdWItY29tcG9uZW50cyB3aXRoIG9uZSBtZXRob2QgYW5kIGl0cyBhcmd1bWVudHMuXG4gKiBGb3IgZXhhbXBsZSwgdG8gJ3N0YXJ0Jywgb3IgJ3N0b3AnIHRoZW0uXG4gKiBXaWxsIHJldHVybiBhIFByb21pc2Ugb25seSBiZSByZXNvbHZlZCBhZnRlciBhbGwgc3ViLWNvbXBvbmVudHNcbiAqIGV4ZWN1dGVkIHRoZSBjb21tYW5kLiBGb3IgZXhhbXBsZTpcbiAqXG4gKiBzdWJjb21wb25lbnRzOiB7XG4gKiAgICBidXR0b25zOiBbQnV0dG9uRm9vLCBCdXR0b25CYXJdXG4gKiAgICBzdWJtaXQ6IFN1Ym1pdFxuICogfVxuICogdmFyIHByb21pc2VkID0gcGFyZW50LndhaXRDb21wb25lbnRzKHBhcmVudC5zdG9wLmJpbmQocGFyZW50KSk7XG4gKlxuICogVGhlIHByb21pc2VkIHdvdWxkIGJlIHJlc29sdmVkIG9ubHkgYWZ0ZXIgQnV0dG9uRm9vLCBCdXR0b25CYXIgYW5kIFN1Ym1pdFxuICogYXJlIGFsbCBzdG9wcGVkLlxuICpcbiAqIEFuZCBzaW5jZSBmb3Igc3RhdGVzIHRoZSBzdWItY29tcG9uZW50cyBpcyBkZWxlZ2F0ZWQgdG8gQ29tcG9uZW50LFxuICogc3RhdGUgc2hvdWxkIG9ubHkgY29tbWFuZCB0aGVzZSBzdWItY29tcG9uZW50cyB2aWEgdGhpcyBtZXRob2QsXG4gKiBvciBhY2Nlc3MgdGhlbSBpbmRpdmlkdWFsbHkgdmlhIHRoZSBjb21wb25lbnQgaW5zdGFuY2Ugc2V0IGF0IHRoZVxuICogc2V0dXAgc3RhZ2UuXG4gKi9cbkJhc2ljQ29tcG9uZW50LnByb3RvdHlwZS53YWl0Q29tcG9uZW50cyA9IGZ1bmN0aW9uKG1ldGhvZCwgYXJncykge1xuICBpZiAoIXRoaXMuX3N1YmNvbXBvbmVudHMpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gIH1cbiAgdmFyIHdhaXRQcm9taXNlcyA9XG4gIE9iamVjdC5rZXlzKHRoaXMuX3N1YmNvbXBvbmVudHMpLnJlZHVjZSgoc3RlcHMsIG5hbWUpID0+IHtcbiAgICB2YXIgaW5zdGFuY2UgPSB0aGlzLl9zdWJjb21wb25lbnRzW25hbWVdO1xuICAgIC8vIElmIHRoZSBlbnRyeSBvZiB0aGUgY29tcG9uZW50IGFjdHVhbGx5IGNvbnRhaW5zIG11bHRpcGxlIHN1YmNvbXBvbmVudHMuXG4gICAgLy8gV2UgbmVlZCB0byBhcHBseSB0aGUgbWV0aG9kIHRvIGVhY2ggb25lIGFuZCBjb25jYXQgYWxsIHRoZSByZXN1bHRcbiAgICAvLyBwcm9taXNlcyB3aXRoIG91ciBtYWluIGFycmF5IG9mIGFwcGxpZXMuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoaW5zdGFuY2UpKSB7XG4gICAgICB2YXIgYXBwbGllcyA9IGluc3RhbmNlLm1hcCgoc3ViY29tcG9uZW50KSA9PiB7XG4gICAgICAgIHJldHVybiBzdWJjb21wb25lbnRbbWV0aG9kXS5hcHBseShzdWJjb21wb25lbnQsIGFyZ3MpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gc3RlcHMuY29uY2F0KGFwcGxpZXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gc3RlcHMuY29uY2F0KFtpbnN0YW5jZVttZXRob2RdLmFwcGx5KGluc3RhbmNlLCBhcmdzKV0pO1xuICAgIH1cbiAgfSwgW10pO1xuICByZXR1cm4gUHJvbWlzZS5hbGwod2FpdFByb21pc2VzKTtcbn07XG5cbi8qKlxuICogRm9yd2FyZCB0aGUgZGF0YSB0byByZW5kZXIgdGhlIHZpZXcuXG4gKiBJZiBpdCdzIGEgcmVhbCBVSSB2aWV3IGFuZCB3aXRoIHRlY2ggbGlrZSB2aXJ0dWFsIERPTSBpbiBSZWFjdC5qcyxcbiAqIHdlIGNvdWxkIHBlcmZvcm0gYSBoaWdoLWVmZmljaWVuY3kgcmVuZGVyaW5nIHdoaWxlIGtlZXAgdGhlIGNsaWVudCBjb2RlXG4gKiBhcyBzaW1wbGUgYXMgcG9zc2libGUuXG4gKlxuICogVGhlIHRhcmdldCBpcyBhbiBvcHRpb25hbCAnY2FudmFzJyBvZiB0aGUgcmVuZGVyaW5nIHRhcmdldC4gSXQgd291bGQsXG4gKiBpZiB0aGUgdmlldyBpcyBhbiBVSSB2aWV3IGZvciBleGFtcGxlLCAnZXJhc2UnIGl0IGFuZCByZW5kZXIgbmV3IGNvbnRlbnRcbiAqIGVhY2ggdGltZSB0aGlzIGZ1bmN0aW9uIGdldCBpbnZva2VkLiBIb3dldmVyLCBzaW5jZSB3ZSBoYXZlIG5vdCBvbmx5XG4gKiBVSSB2aWV3LCBzb21lIHRhcmdldGluZyAnY2FudmFzJyBjb3VsZCBiZSBtb3JlIHRyaWNreSwgbGlrZSBGaWxlT2JqZWN0LFxuICogQmxvYiwgc291bmQgc3lzdGVtLCBldGMuXG4gKi9cbkJhc2ljQ29tcG9uZW50LnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbihwcm9wcywgdGFyZ2V0KSB7XG4gIHJldHVybiB0aGlzLnZpZXcucmVuZGVyKHByb3BzLCB0YXJnZXQpO1xufTtcblxuIiwiICd1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDb21wb25lbnQgc2hvdWxkIGNvbnRyb2wgaXRzIHJlc291cmNlcyBvbmx5IHZpYSBtZXRob2RzXG4gKiBkZWZpbmVkIGhlcmUuIFRoaXMgaXMganVzdCBhIGVtcHR5IGludGVyZmFjZSB0aGF0IHJlcXVpcmVkXG4gKiBieSBCYXNpY0NvbXBvbmVudC4gSW4gdGhpcyB3YXksIHdlIGNvdWxkIHNlZSBob3cgdG8gaW1wbGVtZW50XG4gKiB0aGUgc2FtZSBhcmNoaXRlY3R1cmUgZm9yIHJlYWwgY29tcG9uZW50cy5cbiAqKi9cblxuZXhwb3J0IGZ1bmN0aW9uIEJhc2ljU3RvcmUoKSB7XG4gIC8vIFJlc291cmNlcyBpbmNsdWRlIERPTSBlbGVtZW50cyBhbmQgb3RoZXIgc3R1ZmYgdGhhdCBjb21wb25lbnRcbiAgLy8gbmVlZCB0byByZXF1aXJlIHRoZW0gZnJvbSB0aGUgJ291dHNpZGUnLiBTbyBldmVuIGl0J3Mgb25seSBhIHN0cmluZyxcbiAgLy8gaWYgdGhlIG9uZSBjb21lcyBmcm9tIFN5c3RlbSBzZXR0aW5ncyBvciBYSFIsIGl0IHNob3VsZCBiZSBhIHJlc291cmNlXG4gIC8vIGl0ZW0gYW5kIHRvIGJlIG1hbmFnZWQgaGVyZS5cbiAgdGhpcy5yZXNvdXJjZXMgPSB7fTtcbn1cblxuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFRvIGxvZyBzdGF0ZSB0cmFuc2ZlcnJpbmcgaW4gYSBwcm9wZXIgd2F5LCByYXRoZXIgZHVtcCByYXcgY29uc29sZVxuICogbWVzc2FnZXMgYW5kIHRoZW4gb3ZlcndoZWxtIGl0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gTG9nZ2VyKCkge31cblxuTG9nZ2VyLnByb3RvdHlwZS5zdGFydCA9XG5mdW5jdGlvbiBsc3Nfc3RhcnQoY29uZmlncykge1xuICB0aGlzLnN0YXRlU3RhY2sgPSBbXTtcbiAgdGhpcy5jb25maWdzID0ge1xuICAgIHZlcmJvc2U6IGZhbHNlIHx8IGNvbmZpZ3MudmVyYm9zZSxcbiAgICB3YXJuaW5nOiBmYWxzZSB8fCBjb25maWdzLndhcm5pbmcsXG4gICAgZXJyb3I6IHRydWUgJiYgY29uZmlncy5lcnJvcixcbiAgICBncmFwaDogZmFsc2UgfHwgY29uZmlncy5ncmFwaCxcbiAgICBkZWJ1ZzogdHJ1ZSAmJiBjb25maWdzLmRlYnVnLFxuICAgIHJlcG9ydGVyOiBjb25maWdzLnJlcG9ydGVyIHx8IHRoaXMuY29uc29sZVJlcG9ydGVyLmJpbmQodGhpcylcbiAgfTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5Mb2dnZXIucHJvdG90eXBlLmRlYnVnID1cbmZ1bmN0aW9uIGxzc19kZWJ1ZygpIHtcbiAgaWYgKHRoaXMuY29uZmlncy5kZWJ1Zykge1xuICAgIHRoaXMubG9nLmFwcGx5KHRoaXMsIFsnW0ldICddLmNvbmNhdChBcnJheS5mcm9tKGFyZ3VtZW50cykpKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbkxvZ2dlci5wcm90b3R5cGUudmVyYm9zZSA9XG5mdW5jdGlvbiBsc3NfdmVyYm9zZSgpIHtcbiAgaWYgKHRoaXMuY29uZmlncy52ZXJib3NlKSB7XG4gICAgdGhpcy5sb2cuYXBwbHkodGhpcywgWydbVl0gJ10uY29uY2F0KEFycmF5LmZyb20oYXJndW1lbnRzKSkpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuTG9nZ2VyLnByb3RvdHlwZS53YXJuaW5nID0gZnVuY3Rpb24gbHNzX3dhcm5pbmcoKSB7XG4gIGlmICh0aGlzLmNvbmZpZ3Mud2FybmluZyB8fCB0aGlzLmNvbmZpZ3MudmVyYm9zZSkge1xuICAgIHRoaXMubG9nLmFwcGx5KHRoaXMsIFsnWyFdICddLmNvbmNhdChBcnJheS5mcm9tKGFyZ3VtZW50cykpKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbkxvZ2dlci5wcm90b3R5cGUuZXJyb3IgPVxuZnVuY3Rpb24gbHNzX2Vycm9yKCkge1xuICBpZiAodGhpcy5jb25maWdzLmVycm9yIHx8IHRoaXMuY29uZmlncy53YXJuaW5nIHx8XG4gICAgICB0aGlzLmNvbmZpZ3MudmVyYm9zZSkge1xuICAgIHRoaXMubG9nLmFwcGx5KHRoaXMsIFsnW0VdICddLmNvbmNhdChBcnJheS5mcm9tKGFyZ3VtZW50cykpKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUHJpbnQgdGhlIHN0YWNrLiBGb3IgZXhhbXBsZTpcbiAqXG4gKiAgbG9nZ2VyLmRlYnVnKCd0aGUgdGhpbmcgYXQgc3RhY2s6ICcpLnN0YWNrKClcbiAqXG4gKiB3b3VsZCBwcmludCBvdXQgdGhlIG1lc3NhZ2UgYW5kIHRoZSBzdGFjay5cbiAqL1xuTG9nZ2VyLnByb3RvdHlwZS5zdGFjayA9IGZ1bmN0aW9uIGxzc19zdGFjaygpIHtcbiAgdGhpcy5sb2coKG5ldyBFcnJvcigpKS5zdGFjayk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBMb2cgdGhlIHRyYW5zZmVycmluZyBtYW5pcHVsYXRpb24uXG4gKlxuICogVG8gbG9nIHRoZSBjb25kaXRpb25zLCB0aGlzIGZ1bmN0aW9uIHdvdWxkIHN0cmluZ2lmeSB0aGUgY29uZGl0aW9uc1xuICogYW5kIHRoZW4gcGFyc2UgaXQgdG8gZG8gdGhlIGRlZXAgY29weS4gU28gcGxlYXNlIHR1cm4gb2ZmIHRoZVxuICogYGNvbmZpZy5kZWJ1Z2AgaW4gcHJvZHVjdGlvbiBtb2RlLlxuICpcbiAqIEBwYXJhbSBmcm9tIHtzdHJpbmd9IC0gZnJvbSBzdGF0ZSB0eXBlXG4gKiBAcGFyYW0gdG8ge3N0cmluZ30gLSB0byBzdGF0ZSB0eXBlXG4gKiBAcGFyYW0gY29uZGl0aW9ucyB7b2JqZWN0fSAtIHVuZGVyIHdoYXQgY29uZGl0aW9ucyB3ZSBkbyB0aGUgdHJhbnNmZXJyaW5nXG4gKi9cbkxvZ2dlci5wcm90b3R5cGUudHJhbnNmZXIgPVxuZnVuY3Rpb24gbHNzX3RyYW5zZmVyKGZyb20sIHRvLCBjb25kaXRpb25zID0ge30pIHtcbiAgaWYgKCF0aGlzLmNvbmZpZ3MuZGVidWcpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIHRyYW5zZmVyRGV0YWlscyA9IHtcbiAgICBmcm9tOiBmcm9tLFxuICAgIHRvOiB0byxcbiAgICBjb25kaXRpb25zOiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGNvbmRpdGlvbnMpKVxuICB9O1xuICBpZiAodGhpcy5jb25maWdzLmdyYXBoKSB7XG4gICAgdGhpcy5zdGF0ZVN0YWNrLnB1c2godHJhbnNmZXJEZXRhaWxzKTtcbiAgfVxuICB0aGlzLmRlYnVnKGBTdGF0ZSB0cmFuc2ZlcjogZnJvbSAke2Zyb219IHRvICR7dG99IGJlY2F1c2Ugb2Y6YCxcbiAgICB0cmFuc2ZlckRldGFpbHMuY29uZGl0aW9ucyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBUbyBnZXQgdGhlIGdyYXBoLiBUaGUgYXJyYXkgaXQgcmV0dXJuIHdvdWxkIGJlOlxuICpcbiAqICAgICBbICdmb28nLCB7Y29uZGl0aW9uc30sICdiYXInLCB7Y29uZGl0aW9uc30sICdnYW1tYScuLi5dXG4gKlxuICogd2hpY2ggY2FuIGJlIHJlbmRlcmVkIGFzIGEgcmVhbCBncmFwaC5cbiAqL1xuTG9nZ2VyLnByb3RvdHlwZS5ncmFwaCA9XG5mdW5jdGlvbiBsc3NfZ3JhcGgoKSB7XG4gIHJldHVybiB0aGlzLnN0YXRlU3RhY2sucmVkdWNlKChwcmV2LCBpbmZvKSA9PiB7XG4gICAgcmV0dXJuIHByZXYuY29uY2F0KFtpbmZvLmZyb20sIGluZm8uY29uZGl0aW9ucywgaW5mby50b10pO1xuICB9LCBbXSk7XG59O1xuXG5Mb2dnZXIucHJvdG90eXBlLmxvZyA9XG5mdW5jdGlvbiBsc3NfbG9nKCkge1xuICB2YXIgcmVwb3J0ZXIgPSB0aGlzLmNvbmZpZ3MucmVwb3J0ZXI7XG4gIHJlcG9ydGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuTG9nZ2VyLnByb3RvdHlwZS5zdG9wID1cbmZ1bmN0aW9uIGxzc19zdG9wKCkge1xuICB0aGlzLnN0YXRlU3RhY2subGVuZ3RoID0gMDtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5Mb2dnZXIucHJvdG90eXBlLmNvbnNvbGVSZXBvcnRlciA9XG5mdW5jdGlvbiBsc3NfY29uc29sZVJlcG9ydGVyKCkge1xuICBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBhcmd1bWVudHMpO1xuICByZXR1cm4gdGhpcztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogR2VuZXJpYyBidWlsZGVyIHRoYXQgd291bGQgcHVzaCBub2RlcyBpbnRvIHRoZSBlRFNMIHN0YWNrLlxuICogVXNlciBjb3VsZCBpbmhlcml0IHRoaXMgdG8gZGVmaW5lIHRoZSBuZXcgZURTTC5cbiAqIC0tLVxuICogVGhlIGRlZmF1bHQgc2VtYW50aWNzIG9ubHkgY29udGFpbiB0aGVzZSBvcGVyYXRpb25zOlxuICpcbiAqIDEuIFtwdXNoXSA6IHB1c2ggdG8gdGhlIGN1cnJlbnQgc3RhY2tcbiAqIDIuIFtiZWdpbl06IGNyZWF0ZSBhIG5ldyBzdGFjayBhbmQgc3dpdGNoIHRvIGl0LFxuICogICAgICAgICAgICAgYW5kIHRoZW4gcHVzaCB0aGUgbm9kZSBpbnRvIHRoZSBzdGFjay5cbiAqIDMuIFtlbmRdICA6IGFmdGVyIHB1c2ggdGhlIG5vZGUgaW50byB0aGUgc3RhY2ssXG4gKiAgICAgICAgICAgICBjaGFuZ2UgdGhlIGN1cnJlbnQgc3RhY2sgdG8gdGhlIHByZXZpb3VzIG9uZS5cbiAqIDQuIFtleGl0XSA6IGV4aXQgdGhlIGNvbnRleHQgb2YgdGhpcyBlRFNMOyB0aGUgbGFzdCByZXN1bHRcbiAqICAgICAgICAgICAgIG9mIGl0IHdvdWxkIGJlIHBhc3NlZCB0byB0aGUgcmV0dXJuIHZhbHVlIG9mXG4gKiAgICAgICAgICAgICB0aGlzIGNoYWluLlxuICpcbiAqIFN0YWNrIGNvdWxkIGJlIG5lc3RlZDogd2hlbiBbYmVnaW5dIGEgbmV3IHN0YWNrIGluIGZhY3QgaXQgd291bGRcbiAqIHB1c2ggdGhlIHN0YWNrIGludG8gdGhlIHByZXZpb3VzIG9uZS4gU28gdGhlIHN0YWNrIGNvbXByaXNlXG4gKiBbbm9kZV0gYW5kIFtzdGFja10uXG4gKiAtLS1cbiAqIEFsdGhvdWdoIHRoZSBlRFNMIGluc3RhbmNlIHNob3VsZCB3cmFwIHRoZXNlIGJhc2ljIG9wZXJhdGlvbnNcbiAqIHRvIG1hbmlwdWxhdGUgdGhlIHN0YWNrLCB0aGV5IGFsbCBuZWVkIHRvIGNvbnZlcnQgdGhlIG1ldGhvZFxuICogY2FsbCB0byBub2Rlcy4gU28gJ0xhbmd1YWdlJyBwcm92aWRlIGEgd2F5IHRvIHNpbXBsaWZ5IHRoZSB3b3JrOiBpZlxuICogdGhlIGluc3RhbmNlIGNhbGwgdGhlIFtkZWZpbmVdIG1ldGhvZCB0aGUgbmFtZSBvZiB0aGUgbWV0aG9kLFxuICogaXQgY291bGQgYXNzb2NpYXRlIHRoZSBvcGVyYW5kIG9mIHRoZSBlRFNMIHdpdGggdGhlIHN0YWNrIG1hbmlwdWxhdGlvbi5cbiAqIEZvciBleGFtcGxlOlxuICpcbiAqICAgIHZhciBlRFNMID0gZnVuY3Rpb24oKSB7fTtcbiAqICAgIGVEU0wucHJvdG90eXBlLnRyYW5zYWN0aW9uID0gTGFuZ3VhZ2UuZGVmaW5lKCd0cmFuc2FjdGlvbicsICdiZWdpbicpO1xuICogICAgZURTTC5wcm90b3R5cGUucHJlID0gTGFuZ3VhZ2UuZGVmaW5lKCdwcmUnLCAncHVzaCcpO1xuICogICAgZURTTC5wcm90b3R5cGUucGVyZm9ybSA9IExhbmd1YWdlLmRlZmluZSgncGVyZm9ybScsICdwdXNoJyk7XG4gKiAgICBlRFNMLnByb3RvdHlwZS5wb3N0ID0gTGFuZ3VhZ2UuZGVmaW5lKCdwb3N0JywgJ2VuZCcpO1xuICpcbiAqIFRoZW4gdGhlIGVEU0wgY291bGQgYmUgdXNlZCBhczpcbiAqXG4gKiAgICAobmV3IGVEU0wpXG4gKiAgICAgIC50cmFuc2FjdGlvbigpXG4gKiAgICAgIC5wcmUoY2IpXG4gKiAgICAgIC5wZXJmb3JtKGNiKVxuICogICAgICAucG9zdChjYilcbiAqXG4gKiBBbmQgdGhlIHN0YWNrIHdvdWxkIGJlOlxuICpcbiAqICAgIFtcbiAqICAgICAgbm9kZTwndHJhbnNhY3Rpb24nLD5cbiAqICAgICAgbm9kZTwncHJlJywgY2I+XG4gKiAgICAgIG5vZGU8J3ByZWZvcm0nLCBjYj5cbiAqICAgICAgbm9kZTwncG9zdCcsIGNiPlxuICogICAgXVxuICpcbiAqIEhvd2V2ZXIsIHRoaXMgc2ltcGxlIGFwcHJvYWNoIHRoZSBzZW1hbnRpY3MgcnVsZXMgYW5kIGFuYWx5emVycyB0b1xuICogZ3VhcmFudGVlIHRoZSBzdGFjayBpcyB2YWxpZC4gRm9yIGV4YW1wbGUsIGlmIHdlIGhhdmUgYSBtYWxmb3JtZWRcbiAqIHN0YWNrIGJlY2F1c2Ugb2YgdGhlIGZvbGxvd2luZyBlRFNMIHByb2dyYW06XG4gKlxuICogICAgKG5ldyBlRFNMKVxuICogICAgICAucG9zdChjYilcbiAqICAgICAgLnByZShjYilcbiAqICAgICAgLnBlcmZvcm0oY2IpXG4gKiAgICAgIC50cmFuc2FjdGlvbigpXG4gKlxuICogVGhlIHJ1bnRpbWUgbWF5IHJlcG9ydCBlcnJvdCBiZWNhdXNlIHdoZW4gJy5wb3N0KGNiKScgdGhlcmUgaXMgbm8gc3RhY2tcbiAqIGNyZWF0ZWQgYnkgdGhlIGJlZ2lubmluZyBzdGVwLCBuYW1lbHkgdGhlICcucHJlKGNiKScgaW4gb3VyIGNhc2UuXG4gKiBOZXZlcnRoZWxlc3MsIHRoZSBlcnJvciBtZXNzYWdlIGlzIHRvbyBsb3ctbGV2ZWwgZm9yIHRoZSBsYW5ndWFnZSB1c2VyLFxuICogc2luY2UgdGhleSBzaG91bGQgY2FyZSBubyBzdGFjayB0aGluZ3MgYW5kIHNob3VsZCBvbmx5IGNhcmUgYWJvdXQgdGhlIGVEU0xcbiAqIGl0c2VsZi5cbiAqXG4gKiBUaGUgc29sdXRpb24gaXMgdG8gcHJvdmlkZSBhIGJhc2ljIHN0YWNrIG9yZGVyaW5nIGFuYWx5emVyIGFuZCBsZXQgdGhlXG4gKiBsYW5ndWFnZSBkZWNpZGUgaG93IHRvIGRlc2NyaWJlIHRoZSBlcnJvci4gQW5kIHNpbmNlIHdlIGRvbid0IGhhdmVcbiAqIGFueSBjb250ZXh0IGluZm9ybWF0aW9uIGFib3V0IHZhcmlhYmxlcywgc2NvcGUgYW5kIG90aGVyIGVsZW1lbnRzXG4gKiBhcyBhIGNvbXBsZXRlIHByb2dyYW1taW5nIGxhbmd1YWdlLCB3ZSBvbmx5IG5lZWQgdG8gZ3VhcmFudGVlIHRoZSBvcmRlciBpc1xuICogY29ycmVjdCwgYW5kIG1ha2UgaW5jb3JyZWN0IGNhc2VzIG1lYW5pbmdmdWwuIE1vcmVvdmVyLCBzaW5jZSB0aGUgYW5hbHl6ZXJcbiAqIG5lZWRzIHRvIGFuYWx5emUgdGhlIHN0YXRlcyB3aGVuZXZlciB0aGUgaW5jb21pbmcgbm9kZSBjb21lcywgaXQgaXMgaW4gZmFjdFxuICogYW4gZXZhbHVhdGlvbiBwcm9jZXNzLCBzbyB1c2VyIGNvdWxkIGNvbWJpbmUgdGhlIGFuYWx5emluZyBhbmQgaW50ZXJwcmV0aW5nXG4gKiBwaGFzZSBpbnRvIHRoZSBzYW1lIGZ1bmN0aW9uLiBGb3IgZXhhbXBsZTpcbiAqXG4gKiAgICBydW50aW1lLm9uY2hhbmdlKChjb250ZXh0LCBub2RlLCBzdGFjaykgPT4ge1xuICogICAgICAgIC8vIElmIHRoZSBjaGFuZ2UgaXMgdG8gc3dpdGNoIHRvIGEgbmV3IHN0YWNrLFxuICogICAgICAgIC8vIHRoZSAnc3RhY2snIGhlcmUgd291bGQgYmUgdGhlIG5ldyBzdGFjay5cbiAqICAgICAgICB2YXIge3R5cGUsIGFyZ3N9ID0gbm9kZTtcbiAqICAgICAgICBpZiAoJ3ByZScgPT09IHR5cGUpIHtcbiAqICAgICAgICAgIGNvbnRleHQuaW5pdCA9IHRydWU7XG4gKiAgICAgICAgfSBlbHNlIGlmICgncG9zdCcgPT09IHR5cGUgJiYgIWNvbnRleHQuaW5pdCkge1xuICogICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGVyZSBtdXN0IGJlIG9uZSBcInByZVwiIG5vZGUgYmVmb3JlIHRoZSBcInBvc3RcIi4nKTtcbiAqICAgICAgICB9XG4gKiAgICB9KTtcbiAqXG4gKiBXaXRoIHN1Y2ggZmVhdHVyZSwgaWYgdGhlIGluY29taW5nIG5vZGUgb3IgdGhlIHN0YWNrIGlzIG1hbGZvcm1lZCxcbiAqIGl0IHNob3VsZCB0aHJvdyB0aGUgZXJyb3IuIFRoZSBlcnJvciBjYXB0dXJlZCBieSB0aGUgaW5zdGFuY2UgbGlrZSB0aGlzXG4gKiBjb3VsZCBiZSBhICdjb21waWxhdGlvbiBlcnJvcicuXG4gKlxuICogVGhlIG5vdGljZWFibGUgZmFjdCBpcyBUaGUgY2FsbGJhY2sgb2YgdGhlICdvbmNoYW5nZScgaXMgYWN0dWFsbHkgYSByZWR1Y2VyLFxuICogc28gdXNlciBjb3VsZCB0cmVhdCB0aGUgcHJvY2VzcyBvZiB0aGlzIGV2YWx1YXRpb24gJiBhbmFseXppbmcgYXMgYSByZWR1Y2luZ1xuICogcHJvY2VzcyBvbiBhbiBpbmZpbml0ZSBzdHJlYW0uIEFuZCBzaW5jZSB3ZSBoYXZlIGEgc3RhY2sgbWFjaGluZSwgaWYgdGhlXG4gKiByZWR1Y2VyIHJldHVybiBub3RoaW5nLCB0aGUgc3RhY2sgd291bGQgYmUgZW1wdHkuIE90aGVyd2lzZSwgaWYgdGhlIHJlZHVjZXJcbiAqIHJldHVybiBhIG5ldyBzdGFjaywgaXQgd291bGQgcmVwbGFjZSB0aGUgb2xkIG9uZS5cbiAqXG4gKiBBbmQgcGxlYXNlIG5vdGUgdGhlIGV4YW1wbGUgaXMgbXVjaCBzaW1wbGlmaWVkLiBGb3IgdGhlXG4gKiByZWFsIGVEU0wgaXQgc2hvdWxkIGJlIHVzZWQgb25seSBhcyBhbiBlbnRyeSB0byBkaXNwYXRjaCB0aGUgY2hhbmdlIHRvXG4gKiB0aGUgcmVhbCBoYW5kbGVycywgd2hpY2ggbWF5IGNvbXByaXNlIHNldmVyYWwgc3RhdGVzIGFuZCBjb21wb25lbnRzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gTGFuZ3VhZ2UoKSB7fVxuXG4vKipcbiAqIEhlbHBlciBtZXRob2QgdG8gYnVpbGQgaW50ZXJmYWNlIG9mIGEgc3BlY2lmaWMgRFNMLiBJdCB3b3VsZCByZXR1cm4gYSBtZXRob2RcbiAqIG9mIHRoZSBEU0wgYW5kIHRoZW4gdGhlIGludGVyZmFjZSBjb3VsZCBhdHRhY2ggaXQuXG4gKlxuICogVGhlIHJldHVybmluZyBmdW5jdGlvbiB3b3VsZCBhc3N1bWUgdGhhdCB0aGUgJ3RoaXMnIGluc2lkZSBpdCBpcyB0aGUgcnVudGltZVxuICogb2YgdGhlIGxhbmd1YWdlLiBBbmQgc2luY2UgdGhlIG1ldGhvZCBpdCByZXR1cm5zIHdvdWxkIHJlcXVpcmUgdG8gYWNjZXNzIHNvbWVcbiAqIG1lbWJlcnMgb2YgdGhlICd0aGlzJywgdGhlICd0aGlzJyBzaG91bGQgaGF2ZSAndGhpcy5zdGFjaycgYW5kICd0aGlzLmNvbnRleHQnXG4gKiBhcyB0aGUgbWV0aG9kIHJlcXVpcmVzLlxuICpcbiAqIElmIGl0J3MgYW4gJ2V4aXQnIG5vZGUsIG1lYW5zIHRoZSBzZXNzaW9uIGlzIGVuZGVkIGFuZCB0aGUgaW50ZXJwcmV0ZXIgc2hvdWxkXG4gKiByZXR1cm4gYSBzdGFjayBjb250YWlucyBvbmx5IG9uZSBub2RlIGFzIHRoZSByZXN1bHQgb2YgdGhlIHNlc3Npb24sIG9yIHRoZVxuICogc2Vzc2lvbiByZXR1cm5zIG5vdGhpbmcuXG4gKlxuICogUGxlYXNlIG5vdGUgdGhhdCBmcm9tIHRoZSBkZXNjcmlwdGlvbiBhYm92ZSwgJ2VuZCcgbWVhbnMgc3RhY2sgKHN1YnN0YWNrKVxuICogZW5kcy4gSXQncyB0b3RhbGx5IGlycmVsZXZhbnQgdG8gJ2V4aXQnLlxuICovXG5MYW5ndWFnZS5kZWZpbmUgPSBmdW5jdGlvbihtZXRob2QsIGFzKSB7XG4gIHJldHVybiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgdmFyIG5vZGUsIHJlc3VsdHN0YWNrO1xuICAgIHN3aXRjaCAoYXMpIHtcbiAgICAgIGNhc2UgJ3B1c2gnOlxuICAgICAgICBub2RlID0gbmV3IExhbmd1YWdlLk5vZGUobWV0aG9kLCBhcmdzLCB0aGlzLnN0YWNrKTtcbiAgICAgICAgdGhpcy5zdGFjay5wdXNoKG5vZGUpO1xuICAgICAgICByZXN1bHRzdGFjayA9XG4gICAgICAgICAgdGhpcy5vbmNoYW5nZSh0aGlzLmNvbnRleHQsIG5vZGUsIHRoaXMuc3RhY2spO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2JlZ2luJzpcbiAgICAgICAgdGhpcy5fcHJldnN0YWNrID0gdGhpcy5zdGFjaztcbiAgICAgICAgdGhpcy5zdGFjayA9IFtdO1xuICAgICAgICBub2RlID0gbmV3IExhbmd1YWdlLk5vZGUobWV0aG9kLCBhcmdzLCB0aGlzLnN0YWNrKTtcbiAgICAgICAgdGhpcy5zdGFjay5wdXNoKG5vZGUpOyAgLy8gYXMgdGhlIGZpcnN0IG5vZGUgb2YgdGhlIG5ldyBzdGFjay5cbiAgICAgICAgcmVzdWx0c3RhY2sgPVxuICAgICAgICAgIHRoaXMub25jaGFuZ2UodGhpcy5jb250ZXh0LCBub2RlLCB0aGlzLnN0YWNrKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdlbmQnOlxuICAgICAgICBub2RlID0gbmV3IExhbmd1YWdlLk5vZGUobWV0aG9kLCBhcmdzLCB0aGlzLnN0YWNrKTtcbiAgICAgICAgdGhpcy5zdGFjay5wdXNoKG5vZGUpOyAgLy8gdGhlIGxhc3Qgbm9kZSBvZiB0aGUgc3RhY2suXG4gICAgICAgIHRoaXMuc3RhY2sgPVxuICAgICAgICAgIHRoaXMuX3ByZXZzdGFjazsgLy8gc3dpdGNoIGJhY2sgdG8gdGhlIHByZXZpb3VzIHN0YWNrLlxuICAgICAgICByZXN1bHRzdGFjayA9XG4gICAgICAgICAgdGhpcy5vbmNoYW5nZSh0aGlzLmNvbnRleHQsIG5vZGUsIHRoaXMuc3RhY2spO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2V4aXQnOlxuICAgICAgICBub2RlID0gbmV3IExhbmd1YWdlLk5vZGUobWV0aG9kLCBhcmdzLCB0aGlzLnN0YWNrKTtcbiAgICAgICAgdGhpcy5zdGFjay5wdXNoKG5vZGUpOyAgLy8gdGhlIGxhc3Qgbm9kZSBvZiB0aGUgc3RhY2suXG4gICAgICAgIHJlc3VsdHN0YWNrID1cbiAgICAgICAgICB0aGlzLm9uY2hhbmdlKHRoaXMuY29udGV4dCwgbm9kZSwgdGhpcy5zdGFjayk7XG4gICAgICAgIGlmICghcmVzdWx0c3RhY2spIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCdleGl0JyBub2RlICcke25vZGUudHlwZX0nIHNob3VsZFxuICAgICAgICAgICAgcmV0dXJuIGEgcmVzdWx0c3RhY2suYCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdHN0YWNrWzBdO1xuICAgIH1cbiAgICAvLyBJZiB0aGUgaGFuZGxlciB1cGRhdGVzIHRoZSBzdGFjaywgaXQgd291bGQgcmVwbGFjZSB0aGUgZXhpc3Rpbmcgb25lLlxuICAgIGlmIChyZXN1bHRzdGFjaykge1xuICAgICAgdGhpcy5zdGFjayA9IHJlc3VsdHN0YWNrO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbn07XG5cbkxhbmd1YWdlLk5vZGUgPSBmdW5jdGlvbih0eXBlLCBhcmdzLCBzdGFjaykge1xuICB0aGlzLnR5cGUgPSB0eXBlO1xuICB0aGlzLmFyZ3MgPSBhcmdzO1xuICB0aGlzLnN0YWNrID0gc3RhY2s7XG59O1xuXG5MYW5ndWFnZS5FdmFsdWF0ZSA9IGZ1bmN0aW9uKGNvbnRleHQgPSB7fSkge1xuICB0aGlzLl9hbmFseXplcnMgPSBbXTtcbiAgdGhpcy5faW50ZXJwcmV0ZXIgPSBudWxsO1xuICB0aGlzLl9jb250ZXh0ID0gY29udGV4dDtcbn07XG5cbi8qKlxuICogQW5hbHl6ZXIgY291bGQgcmVjZWl2ZSB0aGUgc3RhY2sgY2hhbmdlIGZyb20gJ0xhbmd1YWdlI2V2YWx1YXRlJyxcbiAqIGFuZCBpdCB3b3VsZCBiZSBjYWxsZWQgd2l0aCB0aGUgYXJndW1lbnRzIGFzIHRoZSBmdW5jdGlvbiBkZXNjcmliZXM6XG4gKlxuICogICAgIExhbmd1YWdlLnByb3RvdHlwZS5ldmFsdWF0ZSgoY29udGV4dCwgY2hhbmdlLCBzdGFjaykgPT4ge1xuICogICAgICAgIC8vIC4uLlxuICogICAgIH0pO1xuICpcbiAqIFNvIHRoZSBhbmFseXplciBjb3VsZCBiZTpcbiAqXG4gKiAgICBmdW5jdGlvbihjb250ZXh0LCBjaGFuZ2UsIHN0YWNrKSB7XG4gKiAgICAgIC8vIERvIHNvbWUgY2hlY2sgYW5kIG1heWJlIGNoYW5nZWQgdGhlIGNvbnRleHQuXG4gKiAgICAgIC8vIFRoZSBuZXh0IGFuYWx5emVyIHRvIHRoZSBpbnRlcnByZXRlciB3b3VsZCBhY2NlcHQgdGhlIGFsdGVybmF0ZWRcbiAqICAgICAgLy8gY29udGV4dCBhcyB0aGUgYXJndW1lbnQgJ2NvbnRleHQnLlxuICogICAgICBjb250ZXh0LnNvbWVGbGFnID0gdHJ1ZTtcbiAqICAgICAgLy8gV2hlbiB0aGVyZSBpcyB3cm9uZywgdGhyb3cgaXQuXG4gKiAgICAgIHRocm93IG5ldyBFcnJvcignU29tZSBhbmFseXppbmcgZXJyb3InKTtcbiAqICAgIH07XG4gKlxuICogTm90ZSB0aGF0IHRoZSBhbmFseXplciAoJ2EnKSB3b3VsZCBiZSBpbnZva2VkIHdpdGggZW1wdHkgJ3RoaXMnIG9iamVjdCxcbiAqIHNvIHRoZSBmdW5jdGlvbiByZWxpZXMgb24gJ3RoaXMnIHNob3VsZCBiaW5kIGl0c2VsZiBmaXJzdC5cbiAqL1xuTGFuZ3VhZ2UuRXZhbHVhdGUucHJvdG90eXBlLmFuYWx5emVyID0gZnVuY3Rpb24oYSkge1xuICB0aGlzLl9hbmFseXplcnMucHVzaChhKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIE9uZSBFdmFsdWF0ZSBjYW4gb25seSBoYXZlIG9uZSBpbnRlcnByZXRlciwgYW5kIGl0IHdvdWxkIHJldHVyblxuICogdGhlIGZ1bmN0aW9uIGNvdWxkIGNvbnN1bWUgZXZlcnkgc3RhY2sgY2hhbmdlIGZyb20gJ0xhbmd1YWdlI2V2YWx1YXRlJy5cbiAqXG4gKiBUaGUgY29kZSBpcyBhIGxpdHRsZSBjb21wbGljYXRlZDogd2UgaGF2ZSB0d28ga2luZHMgb2YgJ3JlZHVjaW5nJzpcbiAqIG9uZSBpcyB0byByZWR1Y2UgYWxsIGFuYWx5emVycyB3aXRoIHRoZSBzaW5nbGUgaW5jb21pbmcgY2hhbmdlLFxuICogYW5vdGhlciBpcyB0byByZWR1Y2UgYWxsIGluY29taW5nIGNoYW5nZXMgd2l0aCB0aGlzIGFuYWx5emVycyArIGludGVycHJldGVyLlxuICpcbiAqIFRoZSBhbmFseXplciBhbmQgaW50ZXJwcmV0ZXIgc2hvdWxkIGNoYW5nZSB0aGUgY29udGV4dCwgdG8gbWVtb3JpemUgdGhlXG4gKiBzdGF0ZXMgb2YgdGhlIGV2YWx1YXRpb24uIFRoZSBkaWZmZXJlbmNlIGlzIGludGVycHJldGVyIHNob3VsZCByZXR1cm4gb25lXG4gKiBuZXcgc3RhY2sgaWYgaXQgbmVlZHMgdG8gdXBkYXRlIHRoZSBleGlzdGluZyBvbmUuIFRoZSBzdGFjayBpdCByZXR1cm5zIHdvdWxkXG4gKiByZXBsYWNlIHRoZSBleGlzdGluZyBvbmUsIHNvIGFueXRoaW5nIHN0aWxsIGluIHRoZSBvbGQgb25lIHdvdWxkIGJlIHdpcGVkXG4gKiBvdXQuIFRoZSBpbnRlcnByZXRlciBjb3VsZCByZXR1cm4gbm90aGluZyAoJ3VuZGVmaW5lZCcpIHRvIGtlZXAgdGhlIHN0YWNrXG4gKiB1bnRvdWNoZWQuXG4gKlxuICogVGhlIGFuYWx5emVycyBhbmQgaW50ZXJwcmV0ZXIgY291bGQgY2hhbmdlIHRoZSAnY29udGV4dCcgcGFzcyB0byB0aGVtLlxuICogQW5kIHNpbmNlIHdlIG1heSB1cGRhdGUgdGhlIHN0YWNrIGFzIGFib3ZlLCB0aGUgY29udGV4dCBzaG91bGQgbWVtb3JpemVcbiAqIHRob3NlIGluZm9ybWF0aW9uIG5vdCB0byBiZSBvdmVyd3JpdHRlbiB3aGlsZSB0aGUgc3RhY2sgZ2V0IHdpcGVkIG91dC5cbiAqXG4gKiBBbmQgaWYgdGhlIGludGVycHJldGluZyBub2RlIGlzIHRoZSBleGl0IG5vZGUgb2YgdGhlIHNlc3Npb24sIGludGVycHJldGVyXG4gKiBzaG91bGQgcmV0dXJuIGEgbmV3IHN0YWNrIGNvbnRhaW5zIG9ubHkgb25lIGZpbmFsIHJlc3VsdCBub2RlLiBJZiB0aGVyZVxuICogaXMgbm8gc3VjaCBub2RlLCB0aGUgcmVzdWx0IG9mIHRoaXMgc2Vzc2lvbiBpcyAndW5kZWZpbmVkJy5cbiAqL1xuTGFuZ3VhZ2UuRXZhbHVhdGUucHJvdG90eXBlLmludGVycHJldGVyID0gZnVuY3Rpb24oaW5wdCkge1xuICAvLyBUaGUgY3VzdG9taXplZCBsYW5ndWFnZSBzaG91bGQgZ2l2ZSB0aGUgZGVmYXVsdCBjb250ZXh0LlxuICByZXR1cm4gKGNvbnRleHQsIGNoYW5nZSwgc3RhY2spID0+IHtcbiAgICB0cnkge1xuICAgICAgLy8gQW5hbHl6ZXJzIGNvdWxkIGNoYW5nZSB0aGUgY29udGV4dC5cbiAgICAgIHRoaXMuX2FuYWx5emVycy5yZWR1Y2UoKGN0eCwgYW5hbHl6ZXIpID0+IHtcbiAgICAgICAgYW5hbHl6ZXIuY2FsbCh7fSwgY29udGV4dCwgY2hhbmdlLCBzdGFjayk7XG4gICAgICB9LCBjb250ZXh0KTtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIHRoaXMuX2hhbmRsZUVycm9yKGUsIGNvbnRleHQsIGNoYW5nZSwgc3RhY2spO1xuICAgIH1cbiAgICAvLyBBZnRlciBhbmFseXplIGl0LCBpbnRlcnByZXQgdGhlIG5vZGUgYW5kIHJldHVybiB0aGUgbmV3IHN0YWNrIChpZiBhbnkpLlxuICAgIHZhciBuZXdTdGFjayA9IGlucHQoY29udGV4dCwgY2hhbmdlLCBzdGFjayk7XG4gICAgcmV0dXJuIG5ld1N0YWNrO1xuICB9O1xufTtcblxuTGFuZ3VhZ2UuRXZhbHVhdGUucHJvdG90eXBlLl9oYW5kbGVFcnJvciA9XG5mdW5jdGlvbihlcnIsIGNvbnRleHQsIGNoYW5nZSwgc3RhY2spIHtcbiAgLy8gVE9ETzogZXhwYW5kIGl0IHRvIHByb3ZpZGUgbW9yZSBzb3BoaXN0aWMgZGVidWdnaW5nIG1lc3NhZ2UuXG4gIHRocm93IG5ldyBFcnJvcihgV2hlbiBjaGFuZ2UgJHtjaGFuZ2UudHlwZX0gY29tZXMgZXJyb3IgJyR7ZXJyfScgaGFwcGVuZWRgKTtcbn07XG4iLCIgJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEEgc2V0dGluZ3MgZ2V0dGVyL3NldHRlciBjYWNoZS5cbiAqIFByb3ZpZGUgYXMgZmV3IGFzIHBvc3NpYmxlIEFQSXMgbGlrZSB0aGUgbmF0aXZlIEFQSXMgZG8uXG4gKiovXG5leHBvcnQgZnVuY3Rpb24gU2V0dGluZ3NDYWNoZSgpIHtcbiAgdGhpcy5jYWNoZSA9IHt9O1xuICB0aGlzLmhhbmRsZVNldHRpbmdzID0gdGhpcy5oYW5kbGVTZXR0aW5ncy5iaW5kKHRoaXMpO1xufVxuXG5TZXR0aW5nc0NhY2hlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihlbnRyeSkge1xuICBpZiAodGhpcy5jYWNoZVtlbnRyeV0pIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuY2FjaGVbZW50cnldKTtcbiAgfVxuXG4gIHZhciByZXNvbHZlLCByZWplY3Q7XG4gIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoKHJldiwgcmVqKSA9PiB7XG4gICAgcmVzb2x2ZSA9IHJldjtcbiAgICByZWplY3QgPSByZWo7XG4gIH0pO1xuICB2YXIgbG9jayA9IG5hdmlnYXRvci5tb3pTZXR0aW5ncy5jcmVhdGVMb2NrKCk7XG4gIHZhciByZXEgPSBsb2NrLmdldChlbnRyeSk7XG4gIHJlcS50aGVuKCgpID0+IHtcbiAgICB0aGlzLmNhY2hlW2VudHJ5XSA9IHJlcS5yZXN1bHRbZW50cnldO1xuICAgIC8vIE9uY2UgaXQgZ2V0dGVkLCBtb25pdG9yIGl0IHRvIHVwZGF0ZSBjYWNoZS5cbiAgICBuYXZpZ2F0b3IubW96U2V0dGluZ3NcbiAgICAgIC5hZGRPYnNlcnZlcihlbnRyeSwgdGhpcy5oYW5kbGVTZXR0aW5ncyk7XG4gICAgcmVzb2x2ZShyZXEucmVzdWx0W2VudHJ5XSk7XG4gIH0pLmNhdGNoKCgpID0+IHtcbiAgICByZWplY3QocmVxLmVycm9yKTtcbiAgfSk7XG4gIHJldHVybiBwcm9taXNlO1xufTtcblNldHRpbmdzQ2FjaGUucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKGVudHJ5LCB2YWx1ZSkge1xuICB2YXIgcmVzb2x2ZSwgcmVqZWN0O1xuICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXYsIHJlaikgPT4ge1xuICAgIHJlc29sdmUgPSByZXY7XG4gICAgcmVqZWN0ID0gcmVqO1xuICB9KTtcbiAgdmFyIGxvY2sgPSBuYXZpZ2F0b3IubW96U2V0dGluZ3MuY3JlYXRlTG9jaygpO1xuICB2YXIgcmVxY29udGVudCA9IHt9O1xuICByZXFjb250ZW50W2VudHJ5XSA9IHZhbHVlO1xuICB2YXIgcmVxID0gbG9jay5zZXQocmVxY29udGVudCk7XG4gIHJlcS50aGVuKCgpID0+IHtcbiAgICB0aGlzLmNhY2hlW2VudHJ5XSA9IHZhbHVlO1xuICAgIHJlc29sdmUoKTtcbiAgfSkuY2F0Y2goKCkgPT4ge1xuICAgIHJlamVjdCgpO1xuICB9KTtcbiAgcmV0dXJuIHByb21pc2U7XG59O1xuU2V0dGluZ3NDYWNoZS5wcm90b3R5cGUuaGFuZGxlU2V0dGluZ3MgPSBmdW5jdGlvbihldnQpIHtcbiAgdmFyIHsgc2V0dGluZ3NOYW1lLCBzZXR0aW5nc1ZhbHVlIH0gPSBldnQ7XG4gIHRoaXMuY2FjaGVbc2V0dGluZ3NOYW1lXSA9IHNldHRpbmdzVmFsdWU7XG59O1xuU2V0dGluZ3NDYWNoZS5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICBPYmplY3Qua2V5cyh0aGlzLmNhY2hlKS5mb3JFYWNoKChlbnRyeSkgPT4ge1xuICAgIG5hdmlnYXRvci5tb3pTZXR0aW5ncy5yZW1vdmVPYnNlcnZlcihlbnRyeSwgdGhpcy5oYW5kbGVTZXR0aW5ncyk7XG4gIH0pO1xufTtcblxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgeyBTb3VyY2VFdmVudCB9IGZyb20gJ3NyYy9zb3VyY2Uvc291cmNlX2V2ZW50LmpzJztcblxuLyoqXG4gKiBET00gZXZlbnQgc291cmNlIGZvciBTdHJlYW0uIE9uZSBTdHJlYW0gY2FuIGNvbGxlY3QgZXZlbnRzIGZyb20gbXVsdGlwbGVcbiAqIHNvdXJjZXMsIHdoaWNoIHBhc3MgZGlmZmVyZW50IG5hdGl2ZSBldmVudHMgKG5vdCBvbmx5IERPTSBldmVudHMpXG4gKiB0byBTdHJlYW0uXG4gKiovXG5leHBvcnQgZnVuY3Rpb24gRE9NRXZlbnRTb3VyY2UoY29uZmlncykge1xuICB0aGlzLmNvbmZpZ3MgPSB7XG4gICAgZXZlbnRzOiBjb25maWdzLmV2ZW50cyB8fCBbXSxcbiAgfTtcbiAgdGhpcy5fY29sbGVjdG9yID0gd2luZG93LmFkZEV2ZW50TGlzdGVuZXIuYmluZCh3aW5kb3cpO1xuICB0aGlzLl9kZWNvbGxlY3RvciA9IHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyLmJpbmQod2luZG93KTtcbiAgdGhpcy5fZm9yd2FyZFRvOyAvLyBUaGUgZm9yd2FyZGluZyB0YXJnZXQuXG5cbiAgLy8gU29tZSBBUEkgeW91IGp1c3QgY2FuJ3QgYmluZCBpdCB3aXRoIHRoZSBvYmplY3QsXG4gIC8vIGJ1dCBhIGZ1bmN0aW9uLlxuICB0aGlzLm9uY2hhbmdlID0gdGhpcy5vbmNoYW5nZS5iaW5kKHRoaXMpO1xufVxuXG5ET01FdmVudFNvdXJjZS5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbihmb3J3YXJkVG8pIHtcbiAgdGhpcy5jb25maWdzLmV2ZW50cy5mb3JFYWNoKChlbmFtZSkgPT4ge1xuICAgIHRoaXMuX2NvbGxlY3RvcihlbmFtZSwgdGhpcy5vbmNoYW5nZSk7XG4gIH0pO1xuICB0aGlzLl9mb3J3YXJkVG8gPSBmb3J3YXJkVG87XG4gIHJldHVybiB0aGlzO1xufTtcblxuRE9NRXZlbnRTb3VyY2UucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5fZm9yd2FyZFRvID0gbnVsbDtcbiAgdGhpcy5jb25maWdzLmV2ZW50cy5mb3JFYWNoKChlbmFtZSkgPT4ge1xuICAgIHRoaXMuX2RlY29sbGVjdG9yKGVuYW1lLCB0aGlzLm9uY2hhbmdlKTtcbiAgfSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBGb3IgZm9yd2FyZGluZyB0byB0aGUgdGFyZ2V0LlxuICovXG5ET01FdmVudFNvdXJjZS5wcm90b3R5cGUub25jaGFuZ2UgPSBmdW5jdGlvbihkb21ldnQpIHtcbiAgaWYgKHRoaXMuX2ZvcndhcmRUbykge1xuICAgIHZhciBzb3VyY2VFdmVudCA9IG5ldyBTb3VyY2VFdmVudChcbiAgICAgIGRvbWV2dC50eXBlLCBkb21ldnQuZGV0YWlsLCBkb21ldnQpO1xuICAgIHRoaXMuX2ZvcndhcmRUbyhzb3VyY2VFdmVudCk7XG4gIH1cbn07XG5cbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHsgU291cmNlRXZlbnQgfSBmcm9tICdzcmMvc291cmNlL3NvdXJjZV9ldmVudC5qcyc7XG5cbi8qKlxuICogQSBzb3VyY2UgZmlyZSBldmVudHMgZXZlcnkgY2xvY2sgbWludXRlcy5cbiAqKi9cbmV4cG9ydCBmdW5jdGlvbiBNaW51dGVDbG9ja1NvdXJjZShjb25maWdzKSB7XG4gIHRoaXMuY29uZmlncyA9IHtcbiAgICB0eXBlOiBjb25maWdzLnR5cGUsXG4gICAgaW50ZXJ2YWw6IDYwMDAwICAgICAgIC8vIG9uZSBtaW51dGUuXG4gIH07XG4gIHRoaXMuX3RpY2tJZCA9IG51bGw7XG4gIHRoaXMuX2ZvcndhcmRUbyA9IG51bGw7XG4gIC8vIFNvbWUgQVBJIHlvdSBqdXN0IGNhbid0IGJpbmQgaXQgd2l0aCB0aGUgb2JqZWN0LFxuICAvLyBidXQgYSBmdW5jdGlvbi5cbiAgdGhpcy5vbmNoYW5nZSA9IHRoaXMub25jaGFuZ2UuYmluZCh0aGlzKTtcbn1cblxuTWludXRlQ2xvY2tTb3VyY2UucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oZm9yd2FyZFRvKSB7XG4gIHRoaXMuX2ZvcndhcmRUbyA9IGZvcndhcmRUbztcbiAgdmFyIHNlY29uZHMgPSAobmV3IERhdGUoKSkuZ2V0U2Vjb25kcygpO1xuICAvLyBJZiBpdCdzIHRoZSAjMCBzZWNvbmQgb2YgdGhhdCBtaW51dGUsXG4gIC8vIGltbWVkaWF0ZWx5IHRpY2sgb3Igd2Ugd291bGQgbG9zdCB0aGlzIG1pbnV0ZS5cbiAgaWYgKDAgPT09IHNlY29uZHMpIHtcbiAgICB0aGlzLm9uY2hhbmdlKCk7XG4gIH1cbiAgLy8gRm9yIHRoZSBmaXJzdCB0aWNrIHdlIG11c3Qgc2V0IHRpbWVvdXQgZm9yIGl0LlxuICB0aGlzLl90aWNrSWQgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgdGhpcy50aWNrKCk7XG4gIH0sIHRoaXMuY2FsY0xlZnRNaWxsaXNlY29uZHMoKSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuTWludXRlQ2xvY2tTb3VyY2UucHJvdG90eXBlLnRpY2sgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5vbmNoYW5nZSgpO1xuICAvLyBGb3IgdGhlIGZpcnN0IHRpY2sgd2UgbXVzdCBzZXQgdGltZW91dCBmb3IgaXQuXG4gIHRoaXMuX3RpY2tJZCA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICB0aGlzLnRpY2soKTtcbiAgfSwgdGhpcy5jYWxjTGVmdE1pbGxpc2Vjb25kcygpKTtcbn07XG5cbk1pbnV0ZUNsb2NrU291cmNlLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuX2ZvcndhcmRUbyA9IG51bGw7XG4gIGlmICh0aGlzLl90aWNrSWQpIHtcbiAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRoaXMuX3RpY2tJZCk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEZvciBmb3J3YXJkaW5nIHRvIHRoZSB0YXJnZXQuXG4gKiBXaGVuIHRoZSB0aW1lIGlzIHVwLCBmaXJlIGFuIGV2ZW50IGJ5IGdlbmVyYXRvci5cbiAqIFNvIHRoYXQgdGhlIG9uY2hhbmdlIG1ldGhvZCB3b3VsZCBmb3J3YXJkIGl0IHRvIHRoZSB0YXJnZXQuXG4gKi9cbk1pbnV0ZUNsb2NrU291cmNlLnByb3RvdHlwZS5vbmNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICBpZiAodGhpcy5fZm9yd2FyZFRvKSB7XG4gICAgdGhpcy5fZm9yd2FyZFRvKG5ldyBTb3VyY2VFdmVudCh0aGlzLmNvbmZpZ3MudHlwZSkpO1xuICB9XG59O1xuXG5NaW51dGVDbG9ja1NvdXJjZS5wcm90b3R5cGUuY2FsY0xlZnRNaWxsaXNlY29uZHMgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHNlY29uZHMgPSAobmV3IERhdGUoKSkuZ2V0U2Vjb25kcygpO1xuICAvLyBJZiBpdCdzIGF0IHRoZSBzZWNvbmQgMHRoIG9mIHRoZSBtaW51dGUsIGltbWVkaWF0ZSBzdGFydCB0byB0aWNrLlxuICB2YXIgbGVmdE1pbGxpc2Vjb25kcyA9ICg2MCAtIHNlY29uZHMpICogMTAwMDtcbiAgcmV0dXJuIGxlZnRNaWxsaXNlY29uZHM7XG59O1xuXG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7IFNvdXJjZUV2ZW50IH0gZnJvbSAnc3JjL3NvdXJjZS9zb3VyY2VfZXZlbnQuanMnO1xuXG4vKipcbiAqIEV2ZW50IHNvdXJjZSBmb3IgU3RyZWFtLiBPbmUgU3RyZWFtIGNhbiBjb2xsZWN0IGV2ZW50cyBmcm9tIG11bHRpcGxlXG4gKiBzb3VyY2VzLCB3aGljaCBwYXNzIGRpZmZlcmVudCBuYXRpdmUgZXZlbnRzIChub3Qgb25seSBET00gZXZlbnRzKVxuICogdG8gU3RyZWFtLlxuICoqL1xuZXhwb3J0IGZ1bmN0aW9uIFNldHRpbmdTb3VyY2UoY29uZmlncykge1xuICB0aGlzLmNvbmZpZ3MgPSB7XG4gICAgc2V0dGluZ3M6IGNvbmZpZ3Muc2V0dGluZ3MgfHwgW11cbiAgfTtcbiAgdGhpcy5fY29sbGVjdG9yID0gbmF2aWdhdG9yLm1velNldHRpbmdzLmFkZE9ic2VydmVyXG4gICAgLmJpbmQobmF2aWdhdG9yLm1velNldHRpbmdzKTtcbiAgdGhpcy5fZGVjb2xsZWN0b3IgPSBuYXZpZ2F0b3IubW96U2V0dGluZ3MucmVtb3ZlT2JzZXJ2ZXJcbiAgICAuYmluZChuYXZpZ2F0b3IubW96U2V0dGluZ3MpO1xuICB0aGlzLl9mb3J3YXJkVG8gPSBudWxsO1xuICAvLyBTb21lIEFQSSB5b3UganVzdCBjYW4ndCBiaW5kIGl0IHdpdGggdGhlIG9iamVjdCxcbiAgLy8gYnV0IGEgZnVuY3Rpb24uXG4gIHRoaXMub25jaGFuZ2UgPSB0aGlzLm9uY2hhbmdlLmJpbmQodGhpcyk7XG59XG5cblNldHRpbmdTb3VyY2UucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oZm9yd2FyZFRvKSB7XG4gIHRoaXMuY29uZmlncy5zZXR0aW5ncy5mb3JFYWNoKChrZXkpID0+IHtcbiAgICB0aGlzLl9jb2xsZWN0b3Ioa2V5LCB0aGlzLm9uY2hhbmdlKTtcbiAgfSk7XG4gIHRoaXMuX2ZvcndhcmRUbyA9IGZvcndhcmRUbztcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5TZXR0aW5nU291cmNlLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuX2ZvcndhcmRUbyA9IG51bGw7XG4gIHRoaXMuY29uZmlncy5zZXR0aW5ncy5mb3JFYWNoKChrZXkpID0+IHtcbiAgICB0aGlzLl9kZWNvbGxlY3RvcihrZXksIHRoaXMub25jaGFuZ2UpO1xuICB9KTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEZvciBmb3J3YXJkaW5nIHRvIHRoZSB0YXJnZXQuXG4gKiBXb3VsZCB0cmFuc2Zvcm0gdGhlIG9yaWdpbmFsICdzZXR0aW5nTmFtZScgYW5kICdzZXR0aW5nVmFsdWUnIHBhaXIgYXNcbiAqICd0eXBlJyBhbmQgJ2RldGFpbCcsIGFzIHRoZSBldmVudCBmb3JtYW50LlxuICovXG5TZXR0aW5nU291cmNlLnByb3RvdHlwZS5vbmNoYW5nZSA9IGZ1bmN0aW9uKGNoYW5nZSkge1xuICBpZiAodGhpcy5fZm9yd2FyZFRvKSB7XG4gICAgdGhpcy5fZm9yd2FyZFRvKFxuICAgICAgbmV3IFNvdXJjZUV2ZW50KGNoYW5nZS5zZXR0aW5nTmFtZSwgY2hhbmdlLnNldHRpbmdWYWx1ZSkpO1xuICB9XG59O1xuXG4iLCIgJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEEgZGF0dW0gdGhhdCBldmVyeSBzb3VyY2Ugd291bGQgZmlyZS5cbiAqKi9cbihmdW5jdGlvbihleHBvcnRzKSB7XG4gIHZhciBTb3VyY2VFdmVudCA9IGZ1bmN0aW9uKHR5cGUsIGRldGFpbCwgb3JpZ2luYWwpIHtcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIHRoaXMuZGV0YWlsID0gZGV0YWlsO1xuICAgIHRoaXMub3JpZ2luYWwgPSBvcmlnaW5hbDsgLy8gb3JpZ2luYWwgZXZlbnQsIGlmIGFueS5cbiAgfTtcbiAgZXhwb3J0cy5Tb3VyY2VFdmVudCA9IFNvdXJjZUV2ZW50O1xufSkod2luZG93KTtcblxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgeyBTdHJlYW0gfSBmcm9tICdzcmMvc3RyZWFtL3N0cmVhbS5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBCYXNpY1N0YXRlKGNvbXBvbmVudCkge1xuICAvLyBBIGxvY2sgdG8gcHJldmVudCB0cmFuc2ZlcnJpbmcgcmFjaW5nLiBUaGlzIGlzIGJlY2F1c2UgbW9zdCBvZiBzb3VyY2VcbiAgLy8gZXZlbnRzIGFyZSBtYXBwZWQgaW50byBpbnRlcnJ1cHRzIHRvIHRyaWdnZXIgdHJhbnNmZXJyaW5ncy4gVG8gcHJldmVudFxuICAvLyBjbGllbnQgbmVlZCB0byBpbXBsZW1lbnQgdGhpcyBhZ2FpbiBhbmQgYWdhaW4gd2UgcHV0IHRoZSBsb2NrIGhlcmUuXG4gIHRoaXMuX3RyYW5zZmVycmVkID0gZmFsc2U7XG4gIC8vIFJlcGxhY2Ugd2l0aCB0aGUgbmFtZSBvZiBjb25jcmV0ZSBzdGF0ZS5cbiAgdGhpcy5jb25maWdzID0ge1xuICAgIHR5cGU6ICdCYXNpY1N0YXRlJyxcbiAgICAvLyBOb3RlIHRoZSBldmVudCBtZWFucyBldmVudHMgZm9yd2FyZGVkIGZyb20gc291cmNlcywgbm90IERPTSBldmVudHMuXG4gICAgc3RyZWFtOiB7XG4gICAgICBldmVudHM6IFtdLFxuICAgICAgaW50ZXJydXB0czogW10sXG4gICAgICBzb3VyY2VzOiBbXVxuICAgIH1cbiAgfTtcbiAgLy8gQ29tcG9uZW50IHJlZmVyZW5jZSBwcm9pdmRlcyBldmVyeSByZXNvdXJjZSAmIHByb3BlcnR5XG4gIC8vIG5lZWQgYnkgYWxsIHN0YXRlcy5cbiAgdGhpcy5jb21wb25lbnQgPSBjb21wb25lbnQ7XG59XG5cbi8qKlxuICogU3RyZWFtJyBwaGFzZSBpcyB0aGUgc3RhdGUncyBwaGFzZS5cbiAqL1xuQmFzaWNTdGF0ZS5wcm90b3R5cGUucGhhc2UgPVxuZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnN0cmVhbS5waGFzZSgpO1xufTtcblxuLyoqXG4gKiBEZXJpdmVkIHN0YXRlcyBzaG91bGQgZXh0ZW5kIHRoZXNlIGJhc2ljIG1ldGhvZHMuXG4gKi9cbkJhc2ljU3RhdGUucHJvdG90eXBlLnN0YXJ0ID1cbmZ1bmN0aW9uKCkge1xuICB0aGlzLnN0cmVhbSA9IG5ldyBTdHJlYW0odGhpcy5jb25maWdzLnN0cmVhbSk7XG4gIHJldHVybiB0aGlzLnN0cmVhbS5zdGFydCh0aGlzLmhhbmRsZVNvdXJjZUV2ZW50LmJpbmQodGhpcykpXG4gICAgLm5leHQodGhpcy5zdHJlYW0ucmVhZHkuYmluZCh0aGlzLnN0cmVhbSkpO1xufTtcblxuQmFzaWNTdGF0ZS5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5zdHJlYW0uc3RvcCgpO1xufTtcblxuQmFzaWNTdGF0ZS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5zdHJlYW0uZGVzdHJveSgpO1xufTtcblxuQmFzaWNTdGF0ZS5wcm90b3R5cGUubGl2ZSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5zdHJlYW0udW50aWwoJ3N0b3AnKTtcbn07XG5cbkJhc2ljU3RhdGUucHJvdG90eXBlLmV4aXN0ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnN0cmVhbS51bnRpbCgnZGVzdHJveScpO1xufTtcblxuLyoqXG4gKiBNdXN0IHRyYW5zZmVyIHRvIG5leHQgc3RhdGUgdmlhIGNvbXBvbmVudCdzIG1ldGhvZC5cbiAqIE9yIHRoZSBjb21wb25lbnQgY2Fubm90IHRyYWNrIHRoZSBsYXN0IGFjdGl2ZSBzdGF0ZS5cbiAqL1xuQmFzaWNTdGF0ZS5wcm90b3R5cGUudHJhbnNmZXJUbyA9IGZ1bmN0aW9uKCkge1xuICBpZiAodGhpcy5fdHJhbnNmZXJyZWQpIHtcbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnUHJldmVudCB0cmFuc2ZlcnJpbmcgcmFjaW5nJyk7XG4gICAgdmFyIG51bGxpZml6ZWQgPSBuZXcgU3RyZWFtKCk7XG4gICAgLy8gVGhpcyB3b3VsZCByZXR1cm4gYSBwcm9jZXNzIGNvdWxkIGJlIGNvbmNhdGVkIGJ1dCB3b3VsZCBkbyBub3RoaW5nLlxuICAgIC8vIEl0J3MgYmV0dGVyIHRvIGZvcm1hbGx5IHByb3ZpZGUgYSBBUEkgZnJvbSBQcm9jZXNzLCBsaWtlXG4gICAgLy8gUHJvY2Vzcy5tYXliZSgpIG9yIFByb2Nlc3MjbnVsbGl6ZSgpLCBidXQgdGhpcyBpcyBhIHNpbXBsaWVyIHNvbHV0aW9uLlxuICAgIHJldHVybiBudWxsaWZpemVkLnN0YXJ0KCkubmV4dCgoKSA9PiBudWxsaWZpemVkLnN0b3AoKSk7XG4gIH1cbiAgLy8gTm8gbmVlZCB0byByZXNldCBpdCBhZ2FpbiBzaW5jZSBhIHN0YXRlIGluc3RhbmNlIHNob3VsZCBub3QgYmVcbiAgLy8gdHJhbnNmZXJyZWQgdG8gdHdpY2UuXG4gIHRoaXMuX3RyYW5zZmVycmVkID0gdHJ1ZTtcbiAgcmV0dXJuIHRoaXMuY29tcG9uZW50LnRyYW5zZmVyVG8uYXBwbHkodGhpcy5jb21wb25lbnQsIGFyZ3VtZW50cyk7XG59O1xuXG4vKipcbiAqIElmIHRoaXMgaGFuZGxlciByZXR1cm4gYSBQcm9taXNlLCBvciBQcm9jZXNzLCB0aGUgdW5kZXJseWluZyBTdHJlYW1cbiAqIGNhbiBtYWtlIHN1cmUgdGhlIHN0ZXBzIGFyZSBxdWV1ZWQgZXZlbiB3aXRoIGFzeW5jaHJvbm91cyBzdGVwcy5cbiAqL1xuQmFzaWNTdGF0ZS5wcm90b3R5cGUuaGFuZGxlU291cmNlRXZlbnQgPSBmdW5jdGlvbigpIHt9O1xuXG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7IFByb2Nlc3MgfSBmcm9tICdzcmMvc3RyZWFtL3Byb2Nlc3MvcHJvY2Vzcy5qcyc7XG5cbi8qKlxuICogQ29tYmluZSB0aGUgYWJpbGl0aWVzIG9mIHRoZSBldmVudCBoYW5kbGluZyBhbmQgYXN5bmNocm9ub3VzIG9wZXJhdGlvbnNcbiAqIHNlcXVlbnRpYWxpemluZyB0b2dldGhlci4gU28gdGhhdCBldmVyeSBTdHJlYW0gY291bGQ6XG4gKlxuICogMS4gRm9yIHRoZSBvcmRpbmFyeSBldmVudHMsIGFwcGVuZCBzdGVwcyB0byB0aGUgbWFpbiBQcm9jZXNzIHRvIHF1ZXVlXG4gKiAgICB0aGUgZXZlbnQgaGFuZGxlcnMuXG4gKiAyLiBGb3Igb3RoZXIgdXJnZW50IGV2ZW50cyAoaW50ZXJydXB0cyksIGltbWVkaWF0ZWx5IGV4ZWN1dGUgdGhlIGV2ZW50XG4gKiAgICBoYW5kbGVyIHdpdGhvdXQgcXVldWluZyBpdC5cbiAqIDMuIE9ubHkgcmVjZWl2ZSBldmVudHMgd2hlbiBpdCdzICdyZWFkeScuIEJlZm9yZSB0aGF0LCBubyBzb3VyY2UgZXZlbnRzXG4gKiAgICB3b3VsZCBiZSBmb3J3YXJkZWQgYW5kIGhhbmRsZWQuXG4gKiA0LiBPbmNlIHBoYXNlIGJlY29tZXMgJ3N0b3AnLCBubyBldmVudHMgd291bGQgYmUgcmVjZWl2ZWQgYWdhaW4uXG4gKlxuICogU3RyZWFtIHNob3VsZCBjcmVhdGUgd2l0aCBhIGNvbmZpZ3Mgb2JqZWN0IGlmIHVzZXIgd2FudCB0byBzZXQgdXAgc291cmNlcyxcbiAqIGV2ZW50cyBhbmQgaW50ZXJydXB0cy4gSWYgdGhlcmUgaXMgbm8gc3VjaCBvYmplY3QsIGl0IHdvdWxkIGFjdCBsaWtlIGFcbiAqIFByb2Nlc3MsIGFuZCB3aXRob3V0IGFueSBmdW5jdGlvbiBoYW5kbGVzIGV2ZW50cy5cbiAqKi9cbmV4cG9ydCBmdW5jdGlvbiBTdHJlYW0oY29uZmlncyA9IHt9KSB7XG4gIHRoaXMuY29uZmlncyA9IHtcbiAgICBldmVudHM6IGNvbmZpZ3MuZXZlbnRzIHx8IFtdLFxuICAgIGludGVycnVwdHM6IGNvbmZpZ3MuaW50ZXJydXB0cyB8fCBbXVxuICB9O1xuICBpZiAoY29uZmlncy5zb3VyY2VzICYmIDAgIT09IGNvbmZpZ3Muc291cmNlcy5sZW5ndGgpIHtcbiAgICB0aGlzLmNvbmZpZ3Muc291cmNlcyA9IGNvbmZpZ3Muc291cmNlcztcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmNvbmZpZ3Muc291cmNlcyA9IFtdO1xuICB9XG4gIHRoaXMuX2ZvcndhcmRUbyA9IG51bGw7XG4gIC8vIE5lZWQgdG8gZGVsZWdhdGUgdG8gU291cmNlLlxuICB0aGlzLm9uY2hhbmdlID0gdGhpcy5vbmNoYW5nZS5iaW5kKHRoaXMpO1xufVxuXG5TdHJlYW0ucHJvdG90eXBlLnBoYXNlID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnByb2Nlc3MuX3J1bnRpbWUuc3RhdGVzLnBoYXNlO1xufTtcblxuU3RyZWFtLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKGZvcndhcmRUbykge1xuICB0aGlzLl9mb3J3YXJkVG8gPSBmb3J3YXJkVG87XG4gIHRoaXMucHJvY2VzcyA9IG5ldyBQcm9jZXNzKCk7XG4gIHRoaXMucHJvY2Vzcy5zdGFydCgpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogS2ljayBvZmYgU291cmNlIGFuZCBzdGFydCBkbyB0aGluZ3MuXG4gKi9cblN0cmVhbS5wcm90b3R5cGUucmVhZHkgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5jb25maWdzLnNvdXJjZXMuZm9yRWFjaCgoc291cmNlKSA9PiB7XG4gICAgc291cmNlLnN0YXJ0KHRoaXMub25jaGFuZ2UpO1xuICB9KTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5TdHJlYW0ucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5wcm9jZXNzLnN0b3AoKTtcbiAgdGhpcy5jb25maWdzLnNvdXJjZXMuZm9yRWFjaCgoc291cmNlKSA9PiB7XG4gICAgc291cmNlLnN0b3AoKTtcbiAgfSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuU3RyZWFtLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMucHJvY2Vzcy5kZXN0cm95KCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuU3RyZWFtLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24oc3RlcCkge1xuICB0aGlzLnByb2Nlc3MubmV4dChzdGVwKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5TdHJlYW0ucHJvdG90eXBlLnJlc2N1ZSA9IGZ1bmN0aW9uKHJlc2N1ZXIpIHtcbiAgdGhpcy5wcm9jZXNzLnJlc2N1ZShyZXNjdWVyKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJldHVybiBhIFByb21pc2UgZ2V0IHJlc29sdmVkIHdoZW4gdGhlIHN0cmVhbSB0dXJuIHRvXG4gKiB0aGUgc3BlY2lmaWMgcGhhc2UuIEZvciBleGFtcGxlOlxuICpcbiAqICAgIHN0cmVhbS51bnRpbCgnc3RvcCcpXG4gKiAgICAgICAgICAudGhlbigoKSA9PiB7IGNvbnNvbGUubG9nKCdzdHJlYW0gc3RvcHBlZCcpIH0pO1xuICogICAgc3RyZWFtLnN0YXJ0KCk7XG4gKi9cblN0cmVhbS5wcm90b3R5cGUudW50aWwgPSBmdW5jdGlvbihwaGFzZSkge1xuICByZXR1cm4gdGhpcy5wcm9jZXNzLnVudGlsKHBoYXNlKTtcbn07XG5cbi8qKlxuICogT25seSB3aGVuIGFsbCB0YXNrcyBwYXNzZWQgaW4gZ2V0IHJlc29sdmVkLFxuICogdGhlIHByb2Nlc3Mgd291bGQgZ28gdG8gdGhlIG5leHQuXG4gKi9cblN0cmVhbS5wcm90b3R5cGUud2FpdCA9IGZ1bmN0aW9uKHRhc2tzKSB7XG4gIHRoaXMucHJvY2Vzcy53YWl0KHRhc2tzKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEl0IHdvdWxkIHJlY2VpdmUgZXZlbnRzIGZyb20gU291cmNlLCBhbmQgdGhhbiBxdWV1ZSBvciBub3QgcXVldWVcbiAqIGl0LCBkZXBlbmRzIG9uIHdoZXRoZXIgdGhlIGV2ZW50IGlzIGFuIGludGVycnVwdC5cbiAqL1xuU3RyZWFtLnByb3RvdHlwZS5vbmNoYW5nZSA9IGZ1bmN0aW9uKGV2dCkge1xuICBpZiAoJ3N0YXJ0JyAhPT0gdGhpcy5wcm9jZXNzLl9ydW50aW1lLnN0YXRlcy5waGFzZSkge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIGlmICgtMSAhPT0gdGhpcy5jb25maWdzLmludGVycnVwdHMuaW5kZXhPZihldnQudHlwZSkpIHtcbiAgICAvLyBJbnRlcnJ1cHQgd291bGQgYmUgaGFuZGxlZCBpbW1lZGlhdGVseS5cbiAgICB0aGlzLl9mb3J3YXJkVG8oZXZ0KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSBlbHNlIHtcbiAgICAvLyBFdmVudCB3b3VsZCBiZSBoYW5kbGVkIGFmdGVyIHF1ZXVpbmcuXG4gICAgLy8gVGhpcyBpcywgaWYgdGhlIGV2ZW50IGhhbmRsZSByZXR1cm4gYSBQcm9taXNlIG9yIFByb2Nlc3MsXG4gICAgLy8gdGhhdCBjYW4gYmUgZnVsZmlsbGVkIGxhdGVyLlxuICAgIHRoaXMucHJvY2Vzcy5uZXh0KCgpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLl9mb3J3YXJkVG8oZXZ0KTtcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxufTtcblxuIiwiICd1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBUaGUgYmFzaWMgaW50ZXJmYWNlIG9mIHZpZXcuXG4gKiBWaWV3IG9ubHkgbmVlZCB0byBrbm93IGhvdyB0byB0cmFuc2Zvcm0gZGF0YSB0byB0aGVcbiAqIHN5bnRoZXRpYyAnZWZmZWN0cycuXG4gKlxuICogRm9yIFVJLCBpdCBtZWFucyB0byBkcmF3IHNvbWV0aGluZyBvbiB0aGUgc2NyZWVuLlxuICogRm9yIG90aGVyIHZpZXdzLCBpdCBtZWFucyB0byBwZXJmb3JtIHJlbW90ZSBxdWVyaWVzLFxuICogcGxheSBzb3VuZHMsIHNlbmQgY29tbWFuZHMgdmlhIG5ldHdvcmssIGV0Yy5cbiAqXG4gKiBBbmQgaG93IHRvIGNvbXBvc2UgdGhlICdlZmZlY3RzJyBpcyBkZWNpZGVkIGJ5IHRoZSBjb21wb25lbnQuXG4gKiBJZiBvbmUgcGFyZW50IG5lZWQgdG8gd2FpdCBpdHMgY2hpbGRyZW4sIG9yIHRvIGNvbGxlY3QgcmVzdWx0c1xuICogZnJvbSB0aGVtLCB0aGUgY29tcG9uZW50IG11c3QgZGVyaXZlIHRoaXMgdmlldyB0byBwcm92aWRlXG4gKiAndGhlbi1hYmxlJyBhYmlsaXR5IHRvIHRoZSAncmVuZGVyJyBtZXRob2QuXG4gKiBXZSBkb24ndCBtYWtlIGFueSBhc3N1bXB0aW9ucyBpbiB0aGlzIGJhc2ljIGludGVyZmFjZS5cbiAqKi9cbiAgZXhwb3J0IGZ1bmN0aW9uIEJhc2ljVmlldygpIHt9XG5cbiAgLyoqXG4gICAqIElmIGl0J3MgYSBVSSB2aWV3IGJ1dCB3aXRob3V0IHZpcnR1YWwgRE9NLFxuICAgKiB0aGUgdmlld3MgbXVzdCBoYW5kbGUgZGV0YWlsZWQgRE9NIG1hbmlwdWxhdGlvbnNcbiAgICogbWFudWFsbHkuIFNvIFVJIHZpZXcgY291bGQgYmUgY29tcGxpY2F0ZWQuXG4gICAqXG4gICAqIFdpdGggdmlydHVhbCBET00gaXQgY291bGQgYmUgdmVyeSBzaW1wbGUsIGJ1dCB0aGlzIGRlcGVuZHMgb24gdGhlXG4gICAqIGZhY2lsaXRpZXMgb2YgdGhlIHByb2plY3QuXG4gICAqL1xuICBCYXNpY1ZpZXcucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKGRhdGEpIHt9O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgeyBMYW5ndWFnZSB9IGZyb20gJ3NyYy9ydW5lL2xhbmd1YWdlLmpzJztcblxuLyoqXG4gKiBUaGlzIGxhbmd1YWdlIGludGVyZmFjZSB3b3VsZCBwcm92aWRlIGNhbGxhYmxlIG1ldGhvZHMgb2YgdGhlIFByb2Nlc3MgZURTTC5cbiAqXG4gKiBUaGUgZGlmZmVyZW5jZSBiZXR3ZWVuIGludGVyZmFuY2UgJiBydW50aW1lIGlzOlxuICpcbiAqICBJbnRlcmZhY2U6IG1hbmFnZSB0aGUgc3RhY2sgYW5kIHByb3ZpZGVzIGFuYWx5emVycyBpZiBpdCdzIG5lY2Vzc2FyeS5cbiAqICBSdW50aW1lOiBldmFsdWF0ZSBldmVyeSBjaGFuZ2UgKG5vZGUpIG9mIHRoZSBzdGFjay5cbiAqXG4gKiBTbyB0aGlzIGludGVyZmFjZSB3b3VsZCBjaGVjayBpZiB0aGVyZSBhcmUgYW55ICdzeW50YXgnIGVycm9yIGR1cmluZyBjb21wb3NlXG4gKiB0aGUgZURTTCBpbnN0YW5jZS4gRm9yIGV4YW1wbGUsIHRoZSBhbmFseXplciBvZiB0aGUgaW50ZXJmYWNlIGNvdWxkIHJlcG9ydFxuICogdGhpcyBraW5kIG9mIGVycm9yOlxuICpcbiAqICBwcm9jZXNzLnN0b3AoKS5zdGFydCgpLm5leHQoKTsgICAgLy8gRVJST1I6ICdzdG9wJyBiZWZvcmUgJ3N0YXJ0J1xuICpcbiAqIEFuZCBzaW5jZSB0aGUgaW50ZXJmYWNlIHdvdWxkIG5vdCBldmFsdWF0ZSBub2RlcywgaXQgd291bGQgZm9yd2FyZCBzdGFja1xuICogY2hhbmdlcyB0byB0aGUgcnVudGltZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEludGVyZmFjZShydW50aW1lKSB7XG4gIC8vIFJlcXVpcmVkIGJ5IHRoZSAnTGFuZ3VhZ2UnIG1vZHVsZS5cbiAgdGhpcy5jb250ZXh0ID0ge1xuICAgIHN0YXJ0ZWQ6IGZhbHNlLFxuICAgIHN0b3BwZWQ6IGZhbHNlXG4gIH07XG4gIHRoaXMuc3RhY2sgPSBbXTtcbiAgdGhpcy5fcnVudGltZSA9IHJ1bnRpbWU7XG4gIHRoaXMuX2V2YWx1YXRvciA9IChuZXcgTGFuZ3VhZ2UuRXZhbHVhdGUoKSlcbiAgICAuYW5hbHl6ZXIodGhpcy5fYW5hbHl6ZU9yZGVyLmJpbmQodGhpcykpXG4gICAgLmludGVycHJldGVyKHRoaXMuX2ludGVycHJldC5iaW5kKHRoaXMpKTtcbn1cblxuSW50ZXJmYWNlLnByb3RvdHlwZS5zdGFydCA9IExhbmd1YWdlLmRlZmluZSgnc3RhcnQnLCAnYmVnaW4nKTtcbkludGVyZmFjZS5wcm90b3R5cGUuc3RvcCA9IExhbmd1YWdlLmRlZmluZSgnc3RvcCcsICdwdXNoJyk7XG5JbnRlcmZhY2UucHJvdG90eXBlLmRlc3Ryb3kgPSBMYW5ndWFnZS5kZWZpbmUoJ2Rlc3Ryb3knLCAncHVzaCcpO1xuSW50ZXJmYWNlLnByb3RvdHlwZS5uZXh0ID0gTGFuZ3VhZ2UuZGVmaW5lKCduZXh0JywgJ3B1c2gnKTtcbkludGVyZmFjZS5wcm90b3R5cGUuc2hpZnQgPSBMYW5ndWFnZS5kZWZpbmUoJ3NoaWZ0JywgJ3B1c2gnKTtcbkludGVyZmFjZS5wcm90b3R5cGUucmVzY3VlID0gTGFuZ3VhZ2UuZGVmaW5lKCdyZXNjdWUnLCAncHVzaCcpO1xuSW50ZXJmYWNlLnByb3RvdHlwZS53YWl0ID0gTGFuZ3VhZ2UuZGVmaW5lKCd3YWl0JywgJ3B1c2gnKTtcblxuLy8gSXQncyBub3QgYSBtZXRob2Qgb3ducyBzZW1hbnRpY3MgbWVhbmluZyBvZiB0aGUgZURTTCwgYnV0IGEgbWV0aG9kXG4vLyBpbnRlcmFjdHMgd2l0aCB0aGUgbWV0YWxhbmdhdWdlLCBzbyBkZWZpbmUgaXQgaW4gdGhpcyB3YXkuXG5JbnRlcmZhY2UucHJvdG90eXBlLnVudGlsID1cbmZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5fcnVudGltZS51bnRpbC5hcHBseSh0aGlzLl9ydW50aW1lLCBhcmd1bWVudHMpO1xufTtcblxuSW50ZXJmYWNlLnByb3RvdHlwZS5vbmNoYW5nZSA9IGZ1bmN0aW9uKGNvbnRleHQsIG5vZGUsIHN0YWNrKSB7XG4gIC8vIFdoZW4gaXQncyBjaGFuZ2VkLCBldmFsdWF0ZSBpdCB3aXRoIGFuYWx5emVycyAmIGludGVycHJldGVyLlxuICByZXR1cm4gdGhpcy5fZXZhbHVhdG9yKGNvbnRleHQsIG5vZGUsIHN0YWNrKTtcbn07XG5cbkludGVyZmFjZS5wcm90b3R5cGUuX2ludGVycHJldCA9IGZ1bmN0aW9uKGNvbnRleHQsIG5vZGUsIHN0YWNrKSB7XG4gIC8vIFdlbGwgaW4gdGhpcyBlRFNMIHdlIGRlbGVnYXRlIHRoZSBpbnRlcnByZXRpb24gdG8gdGhlIHJ1bnRpbWUuXG4gIHJldHVybiB0aGlzLl9ydW50aW1lLm9uY2hhbmdlLmFwcGx5KHRoaXMuX3J1bnRpbWUsIGFyZ3VtZW50cyk7XG59O1xuXG4vLyBJbiB0aGlzIGVEU0wgd2Ugbm93IG9ubHkgaGF2ZSB0aGlzIGFuYWx5emVyLiBDb3VsZCBhZGQgbW9yZSBhbmQgcmVnaXN0ZXIgaXRcbi8vIGluIHRoZSBjb250cnVjdGlvbiBvZiAndGhpcy5fZXZhbHVhdG9yJy5cbkludGVyZmFjZS5wcm90b3R5cGUuX2FuYWx5emVPcmRlciA9IGZ1bmN0aW9uKGNvbnRleHQsIGNoYW5nZSwgc3RhY2spIHtcbiAgaWYgKCdzdGFydCcgPT09IGNoYW5nZS50eXBlKSB7XG4gICAgY29udGV4dC5zdGFydGVkID0gdHJ1ZTtcbiAgfSBlbHNlIGlmICgnc3RvcCcpIHtcbiAgICBjb250ZXh0LnN0b3BwZWQgPSB0cnVlO1xuICB9XG4gIGlmICgnc3RhcnQnID09PSBjaGFuZ2UudHlwZSAmJiBjb250ZXh0LnN0b3BwZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Nob3VsZCBub3Qgc3RhcnQgYSBwcm9jZXNzIGFnYWluJyArXG4gICAgICAgICdhZnRlciBpdFxcJ3MgYWxyZWFkeSBzdG9wcGVkJyk7XG4gIH0gZWxzZSBpZiAoJ25leHQnID09PSBjaGFuZ2UudHlwZSAmJiAhY29udGV4dC5zdGFydGVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdTaG91bGQgbm90IGNvbmNhdCBzdGVwcyB3aGlsZSBpdFxcJ3Mgbm90IHN0YXJ0ZWQnKTtcbiAgfSBlbHNlIGlmICgnc3RvcCcgPT09IGNoYW5nZS50eXBlICYmICFjb250ZXh0LnN0YXJ0ZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Nob3VsZCBub3Qgc3RvcCBhIHByb2Nlc3MgYmVmb3JlIGl0XFwncyBzdGFydGVkJyk7XG4gIH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7IEludGVyZmFjZSB9IGZyb20gJ3NyYy9zdHJlYW0vcHJvY2Vzcy9pbnRlcmZhY2UuanMnO1xuaW1wb3J0IHsgUnVudGltZSB9IGZyb20gJ3NyYy9zdHJlYW0vcHJvY2Vzcy9ydW50aW1lLmpzJztcblxuLyoqXG4gKiBUaGUgY29yZSBjb21wb25lbnQgdG8gc2VxdWVudGlhbGl6ZSBhc3luY2hyb25vdXMgc3RlcHMuXG4gKiBCYXNpY2FsbHkgaXQncyBhbiAnaW50ZXJydXB0YWJsZSBwcm9taXNlJywgYnV0IG1vcmUgdGhhbiBiZSBpbnRlcnJ1cHRlZCxcbiAqIGl0IGNvdWxkICdzaGlmdCcgZnJvbSBvbmUgdG8gYW5vdGhlciBwaGFzZSwgd2l0aCB0aGUgbm9uLXByZWVtcHRpdmVcbiAqIGludGVycnVwdGluZyBtb2RlbC5cbiAqXG4gKiBFeGFtcGxlOlxuICogICAgdmFyIHByb2Nlc3MgPSBuZXcgUHJvY2VzcygpO1xuICogICAgcHJvY2Vzcy5zdGFydCgpICAgICAgIC8vIHRoZSBkZWZhdWx0IHBoYXNlIGlzICdzdGFydCdcbiAqICAgICAgICAgICAubmV4dChzdGVwQSlcbiAqICAgICAgICAgICAubmV4dChzdGVwQilcbiAqICAgICAgICAgICAuLi5cbiAqICAgIC8vIGxhdGVyLCBzb21lIHVyZ2VudCBldmVudHMgY29tZVxuICogICAgcHJvY2Vzcy5zdG9wKCkgICAgICAgLy8gb25lIG9mIHRoZSBkZWZhdWx0IHRocmVlIHBoYXNlc1xuICogICAgICAgICAgIC5uZXh0KHN0b3BTdGVwQSlcbiAqICAgICAgICAgICAubmV4dChzdG9wU3RlcEIpXG4gKiAgICAgICAgICAgLi4uLlxuICogICAvLyBsYXRlciwgc29tZSBvdGhlciBpbnRlcnJ1cHRzIGNvbWVcbiAqICAgcHJvY2Vzcy5zaGlmdCgnc3RvcCcsICdkaXp6eScpXG4gKiAgICAgICAgICAubmV4dChkaXp6eVN0ZXBBKVxuICogICAgICAgICAgLm5leHQoZGl6enlTdGVwQilcbiAqXG4gKiBUaGUgcGhhc2VzIGxpc3RlZCBhYm92ZSB3b3VsZCBpbW1lZGlhdGVseSBpbnRlcnJ1cHQgdGhlIHN0ZXBzIHNjaGVkdWxlZFxuICogYXQgdGhlIHByZXZpb3VzIHBoYXNlLiBIb3dldmVyLCB0aGlzIGlzIGEgKm5vbi1wcmVlbXB0aXZlKiBwcm9jZXNzIGJ5XG4gKiBkZWZhdWx0LiBTbywgaWYgdGhlcmUgaXMgYSBsb25nLXdhaXRpbmcgUHJvbWlzZSBzdGVwIGluIHRoZSAnc3RhcnQnIHBoYXNlOlxuICpcbiAqICAgcHJvY2Vzcy5zdGFydCgpXG4gKiAgICAgICAgICAubmV4dCggbG9uZ2xvbmdsb25nV2FpdGluZ1Byb21pc2UgKSAgIC8vIDwtLS0gbm93IGl0J3Mgd2FpdGluZyB0aGlzXG4gKiAgICAgICAgICAubmV4dCggdGhpc1N0ZXBJc1N0YXJ2aW5nIClcbiAqICAgICAgICAgIC5uZXh0KCBhbmRUaGlzT25lVG9vIClcbiAqICAgICAgICAgIC5uZXh0KCBwb29yU3RlcHMgKVxuICogICAgICAgICAgLi4uLlxuICogICAvLyBzb21lIHVyZ2VudCBldmVudCBvY2N1cnMgd2hlbiBpdCBnb2VzIHRvIHRoZSBsb25nIHdhaXRpbmcgcHJvbWlzZVxuICogICBwcm9jZXNzLnN0b3AoKVxuICogICAgICAgICAgLm5leHQoIGRvVGhpc0FzUXVpY2tBc1Bvc3NpYmxlIClcbiAqXG4gKiBUaGUgZmlyc3Qgc3RlcCBvZiB0aGUgJ3N0b3AnIHBoYXNlLCBuYW1lbHkgdGhlICdkb1RoaXNBc1F1aWNrQXNQb3NzaWJsZScsXG4gKiB3b3VsZCAqbm90KiBnZXQgZXhlY3V0ZWQgaW1tZWRpYXRlbHksIHNpbmNlIHRoZSBwcm9taXNlIGlzIHN0aWxsIHdhaXRpbmcgdGhlXG4gKiBsYXN0IHN0ZXAgZWFybGllciBpbnRlcnJ1cHRpb24uIFNvLCBldmVuIHRoZSBmb2xsb3dpbmcgc3RlcHMgb2YgdGhlICdzdGFydCdcbiAqIHBoYXNlIHdvdWxkIGFsbCBnZXQgZHJvcHBlZCwgdGhlIG5ldyBwaGFzZSBzdGlsbCBuZWVkIHRvIHdhaXQgdGhlIGxhc3Qgb25lXG4gKiBhc3luY2hyb25vdXMgc3RlcCBnZXQgcmVzb2x2ZWQgdG8gZ2V0IGtpY2tlZCBvZmYuXG4gKlxuICogLS0tXG4gKiAjIyBBYm91dCB0aGUgbm9uLXByZWVtcHRpdmUgbW9kZWxcbiAqXG4gKiBUaGUgcmVhc29uIHdoeSB3ZSBjYW4ndCBoYXZlIGEgcHJlZW1wdGl2ZSBwcm9jZXNzIGlzIGJlY2F1c2Ugd2UgY291bGRuJ3RcbiAqIGludGVycnVwdCBlYWNoIHNpbmdsZSBzdGVwIGluIHRoZSBwcm9jZXNzLCBzbyB0aGUgbW9zdCBiYXNpYyB1bml0IGNvdWxkIGJlXG4gKiBpbnRlcnJ1cHRlZCBpcyB0aGUgc3RlcC4gU28sIHRoZSBjYXZlYXQgaGVyZSBpcyBtYWtlIHRoZSBzdGVwIGFzIHNtYWxsIGFzXG4gKiBwb3NzaWJsZSwgYW5kIHRyZWF0IGl0IGFzIHNvbWUgYXRvbWljIG9wZXJhdGlvbiB0aGF0IGd1YXJhbnRlZWQgdG8gbm90IGJlZW5cbiAqIGludGVycnVwdGVkIGJ5IFByb2Nlc3MuIEZvciBleGFtcGxlLCBpZiB3ZSBhbGlhcyAnbmV4dCcgYXMgJ2F0b21pYyc6XG4gKlxuICogICAgcHJvY2Vzcy5zdGFydCgpXG4gKiAgICAgICAgICAgLmF0b21pYyhzdGVwQSkgICAgICAgLy8gPC0tLSBub3cgaXQncyB3YWl0aW5nIHRoaXNcbiAqICAgICAgICAgICAuYXRvbWljKHN0ZXBCKVxuICpcbiAqICAgLy8gc29tZSB1cmdlbnQgZXZlbnQgb2NjdXJzXG4gKiAgIHByb2Nlc3Muc3RvcCgpXG4gKiAgICAgICAgICAuYXRvbWljKCBkb1RoaXNBc1F1aWNrQXNQb3NzaWJsZSApXG4gKlxuICogSXQgd291bGQgYmUgYmV0dGVyIHRoYW46XG4gKlxuICogICAgcHJvY2Vzcy5zdGFydCgpXG4gKiAgICAgICAgICAgLmF0b21pYygoKSA9PiBzdGVwQS50aGVuKHN0ZXBCKSlcbiAqXG4gKiAgIC8vIHNvbWUgdXJnZW50IGV2ZW50IG9jY3Vyc1xuICogICBwcm9jZXNzLnN0b3AoKVxuICogICAgICAgICAgLmF0b21pYyggZG9UaGlzQXNRdWlja0FzUG9zc2libGUgKVxuICpcbiAqIFNpbmNlIGluIHRoZSBzZWNvbmQgZXhhbXBsZSB0aGUgZmlyc3Qgc3RlcCBvZiB0aGUgJ3N0b3AnIHBoYXNlIG11c3Qgd2FpdFxuICogYm90aCB0aGUgc3RlcEEgJiBzdGVwQiwgd2hpbGUgaW4gdGhlIGZpcnN0IG9uZSBpdCBvbmx5IG5lZWRzIHRvIHdhaXQgc3RlcEEuXG4gKiBIb3dldmVyLCB0aGlzIGRlcGVuZHMgb24gd2hpY2ggYXRvbWljIG9wZXJhdGlvbnMgaXMgbmVlZGVkLlxuICpcbiAqIE5ldmVydGhlbGVzcywgdXNlciBpcyBhYmxlIHRvIG1ha2UgdGhlIHN0ZXBzICdpbnRlcnJ1cHRpYmxlJyB2aWEgc29tZSBzcGVjaWFsXG4gKiBtZXRob2RzIG9mIHRoZSBwcm9jZXNzLiBUaGF0IGlzLCB0byBtb25pdG9yIHRoZSBwaGFzZSBjaGFuZ2VzIHRvIG51bGxpZnkgdGhlXG4gKiBzdGVwOlxuICpcbiAqICAgIHZhciBwcm9jZXNzID0gbmV3IFByb2Nlc3MoKTtcbiAqICAgIHByb2Nlc3Muc3RhcnQoKVxuICogICAgICAubmV4dCgoKSA9PiB7XG4gKiAgICAgICAgdmFyIHBoYXNlU2hpZnRlZCA9IGZhbHNlO1xuICogICAgICAgIHByb2Nlc3MudW50aWwoJ3N0b3AnKVxuICogICAgICAgICAgLm5leHQoKCkgPT4ge3BoYXNlU2hpZnRlZCA9IHRydWU7fSk7XG4gKiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyLCByaikgPT4ge1xuICogICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gKiAgICAgICAgICAgIGlmIChwaGFzZVNoaWZ0ZWQpIHsgY29uc29sZS5sb2coJ2RvIG5vdGhpbmcnKTsgfVxuICogICAgICAgICAgICBlbHNlICAgICAgICAgICAgICB7IGNvbnNvbGUubG9nKCdkbyBzb21ldGhpbmcnKTsgfVxuICogICAgICAgICAgfSwgMTAwMClcbiAqICAgICAgICB9KTtcbiAqICAgICAgfSlcbiAqXG4gKiAgIC8vIHNvbWUgdXJnZW50IGV2ZW50IG9jY3Vyc1xuICogICBwcm9jZXNzLnN0b3AoKVxuICogICAgICAgICAgLm5leHQoIGRvVGhpc0FzUXVpY2tBc1Bvc3NpYmxlIClcbiAqXG4gKiBTbyB0aGF0IHRoZSBmaXJzdCBzdGVwIG9mIHRoZSAnc3RvcCcgcGhhc2Ugd291bGQgZXhlY3V0ZSBpbW1lZGlhdGVseSBhZnRlclxuICogdGhlIHBoYXNlIHNoaWZ0ZWQsIHNpbmNlIHRoZSBsYXN0IHN0ZXAgb2YgdGhlIHByZXZpb3VzIHBoYXNlIGFib3J0ZWQgaXRzZWxmLlxuICogSW4gZnV0dXJlIHRoZSB0cmljayB0byBudWxsaWZ5IHRoZSBsYXN0IHN0ZXAgbWF5IGJlIGluY2x1ZGVkIGluIGFzIGEgbWV0aG9kXG4gKiBvZiBQcm9jZXNzLCBidXQgY3VycmVudGx5IHRoZSBtYW51YWwgZGV0ZWN0aW5nIGlzIHN0aWxsIG5lY2Vzc2FyeS5cbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gUHJvY2VzcygpIHtcbiAgdGhpcy5fcnVudGltZSA9IG5ldyBSdW50aW1lKCk7XG4gIHRoaXMuX2ludGVyZmFjZSA9IG5ldyBJbnRlcmZhY2UodGhpcy5fcnVudGltZSk7XG4gIHJldHVybiB0aGlzLl9pbnRlcmZhY2U7XG59XG5cbi8qKlxuICogQmVjYXVzZSBEUlkuXG4gKi9cblByb2Nlc3MuZGVmZXIgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHJlc29sdmUsIHJlamVjdDtcbiAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IHtcbiAgICByZXNvbHZlID0gcmVzO1xuICAgIHJlamVjdCA9IHJlajtcbiAgfSk7XG4gIHZhciByZXN1bHQgPSB7XG4gICAgJ3Jlc29sdmUnOiByZXNvbHZlLFxuICAgICdyZWplY3QnOiByZWplY3QsXG4gICAgJ3Byb21pc2UnOiBwcm9taXNlXG4gIH07XG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKiBTdGF0aWMgdmVyc2lvbiBmb3IgbWltaWNraW5nIFByb21pc2UuYWxsICovXG5Qcm9jZXNzLndhaXQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHByb2Nlc3MgPSBuZXcgUHJvY2VzcygpO1xuICByZXR1cm4gcHJvY2Vzcy5zdGFydCgpLndhaXQuYXBwbHkocHJvY2VzcywgYXJndW1lbnRzKTtcbn07XG5cbiIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0IGZ1bmN0aW9uIFJ1bnRpbWUoKSB7XG4gIHRoaXMuc3RhdGVzID0ge1xuICAgIHBoYXNlOiBudWxsLFxuICAgIGN1cnJlbnRQcm9taXNlOiBudWxsLFxuICAgIHVudGlsOiB7XG4gICAgICByZXNvbHZlcjogbnVsbCxcbiAgICAgIHBoYXNlOiBudWxsXG4gICAgfSxcbiAgICAvLyBAc2VlOiAjbmV4dFxuICAgIHN0ZXBSZXN1bHRzOiBbXSxcbiAgfTtcbiAgdGhpcy5kZWJ1Z2dpbmcgPSB7XG4gICAgLy8gQHNlZTogI25leHRcbiAgICBjdXJyZW50UGhhc2VTdGVwczogMCxcbiAgICBjb2xvcnM6IHRoaXMuZ2VuZXJhdGVEZWJ1Z2dpbmdDb2xvcigpLFxuICAgIHRydW5jYXRpbmdMaW1pdDogNjRcbiAgfTtcbiAgdGhpcy5jb25maWdzID0ge1xuICAgIGRlYnVnOiBmYWxzZVxuICB9O1xufVxuXG4vKipcbiAqIFdoZW4gdGhlIHN0YWNrIG9mIERTTCBjaGFuZ2VzLCBldmFsdWF0ZSB0aGUgTGFuZ3VhZ2UuTm9kZS5cbiAqIE5vdGU6IHNpbmNlIGluIHRoaXMgRFNMIHdlIG5lZWRuJ3QgJ2V4aXQnIG5vZGUsIHdlIGRvbid0IGhhbmRsZSBpdC5cbiAqIEZvciBzb21lIG90aGVyIERTTCB0aGF0IG1heSByZXR1cm4gc29tZXRoaW5nLCB0aGUgJ2V4aXQnIG5vZGUgbXVzdFxuICoga2VlcCBhIGZpbmFsIHN0YWNrIHdpdGggb25seSByZXN1bHQgbm9kZSBpbnNpZGUgYXMgdGhlciByZXR1cm4gdmFsdWUuXG4gKi9cblJ1bnRpbWUucHJvdG90eXBlLm9uY2hhbmdlID0gZnVuY3Rpb24oaW5zdGFuY2UsIGNoYW5nZSwgc3RhY2spIHtcbiAgLy8gU2luY2Ugd2UgZG9uJ3QgbmVlZCB0byBrZWVwIHRoaW5ncyBpbiBzdGFjayB1bnRpbCB3ZSBoYXZlXG4gIC8vIHJlYWwgYW5hbHl6ZXJzLCB0aGUgJ29uY2hhbmdlJyBoYW5kbGVyIHdvdWxkIHJldHVybiBlbXB0eSBzdGFja1xuICAvLyB0byBsZXQgdGhlIGxhbmd1YWdlIHJ1bnRpbWUgY2xlYXIgdGhlIHN0YWNrIGV2ZXJ5IGluc3RydWN0aW9uLlxuICB0aGlzW2NoYW5nZS50eXBlXS5hcHBseSh0aGlzLCBjaGFuZ2UuYXJncyk7XG4gIHJldHVybiBbXTtcbn07XG5cblxuUnVudGltZS5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5zdGF0ZXMucGhhc2UgPSAnc3RhcnQnO1xuICB0aGlzLnN0YXRlcy5jdXJyZW50UHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSgpO1xufTtcblxuUnVudGltZS5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnNoaWZ0KCdzdGFydCcsICdzdG9wJyk7XG59O1xuXG5SdW50aW1lLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuc2hpZnQoJ3N0b3AnLCAnZGVzdHJveScpO1xufTtcblxuUnVudGltZS5wcm90b3R5cGUuc2hpZnQgPSBmdW5jdGlvbihwcmV2LCBjdXJyZW50KSB7XG4gIC8vIEFscmVhZHkgaW4uXG4gIGlmIChjdXJyZW50ID09PSB0aGlzLnN0YXRlcy5waGFzZSkge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAocHJldiAhPT0gdGhpcy5zdGF0ZXMucGhhc2UpIHtcbiAgICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IoYE11c3QgYmUgJHtwcmV2fSBiZWZvcmUgc2hpZnQgdG8gJHtjdXJyZW50fSxcbiAgICAgICAgICAgICAgICAgICAgIGJ1dCBub3cgaXQncyAke3RoaXMuc3RhdGVzLnBoYXNlfWApO1xuICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgIHRocm93IGVycm9yO1xuICB9XG4gIHRoaXMuc3RhdGVzLnBoYXNlID0gY3VycmVudDtcbiAgaWYgKHRoaXMudW50aWwucGhhc2UgPT09IHRoaXMuc3RhdGVzLnBoYXNlKSB7XG4gICAgdGhpcy51bnRpbC5yZXNvbHZlcigpO1xuICB9XG4gIC8vIENvbmNhdCBuZXcgc3RlcCB0byBzd2l0Y2ggdG8gdGhlICduZXh0IHByb21pc2UnLlxuICB0aGlzLnN0YXRlcy5jdXJyZW50UHJvbWlzZSA9XG4gIHRoaXMuc3RhdGVzLmN1cnJlbnRQcm9taXNlLmNhdGNoKChlcnIpID0+IHtcbiAgICBpZiAoIShlcnIgaW5zdGFuY2VvZiBSdW50aW1lLkludGVycnVwdEVycm9yKSkge1xuICAgICAgLy8gV2UgbmVlZCB0byByZS10aHJvdyBpdCBhZ2FpbiBhbmQgYnlwYXNzIHRoZSB3aG9sZVxuICAgICAgLy8gcGhhc2UsIHVudGlsIHRoZSBuZXh0IHBoYXNlIChmaW5hbCBwaGFzZSkgdG9cbiAgICAgIC8vIGhhbmRsZSBpdC4gU2luY2UgaW4gUHJvbWlzZSwgc3RlcHMgYWZ0ZXIgY2F0Y2ggd291bGRcbiAgICAgIC8vIG5vdCBiZSBhZmZlY3RlZCBieSB0aGUgY2F0Y2hlZCBlcnJvciBhbmQga2VlcCBleGVjdXRpbmcuXG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICAgIC8vIEFuZCBpZiBpdCdzIGFuIGludGVycnVwdCBlcnJvciB3ZSBkbyBub3RoaW5nLCBzbyB0aGF0IGl0IHdvdWxkXG4gICAgLy8gbWFrZSB0aGUgY2hhaW4gb21pdCB0aGlzIGVycm9yIGFuZCBleGVjdXRlIHRoZSBmb2xsb3dpbmcgc3RlcHMuXG4gIH0pO1xuICAvLyBBdCB0aGUgbW9tZW50IG9mIHNoaWZ0aW5nLCB0aGVyZSBhcmUgbm8gc3RlcHMgYmVsb25nIHRvIHRoZSBuZXcgcGhhc2UuXG4gIHRoaXMuZGVidWdnaW5nLmN1cnJlbnRQaGFzZVN0ZXBzID0gMDtcbn07XG5cbi8qKlxuICogUmV0dXJuIGEgUHJvbWlzZSB0aGF0IG9ubHkgYmUgcmVzb2x2ZWQgd2hlbiB3ZSBnZXQgc2hpZmVkIHRvIHRoZVxuICogdGFyZ2V0IHBoYXNlLlxuICovXG5SdW50aW1lLnByb3RvdHlwZS51bnRpbCA9IGZ1bmN0aW9uKHBoYXNlKSB7XG4gIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlcykgPT4ge1xuICAgIHRoaXMuc3RhdGVzLnVudGlsLnJlc29sdmVyID0gcmVzO1xuICB9KTtcbiAgcmV0dXJuIHByb21pc2U7XG59O1xuXG4vKipcbiAqIFRoZSAnc3RlcCcgY2FuIG9ubHkgYmUgYSBmdW5jdGlvbiByZXR1cm4gUHJvbWlzZS9Qcm9jZXNzL3BsYWluIHZhbHVlLlxuICogTm8gbWF0dGVyIGEgUHJvbWlzZSBvciBQcm9jZXNzIGl0IHdvdWxkIHJldHVybixcbiAqIHRoZSBjaGFpbiB3b3VsZCBjb25jYXQgaXQgYXMgdGhlIFByb21pc2UgcnVsZS5cbiAqIElmIGl0J3MgcGxhaW4gdmFsdWUgdGhlbiB0aGlzIHByb2Nlc3Mgd291bGQgaWdub3JlIGl0LCBhc1xuICogd2hhdCBhIFByb21pc2UgZG9lcy5cbiAqXG4gKiBBYm91dCB0aGUgcmVzb2x2aW5nIHZhbHVlczpcbiAqXG4gKiAubmV4dCggZm5SZXNvbHZlQSwgZm5SZXNvbHZlQiApICAtLT4gI3NhdmUgW2EsIGJdIGluIHRoaXMgcHJvY2Vzc1xuICogLm5leHQoIGZuUmVzb2x2ZUMgKSAgICAgICAgICAgICAgLS0+ICNyZWNlaXZlIFthLCBiXSBhcyBmaXJzdCBhcmd1bWVudFxuICogLm5leHQoIGZuUmVzb2x2ZUQgKSAgICAgICAgICAgICAgLS0+ICNyZWNlaXZlIGMgYXMgZmlyc3QgYXJndW1lbnRcbiAqIC5uZXh0KCBmblJlc29sdmVFLCBmblJlc29sdmVGKSAgIC0tPiAjZWFjaCBvZiB0aGVtIHJlY2VpdmUgZCBhcyBhcmd1bWVudFxuICovXG5SdW50aW1lLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24oLi4udGFza3MpIHtcbiAgaWYgKCF0aGlzLnN0YXRlcy5jdXJyZW50UHJvbWlzZSkge1xuICAgIHRocm93IG5ldyBFcnJvcignUHJvY2VzcyBzaG91bGQgaW5pdGlhbGl6ZSB3aXRoIHRoZSBgc3RhcnRgIG1ldGhvZCcpO1xuICB9XG4gIC8vIEF0IGRlZmluaXRpb24gc3RhZ2UsIHNldCBpdCdzIHBoYXNlLlxuICAvLyBBbmQgY2hlY2sgaWYgaXQncyBhIGZ1bmN0aW9uLlxuICB0YXNrcy5mb3JFYWNoKCh0YXNrKSA9PiB7XG4gICAgaWYgKCdmdW5jdGlvbicgIT09IHR5cGVvZiB0YXNrKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZSB0YXNrIGlzIG5vdCBhIGZ1bmN0aW9uOiAke3Rhc2t9YCk7XG4gICAgfVxuICAgIHRhc2sucGhhc2UgPSB0aGlzLnN0YXRlcy5waGFzZTtcbiAgICBpZiAodGhpcy5jb25maWdzLmRlYnVnKSB7XG4gICAgICAvLyBNdXN0IGFwcGVuZCBzdGFjayBpbmZvcm1hdGlvbiBoZXJlIHRvIGxldCBkZWJ1Z2dlciBvdXRwdXRcbiAgICAgIC8vIGl0J3MgZGVmaW5lZCBpbiB3aGVyZS5cbiAgICAgIHRhc2sudHJhY2luZyA9IHtcbiAgICAgICAgc3RhY2s6IChuZXcgRXJyb3IoKSkuc3RhY2tcbiAgICAgIH07XG4gICAgfVxuICB9KTtcblxuICAvLyBGaXJzdCwgY29uY2F0IGEgJ3RoZW4nIHRvIGNoZWNrIGludGVycnVwdC5cbiAgdGhpcy5zdGF0ZXMuY3VycmVudFByb21pc2UgPVxuICAgIHRoaXMuc3RhdGVzLmN1cnJlbnRQcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgLy8gV291bGQgY2hlY2s6IGlmIHRoZSBwaGFzZSBpdCBiZWxvbmdzIHRvIGlzIG5vdCB3aGF0IHdlJ3JlIGluLFxuICAgICAgLy8gdGhlIHByb2Nlc3MgbmVlZCB0byBiZSBpbnRlcnJwdXRlZC5cbiAgICAgIGZvciAodmFyIHRhc2sgb2YgdGFza3MpIHtcbiAgICAgICAgaWYgKHRoaXMuY2hlY2tJbnRlcnJ1cHQodGFzaykpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgUnVudGltZS5JbnRlcnJ1cHRFcnJvcigpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgLy8gUmVhZCBpdCBhczpcbiAgLy8gMS4gZXhlY3V0ZSBhbGwgdGFza3MgdG8gZ2VuZXJhdGUgcmVzb2x2YWJsZS1wcm9taXNlc1xuICAvLyAyLiBQcm9taXNlLmFsbCguLi4pIHRvIHdhaXQgdGhlc2UgcmVzb2x2YWJsZS1wcm9taXNlc1xuICAvLyAzLiBhcHBlbmQgYSBnZW5lcmFsIGVycm9yIGhhbmRsZXIgYWZ0ZXIgdGhlIFByb21pc2UuYWxsXG4gIC8vICAgIHNvIHRoYXQgaWYgYW55IGVycm9yIG9jY3VycyBpdCB3b3VsZCBwcmludCB0aGVtIG91dFxuICAvLyBTbywgaW5jbHVkaW5nIHRoZSBjb2RlIGFib3ZlLCB3ZSB3b3VsZCBoYXZlOlxuICAvL1xuICAvLyBjdXJyZW50UHJvbWlzZSB7XG4gIC8vICBbY2hlY2tJbnRlcnJ1cHQodGFza3MpXVxuICAvLyAgW1Byb21pc2UuYWxsKFt0YXNrQTEsIHRhc2tBMi4uLl0pXVxuICAvLyAgW2Vycm9yIGhhbmRsZXJdICt9XG4gIC8vXG4gIC8vIFRoZSAnY2hlY2tJbnRlcnJ1cHQnIGFuZCAnZXJyb3IgaGFuZGxlcicgd3JhcCB0aGUgYWN0dWFsIHN0ZXBzXG4gIC8vIHRvIGRvIHRoZSBuZWNlc3NhcnkgY2hlY2tzLlxuICB0aGlzLnN0YXRlcy5jdXJyZW50UHJvbWlzZSA9XG4gICAgdGhpcy5zdGF0ZXMuY3VycmVudFByb21pc2UudGhlbigoKSA9PiB0aGlzLmdlbmVyYXRlU3RlcCh0YXNrcykpO1xuICB0aGlzLnN0YXRlcy5jdXJyZW50UHJvbWlzZSA9XG4gICAgdGhpcy5zdGF0ZXMuY3VycmVudFByb21pc2UuY2F0Y2godGhpcy5nZW5lcmF0ZUVycm9yTG9nZ2VyKHtcbiAgICAgICdudGgtc3RlcCc6IHRoaXMuZGVidWdnaW5nLmN1cnJlbnRQaGFzZVN0ZXBzXG4gICAgfSkpO1xuXG4gIC8vIEEgd2F5IHRvIGtub3cgaWYgdGhlc2UgdGFza3MgaXMgdGhlIGZpcnN0IHN0ZXBzIGluIHRoZSBjdXJyZW50IHBoYXNlLFxuICAvLyBhbmQgaXQncyBhbHNvIGNvbnZlbmllbnQgZm9yIGRlYnVnZ2luZy5cbiAgdGhpcy5kZWJ1Z2dpbmcuY3VycmVudFBoYXNlU3RlcHMgKz0gMTtcblxufTtcblxuUnVudGltZS5wcm90b3R5cGUucmVzY3VlID0gZnVuY3Rpb24oaGFuZGxlcikge1xuICB0aGlzLnN0YXRlcy5jdXJyZW50UHJvbWlzZSA9XG4gICAgdGhpcy5zdGF0ZXMuY3VycmVudFByb21pc2UuY2F0Y2goKGVycikgPT4ge1xuICAgIGlmIChlcnIgaW5zdGFuY2VvZiBSdW50aW1lLkludGVycnVwdEVycm9yKSB7XG4gICAgICAvLyBPbmx5IGJ1aWx0LWluIHBoYXNlIHRyYW5zZmVycmluZyBjYXRjaCBjYW4gaGFuZGxlIGludGVycnVwdHMuXG4gICAgICAvLyBSZS10aHJvdyBpdCB1bnRpbCB3ZSByZWFjaCB0aGUgZmluYWwgY2F0Y2ggd2Ugc2V0LlxuICAgICAgdGhyb3cgZXJyO1xuICAgIH0gZWxzZSB7XG4gICAgICBoYW5kbGVyKGVycik7XG4gICAgfVxuICB9KTtcbn07XG5cbi8qKlxuICogQW4gaW50ZXJmYWNlIHRvIGV4cGxpY2l0bHkgcHV0IG11bHRpcGxlIHRhc2tzIGV4ZWN1dGUgYXQgb25lIHRpbWUuXG4gKiovXG5SdW50aW1lLnByb3RvdHlwZS53YWl0ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMubmV4dC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcblxuLyoqXG4gKiBFeGVjdXRlIHRhc2sgYW5kIGdldCBQcm9taXNlcyBvciBwbGFpbiB2YWx1ZXMgdGhlbSByZXR1cm4sXG4gKiBhbmQgdGhlbiByZXR1cm4gdGhlIHdyYXBwZWQgUHJvbWlzZSBhcyB0aGUgbmV4dCBzdGVwIG9mIHRoaXNcbiAqIHByb2Nlc3MuIFRoZSBuYW1lICdzdGVwJyBpbmRpY2F0ZXMgdGhlIGdlbmVyYXRlZCBQcm9taXNlLFxuICogd2hpY2ggaXMgb25lIHN0ZXAgb2YgdGhlIG1haW4gUHJvbWlzZSBvZiB0aGUgY3VycmVudCBwaGFzZS5cbiAqL1xuUnVudGltZS5wcm90b3R5cGUuZ2VuZXJhdGVTdGVwID0gZnVuY3Rpb24odGFza3MpIHtcbiAgLy8gJ3Rhc2tSZXN1bHRzJyBtZWFucyB0aGUgcmVzdWx0cyBvZiB0aGUgdGFza3MuXG4gIHZhciB0YXNrUmVzdWx0cyA9IFtdO1xuICBpZiAodHJ1ZSA9PT0gdGhpcy5jb25maWdzLmRlYnVnKSB7XG4gICAgdGhpcy50cmFjZSh0YXNrcyk7XG4gIH1cblxuICAvLyBTbyB3ZSB1bndyYXAgdGhlIHRhc2sgZmlyc3QsIGFuZCB0aGVuIHB1dCBpdCBpbiB0aGUgYXJyYXkuXG4gIC8vIFNpbmNlIHdlIG5lZWQgdG8gZ2l2ZSB0aGUgJ2N1cnJlbnRQcm9taXNlJyBhIGZ1bmN0aW9uIGFzIHdoYXQgdGhlXG4gIC8vIHRhc2tzIGdlbmVyYXRlIGhlcmUuXG4gIHZhciBjaGFpbnMgPSB0YXNrcy5tYXAoKHRhc2spID0+IHtcbiAgICAvLyBSZXNldCB0aGUgcmVnaXN0ZXJlZCByZXN1bHRzLlxuICAgIC8vICdwcmV2aW91c1Jlc3VsdHMnIG1lYW5zIHRoZSByZXN1bHRzIGxlZnQgYnkgdGhlIHByZXZpb3VzIHN0ZXAuXG4gICAgdmFyIHByZXZpb3VzUmVzdWx0cyA9IHRoaXMuc3RhdGVzLnN0ZXBSZXN1bHRzO1xuICAgIHZhciBjaGFpbjtcbiAgICAvLyBJZiBpdCBoYXMgbXVsdGlwbGUgcmVzdWx0cywgbWVhbnMgaXQncyBhIHRhc2sgZ3JvdXBcbiAgICAvLyBnZW5lcmF0ZWQgcmVzdWx0cy5cbiAgICBpZiAocHJldmlvdXNSZXN1bHRzLmxlbmd0aCA+IDEpIHtcbiAgICAgIGNoYWluID0gdGFzayhwcmV2aW91c1Jlc3VsdHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjaGFpbiA9IHRhc2socHJldmlvdXNSZXN1bHRzWzBdKTtcbiAgICB9XG4gICAgLy8gT3JkaW5hcnkgZnVuY3Rpb24gcmV0dXJucyAndW5kZWZpbmUnIG9yIG90aGVyIHRoaW5ncy5cbiAgICBpZiAoIWNoYWluKSB7XG4gICAgICAvLyBJdCdzIGEgcGxhaW4gdmFsdWUuXG4gICAgICAvLyBTdG9yZSBpdCBhcyBvbmUgb2YgcmVzdWx0cy5cbiAgICAgIHRhc2tSZXN1bHRzLnB1c2goY2hhaW4pO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShjaGFpbik7XG4gICAgfVxuXG4gICAgLy8gSXQncyBhIFByb2Nlc3MuXG4gICAgaWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgY2hhaW4uX3J1bnRpbWUgJiZcbiAgICAgICAgY2hhaW4uX3J1bnRpbWUgaW5zdGFuY2VvZiBSdW50aW1lKSB7XG4gICAgICAvLyBQcmVtaXNlOiBpdCdzIGEgc3RhcnRlZCBwcm9jZXNzLlxuICAgICAgcmV0dXJuIGNoYWluLl9ydW50aW1lLnN0YXRlcy5jdXJyZW50UHJvbWlzZS50aGVuKCgpID0+IHtcbiAgICAgICAgdmFyIGd1ZXN0UmVzdWx0cyA9IGNoYWluLl9ydW50aW1lLnN0YXRlcy5zdGVwUmVzdWx0cztcbiAgICAgICAgLy8gU2luY2Ugd2UgaW1wbGljaXRseSB1c2UgJ1Byb21pc2UuYWxsJyB0byBydW5cbiAgICAgICAgLy8gbXVsdGlwbGUgdGFza3MgaW4gb25lIHN0ZXAsIHdlIG5lZWQgdG8gZGV0ZXJtaW5hdGUgaWZcbiAgICAgICAgLy8gdGhlcmUgaXMgb25seSBvbmUgdGFzayBpbiB0aGUgdGFzaywgb3IgaXQgYWN0dWFsbHkgaGFzIG11bHRpcGxlXG4gICAgICAgIC8vIHJldHVybiB2YWx1ZXMgZnJvbSBtdWx0aXBsZSB0YXNrcy5cbiAgICAgICAgaWYgKGd1ZXN0UmVzdWx0cy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgLy8gV2UgbmVlZCB0byB0cmFuc2ZlciB0aGUgcmVzdWx0cyBmcm9tIHRoZSBndWVzdCBQcm9jZXNzIHRvIHRoZVxuICAgICAgICAgIC8vIGhvc3QgUHJvY2Vzcy5cbiAgICAgICAgICB0YXNrUmVzdWx0cyA9IHRhc2tSZXN1bHRzLnB1c2goZ3Vlc3RSZXN1bHRzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0YXNrUmVzdWx0cy5wdXNoKGNoYWluLl9ydW50aW1lLnN0YXRlcy5zdGVwUmVzdWx0c1swXSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoY2hhaW4udGhlbikge1xuICAgICAgLy8gT3JkaW5hcnkgcHJvbWlzZSBjYW4gYmUgY29uY2F0ZWQgaW1tZWRpYXRlbHkuXG4gICAgICByZXR1cm4gY2hhaW4udGhlbigocmVzb2x2ZWRWYWx1ZSkgPT4ge1xuICAgICAgICB0YXNrUmVzdWx0cy5wdXNoKHJlc29sdmVkVmFsdWUpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEl0J3MgYSBwbGFpbiB2YWx1ZS5cbiAgICAgIC8vIFN0b3JlIGl0IGFzIG9uZSBvZiByZXN1bHRzLlxuICAgICAgdGFza1Jlc3VsdHMucHVzaChjaGFpbik7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGNoYWluKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gUHJvbWlzZS5hbGwoY2hhaW5zKS50aGVuKCgpID0+IHtcbiAgICAvLyBCZWNhdXNlIGluIHRoZSBwcmV2aW91cyAnYWxsJyB3ZSBlbnN1cmUgYWxsIHRhc2tzIGFyZSBleGVjdXRlZCxcbiAgICAvLyBhbmQgdGhlIHJlc3VsdHMgb2YgdGhlc2UgdGFza3MgYXJlIGNvbGxlY3RlZCwgc28gd2UgbmVlZFxuICAgIC8vIHRvIHJlZ2lzdGVyIHRoZW0gYXMgdGhlIGxhc3QgcmVzdWx0cyBvZiB0aGUgbGFzdCBzdGVwLlxuICAgIHRoaXMuc3RhdGVzLnN0ZXBSZXN1bHRzID0gdGFza1Jlc3VsdHM7XG4gIH0pO1xufTtcblxuLyoqIFdlIG5lZWQgdGhpcyB0byBwcmV2ZW50IHRoZSBzdGVwKCkgdGhyb3cgZXJyb3JzLlxuKiBJbiB0aGlzIGNhdGNoLCB3ZSBkaXN0aW5ndWlzaCB0aGUgaW50ZXJydXB0IGFuZCBvdGhlciBlcnJvcnMsXG4qIGFuZCB0aGVuIGJ5cGFzcyB0aGUgZm9ybWVyIGFuZCBwcmludCB0aGUgbGF0ZXIgb3V0LlxuKlxuKiBUaGUgZmluYWwgZmF0ZSBvZiB0aGUgcmVhbCBlcnJvcnMgaXMgaXQgd291bGQgYmUgcmUtdGhyb3cgYWdhaW5cbiogYWZ0ZXIgd2UgcHJpbnQgdGhlIGluc3RhbmNlIG91dC4gV2UgbmVlZCB0byBkbyB0aGF0IHNpbmNlIGFmdGVyIGFuXG4qIGVycm9yIHRoZSBwcm9taXNlIHNob3VsZG4ndCBrZWVwIGV4ZWN1dGluZy4gSWYgd2UgZG9uJ3QgdGhyb3cgaXRcbiogYWdhaW4sIHNpbmNlIHRoZSBlcnJvciBoYXMgYmVlbiBjYXRjaGVkLCB0aGUgcmVzdCBzdGVwcyBpbiB0aGVcbiogcHJvbWlzZSB3b3VsZCBzdGlsbCBiZSBleGVjdXRlZCwgYW5kIHRoZSB1c2VyLXNldCByZXNjdWVzIHdvdWxkXG4qIG5vdCBjYXRjaCB0aGlzIGVycm9yLlxuKlxuKiBBcyBhIGNvbmNsdXNpb24sIG5vIG1hdHRlciB3aGV0aGVyIHRoZSBlcnJvciBpcyBhbiBpbnRlcnJ1cHQsXG4qIHdlIGFsbCBuZWVkIHRvIHRocm93IGl0IGFnYWluLiBUaGUgb25seSBkaWZmZXJlbmNlIGlzIGlmIGl0J3NcbiogYW5kIGludGVycnVwdCB3ZSBkb24ndCBwcmludCBpdCBvdXQuXG4qL1xuUnVudGltZS5wcm90b3R5cGUuZ2VuZXJhdGVFcnJvckxvZ2dlciA9IGZ1bmN0aW9uKGRlYnVnaW5mbykge1xuICByZXR1cm4gKGVycikgPT4ge1xuICAgIGlmICghKGVyciBpbnN0YW5jZW9mIFJ1bnRpbWUuSW50ZXJydXB0RXJyb3IpKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGBFUlJPUiBkdXJpbmcgIyR7ZGVidWdpbmZvWydudGgtc3RlcCddfVxuICAgICAgICAgIHN0ZXAgZXhlY3V0ZXM6ICR7ZXJyLm1lc3NhZ2V9YCwgZXJyKTtcbiAgICB9XG4gICAgdGhyb3cgZXJyO1xuICB9O1xufTtcblxuUnVudGltZS5wcm90b3R5cGUuY2hlY2tJbnRlcnJ1cHQgPSBmdW5jdGlvbihzdGVwKSB7XG4gIGlmIChzdGVwLnBoYXNlICE9PSB0aGlzLnN0YXRlcy5waGFzZSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cblJ1bnRpbWUucHJvdG90eXBlLmdlbmVyYXRlRGVidWdnaW5nQ29sb3IgPSBmdW5jdGlvbigpIHtcbiAgY29uc3QgY29sb3JzZXRzID0gW1xuICAgIHsgYmFja2dyb3VuZDogJ3JlZCcsIGZvcmVncm91bmQ6ICd3aGl0ZScgfSxcbiAgICB7IGJhY2tncm91bmQ6ICdncmVlbicsIGZvcmVncm91bmQ6ICd3aGl0ZScgfSxcbiAgICB7IGJhY2tncm91bmQ6ICdibHVlJywgZm9yZWdyb3VuZDogJ3doaXRlJyB9LFxuICAgIHsgYmFja2dyb3VuZDogJ3NhZGRsZUJyb3duJywgZm9yZWdyb3VuZDogJ3doaXRlJyB9LFxuICAgIHsgYmFja2dyb3VuZDogJ2N5YW4nLCBmb3JlZ3JvdW5kOiAnZGFya1NsYXRlR3JheScgfSxcbiAgICB7IGJhY2tncm91bmQ6ICdnb2xkJywgZm9yZWdyb3VuZDogJ2RhcmtTbGF0ZUdyYXknIH0sXG4gICAgeyBiYWNrZ3JvdW5kOiAncGFsZUdyZWVuJywgZm9yZWdyb3VuZDogJ2RhcmtTbGF0ZUdyYXknIH0sXG4gICAgeyBiYWNrZ3JvdW5kOiAncGx1bScsIGZvcmVncm91bmQ6ICdkYXJrU2xhdGVHcmF5JyB9XG4gIF07XG4gIHZhciBjb2xvcnNldCA9IGNvbG9yc2V0c1sgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY29sb3JzZXRzLmxlbmd0aCkgXTtcbiAgcmV0dXJuIGNvbG9yc2V0O1xufTtcblxuUnVudGltZS5wcm90b3R5cGUudHJhY2UgPSBmdW5jdGlvbih0YXNrcykge1xuICBpZiAoZmFsc2UgPT09IHRoaXMuY29uZmlncy5kZWJ1Zykge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgbG9nID0gdGFza3MucmVkdWNlKChtZXJnZWRNZXNzYWdlLCB0YXNrKSA9PiB7XG4gICAgdmFyIHNvdXJjZSA9IFN0cmluZy5zdWJzdHJpbmcodGFzay50b1NvdXJjZSgpLCAwLFxuICAgICAgdGhpcy5kZWJ1Z2dpbmcudHJ1bmNhdGluZ0xpbWl0KTtcbiAgICB2YXIgbWVzc2FnZSA9IGAgJHsgc291cmNlIH0gYDtcbiAgICByZXR1cm4gbWVyZ2VkTWVzc2FnZSArIG1lc3NhZ2U7XG4gIH0sIGAlYyAkeyB0YXNrc1swXS5waGFzZSB9IyR7IHRoaXMuZGVidWdnaW5nLmN1cnJlbnRQaGFzZVN0ZXBzIH0gfCBgKTtcbiAgLy8gRG9uJ3QgcHJpbnQgdGhvc2UgaW5oZXJpdGVkIGZ1bmN0aW9ucy5cbiAgdmFyIHN0YWNrRmlsdGVyID0gbmV3IFJlZ0V4cCgnXihHbGVpcG5pckJhc2ljfFByb2Nlc3N8U3RyZWFtKScpO1xuICB2YXIgc3RhY2sgPSB0YXNrc1swXS50cmFjaW5nLnN0YWNrLnNwbGl0KCdcXG4nKS5maWx0ZXIoKGxpbmUpID0+IHtcbiAgICByZXR1cm4gJycgIT09IGxpbmU7XG4gIH0pLmZpbHRlcigobGluZSkgPT4ge1xuICAgIHJldHVybiAhbGluZS5tYXRjaChzdGFja0ZpbHRlcik7XG4gIH0pLmpvaW4oJ1xcbicpO1xuXG4gIGxvZyA9IGxvZyArICcgfCBcXG5cXHInICsgc3RhY2s7XG4gIGNvbnNvbGUubG9nKGxvZywgJ2JhY2tncm91bmQtY29sb3I6ICcrIHRoaXMuZGVidWdnaW5nLmNvbG9ycy5iYWNrZ3JvdW5kICtcbiAgICAnOycgKyAnY29sb3I6ICcgKyB0aGlzLmRlYnVnZ2luZy5jb2xvcnMuZm9yZWdyb3VuZCk7XG59O1xuXG5SdW50aW1lLkludGVycnVwdEVycm9yID0gZnVuY3Rpb24obWVzc2FnZSkge1xuICB0aGlzLm5hbWUgPSAnSW50ZXJydXB0RXJyb3InO1xuICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlIHx8ICcnO1xufTtcblxuUnVudGltZS5JbnRlcnJ1cHRFcnJvci5wcm90b3R5cGUgPSBuZXcgRXJyb3IoKTtcblxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9