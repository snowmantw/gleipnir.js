/**
 * gleipnir.js - Gleipnir.js - a library for UI programming
 * @version v0.0.1
 * @link 
 * @license Apache 2.0
 */
var Gleipnir = Gleipnir || {}; Gleipnir["Builder"] =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(6);
	module.exports = __webpack_require__(13);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports.State = State;
	/**
	 * To log state transferring in a proper way, rather dump raw console
	 * messages and then overwhelm it.
	 */
	
	function State() {}
	
	State.prototype.start = function lss_start(configs) {
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
	
	State.prototype.debug = function lss_debug() {
	  if (this.configs.debug) {
	    this.log.apply(this, ['[I] '].concat(Array.from(arguments)));
	  }
	  return this;
	};
	
	State.prototype.verbose = function lss_verbose() {
	  if (this.configs.verbose) {
	    this.log.apply(this, ['[V] '].concat(Array.from(arguments)));
	  }
	  return this;
	};
	
	State.prototype.warning = function lss_warning() {
	  if (this.configs.warning || this.configs.verbose) {
	    this.log.apply(this, ['[!] '].concat(Array.from(arguments)));
	  }
	  return this;
	};
	
	State.prototype.error = function lss_error() {
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
	State.prototype.stack = function lss_stack() {
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
	State.prototype.transfer = function lss_transfer(from, to) {
	  var conditions = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
	
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
	State.prototype.graph = function lss_graph() {
	  return this.stateStack.reduce(function (prev, info) {
	    return prev.concat([info.from, info.conditions, info.to]);
	  }, []);
	};
	
	State.prototype.log = function lss_log() {
	  var reporter = this.configs.reporter;
	  reporter.apply(this, arguments);
	  return this;
	};
	
	State.prototype.stop = function lss_stop() {
	  this.stateStack.length = 0;
	  return this;
	};
	
	State.prototype.consoleReporter = function lss_consoleReporter() {
	  console.log.apply(console, arguments);
	  return this;
	};

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

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
	    var node, resultstack;
	
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }
	
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
	  var context = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	
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

/***/ },
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports.Component = Component;
	
	var _srcRuneLanguageJs = __webpack_require__(2);
	
	var _srcStateBasicJs = __webpack_require__(7);
	
	var _srcComponentBasicJs = __webpack_require__(12);
	
	function Component() {
	  this.context = {
	    _info: {}
	  };
	  this.stack = [];
	  this._evaluator = new _srcRuneLanguageJs.Language.Evaluate().analyzer(this._analyzer.bind(this)).interpreter(this._interpret.bind(this));
	  this._component = null;
	}
	
	// The language interface.
	Component.prototype.start = _srcRuneLanguageJs.Language.define('start', 'begin');
	Component.prototype.type = _srcRuneLanguageJs.Language.define('type', 'push');
	Component.prototype.configs = _srcRuneLanguageJs.Language.define('configs', 'push');
	// Set the default resources.
	Component.prototype.resources = _srcRuneLanguageJs.Language.define('resources', 'push');
	Component.prototype.logger = _srcRuneLanguageJs.Language.define('logger', 'push');
	Component.prototype.methods = _srcRuneLanguageJs.Language.define('methods', 'push');
	// The setup state. Should give the constructor.
	Component.prototype.setup = _srcRuneLanguageJs.Language.define('setup', 'push');
	// To build a constructor + prototype
	Component.prototype.build = _srcRuneLanguageJs.Language.define('build', 'exit');
	// Besides the constructor and prototype, create an instance and return it.
	Component.prototype.instance = _srcRuneLanguageJs.Language.define('instance', 'exit');
	
	// The private methods.
	Component.prototype.onchange = function (context, node, stack) {
	  // When it's changed, evaluate it with analyzers & interpreter.
	  return this._evaluator(context, node, stack);
	};
	
	Component.prototype._analyzer = function (context, node, stack) {
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
	      if (!context._info.setup || context._info.setup instanceof _srcStateBasicJs.Basic) {
	        throw new Error('A state should at least with setup state');
	      }
	      break;
	  }
	};
	
	/**
	 * As an ordinary interpreting function: do some effects according to the node,
	 * and return the final stack after ending.
	 */
	Component.prototype._interpret = function (context, node, stack) {
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
	    _srcComponentBasicJs.Basic.apply(this, arguments);
	    this.resources = _info.resources || this.resources;
	    this.configs = _info.configs || this.configs;
	    this.logger = _info.logger || this.logger;
	    this.type = _info.type;
	    this._setupState = new _info.setup(this);
	  };
	  context._component.prototype = Object.create(_srcComponentBasicJs.Basic.prototype);
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

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports.Basic = Basic;
	
	var _srcStreamStreamJs = __webpack_require__(8);
	
	function Basic(component) {
	  // A lock to prevent transferring racing. This is because most of source
	  // events are mapped into interrupts to trigger transferrings. To prevent
	  // client need to implement this again and again we put the lock here.
	  this._transferred = false;
	  // Replace with the name of concrete state.
	  this.configs = {
	    type: 'Basic',
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
	Basic.prototype.phase = function () {
	  return this.stream.phase();
	};
	
	/**
	 * Derived states should extend these basic methods.
	 */
	Basic.prototype.start = function () {
	  this.stream = new _srcStreamStreamJs.Stream(this.configs.stream);
	  return this.stream.start(this.handleSourceEvent.bind(this)).next(this.stream.ready.bind(this.stream));
	};
	
	Basic.prototype.stop = function () {
	  return this.stream.stop();
	};
	
	Basic.prototype.destroy = function () {
	  return this.stream.destroy();
	};
	
	Basic.prototype.live = function () {
	  return this.stream.until('stop');
	};
	
	Basic.prototype.exist = function () {
	  return this.stream.until('destroy');
	};
	
	/**
	 * Must transfer to next state via component's method.
	 * Or the component cannot track the last active state.
	 */
	Basic.prototype.transferTo = function () {
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
	Basic.prototype.handleSourceEvent = function () {};

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports.Stream = Stream;
	
	var _srcProcessProcessJs = __webpack_require__(9);
	
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
	  var configs = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	
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
	  this.process = new _srcProcessProcessJs.Process();
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

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports.Process = Process;
	
	var _srcProcessInterfaceJs = __webpack_require__(10);
	
	var _srcProcessRuntimeJs = __webpack_require__(11);
	
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
	  this._runtime = new _srcProcessRuntimeJs.Runtime();
	  this._interface = new _srcProcessInterfaceJs.Interface(this._runtime);
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

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports.Interface = Interface;
	
	var _srcRuneLanguageJs = __webpack_require__(2);
	
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

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

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
	    stepResults: []
	  };
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

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports.Basic = Basic;
	
	var _srcLoggerStateJs = __webpack_require__(1);
	
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
	
	function Basic(view) {
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
	  this.logger = new _srcLoggerStateJs.State();
	  this.view = view;
	  // Should at least appoint these.
	  this.type = null;
	  this._setupState = null;
	}
	
	/**
	 * State' phase is the component's phase.
	 */
	Basic.prototype.phase = function () {
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
	Basic.prototype.transferTo = function (clazz) {
	  var reason = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	
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
	Basic.prototype.start = function (resources) {
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
	
	Basic.prototype.stop = function () {
	  return this._activeState.stop().next(this.waitComponents.bind(this, 'stop'));
	};
	
	Basic.prototype.destroy = function () {
	  var _this = this;
	
	  return this._activeState.destroy().next(this.waitComponents.bind(this, 'destroy')).next(function () {
	    _this.logger.stop();
	  }); // Logger need add phase support.
	};
	
	Basic.prototype.live = function () {
	  return this._activeState.until('stop');
	};
	
	Basic.prototype.exist = function () {
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
	Basic.prototype.waitComponents = function (method, args) {
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
	Basic.prototype.render = function (props, target) {
	  return this.view.render(props, target);
	};

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports.State = State;
	
	var _srcRuneLanguageJs = __webpack_require__(2);
	
	var _srcStateBasicJs = __webpack_require__(7);
	
	/**
	 * Use this builder to build states in a component.
	 */
	
	function State() {
	  this.context = {
	    _info: {}
	  };
	  this.stack = [];
	  // With this helper we get the evaluator.
	  this._evaluator = new _srcRuneLanguageJs.Language.Evaluate().analyzer(this._analyzer.bind(this)).interpreter(this._interpret.bind(this));
	  this._state = null;
	}
	
	// The language interface.
	State.prototype.start = _srcRuneLanguageJs.Language.define('start', 'begin');
	State.prototype.component = _srcRuneLanguageJs.Language.define('component', 'push');
	State.prototype.events = _srcRuneLanguageJs.Language.define('events', 'push');
	State.prototype.interrupts = _srcRuneLanguageJs.Language.define('interrupts', 'push');
	State.prototype.sources = _srcRuneLanguageJs.Language.define('sources', 'push');
	State.prototype.type = _srcRuneLanguageJs.Language.define('type', 'push');
	State.prototype.handler = _srcRuneLanguageJs.Language.define('handler', 'push');
	State.prototype.methods = _srcRuneLanguageJs.Language.define('methods', 'push');
	// To build a constructor + prototype
	State.prototype.build = _srcRuneLanguageJs.Language.define('build', 'exit');
	// Besides the constructor and prototype, create an instance and return it.
	State.prototype.instance = _srcRuneLanguageJs.Language.define('instance', 'exit');
	
	// The private methods.
	State.prototype.onchange = function (context, node, stack) {
	  // When it's changed, evaluate it with analyzers & interpreter.
	  return this._evaluator(context, node, stack);
	};
	
	State.prototype._analyzer = function (context, node, stack) {
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
	State.prototype._interpret = function (context, node, stack) {
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
	    _srcStateBasicJs.Basic.apply(this, arguments);
	    this.configs.type = _info.type;
	    this.configs.stream.events = _info.events || [];
	    this.configs.stream.interrupts = _info.interrupts || [];
	    this.configs.stream.sources = _info.sources || [];
	    this.handleSourceEvent = _info.handler.bind(this);
	  };
	  context._state.prototype = Object.create(_srcStateBasicJs.Basic.prototype);
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

/***/ }
/******/ ]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNjgzYzcyYWJiOGUxNDNhMTM4MGMiLCJ3ZWJwYWNrOi8vLy4vYnVpbGRfc3RhZ2Uvc3JjL2xvZ2dlci9zdGF0ZS5qcz9jMmEzIiwid2VicGFjazovLy8uL2J1aWxkX3N0YWdlL3NyYy9ydW5lL2xhbmd1YWdlLmpzPzFmMGMiLCJ3ZWJwYWNrOi8vLy4vYnVpbGRfc3RhZ2Uvc3JjL2J1aWxkZXIvY29tcG9uZW50LmpzIiwid2VicGFjazovLy8uL2J1aWxkX3N0YWdlL3NyYy9zdGF0ZS9iYXNpYy5qcyIsIndlYnBhY2s6Ly8vLi9idWlsZF9zdGFnZS9zcmMvc3RyZWFtL3N0cmVhbS5qcyIsIndlYnBhY2s6Ly8vLi9idWlsZF9zdGFnZS9zcmMvcHJvY2Vzcy9wcm9jZXNzLmpzIiwid2VicGFjazovLy8uL2J1aWxkX3N0YWdlL3NyYy9wcm9jZXNzL2ludGVyZmFjZS5qcyIsIndlYnBhY2s6Ly8vLi9idWlsZF9zdGFnZS9zcmMvcHJvY2Vzcy9ydW50aW1lLmpzIiwid2VicGFjazovLy8uL2J1aWxkX3N0YWdlL3NyYy9jb21wb25lbnQvYmFzaWMuanMiLCJ3ZWJwYWNrOi8vLy4vYnVpbGRfc3RhZ2Uvc3JjL2J1aWxkZXIvc3RhdGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx1QkFBZTtBQUNmO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7QUN0Q0EsYUFBWSxDQUFDOzs7OztTQU1HLEtBQUssR0FBTCxLQUFLOzs7Ozs7QUFBZCxVQUFTLEtBQUssR0FBRyxFQUFFOztBQUUxQixNQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssR0FDckIsU0FBUyxTQUFTLENBQUMsT0FB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QixTQUFJLFFBQVEsS0FBSyxPQUFPLEtBQUssQ0FBQyxTQUFTLElBQ25DLFVBQVUsS0FBSyxPQUFPLEtBQUssQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFO0FBQ3BELGFBQU0sSUFBSSxLQUFLLDRDQUE0QyxDQUFDO01BQzdEO0FBQ0QsVUFBSyxHQUFHLENBQUUsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBRSxDQUFDO0FBQ2hELFlBQU8sS0FBSyxDQUFDO0lBQ2Q7RUFDRixDIiwiZmlsZSI6IkdsZWlwbmlyLkJ1aWxkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0ZXhwb3J0czoge30sXG4gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuIFx0XHRcdGxvYWRlZDogZmFsc2VcbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIHdlYnBhY2svYm9vdHN0cmFwIDY4M2M3MmFiYjhlMTQzYTEzODBjXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFRvIGxvZyBzdGF0ZSB0cmFuc2ZlcnJpbmcgaW4gYSBwcm9wZXIgd2F5LCByYXRoZXIgZHVtcCByYXcgY29uc29sZVxuICogbWVzc2FnZXMgYW5kIHRoZW4gb3ZlcndoZWxtIGl0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gU3RhdGUoKSB7fVxuXG5TdGF0ZS5wcm90b3R5cGUuc3RhcnQgPVxuZnVuY3Rpb24gbHNzX3N0YXJ0KGNvbmZpZ3MpIHtcbiAgdGhpcy5zdGF0ZVN0YWNrID0gW107XG4gIHRoaXMuY29uZmlncyA9IHtcbiAgICB2ZXJib3NlOiBmYWxzZSB8fCBjb25maWdzLnZlcmJvc2UsXG4gICAgd2FybmluZzogZmFsc2UgfHwgY29uZmlncy53YXJuaW5nLFxuICAgIGVycm9yOiB0cnVlICYmIGNvbmZpZ3MuZXJyb3IsXG4gICAgZ3JhcGg6IGZhbHNlIHx8IGNvbmZpZ3MuZ3JhcGgsXG4gICAgZGVidWc6IHRydWUgJiYgY29uZmlncy5kZWJ1ZyxcbiAgICByZXBvcnRlcjogY29uZmlncy5yZXBvcnRlciB8fCB0aGlzLmNvbnNvbGVSZXBvcnRlci5iaW5kKHRoaXMpXG4gIH07XG4gIHJldHVybiB0aGlzO1xufTtcblxuU3RhdGUucHJvdG90eXBlLmRlYnVnID1cbmZ1bmN0aW9uIGxzc19kZWJ1ZygpIHtcbiAgaWYgKHRoaXMuY29uZmlncy5kZWJ1Zykge1xuICAgIHRoaXMubG9nLmFwcGx5KHRoaXMsIFsnW0ldICddLmNvbmNhdChBcnJheS5mcm9tKGFyZ3VtZW50cykpKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cblN0YXRlLnByb3RvdHlwZS52ZXJib3NlID1cbmZ1bmN0aW9uIGxzc192ZXJib3NlKCkge1xuICBpZiAodGhpcy5jb25maWdzLnZlcmJvc2UpIHtcbiAgICB0aGlzLmxvZy5hcHBseSh0aGlzLCBbJ1tWXSAnXS5jb25jYXQoQXJyYXkuZnJvbShhcmd1bWVudHMpKSk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5TdGF0ZS5wcm90b3R5cGUud2FybmluZyA9IGZ1bmN0aW9uIGxzc193YXJuaW5nKCkge1xuICBpZiAodGhpcy5jb25maWdzLndhcm5pbmcgfHwgdGhpcy5jb25maWdzLnZlcmJvc2UpIHtcbiAgICB0aGlzLmxvZy5hcHBseSh0aGlzLCBbJ1shXSAnXS5jb25jYXQoQXJyYXkuZnJvbShhcmd1bWVudHMpKSk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5TdGF0ZS5wcm90b3R5cGUuZXJyb3IgPVxuZnVuY3Rpb24gbHNzX2Vycm9yKCkge1xuICBpZiAodGhpcy5jb25maWdzLmVycm9yIHx8IHRoaXMuY29uZmlncy53YXJuaW5nIHx8XG4gICAgICB0aGlzLmNvbmZpZ3MudmVyYm9zZSkge1xuICAgIHRoaXMubG9nLmFwcGx5KHRoaXMsIFsnW0VdICddLmNvbmNhdChBcnJheS5mcm9tKGFyZ3VtZW50cykpKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUHJpbnQgdGhlIHN0YWNrLiBGb3IgZXhhbXBsZTpcbiAqXG4gKiAgbG9nZ2VyLmRlYnVnKCd0aGUgdGhpbmcgYXQgc3RhY2s6ICcpLnN0YWNrKClcbiAqXG4gKiB3b3VsZCBwcmludCBvdXQgdGhlIG1lc3NhZ2UgYW5kIHRoZSBzdGFjay5cbiAqL1xuU3RhdGUucHJvdG90eXBlLnN0YWNrID0gZnVuY3Rpb24gbHNzX3N0YWNrKCkge1xuICB0aGlzLmxvZygobmV3IEVycm9yKCkpLnN0YWNrKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIExvZyB0aGUgdHJhbnNmZXJyaW5nIG1hbmlwdWxhdGlvbi5cbiAqXG4gKiBUbyBsb2cgdGhlIGNvbmRpdGlvbnMsIHRoaXMgZnVuY3Rpb24gd291bGQgc3RyaW5naWZ5IHRoZSBjb25kaXRpb25zXG4gKiBhbmQgdGhlbiBwYXJzZSBpdCB0byBkbyB0aGUgZGVlcCBjb3B5LiBTbyBwbGVhc2UgdHVybiBvZmYgdGhlXG4gKiBgY29uZmlnLmRlYnVnYCBpbiBwcm9kdWN0aW9uIG1vZGUuXG4gKlxuICogQHBhcmFtIGZyb20ge3N0cmluZ30gLSBmcm9tIHN0YXRlIHR5cGVcbiAqIEBwYXJhbSB0byB7c3RyaW5nfSAtIHRvIHN0YXRlIHR5cGVcbiAqIEBwYXJhbSBjb25kaXRpb25zIHtvYmplY3R9IC0gdW5kZXIgd2hhdCBjb25kaXRpb25zIHdlIGRvIHRoZSB0cmFuc2ZlcnJpbmdcbiAqL1xuU3RhdGUucHJvdG90eXBlLnRyYW5zZmVyID1cbmZ1bmN0aW9uIGxzc190cmFuc2Zlcihmcm9tLCB0bywgY29uZGl0aW9ucyA9IHt9KSB7XG4gIGlmICghdGhpcy5jb25maWdzLmRlYnVnKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciB0cmFuc2ZlckRldGFpbHMgPSB7XG4gICAgZnJvbTogZnJvbSxcbiAgICB0bzogdG8sXG4gICAgY29uZGl0aW9uczogSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShjb25kaXRpb25zKSlcbiAgfTtcbiAgaWYgKHRoaXMuY29uZmlncy5ncmFwaCkge1xuICAgIHRoaXMuc3RhdGVTdGFjay5wdXNoKHRyYW5zZmVyRGV0YWlscyk7XG4gIH1cbiAgdGhpcy5kZWJ1ZyhgU3RhdGUgdHJhbnNmZXI6IGZyb20gJHtmcm9tfSB0byAke3RvfSBiZWNhdXNlIG9mOmAsXG4gICAgdHJhbnNmZXJEZXRhaWxzLmNvbmRpdGlvbnMpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogVG8gZ2V0IHRoZSBncmFwaC4gVGhlIGFycmF5IGl0IHJldHVybiB3b3VsZCBiZTpcbiAqXG4gKiAgICAgWyAnZm9vJywge2NvbmRpdGlvbnN9LCAnYmFyJywge2NvbmRpdGlvbnN9LCAnZ2FtbWEnLi4uXVxuICpcbiAqIHdoaWNoIGNhbiBiZSByZW5kZXJlZCBhcyBhIHJlYWwgZ3JhcGguXG4gKi9cblN0YXRlLnByb3RvdHlwZS5ncmFwaCA9XG5mdW5jdGlvbiBsc3NfZ3JhcGgoKSB7XG4gIHJldHVybiB0aGlzLnN0YXRlU3RhY2sucmVkdWNlKChwcmV2LCBpbmZvKSA9PiB7XG4gICAgcmV0dXJuIHByZXYuY29uY2F0KFtpbmZvLmZyb20sIGluZm8uY29uZGl0aW9ucywgaW5mby50b10pO1xuICB9LCBbXSk7XG59O1xuXG5TdGF0ZS5wcm90b3R5cGUubG9nID1cbmZ1bmN0aW9uIGxzc19sb2coKSB7XG4gIHZhciByZXBvcnRlciA9IHRoaXMuY29uZmlncy5yZXBvcnRlcjtcbiAgcmVwb3J0ZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5TdGF0ZS5wcm90b3R5cGUuc3RvcCA9XG5mdW5jdGlvbiBsc3Nfc3RvcCgpIHtcbiAgdGhpcy5zdGF0ZVN0YWNrLmxlbmd0aCA9IDA7XG4gIHJldHVybiB0aGlzO1xufTtcblxuU3RhdGUucHJvdG90eXBlLmNvbnNvbGVSZXBvcnRlciA9XG5mdW5jdGlvbiBsc3NfY29uc29sZVJlcG9ydGVyKCkge1xuICBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBhcmd1bWVudHMpO1xuICByZXR1cm4gdGhpcztcbn07XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL2J1aWxkX3N0YWdlL3NyYy9sb2dnZXIvc3RhdGUuanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogR2VuZXJpYyBidWlsZGVyIHRoYXQgd291bGQgcHVzaCBub2RlcyBpbnRvIHRoZSBlRFNMIHN0YWNrLlxuICogVXNlciBjb3VsZCBpbmhlcml0IHRoaXMgdG8gZGVmaW5lIHRoZSBuZXcgZURTTC5cbiAqIC0tLVxuICogVGhlIGRlZmF1bHQgc2VtYW50aWNzIG9ubHkgY29udGFpbiB0aGVzZSBvcGVyYXRpb25zOlxuICpcbiAqIDEuIFtwdXNoXSA6IHB1c2ggdG8gdGhlIGN1cnJlbnQgc3RhY2tcbiAqIDIuIFtiZWdpbl06IGNyZWF0ZSBhIG5ldyBzdGFjayBhbmQgc3dpdGNoIHRvIGl0LFxuICogICAgICAgICAgICAgYW5kIHRoZW4gcHVzaCB0aGUgbm9kZSBpbnRvIHRoZSBzdGFjay5cbiAqIDMuIFtlbmRdICA6IGFmdGVyIHB1c2ggdGhlIG5vZGUgaW50byB0aGUgc3RhY2ssXG4gKiAgICAgICAgICAgICBjaGFuZ2UgdGhlIGN1cnJlbnQgc3RhY2sgdG8gdGhlIHByZXZpb3VzIG9uZS5cbiAqIDQuIFtleGl0XSA6IGV4aXQgdGhlIGNvbnRleHQgb2YgdGhpcyBlRFNMOyB0aGUgbGFzdCByZXN1bHRcbiAqICAgICAgICAgICAgIG9mIGl0IHdvdWxkIGJlIHBhc3NlZCB0byB0aGUgcmV0dXJuIHZhbHVlIG9mXG4gKiAgICAgICAgICAgICB0aGlzIGNoYWluLlxuICpcbiAqIFN0YWNrIGNvdWxkIGJlIG5lc3RlZDogd2hlbiBbYmVnaW5dIGEgbmV3IHN0YWNrIGluIGZhY3QgaXQgd291bGRcbiAqIHB1c2ggdGhlIHN0YWNrIGludG8gdGhlIHByZXZpb3VzIG9uZS4gU28gdGhlIHN0YWNrIGNvbXByaXNlXG4gKiBbbm9kZV0gYW5kIFtzdGFja10uXG4gKiAtLS1cbiAqIEFsdGhvdWdoIHRoZSBlRFNMIGluc3RhbmNlIHNob3VsZCB3cmFwIHRoZXNlIGJhc2ljIG9wZXJhdGlvbnNcbiAqIHRvIG1hbmlwdWxhdGUgdGhlIHN0YWNrLCB0aGV5IGFsbCBuZWVkIHRvIGNvbnZlcnQgdGhlIG1ldGhvZFxuICogY2FsbCB0byBub2Rlcy4gU28gJ0xhbmd1YWdlJyBwcm92aWRlIGEgd2F5IHRvIHNpbXBsaWZ5IHRoZSB3b3JrOiBpZlxuICogdGhlIGluc3RhbmNlIGNhbGwgdGhlIFtkZWZpbmVdIG1ldGhvZCB0aGUgbmFtZSBvZiB0aGUgbWV0aG9kLFxuICogaXQgY291bGQgYXNzb2NpYXRlIHRoZSBvcGVyYW5kIG9mIHRoZSBlRFNMIHdpdGggdGhlIHN0YWNrIG1hbmlwdWxhdGlvbi5cbiAqIEZvciBleGFtcGxlOlxuICpcbiAqICAgIHZhciBlRFNMID0gZnVuY3Rpb24oKSB7fTtcbiAqICAgIGVEU0wucHJvdG90eXBlLnRyYW5zYWN0aW9uID0gTGFuZ3VhZ2UuZGVmaW5lKCd0cmFuc2FjdGlvbicsICdiZWdpbicpO1xuICogICAgZURTTC5wcm90b3R5cGUucHJlID0gTGFuZ3VhZ2UuZGVmaW5lKCdwcmUnLCAncHVzaCcpO1xuICogICAgZURTTC5wcm90b3R5cGUucGVyZm9ybSA9IExhbmd1YWdlLmRlZmluZSgncGVyZm9ybScsICdwdXNoJyk7XG4gKiAgICBlRFNMLnByb3RvdHlwZS5wb3N0ID0gTGFuZ3VhZ2UuZGVmaW5lKCdwb3N0JywgJ2VuZCcpO1xuICpcbiAqIFRoZW4gdGhlIGVEU0wgY291bGQgYmUgdXNlZCBhczpcbiAqXG4gKiAgICAobmV3IGVEU0wpXG4gKiAgICAgIC50cmFuc2FjdGlvbigpXG4gKiAgICAgIC5wcmUoY2IpXG4gKiAgICAgIC5wZXJmb3JtKGNiKVxuICogICAgICAucG9zdChjYilcbiAqXG4gKiBBbmQgdGhlIHN0YWNrIHdvdWxkIGJlOlxuICpcbiAqICAgIFtcbiAqICAgICAgbm9kZTwndHJhbnNhY3Rpb24nLD5cbiAqICAgICAgbm9kZTwncHJlJywgY2I+XG4gKiAgICAgIG5vZGU8J3ByZWZvcm0nLCBjYj5cbiAqICAgICAgbm9kZTwncG9zdCcsIGNiPlxuICogICAgXVxuICpcbiAqIEhvd2V2ZXIsIHRoaXMgc2ltcGxlIGFwcHJvYWNoIHRoZSBzZW1hbnRpY3MgcnVsZXMgYW5kIGFuYWx5emVycyB0b1xuICogZ3VhcmFudGVlIHRoZSBzdGFjayBpcyB2YWxpZC4gRm9yIGV4YW1wbGUsIGlmIHdlIGhhdmUgYSBtYWxmb3JtZWRcbiAqIHN0YWNrIGJlY2F1c2Ugb2YgdGhlIGZvbGxvd2luZyBlRFNMIHByb2dyYW06XG4gKlxuICogICAgKG5ldyBlRFNMKVxuICogICAgICAucG9zdChjYilcbiAqICAgICAgLnByZShjYilcbiAqICAgICAgLnBlcmZvcm0oY2IpXG4gKiAgICAgIC50cmFuc2FjdGlvbigpXG4gKlxuICogVGhlIHJ1bnRpbWUgbWF5IHJlcG9ydCBlcnJvdCBiZWNhdXNlIHdoZW4gJy5wb3N0KGNiKScgdGhlcmUgaXMgbm8gc3RhY2tcbiAqIGNyZWF0ZWQgYnkgdGhlIGJlZ2lubmluZyBzdGVwLCBuYW1lbHkgdGhlICcucHJlKGNiKScgaW4gb3VyIGNhc2UuXG4gKiBOZXZlcnRoZWxlc3MsIHRoZSBlcnJvciBtZXNzYWdlIGlzIHRvbyBsb3ctbGV2ZWwgZm9yIHRoZSBsYW5ndWFnZSB1c2VyLFxuICogc2luY2UgdGhleSBzaG91bGQgY2FyZSBubyBzdGFjayB0aGluZ3MgYW5kIHNob3VsZCBvbmx5IGNhcmUgYWJvdXQgdGhlIGVEU0xcbiAqIGl0c2VsZi5cbiAqXG4gKiBUaGUgc29sdXRpb24gaXMgdG8gcHJvdmlkZSBhIGJhc2ljIHN0YWNrIG9yZGVyaW5nIGFuYWx5emVyIGFuZCBsZXQgdGhlXG4gKiBsYW5ndWFnZSBkZWNpZGUgaG93IHRvIGRlc2NyaWJlIHRoZSBlcnJvci4gQW5kIHNpbmNlIHdlIGRvbid0IGhhdmVcbiAqIGFueSBjb250ZXh0IGluZm9ybWF0aW9uIGFib3V0IHZhcmlhYmxlcywgc2NvcGUgYW5kIG90aGVyIGVsZW1lbnRzXG4gKiBhcyBhIGNvbXBsZXRlIHByb2dyYW1taW5nIGxhbmd1YWdlLCB3ZSBvbmx5IG5lZWQgdG8gZ3VhcmFudGVlIHRoZSBvcmRlciBpc1xuICogY29ycmVjdCwgYW5kIG1ha2UgaW5jb3JyZWN0IGNhc2VzIG1lYW5pbmdmdWwuIE1vcmVvdmVyLCBzaW5jZSB0aGUgYW5hbHl6ZXJcbiAqIG5lZWRzIHRvIGFuYWx5emUgdGhlIHN0YXRlcyB3aGVuZXZlciB0aGUgaW5jb21pbmcgbm9kZSBjb21lcywgaXQgaXMgaW4gZmFjdFxuICogYW4gZXZhbHVhdGlvbiBwcm9jZXNzLCBzbyB1c2VyIGNvdWxkIGNvbWJpbmUgdGhlIGFuYWx5emluZyBhbmQgaW50ZXJwcmV0aW5nXG4gKiBwaGFzZSBpbnRvIHRoZSBzYW1lIGZ1bmN0aW9uLiBGb3IgZXhhbXBsZTpcbiAqXG4gKiAgICBydW50aW1lLm9uY2hhbmdlKChjb250ZXh0LCBub2RlLCBzdGFjaykgPT4ge1xuICogICAgICAgIC8vIElmIHRoZSBjaGFuZ2UgaXMgdG8gc3dpdGNoIHRvIGEgbmV3IHN0YWNrLFxuICogICAgICAgIC8vIHRoZSAnc3RhY2snIGhlcmUgd291bGQgYmUgdGhlIG5ldyBzdGFjay5cbiAqICAgICAgICB2YXIge3R5cGUsIGFyZ3N9ID0gbm9kZTtcbiAqICAgICAgICBpZiAoJ3ByZScgPT09IHR5cGUpIHtcbiAqICAgICAgICAgIGNvbnRleHQuaW5pdCA9IHRydWU7XG4gKiAgICAgICAgfSBlbHNlIGlmICgncG9zdCcgPT09IHR5cGUgJiYgIWNvbnRleHQuaW5pdCkge1xuICogICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGVyZSBtdXN0IGJlIG9uZSBcInByZVwiIG5vZGUgYmVmb3JlIHRoZSBcInBvc3RcIi4nKTtcbiAqICAgICAgICB9XG4gKiAgICB9KTtcbiAqXG4gKiBXaXRoIHN1Y2ggZmVhdHVyZSwgaWYgdGhlIGluY29taW5nIG5vZGUgb3IgdGhlIHN0YWNrIGlzIG1hbGZvcm1lZCxcbiAqIGl0IHNob3VsZCB0aHJvdyB0aGUgZXJyb3IuIFRoZSBlcnJvciBjYXB0dXJlZCBieSB0aGUgaW5zdGFuY2UgbGlrZSB0aGlzXG4gKiBjb3VsZCBiZSBhICdjb21waWxhdGlvbiBlcnJvcicuXG4gKlxuICogVGhlIG5vdGljZWFibGUgZmFjdCBpcyBUaGUgY2FsbGJhY2sgb2YgdGhlICdvbmNoYW5nZScgaXMgYWN0dWFsbHkgYSByZWR1Y2VyLFxuICogc28gdXNlciBjb3VsZCB0cmVhdCB0aGUgcHJvY2VzcyBvZiB0aGlzIGV2YWx1YXRpb24gJiBhbmFseXppbmcgYXMgYSByZWR1Y2luZ1xuICogcHJvY2VzcyBvbiBhbiBpbmZpbml0ZSBzdHJlYW0uIEFuZCBzaW5jZSB3ZSBoYXZlIGEgc3RhY2sgbWFjaGluZSwgaWYgdGhlXG4gKiByZWR1Y2VyIHJldHVybiBub3RoaW5nLCB0aGUgc3RhY2sgd291bGQgYmUgZW1wdHkuIE90aGVyd2lzZSwgaWYgdGhlIHJlZHVjZXJcbiAqIHJldHVybiBhIG5ldyBzdGFjaywgaXQgd291bGQgcmVwbGFjZSB0aGUgb2xkIG9uZS5cbiAqXG4gKiBBbmQgcGxlYXNlIG5vdGUgdGhlIGV4YW1wbGUgaXMgbXVjaCBzaW1wbGlmaWVkLiBGb3IgdGhlXG4gKiByZWFsIGVEU0wgaXQgc2hvdWxkIGJlIHVzZWQgb25seSBhcyBhbiBlbnRyeSB0byBkaXNwYXRjaCB0aGUgY2hhbmdlIHRvXG4gKiB0aGUgcmVhbCBoYW5kbGVycywgd2hpY2ggbWF5IGNvbXByaXNlIHNldmVyYWwgc3RhdGVzIGFuZCBjb21wb25lbnRzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gTGFuZ3VhZ2UoKSB7fVxuXG4vKipcbiAqIEhlbHBlciBtZXRob2QgdG8gYnVpbGQgaW50ZXJmYWNlIG9mIGEgc3BlY2lmaWMgRFNMLiBJdCB3b3VsZCByZXR1cm4gYSBtZXRob2RcbiAqIG9mIHRoZSBEU0wgYW5kIHRoZW4gdGhlIGludGVyZmFjZSBjb3VsZCBhdHRhY2ggaXQuXG4gKlxuICogVGhlIHJldHVybmluZyBmdW5jdGlvbiB3b3VsZCBhc3N1bWUgdGhhdCB0aGUgJ3RoaXMnIGluc2lkZSBpdCBpcyB0aGUgcnVudGltZVxuICogb2YgdGhlIGxhbmd1YWdlLiBBbmQgc2luY2UgdGhlIG1ldGhvZCBpdCByZXR1cm5zIHdvdWxkIHJlcXVpcmUgdG8gYWNjZXNzIHNvbWVcbiAqIG1lbWJlcnMgb2YgdGhlICd0aGlzJywgdGhlICd0aGlzJyBzaG91bGQgaGF2ZSAndGhpcy5zdGFjaycgYW5kICd0aGlzLmNvbnRleHQnXG4gKiBhcyB0aGUgbWV0aG9kIHJlcXVpcmVzLlxuICpcbiAqIElmIGl0J3MgYW4gJ2V4aXQnIG5vZGUsIG1lYW5zIHRoZSBzZXNzaW9uIGlzIGVuZGVkIGFuZCB0aGUgaW50ZXJwcmV0ZXIgc2hvdWxkXG4gKiByZXR1cm4gYSBzdGFjayBjb250YWlucyBvbmx5IG9uZSBub2RlIGFzIHRoZSByZXN1bHQgb2YgdGhlIHNlc3Npb24sIG9yIHRoZVxuICogc2Vzc2lvbiByZXR1cm5zIG5vdGhpbmcuXG4gKlxuICogUGxlYXNlIG5vdGUgdGhhdCBmcm9tIHRoZSBkZXNjcmlwdGlvbiBhYm92ZSwgJ2VuZCcgbWVhbnMgc3RhY2sgKHN1YnN0YWNrKVxuICogZW5kcy4gSXQncyB0b3RhbGx5IGlycmVsZXZhbnQgdG8gJ2V4aXQnLlxuICovXG5MYW5ndWFnZS5kZWZpbmUgPSBmdW5jdGlvbihtZXRob2QsIGFzKSB7XG4gIHJldHVybiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgdmFyIG5vZGUsIHJlc3VsdHN0YWNrO1xuICAgIHN3aXRjaCAoYXMpIHtcbiAgICAgIGNhc2UgJ3B1c2gnOlxuICAgICAgICBub2RlID0gbmV3IExhbmd1YWdlLk5vZGUobWV0aG9kLCBhcmdzLCB0aGlzLnN0YWNrKTtcbiAgICAgICAgdGhpcy5zdGFjay5wdXNoKG5vZGUpO1xuICAgICAgICByZXN1bHRzdGFjayA9XG4gICAgICAgICAgdGhpcy5vbmNoYW5nZSh0aGlzLmNvbnRleHQsIG5vZGUsIHRoaXMuc3RhY2spO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2JlZ2luJzpcbiAgICAgICAgdGhpcy5fcHJldnN0YWNrID0gdGhpcy5zdGFjaztcbiAgICAgICAgdGhpcy5zdGFjayA9IFtdO1xuICAgICAgICBub2RlID0gbmV3IExhbmd1YWdlLk5vZGUobWV0aG9kLCBhcmdzLCB0aGlzLnN0YWNrKTtcbiAgICAgICAgdGhpcy5zdGFjay5wdXNoKG5vZGUpOyAgLy8gYXMgdGhlIGZpcnN0IG5vZGUgb2YgdGhlIG5ldyBzdGFjay5cbiAgICAgICAgcmVzdWx0c3RhY2sgPVxuICAgICAgICAgIHRoaXMub25jaGFuZ2UodGhpcy5jb250ZXh0LCBub2RlLCB0aGlzLnN0YWNrKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdlbmQnOlxuICAgICAgICBub2RlID0gbmV3IExhbmd1YWdlLk5vZGUobWV0aG9kLCBhcmdzLCB0aGlzLnN0YWNrKTtcbiAgICAgICAgdGhpcy5zdGFjay5wdXNoKG5vZGUpOyAgLy8gdGhlIGxhc3Qgbm9kZSBvZiB0aGUgc3RhY2suXG4gICAgICAgIHRoaXMuc3RhY2sgPVxuICAgICAgICAgIHRoaXMuX3ByZXZzdGFjazsgLy8gc3dpdGNoIGJhY2sgdG8gdGhlIHByZXZpb3VzIHN0YWNrLlxuICAgICAgICByZXN1bHRzdGFjayA9XG4gICAgICAgICAgdGhpcy5vbmNoYW5nZSh0aGlzLmNvbnRleHQsIG5vZGUsIHRoaXMuc3RhY2spO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2V4aXQnOlxuICAgICAgICBub2RlID0gbmV3IExhbmd1YWdlLk5vZGUobWV0aG9kLCBhcmdzLCB0aGlzLnN0YWNrKTtcbiAgICAgICAgdGhpcy5zdGFjay5wdXNoKG5vZGUpOyAgLy8gdGhlIGxhc3Qgbm9kZSBvZiB0aGUgc3RhY2suXG4gICAgICAgIHJlc3VsdHN0YWNrID1cbiAgICAgICAgICB0aGlzLm9uY2hhbmdlKHRoaXMuY29udGV4dCwgbm9kZSwgdGhpcy5zdGFjayk7XG4gICAgICAgIGlmICghcmVzdWx0c3RhY2spIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCdleGl0JyBub2RlICcke25vZGUudHlwZX0nIHNob3VsZFxuICAgICAgICAgICAgcmV0dXJuIGEgcmVzdWx0c3RhY2suYCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdHN0YWNrWzBdO1xuICAgIH1cbiAgICAvLyBJZiB0aGUgaGFuZGxlciB1cGRhdGVzIHRoZSBzdGFjaywgaXQgd291bGQgcmVwbGFjZSB0aGUgZXhpc3Rpbmcgb25lLlxuICAgIGlmIChyZXN1bHRzdGFjaykge1xuICAgICAgdGhpcy5zdGFjayA9IHJlc3VsdHN0YWNrO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbn07XG5cbkxhbmd1YWdlLk5vZGUgPSBmdW5jdGlvbih0eXBlLCBhcmdzLCBzdGFjaykge1xuICB0aGlzLnR5cGUgPSB0eXBlO1xuICB0aGlzLmFyZ3MgPSBhcmdzO1xuICB0aGlzLnN0YWNrID0gc3RhY2s7XG59O1xuXG5MYW5ndWFnZS5FdmFsdWF0ZSA9IGZ1bmN0aW9uKGNvbnRleHQgPSB7fSkge1xuICB0aGlzLl9hbmFseXplcnMgPSBbXTtcbiAgdGhpcy5faW50ZXJwcmV0ZXIgPSBudWxsO1xuICB0aGlzLl9jb250ZXh0ID0gY29udGV4dDtcbn07XG5cbi8qKlxuICogQW5hbHl6ZXIgY291bGQgcmVjZWl2ZSB0aGUgc3RhY2sgY2hhbmdlIGZyb20gJ0xhbmd1YWdlI2V2YWx1YXRlJyxcbiAqIGFuZCBpdCB3b3VsZCBiZSBjYWxsZWQgd2l0aCB0aGUgYXJndW1lbnRzIGFzIHRoZSBmdW5jdGlvbiBkZXNjcmliZXM6XG4gKlxuICogICAgIExhbmd1YWdlLnByb3RvdHlwZS5ldmFsdWF0ZSgoY29udGV4dCwgY2hhbmdlLCBzdGFjaykgPT4ge1xuICogICAgICAgIC8vIC4uLlxuICogICAgIH0pO1xuICpcbiAqIFNvIHRoZSBhbmFseXplciBjb3VsZCBiZTpcbiAqXG4gKiAgICBmdW5jdGlvbihjb250ZXh0LCBjaGFuZ2UsIHN0YWNrKSB7XG4gKiAgICAgIC8vIERvIHNvbWUgY2hlY2sgYW5kIG1heWJlIGNoYW5nZWQgdGhlIGNvbnRleHQuXG4gKiAgICAgIC8vIFRoZSBuZXh0IGFuYWx5emVyIHRvIHRoZSBpbnRlcnByZXRlciB3b3VsZCBhY2NlcHQgdGhlIGFsdGVybmF0ZWRcbiAqICAgICAgLy8gY29udGV4dCBhcyB0aGUgYXJndW1lbnQgJ2NvbnRleHQnLlxuICogICAgICBjb250ZXh0LnNvbWVGbGFnID0gdHJ1ZTtcbiAqICAgICAgLy8gV2hlbiB0aGVyZSBpcyB3cm9uZywgdGhyb3cgaXQuXG4gKiAgICAgIHRocm93IG5ldyBFcnJvcignU29tZSBhbmFseXppbmcgZXJyb3InKTtcbiAqICAgIH07XG4gKlxuICogTm90ZSB0aGF0IHRoZSBhbmFseXplciAoJ2EnKSB3b3VsZCBiZSBpbnZva2VkIHdpdGggZW1wdHkgJ3RoaXMnIG9iamVjdCxcbiAqIHNvIHRoZSBmdW5jdGlvbiByZWxpZXMgb24gJ3RoaXMnIHNob3VsZCBiaW5kIGl0c2VsZiBmaXJzdC5cbiAqL1xuTGFuZ3VhZ2UuRXZhbHVhdGUucHJvdG90eXBlLmFuYWx5emVyID0gZnVuY3Rpb24oYSkge1xuICB0aGlzLl9hbmFseXplcnMucHVzaChhKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIE9uZSBFdmFsdWF0ZSBjYW4gb25seSBoYXZlIG9uZSBpbnRlcnByZXRlciwgYW5kIGl0IHdvdWxkIHJldHVyblxuICogdGhlIGZ1bmN0aW9uIGNvdWxkIGNvbnN1bWUgZXZlcnkgc3RhY2sgY2hhbmdlIGZyb20gJ0xhbmd1YWdlI2V2YWx1YXRlJy5cbiAqXG4gKiBUaGUgY29kZSBpcyBhIGxpdHRsZSBjb21wbGljYXRlZDogd2UgaGF2ZSB0d28ga2luZHMgb2YgJ3JlZHVjaW5nJzpcbiAqIG9uZSBpcyB0byByZWR1Y2UgYWxsIGFuYWx5emVycyB3aXRoIHRoZSBzaW5nbGUgaW5jb21pbmcgY2hhbmdlLFxuICogYW5vdGhlciBpcyB0byByZWR1Y2UgYWxsIGluY29taW5nIGNoYW5nZXMgd2l0aCB0aGlzIGFuYWx5emVycyArIGludGVycHJldGVyLlxuICpcbiAqIFRoZSBhbmFseXplciBhbmQgaW50ZXJwcmV0ZXIgc2hvdWxkIGNoYW5nZSB0aGUgY29udGV4dCwgdG8gbWVtb3JpemUgdGhlXG4gKiBzdGF0ZXMgb2YgdGhlIGV2YWx1YXRpb24uIFRoZSBkaWZmZXJlbmNlIGlzIGludGVycHJldGVyIHNob3VsZCByZXR1cm4gb25lXG4gKiBuZXcgc3RhY2sgaWYgaXQgbmVlZHMgdG8gdXBkYXRlIHRoZSBleGlzdGluZyBvbmUuIFRoZSBzdGFjayBpdCByZXR1cm5zIHdvdWxkXG4gKiByZXBsYWNlIHRoZSBleGlzdGluZyBvbmUsIHNvIGFueXRoaW5nIHN0aWxsIGluIHRoZSBvbGQgb25lIHdvdWxkIGJlIHdpcGVkXG4gKiBvdXQuIFRoZSBpbnRlcnByZXRlciBjb3VsZCByZXR1cm4gbm90aGluZyAoJ3VuZGVmaW5lZCcpIHRvIGtlZXAgdGhlIHN0YWNrXG4gKiB1bnRvdWNoZWQuXG4gKlxuICogVGhlIGFuYWx5emVycyBhbmQgaW50ZXJwcmV0ZXIgY291bGQgY2hhbmdlIHRoZSAnY29udGV4dCcgcGFzcyB0byB0aGVtLlxuICogQW5kIHNpbmNlIHdlIG1heSB1cGRhdGUgdGhlIHN0YWNrIGFzIGFib3ZlLCB0aGUgY29udGV4dCBzaG91bGQgbWVtb3JpemVcbiAqIHRob3NlIGluZm9ybWF0aW9uIG5vdCB0byBiZSBvdmVyd3JpdHRlbiB3aGlsZSB0aGUgc3RhY2sgZ2V0IHdpcGVkIG91dC5cbiAqXG4gKiBBbmQgaWYgdGhlIGludGVycHJldGluZyBub2RlIGlzIHRoZSBleGl0IG5vZGUgb2YgdGhlIHNlc3Npb24sIGludGVycHJldGVyXG4gKiBzaG91bGQgcmV0dXJuIGEgbmV3IHN0YWNrIGNvbnRhaW5zIG9ubHkgb25lIGZpbmFsIHJlc3VsdCBub2RlLiBJZiB0aGVyZVxuICogaXMgbm8gc3VjaCBub2RlLCB0aGUgcmVzdWx0IG9mIHRoaXMgc2Vzc2lvbiBpcyAndW5kZWZpbmVkJy5cbiAqL1xuTGFuZ3VhZ2UuRXZhbHVhdGUucHJvdG90eXBlLmludGVycHJldGVyID0gZnVuY3Rpb24oaW5wdCkge1xuICAvLyBUaGUgY3VzdG9taXplZCBsYW5ndWFnZSBzaG91bGQgZ2l2ZSB0aGUgZGVmYXVsdCBjb250ZXh0LlxuICByZXR1cm4gKGNvbnRleHQsIGNoYW5nZSwgc3RhY2spID0+IHtcbiAgICB0cnkge1xuICAgICAgLy8gQW5hbHl6ZXJzIGNvdWxkIGNoYW5nZSB0aGUgY29udGV4dC5cbiAgICAgIHRoaXMuX2FuYWx5emVycy5yZWR1Y2UoKGN0eCwgYW5hbHl6ZXIpID0+IHtcbiAgICAgICAgYW5hbHl6ZXIuY2FsbCh7fSwgY29udGV4dCwgY2hhbmdlLCBzdGFjayk7XG4gICAgICB9LCBjb250ZXh0KTtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIHRoaXMuX2hhbmRsZUVycm9yKGUsIGNvbnRleHQsIGNoYW5nZSwgc3RhY2spO1xuICAgIH1cbiAgICAvLyBBZnRlciBhbmFseXplIGl0LCBpbnRlcnByZXQgdGhlIG5vZGUgYW5kIHJldHVybiB0aGUgbmV3IHN0YWNrIChpZiBhbnkpLlxuICAgIHZhciBuZXdTdGFjayA9IGlucHQoY29udGV4dCwgY2hhbmdlLCBzdGFjayk7XG4gICAgcmV0dXJuIG5ld1N0YWNrO1xuICB9O1xufTtcblxuTGFuZ3VhZ2UuRXZhbHVhdGUucHJvdG90eXBlLl9oYW5kbGVFcnJvciA9XG5mdW5jdGlvbihlcnIsIGNvbnRleHQsIGNoYW5nZSwgc3RhY2spIHtcbiAgLy8gVE9ETzogZXhwYW5kIGl0IHRvIHByb3ZpZGUgbW9yZSBzb3BoaXN0aWMgZGVidWdnaW5nIG1lc3NhZ2UuXG4gIHRocm93IG5ldyBFcnJvcihgV2hlbiBjaGFuZ2UgJHtjaGFuZ2UudHlwZX0gY29tZXMgZXJyb3IgJyR7ZXJyfScgaGFwcGVuZWRgKTtcbn07XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL2J1aWxkX3N0YWdlL3NyYy9ydW5lL2xhbmd1YWdlLmpzXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgeyBMYW5ndWFnZSB9IGZyb20gJ3NyYy9ydW5lL2xhbmd1YWdlLmpzJztcbmltcG9ydCB7IEJhc2ljIGFzIEJhc2ljU3RhdGUgIH0gZnJvbSAnc3JjL3N0YXRlL2Jhc2ljLmpzJztcbmltcG9ydCB7IEJhc2ljIGFzIEJhc2ljQ29tcG9uZW50IH0gZnJvbSAnc3JjL2NvbXBvbmVudC9iYXNpYy5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBDb21wb25lbnQoKSB7XG4gIHRoaXMuY29udGV4dCA9IHtcbiAgICBfaW5mbzoge31cbiAgfTtcbiAgdGhpcy5zdGFjayA9IFtdO1xuICB0aGlzLl9ldmFsdWF0b3IgPSAobmV3IExhbmd1YWdlLkV2YWx1YXRlKCkpXG4gICAgLmFuYWx5emVyKHRoaXMuX2FuYWx5emVyLmJpbmQodGhpcykpXG4gICAgLmludGVycHJldGVyKHRoaXMuX2ludGVycHJldC5iaW5kKHRoaXMpKTtcbiAgdGhpcy5fY29tcG9uZW50ID0gbnVsbDtcbn1cblxuLy8gVGhlIGxhbmd1YWdlIGludGVyZmFjZS5cbkNvbXBvbmVudC5wcm90b3R5cGUuc3RhcnQgPSBMYW5ndWFnZS5kZWZpbmUoJ3N0YXJ0JywgJ2JlZ2luJyk7XG5Db21wb25lbnQucHJvdG90eXBlLnR5cGUgPSBMYW5ndWFnZS5kZWZpbmUoJ3R5cGUnLCAncHVzaCcpO1xuQ29tcG9uZW50LnByb3RvdHlwZS5jb25maWdzID0gTGFuZ3VhZ2UuZGVmaW5lKCdjb25maWdzJywgJ3B1c2gnKTtcbi8vIFNldCB0aGUgZGVmYXVsdCByZXNvdXJjZXMuXG5Db21wb25lbnQucHJvdG90eXBlLnJlc291cmNlcyA9IExhbmd1YWdlLmRlZmluZSgncmVzb3VyY2VzJywgJ3B1c2gnKTtcbkNvbXBvbmVudC5wcm90b3R5cGUubG9nZ2VyID0gTGFuZ3VhZ2UuZGVmaW5lKCdsb2dnZXInLCAncHVzaCcpO1xuQ29tcG9uZW50LnByb3RvdHlwZS5tZXRob2RzID0gTGFuZ3VhZ2UuZGVmaW5lKCdtZXRob2RzJywgJ3B1c2gnKTtcbi8vIFRoZSBzZXR1cCBzdGF0ZS4gU2hvdWxkIGdpdmUgdGhlIGNvbnN0cnVjdG9yLlxuQ29tcG9uZW50LnByb3RvdHlwZS5zZXR1cCA9IExhbmd1YWdlLmRlZmluZSgnc2V0dXAnLCAncHVzaCcpO1xuLy8gVG8gYnVpbGQgYSBjb25zdHJ1Y3RvciArIHByb3RvdHlwZVxuQ29tcG9uZW50LnByb3RvdHlwZS5idWlsZCA9IExhbmd1YWdlLmRlZmluZSgnYnVpbGQnLCAnZXhpdCcpO1xuLy8gQmVzaWRlcyB0aGUgY29uc3RydWN0b3IgYW5kIHByb3RvdHlwZSwgY3JlYXRlIGFuIGluc3RhbmNlIGFuZCByZXR1cm4gaXQuXG5Db21wb25lbnQucHJvdG90eXBlLmluc3RhbmNlID0gTGFuZ3VhZ2UuZGVmaW5lKCdpbnN0YW5jZScsICdleGl0Jyk7XG5cbi8vIFRoZSBwcml2YXRlIG1ldGhvZHMuXG5Db21wb25lbnQucHJvdG90eXBlLm9uY2hhbmdlID0gZnVuY3Rpb24oY29udGV4dCwgbm9kZSwgc3RhY2spIHtcbiAgLy8gV2hlbiBpdCdzIGNoYW5nZWQsIGV2YWx1YXRlIGl0IHdpdGggYW5hbHl6ZXJzICYgaW50ZXJwcmV0ZXIuXG4gIHJldHVybiB0aGlzLl9ldmFsdWF0b3IoY29udGV4dCwgbm9kZSwgc3RhY2spO1xufTtcblxuQ29tcG9uZW50LnByb3RvdHlwZS5fYW5hbHl6ZXIgPSBmdW5jdGlvbihjb250ZXh0LCBub2RlLCBzdGFjaykge1xuICBpZiAoJ3N0YXJ0JyAhPT0gbm9kZS50eXBlICYmICFjb250ZXh0LnN0YXJ0ZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEJlZm9yZSAnJHtub2RlLnR5cGV9Jywgc2hvdWxkIHN0YXJ0IHRoZSBidWlsZGVyIGZpcnN0YCk7XG4gIH1cbiAgc3dpdGNoKG5vZGUudHlwZSkge1xuICAgIGNhc2UgJ3N0YXJ0JzpcbiAgICAgIGNvbnRleHQuc3RhcnRlZCA9IHRydWU7XG4gICAgICBicmVhaztcbiAgICBjYXNlICd0eXBlJzpcbiAgICAgIGlmICgxICE9PSBub2RlLmFyZ3MubGVuZ3RoIHx8ICdzdHJpbmcnICE9PSB0eXBlb2Ygbm9kZS5hcmdzWzBdKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgICcke25vZGUudHlwZX0nXG4gICAgICAgICAgZXhwZWN0IHRvIGhhdmUgYSBzdHJpbmcgYXMgdGhlIGNvbXBvbmVudCB0eXBlYCk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdidWlsZCc6XG4gICAgY2FzZSAnaW5zdGFuY2UnOlxuICAgICAgLy8gQ2hlY2sgaWYgbmVjZXNzYXJ5IHByb3BlcnRpZXMgYXJlIG1pc3NpbmcuXG4gICAgICAvLyBDdXJyZW50bHksICdzZXR1cCcgYW5kICd0eXBlJyBpcyBuZWNlc3NhcnkuXG4gICAgICBpZiAoIWNvbnRleHQuX2luZm8udHlwZSB8fCAnc3RyaW5nJyAhPT0gdHlwZW9mIGNvbnRleHQuX2luZm8udHlwZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEEgc3RhdGUgc2hvdWxkIGF0IGxlYXN0IHdpdGggdHlwZWApO1xuICAgICAgfVxuICAgICAgaWYgKCFjb250ZXh0Ll9pbmZvLnNldHVwIHx8IGNvbnRleHQuX2luZm8uc2V0dXAgaW5zdGFuY2VvZiBCYXNpY1N0YXRlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQSBzdGF0ZSBzaG91bGQgYXQgbGVhc3Qgd2l0aCBzZXR1cCBzdGF0ZWApO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gIH1cbn07XG5cbi8qKlxuICogQXMgYW4gb3JkaW5hcnkgaW50ZXJwcmV0aW5nIGZ1bmN0aW9uOiBkbyBzb21lIGVmZmVjdHMgYWNjb3JkaW5nIHRvIHRoZSBub2RlLFxuICogYW5kIHJldHVybiB0aGUgZmluYWwgc3RhY2sgYWZ0ZXIgZW5kaW5nLlxuICovXG5Db21wb25lbnQucHJvdG90eXBlLl9pbnRlcnByZXQgPSBmdW5jdGlvbihjb250ZXh0LCBub2RlLCBzdGFjaykge1xuICBpZiAoJ3N0YXJ0JyA9PT0gbm9kZS50eXBlKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIElmIHRoZSBpbmZvcm1hdGlvbiBhcmUgZ2F0aGVyZWQsIGFjY29yZGluZyB0byB0aGUgaW5mb3JtYXRpb25cbiAgLy8gdXNlciBnYXZlIHRvIGJ1aWxkIGEgc3RhdGUuXG4gIGlmICgnYnVpbGQnICE9PSBub2RlLnR5cGUgJiYgJ2luc3RhbmNlJyAhPT0gbm9kZS50eXBlKSB7XG4gICAgLy8gU2luY2UgYWxsIHRoZXNlIG1ldGhvZHMgYXJlIG9ubHkgbmVlZCBvbmUgYXJndW1lbnQuXG4gICAgY29udGV4dC5faW5mb1tub2RlLnR5cGVdID0gbm9kZS5hcmdzWzBdO1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgX2luZm8gPSBjb250ZXh0Ll9pbmZvO1xuICBjb250ZXh0Ll9jb21wb25lbnQgPSBmdW5jdGlvbih2aWV3KSB7XG4gICAgQmFzaWNDb21wb25lbnQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLnJlc291cmNlcyA9IF9pbmZvLnJlc291cmNlcyB8fCB0aGlzLnJlc291cmNlcztcbiAgICB0aGlzLmNvbmZpZ3MgPSBfaW5mby5jb25maWdzIHx8IHRoaXMuY29uZmlncztcbiAgICB0aGlzLmxvZ2dlciA9IF9pbmZvLmxvZ2dlciB8fCB0aGlzLmxvZ2dlcjtcbiAgICB0aGlzLnR5cGUgPSBfaW5mby50eXBlO1xuICAgIHRoaXMuX3NldHVwU3RhdGUgPSBuZXcgX2luZm8uc2V0dXAodGhpcyk7XG4gIH07XG4gIGNvbnRleHQuX2NvbXBvbmVudC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhc2ljQ29tcG9uZW50LnByb3RvdHlwZSk7XG4gIGlmIChfaW5mby5tZXRob2RzKSB7XG4gICAgT2JqZWN0LmtleXMoX2luZm8ubWV0aG9kcykuZm9yRWFjaChmdW5jdGlvbihtZXRob2ROYW1lKSB7XG4gICAgICBjb250ZXh0Ll9jb21wb25lbnQucHJvdG90eXBlW21ldGhvZE5hbWVdID0gX2luZm8ubWV0aG9kc1ttZXRob2ROYW1lXTtcbiAgICB9KTtcbiAgfVxuICBpZiAoJ2J1aWxkJyA9PT0gbm9kZS50eXBlKSB7XG4gICAgLy8gVGhlIG9ubHkgb25lIG5vZGUgb24gdGhlIHN0YWNrIHdvdWxkIGJlIHJldHVybmVkLlxuICAgIHN0YWNrID0gWyBjb250ZXh0Ll9jb21wb25lbnQgXTtcbiAgICByZXR1cm4gc3RhY2s7XG4gIH1cbiAgaWYgKCdpbnN0YW5jZScgPT09IG5vZGUudHlwZSkge1xuICAgIC8vIFNpbmNlICdpbnN0YW5jZScgbWF5IHBhc3Mgc29tZSBhcmd1bWVudHMgdG8gdGhlIGNvbnN0cnVjdG9yLFxuICAgIC8vIHdlIG5lZWQgdG8gYXBwbHkgaXQgcmF0aGVyIHRoYW4gbmV3IGl0LlxuICAgIHZhciB0YXJnZXQgPSBPYmplY3QuY3JlYXRlKGNvbnRleHQuX2NvbXBvbmVudC5wcm90b3R5cGUpO1xuICAgIGNvbnRleHQuX2NvbXBvbmVudC5hcHBseSh0YXJnZXQsIG5vZGUuYXJncyk7XG4gICAgc3RhY2sgPSBbIHRhcmdldCBdO1xuICAgIHJldHVybiBzdGFjaztcbiAgfVxufTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vYnVpbGRfc3RhZ2Uvc3JjL2J1aWxkZXIvY29tcG9uZW50LmpzXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgeyBTdHJlYW0gfSBmcm9tICdzcmMvc3RyZWFtL3N0cmVhbS5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBCYXNpYyhjb21wb25lbnQpIHtcbiAgLy8gQSBsb2NrIHRvIHByZXZlbnQgdHJhbnNmZXJyaW5nIHJhY2luZy4gVGhpcyBpcyBiZWNhdXNlIG1vc3Qgb2Ygc291cmNlXG4gIC8vIGV2ZW50cyBhcmUgbWFwcGVkIGludG8gaW50ZXJydXB0cyB0byB0cmlnZ2VyIHRyYW5zZmVycmluZ3MuIFRvIHByZXZlbnRcbiAgLy8gY2xpZW50IG5lZWQgdG8gaW1wbGVtZW50IHRoaXMgYWdhaW4gYW5kIGFnYWluIHdlIHB1dCB0aGUgbG9jayBoZXJlLlxuICB0aGlzLl90cmFuc2ZlcnJlZCA9IGZhbHNlO1xuICAvLyBSZXBsYWNlIHdpdGggdGhlIG5hbWUgb2YgY29uY3JldGUgc3RhdGUuXG4gIHRoaXMuY29uZmlncyA9IHtcbiAgICB0eXBlOiAnQmFzaWMnLFxuICAgIC8vIE5vdGUgdGhlIGV2ZW50IG1lYW5zIGV2ZW50cyBmb3J3YXJkZWQgZnJvbSBzb3VyY2VzLCBub3QgRE9NIGV2ZW50cy5cbiAgICBzdHJlYW06IHtcbiAgICAgIGV2ZW50czogW10sXG4gICAgICBpbnRlcnJ1cHRzOiBbXSxcbiAgICAgIHNvdXJjZXM6IFtdXG4gICAgfVxuICB9O1xuICAvLyBDb21wb25lbnQgcmVmZXJlbmNlIHByb2l2ZGVzIGV2ZXJ5IHJlc291cmNlICYgcHJvcGVydHlcbiAgLy8gbmVlZCBieSBhbGwgc3RhdGVzLlxuICB0aGlzLmNvbXBvbmVudCA9IGNvbXBvbmVudDtcbn1cblxuLyoqXG4gKiBTdHJlYW0nIHBoYXNlIGlzIHRoZSBzdGF0ZSdzIHBoYXNlLlxuICovXG5CYXNpYy5wcm90b3R5cGUucGhhc2UgPVxuZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnN0cmVhbS5waGFzZSgpO1xufTtcblxuLyoqXG4gKiBEZXJpdmVkIHN0YXRlcyBzaG91bGQgZXh0ZW5kIHRoZXNlIGJhc2ljIG1ldGhvZHMuXG4gKi9cbkJhc2ljLnByb3RvdHlwZS5zdGFydCA9XG5mdW5jdGlvbigpIHtcbiAgdGhpcy5zdHJlYW0gPSBuZXcgU3RyZWFtKHRoaXMuY29uZmlncy5zdHJlYW0pO1xuICByZXR1cm4gdGhpcy5zdHJlYW0uc3RhcnQodGhpcy5oYW5kbGVTb3VyY2VFdmVudC5iaW5kKHRoaXMpKVxuICAgIC5uZXh0KHRoaXMuc3RyZWFtLnJlYWR5LmJpbmQodGhpcy5zdHJlYW0pKTtcbn07XG5cbkJhc2ljLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnN0cmVhbS5zdG9wKCk7XG59O1xuXG5CYXNpYy5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5zdHJlYW0uZGVzdHJveSgpO1xufTtcblxuQmFzaWMucHJvdG90eXBlLmxpdmUgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuc3RyZWFtLnVudGlsKCdzdG9wJyk7XG59O1xuXG5CYXNpYy5wcm90b3R5cGUuZXhpc3QgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuc3RyZWFtLnVudGlsKCdkZXN0cm95Jyk7XG59O1xuXG4vKipcbiAqIE11c3QgdHJhbnNmZXIgdG8gbmV4dCBzdGF0ZSB2aWEgY29tcG9uZW50J3MgbWV0aG9kLlxuICogT3IgdGhlIGNvbXBvbmVudCBjYW5ub3QgdHJhY2sgdGhlIGxhc3QgYWN0aXZlIHN0YXRlLlxuICovXG5CYXNpYy5wcm90b3R5cGUudHJhbnNmZXJUbyA9IGZ1bmN0aW9uKCkge1xuICBpZiAodGhpcy5fdHJhbnNmZXJyZWQpIHtcbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnUHJldmVudCB0cmFuc2ZlcnJpbmcgcmFjaW5nJyk7XG4gICAgdmFyIG51bGxpZml6ZWQgPSBuZXcgU3RyZWFtKCk7XG4gICAgLy8gVGhpcyB3b3VsZCByZXR1cm4gYSBwcm9jZXNzIGNvdWxkIGJlIGNvbmNhdGVkIGJ1dCB3b3VsZCBkbyBub3RoaW5nLlxuICAgIC8vIEl0J3MgYmV0dGVyIHRvIGZvcm1hbGx5IHByb3ZpZGUgYSBBUEkgZnJvbSBQcm9jZXNzLCBsaWtlXG4gICAgLy8gUHJvY2Vzcy5tYXliZSgpIG9yIFByb2Nlc3MjbnVsbGl6ZSgpLCBidXQgdGhpcyBpcyBhIHNpbXBsaWVyIHNvbHV0aW9uLlxuICAgIHJldHVybiBudWxsaWZpemVkLnN0YXJ0KCkubmV4dCgoKSA9PiBudWxsaWZpemVkLnN0b3AoKSk7XG4gIH1cbiAgLy8gTm8gbmVlZCB0byByZXNldCBpdCBhZ2FpbiBzaW5jZSBhIHN0YXRlIGluc3RhbmNlIHNob3VsZCBub3QgYmVcbiAgLy8gdHJhbnNmZXJyZWQgdG8gdHdpY2UuXG4gIHRoaXMuX3RyYW5zZmVycmVkID0gdHJ1ZTtcbiAgcmV0dXJuIHRoaXMuY29tcG9uZW50LnRyYW5zZmVyVG8uYXBwbHkodGhpcy5jb21wb25lbnQsIGFyZ3VtZW50cyk7XG59O1xuXG4vKipcbiAqIElmIHRoaXMgaGFuZGxlciByZXR1cm4gYSBQcm9taXNlLCBvciBQcm9jZXNzLCB0aGUgdW5kZXJseWluZyBTdHJlYW1cbiAqIGNhbiBtYWtlIHN1cmUgdGhlIHN0ZXBzIGFyZSBxdWV1ZWQgZXZlbiB3aXRoIGFzeW5jaHJvbm91cyBzdGVwcy5cbiAqL1xuQmFzaWMucHJvdG90eXBlLmhhbmRsZVNvdXJjZUV2ZW50ID0gZnVuY3Rpb24oKSB7fTtcblxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9idWlsZF9zdGFnZS9zcmMvc3RhdGUvYmFzaWMuanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7IFByb2Nlc3MgfSBmcm9tICdzcmMvcHJvY2Vzcy9wcm9jZXNzLmpzJztcblxuLyoqXG4gKiBDb21iaW5lIHRoZSBhYmlsaXRpZXMgb2YgdGhlIGV2ZW50IGhhbmRsaW5nIGFuZCBhc3luY2hyb25vdXMgb3BlcmF0aW9uc1xuICogc2VxdWVudGlhbGl6aW5nIHRvZ2V0aGVyLiBTbyB0aGF0IGV2ZXJ5IFN0cmVhbSBjb3VsZDpcbiAqXG4gKiAxLiBGb3IgdGhlIG9yZGluYXJ5IGV2ZW50cywgYXBwZW5kIHN0ZXBzIHRvIHRoZSBtYWluIFByb2Nlc3MgdG8gcXVldWVcbiAqICAgIHRoZSBldmVudCBoYW5kbGVycy5cbiAqIDIuIEZvciBvdGhlciB1cmdlbnQgZXZlbnRzIChpbnRlcnJ1cHRzKSwgaW1tZWRpYXRlbHkgZXhlY3V0ZSB0aGUgZXZlbnRcbiAqICAgIGhhbmRsZXIgd2l0aG91dCBxdWV1aW5nIGl0LlxuICogMy4gT25seSByZWNlaXZlIGV2ZW50cyB3aGVuIGl0J3MgJ3JlYWR5Jy4gQmVmb3JlIHRoYXQsIG5vIHNvdXJjZSBldmVudHNcbiAqICAgIHdvdWxkIGJlIGZvcndhcmRlZCBhbmQgaGFuZGxlZC5cbiAqIDQuIE9uY2UgcGhhc2UgYmVjb21lcyAnc3RvcCcsIG5vIGV2ZW50cyB3b3VsZCBiZSByZWNlaXZlZCBhZ2Fpbi5cbiAqXG4gKiBTdHJlYW0gc2hvdWxkIGNyZWF0ZSB3aXRoIGEgY29uZmlncyBvYmplY3QgaWYgdXNlciB3YW50IHRvIHNldCB1cCBzb3VyY2VzLFxuICogZXZlbnRzIGFuZCBpbnRlcnJ1cHRzLiBJZiB0aGVyZSBpcyBubyBzdWNoIG9iamVjdCwgaXQgd291bGQgYWN0IGxpa2UgYVxuICogUHJvY2VzcywgYW5kIHdpdGhvdXQgYW55IGZ1bmN0aW9uIGhhbmRsZXMgZXZlbnRzLlxuICoqL1xuZXhwb3J0IGZ1bmN0aW9uIFN0cmVhbShjb25maWdzID0ge30pIHtcbiAgdGhpcy5jb25maWdzID0ge1xuICAgIGV2ZW50czogY29uZmlncy5ldmVudHMgfHwgW10sXG4gICAgaW50ZXJydXB0czogY29uZmlncy5pbnRlcnJ1cHRzIHx8IFtdXG4gIH07XG4gIGlmIChjb25maWdzLnNvdXJjZXMgJiYgMCAhPT0gY29uZmlncy5zb3VyY2VzLmxlbmd0aCkge1xuICAgIHRoaXMuY29uZmlncy5zb3VyY2VzID0gY29uZmlncy5zb3VyY2VzO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuY29uZmlncy5zb3VyY2VzID0gW107XG4gIH1cbiAgdGhpcy5fZm9yd2FyZFRvID0gbnVsbDtcbiAgLy8gTmVlZCB0byBkZWxlZ2F0ZSB0byBTb3VyY2UuXG4gIHRoaXMub25jaGFuZ2UgPSB0aGlzLm9uY2hhbmdlLmJpbmQodGhpcyk7XG59XG5cblN0cmVhbS5wcm90b3R5cGUucGhhc2UgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMucHJvY2Vzcy5fcnVudGltZS5zdGF0ZXMucGhhc2U7XG59O1xuXG5TdHJlYW0ucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oZm9yd2FyZFRvKSB7XG4gIHRoaXMuX2ZvcndhcmRUbyA9IGZvcndhcmRUbztcbiAgdGhpcy5wcm9jZXNzID0gbmV3IFByb2Nlc3MoKTtcbiAgdGhpcy5wcm9jZXNzLnN0YXJ0KCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBLaWNrIG9mZiBTb3VyY2UgYW5kIHN0YXJ0IGRvIHRoaW5ncy5cbiAqL1xuU3RyZWFtLnByb3RvdHlwZS5yZWFkeSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmNvbmZpZ3Muc291cmNlcy5mb3JFYWNoKChzb3VyY2UpID0+IHtcbiAgICBzb3VyY2Uuc3RhcnQodGhpcy5vbmNoYW5nZSk7XG4gIH0pO1xuICByZXR1cm4gdGhpcztcbn07XG5cblN0cmVhbS5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnByb2Nlc3Muc3RvcCgpO1xuICB0aGlzLmNvbmZpZ3Muc291cmNlcy5mb3JFYWNoKChzb3VyY2UpID0+IHtcbiAgICBzb3VyY2Uuc3RvcCgpO1xuICB9KTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5TdHJlYW0ucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5wcm9jZXNzLmRlc3Ryb3koKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5TdHJlYW0ucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbihzdGVwKSB7XG4gIHRoaXMucHJvY2Vzcy5uZXh0KHN0ZXApO1xuICByZXR1cm4gdGhpcztcbn07XG5cblN0cmVhbS5wcm90b3R5cGUucmVzY3VlID0gZnVuY3Rpb24ocmVzY3Vlcikge1xuICB0aGlzLnByb2Nlc3MucmVzY3VlKHJlc2N1ZXIpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmV0dXJuIGEgUHJvbWlzZSBnZXQgcmVzb2x2ZWQgd2hlbiB0aGUgc3RyZWFtIHR1cm4gdG9cbiAqIHRoZSBzcGVjaWZpYyBwaGFzZS4gRm9yIGV4YW1wbGU6XG4gKlxuICogICAgc3RyZWFtLnVudGlsKCdzdG9wJylcbiAqICAgICAgICAgIC50aGVuKCgpID0+IHsgY29uc29sZS5sb2coJ3N0cmVhbSBzdG9wcGVkJykgfSk7XG4gKiAgICBzdHJlYW0uc3RhcnQoKTtcbiAqL1xuU3RyZWFtLnByb3RvdHlwZS51bnRpbCA9IGZ1bmN0aW9uKHBoYXNlKSB7XG4gIHJldHVybiB0aGlzLnByb2Nlc3MudW50aWwocGhhc2UpO1xufTtcblxuLyoqXG4gKiBPbmx5IHdoZW4gYWxsIHRhc2tzIHBhc3NlZCBpbiBnZXQgcmVzb2x2ZWQsXG4gKiB0aGUgcHJvY2VzcyB3b3VsZCBnbyB0byB0aGUgbmV4dC5cbiAqL1xuU3RyZWFtLnByb3RvdHlwZS53YWl0ID0gZnVuY3Rpb24odGFza3MpIHtcbiAgdGhpcy5wcm9jZXNzLndhaXQodGFza3MpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSXQgd291bGQgcmVjZWl2ZSBldmVudHMgZnJvbSBTb3VyY2UsIGFuZCB0aGFuIHF1ZXVlIG9yIG5vdCBxdWV1ZVxuICogaXQsIGRlcGVuZHMgb24gd2hldGhlciB0aGUgZXZlbnQgaXMgYW4gaW50ZXJydXB0LlxuICovXG5TdHJlYW0ucHJvdG90eXBlLm9uY2hhbmdlID0gZnVuY3Rpb24oZXZ0KSB7XG4gIGlmICgnc3RhcnQnICE9PSB0aGlzLnByb2Nlc3MuX3J1bnRpbWUuc3RhdGVzLnBoYXNlKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgaWYgKC0xICE9PSB0aGlzLmNvbmZpZ3MuaW50ZXJydXB0cy5pbmRleE9mKGV2dC50eXBlKSkge1xuICAgIC8vIEludGVycnVwdCB3b3VsZCBiZSBoYW5kbGVkIGltbWVkaWF0ZWx5LlxuICAgIHRoaXMuX2ZvcndhcmRUbyhldnQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9IGVsc2Uge1xuICAgIC8vIEV2ZW50IHdvdWxkIGJlIGhhbmRsZWQgYWZ0ZXIgcXVldWluZy5cbiAgICAvLyBUaGlzIGlzLCBpZiB0aGUgZXZlbnQgaGFuZGxlIHJldHVybiBhIFByb21pc2Ugb3IgUHJvY2VzcyxcbiAgICAvLyB0aGF0IGNhbiBiZSBmdWxmaWxsZWQgbGF0ZXIuXG4gICAgdGhpcy5wcm9jZXNzLm5leHQoKCkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuX2ZvcndhcmRUbyhldnQpO1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59O1xuXG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL2J1aWxkX3N0YWdlL3NyYy9zdHJlYW0vc3RyZWFtLmpzXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgeyBJbnRlcmZhY2UgfSBmcm9tICdzcmMvcHJvY2Vzcy9pbnRlcmZhY2UuanMnO1xuaW1wb3J0IHsgUnVudGltZSB9IGZyb20gJ3NyYy9wcm9jZXNzL3J1bnRpbWUuanMnO1xuXG4vKipcbiAqIFRoZSBjb3JlIGNvbXBvbmVudCB0byBzZXF1ZW50aWFsaXplIGFzeW5jaHJvbm91cyBzdGVwcy5cbiAqIEJhc2ljYWxseSBpdCdzIGFuICdpbnRlcnJ1cHRhYmxlIHByb21pc2UnLCBidXQgbW9yZSB0aGFuIGJlIGludGVycnVwdGVkLFxuICogaXQgY291bGQgJ3NoaWZ0JyBmcm9tIG9uZSB0byBhbm90aGVyIHBoYXNlLCB3aXRoIHRoZSBub24tcHJlZW1wdGl2ZVxuICogaW50ZXJydXB0aW5nIG1vZGVsLlxuICpcbiAqIEV4YW1wbGU6XG4gKiAgICB2YXIgcHJvY2VzcyA9IG5ldyBQcm9jZXNzKCk7XG4gKiAgICBwcm9jZXNzLnN0YXJ0KCkgICAgICAgLy8gdGhlIGRlZmF1bHQgcGhhc2UgaXMgJ3N0YXJ0J1xuICogICAgICAgICAgIC5uZXh0KHN0ZXBBKVxuICogICAgICAgICAgIC5uZXh0KHN0ZXBCKVxuICogICAgICAgICAgIC4uLlxuICogICAgLy8gbGF0ZXIsIHNvbWUgdXJnZW50IGV2ZW50cyBjb21lXG4gKiAgICBwcm9jZXNzLnN0b3AoKSAgICAgICAvLyBvbmUgb2YgdGhlIGRlZmF1bHQgdGhyZWUgcGhhc2VzXG4gKiAgICAgICAgICAgLm5leHQoc3RvcFN0ZXBBKVxuICogICAgICAgICAgIC5uZXh0KHN0b3BTdGVwQilcbiAqICAgICAgICAgICAuLi4uXG4gKiAgIC8vIGxhdGVyLCBzb21lIG90aGVyIGludGVycnVwdHMgY29tZVxuICogICBwcm9jZXNzLnNoaWZ0KCdzdG9wJywgJ2Rpenp5JylcbiAqICAgICAgICAgIC5uZXh0KGRpenp5U3RlcEEpXG4gKiAgICAgICAgICAubmV4dChkaXp6eVN0ZXBCKVxuICpcbiAqIFRoZSBwaGFzZXMgbGlzdGVkIGFib3ZlIHdvdWxkIGltbWVkaWF0ZWx5IGludGVycnVwdCB0aGUgc3RlcHMgc2NoZWR1bGVkXG4gKiBhdCB0aGUgcHJldmlvdXMgcGhhc2UuIEhvd2V2ZXIsIHRoaXMgaXMgYSAqbm9uLXByZWVtcHRpdmUqIHByb2Nlc3MgYnlcbiAqIGRlZmF1bHQuIFNvLCBpZiB0aGVyZSBpcyBhIGxvbmctd2FpdGluZyBQcm9taXNlIHN0ZXAgaW4gdGhlICdzdGFydCcgcGhhc2U6XG4gKlxuICogICBwcm9jZXNzLnN0YXJ0KClcbiAqICAgICAgICAgIC5uZXh0KCBsb25nbG9uZ2xvbmdXYWl0aW5nUHJvbWlzZSApICAgLy8gPC0tLSBub3cgaXQncyB3YWl0aW5nIHRoaXNcbiAqICAgICAgICAgIC5uZXh0KCB0aGlzU3RlcElzU3RhcnZpbmcgKVxuICogICAgICAgICAgLm5leHQoIGFuZFRoaXNPbmVUb28gKVxuICogICAgICAgICAgLm5leHQoIHBvb3JTdGVwcyApXG4gKiAgICAgICAgICAuLi4uXG4gKiAgIC8vIHNvbWUgdXJnZW50IGV2ZW50IG9jY3VycyB3aGVuIGl0IGdvZXMgdG8gdGhlIGxvbmcgd2FpdGluZyBwcm9taXNlXG4gKiAgIHByb2Nlc3Muc3RvcCgpXG4gKiAgICAgICAgICAubmV4dCggZG9UaGlzQXNRdWlja0FzUG9zc2libGUgKVxuICpcbiAqIFRoZSBmaXJzdCBzdGVwIG9mIHRoZSAnc3RvcCcgcGhhc2UsIG5hbWVseSB0aGUgJ2RvVGhpc0FzUXVpY2tBc1Bvc3NpYmxlJyxcbiAqIHdvdWxkICpub3QqIGdldCBleGVjdXRlZCBpbW1lZGlhdGVseSwgc2luY2UgdGhlIHByb21pc2UgaXMgc3RpbGwgd2FpdGluZyB0aGVcbiAqIGxhc3Qgc3RlcCBlYXJsaWVyIGludGVycnVwdGlvbi4gU28sIGV2ZW4gdGhlIGZvbGxvd2luZyBzdGVwcyBvZiB0aGUgJ3N0YXJ0J1xuICogcGhhc2Ugd291bGQgYWxsIGdldCBkcm9wcGVkLCB0aGUgbmV3IHBoYXNlIHN0aWxsIG5lZWQgdG8gd2FpdCB0aGUgbGFzdCBvbmVcbiAqIGFzeW5jaHJvbm91cyBzdGVwIGdldCByZXNvbHZlZCB0byBnZXQga2lja2VkIG9mZi5cbiAqXG4gKiAtLS1cbiAqICMjIEFib3V0IHRoZSBub24tcHJlZW1wdGl2ZSBtb2RlbFxuICpcbiAqIFRoZSByZWFzb24gd2h5IHdlIGNhbid0IGhhdmUgYSBwcmVlbXB0aXZlIHByb2Nlc3MgaXMgYmVjYXVzZSB3ZSBjb3VsZG4ndFxuICogaW50ZXJydXB0IGVhY2ggc2luZ2xlIHN0ZXAgaW4gdGhlIHByb2Nlc3MsIHNvIHRoZSBtb3N0IGJhc2ljIHVuaXQgY291bGQgYmVcbiAqIGludGVycnVwdGVkIGlzIHRoZSBzdGVwLiBTbywgdGhlIGNhdmVhdCBoZXJlIGlzIG1ha2UgdGhlIHN0ZXAgYXMgc21hbGwgYXNcbiAqIHBvc3NpYmxlLCBhbmQgdHJlYXQgaXQgYXMgc29tZSBhdG9taWMgb3BlcmF0aW9uIHRoYXQgZ3VhcmFudGVlZCB0byBub3QgYmVlblxuICogaW50ZXJydXB0ZWQgYnkgUHJvY2Vzcy4gRm9yIGV4YW1wbGUsIGlmIHdlIGFsaWFzICduZXh0JyBhcyAnYXRvbWljJzpcbiAqXG4gKiAgICBwcm9jZXNzLnN0YXJ0KClcbiAqICAgICAgICAgICAuYXRvbWljKHN0ZXBBKSAgICAgICAvLyA8LS0tIG5vdyBpdCdzIHdhaXRpbmcgdGhpc1xuICogICAgICAgICAgIC5hdG9taWMoc3RlcEIpXG4gKlxuICogICAvLyBzb21lIHVyZ2VudCBldmVudCBvY2N1cnNcbiAqICAgcHJvY2Vzcy5zdG9wKClcbiAqICAgICAgICAgIC5hdG9taWMoIGRvVGhpc0FzUXVpY2tBc1Bvc3NpYmxlIClcbiAqXG4gKiBJdCB3b3VsZCBiZSBiZXR0ZXIgdGhhbjpcbiAqXG4gKiAgICBwcm9jZXNzLnN0YXJ0KClcbiAqICAgICAgICAgICAuYXRvbWljKCgpID0+IHN0ZXBBLnRoZW4oc3RlcEIpKVxuICpcbiAqICAgLy8gc29tZSB1cmdlbnQgZXZlbnQgb2NjdXJzXG4gKiAgIHByb2Nlc3Muc3RvcCgpXG4gKiAgICAgICAgICAuYXRvbWljKCBkb1RoaXNBc1F1aWNrQXNQb3NzaWJsZSApXG4gKlxuICogU2luY2UgaW4gdGhlIHNlY29uZCBleGFtcGxlIHRoZSBmaXJzdCBzdGVwIG9mIHRoZSAnc3RvcCcgcGhhc2UgbXVzdCB3YWl0XG4gKiBib3RoIHRoZSBzdGVwQSAmIHN0ZXBCLCB3aGlsZSBpbiB0aGUgZmlyc3Qgb25lIGl0IG9ubHkgbmVlZHMgdG8gd2FpdCBzdGVwQS5cbiAqIEhvd2V2ZXIsIHRoaXMgZGVwZW5kcyBvbiB3aGljaCBhdG9taWMgb3BlcmF0aW9ucyBpcyBuZWVkZWQuXG4gKlxuICogTmV2ZXJ0aGVsZXNzLCB1c2VyIGlzIGFibGUgdG8gbWFrZSB0aGUgc3RlcHMgJ2ludGVycnVwdGlibGUnIHZpYSBzb21lIHNwZWNpYWxcbiAqIG1ldGhvZHMgb2YgdGhlIHByb2Nlc3MuIFRoYXQgaXMsIHRvIG1vbml0b3IgdGhlIHBoYXNlIGNoYW5nZXMgdG8gbnVsbGlmeSB0aGVcbiAqIHN0ZXA6XG4gKlxuICogICAgdmFyIHByb2Nlc3MgPSBuZXcgUHJvY2VzcygpO1xuICogICAgcHJvY2Vzcy5zdGFydCgpXG4gKiAgICAgIC5uZXh0KCgpID0+IHtcbiAqICAgICAgICB2YXIgcGhhc2VTaGlmdGVkID0gZmFsc2U7XG4gKiAgICAgICAgcHJvY2Vzcy51bnRpbCgnc3RvcCcpXG4gKiAgICAgICAgICAubmV4dCgoKSA9PiB7cGhhc2VTaGlmdGVkID0gdHJ1ZTt9KTtcbiAqICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHIsIHJqKSA9PiB7XG4gKiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAqICAgICAgICAgICAgaWYgKHBoYXNlU2hpZnRlZCkgeyBjb25zb2xlLmxvZygnZG8gbm90aGluZycpOyB9XG4gKiAgICAgICAgICAgIGVsc2UgICAgICAgICAgICAgIHsgY29uc29sZS5sb2coJ2RvIHNvbWV0aGluZycpOyB9XG4gKiAgICAgICAgICB9LCAxMDAwKVxuICogICAgICAgIH0pO1xuICogICAgICB9KVxuICpcbiAqICAgLy8gc29tZSB1cmdlbnQgZXZlbnQgb2NjdXJzXG4gKiAgIHByb2Nlc3Muc3RvcCgpXG4gKiAgICAgICAgICAubmV4dCggZG9UaGlzQXNRdWlja0FzUG9zc2libGUgKVxuICpcbiAqIFNvIHRoYXQgdGhlIGZpcnN0IHN0ZXAgb2YgdGhlICdzdG9wJyBwaGFzZSB3b3VsZCBleGVjdXRlIGltbWVkaWF0ZWx5IGFmdGVyXG4gKiB0aGUgcGhhc2Ugc2hpZnRlZCwgc2luY2UgdGhlIGxhc3Qgc3RlcCBvZiB0aGUgcHJldmlvdXMgcGhhc2UgYWJvcnRlZCBpdHNlbGYuXG4gKiBJbiBmdXR1cmUgdGhlIHRyaWNrIHRvIG51bGxpZnkgdGhlIGxhc3Qgc3RlcCBtYXkgYmUgaW5jbHVkZWQgaW4gYXMgYSBtZXRob2RcbiAqIG9mIFByb2Nlc3MsIGJ1dCBjdXJyZW50bHkgdGhlIG1hbnVhbCBkZXRlY3RpbmcgaXMgc3RpbGwgbmVjZXNzYXJ5LlxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBQcm9jZXNzKCkge1xuICB0aGlzLl9ydW50aW1lID0gbmV3IFJ1bnRpbWUoKTtcbiAgdGhpcy5faW50ZXJmYWNlID0gbmV3IEludGVyZmFjZSh0aGlzLl9ydW50aW1lKTtcbiAgcmV0dXJuIHRoaXMuX2ludGVyZmFjZTtcbn1cblxuLyoqXG4gKiBCZWNhdXNlIERSWS5cbiAqL1xuUHJvY2Vzcy5kZWZlciA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcmVzb2x2ZSwgcmVqZWN0O1xuICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXMsIHJlaikgPT4ge1xuICAgIHJlc29sdmUgPSByZXM7XG4gICAgcmVqZWN0ID0gcmVqO1xuICB9KTtcbiAgdmFyIHJlc3VsdCA9IHtcbiAgICAncmVzb2x2ZSc6IHJlc29sdmUsXG4gICAgJ3JlamVjdCc6IHJlamVjdCxcbiAgICAncHJvbWlzZSc6IHByb21pc2VcbiAgfTtcbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qIFN0YXRpYyB2ZXJzaW9uIGZvciBtaW1pY2tpbmcgUHJvbWlzZS5hbGwgKi9cblByb2Nlc3Mud2FpdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcHJvY2VzcyA9IG5ldyBQcm9jZXNzKCk7XG4gIHJldHVybiBwcm9jZXNzLnN0YXJ0KCkud2FpdC5hcHBseShwcm9jZXNzLCBhcmd1bWVudHMpO1xufTtcblxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9idWlsZF9zdGFnZS9zcmMvcHJvY2Vzcy9wcm9jZXNzLmpzXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgeyBMYW5ndWFnZSB9IGZyb20gJ3NyYy9ydW5lL2xhbmd1YWdlLmpzJztcblxuLyoqXG4gKiBUaGlzIGxhbmd1YWdlIGludGVyZmFjZSB3b3VsZCBwcm92aWRlIGNhbGxhYmxlIG1ldGhvZHMgb2YgdGhlIFByb2Nlc3MgZURTTC5cbiAqXG4gKiBUaGUgZGlmZmVyZW5jZSBiZXR3ZWVuIGludGVyZmFuY2UgJiBydW50aW1lIGlzOlxuICpcbiAqICBJbnRlcmZhY2U6IG1hbmFnZSB0aGUgc3RhY2sgYW5kIHByb3ZpZGVzIGFuYWx5emVycyBpZiBpdCdzIG5lY2Vzc2FyeS5cbiAqICBSdW50aW1lOiBldmFsdWF0ZSBldmVyeSBjaGFuZ2UgKG5vZGUpIG9mIHRoZSBzdGFjay5cbiAqXG4gKiBTbyB0aGlzIGludGVyZmFjZSB3b3VsZCBjaGVjayBpZiB0aGVyZSBhcmUgYW55ICdzeW50YXgnIGVycm9yIGR1cmluZyBjb21wb3NlXG4gKiB0aGUgZURTTCBpbnN0YW5jZS4gRm9yIGV4YW1wbGUsIHRoZSBhbmFseXplciBvZiB0aGUgaW50ZXJmYWNlIGNvdWxkIHJlcG9ydFxuICogdGhpcyBraW5kIG9mIGVycm9yOlxuICpcbiAqICBwcm9jZXNzLnN0b3AoKS5zdGFydCgpLm5leHQoKTsgICAgLy8gRVJST1I6ICdzdG9wJyBiZWZvcmUgJ3N0YXJ0J1xuICpcbiAqIEFuZCBzaW5jZSB0aGUgaW50ZXJmYWNlIHdvdWxkIG5vdCBldmFsdWF0ZSBub2RlcywgaXQgd291bGQgZm9yd2FyZCBzdGFja1xuICogY2hhbmdlcyB0byB0aGUgcnVudGltZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEludGVyZmFjZShydW50aW1lKSB7XG4gIC8vIFJlcXVpcmVkIGJ5IHRoZSAnTGFuZ3VhZ2UnIG1vZHVsZS5cbiAgdGhpcy5jb250ZXh0ID0ge1xuICAgIHN0YXJ0ZWQ6IGZhbHNlLFxuICAgIHN0b3BwZWQ6IGZhbHNlXG4gIH07XG4gIHRoaXMuc3RhY2sgPSBbXTtcbiAgdGhpcy5fcnVudGltZSA9IHJ1bnRpbWU7XG4gIHRoaXMuX2V2YWx1YXRvciA9IChuZXcgTGFuZ3VhZ2UuRXZhbHVhdGUoKSlcbiAgICAuYW5hbHl6ZXIodGhpcy5fYW5hbHl6ZU9yZGVyLmJpbmQodGhpcykpXG4gICAgLmludGVycHJldGVyKHRoaXMuX2ludGVycHJldC5iaW5kKHRoaXMpKTtcbn1cblxuSW50ZXJmYWNlLnByb3RvdHlwZS5zdGFydCA9IExhbmd1YWdlLmRlZmluZSgnc3RhcnQnLCAnYmVnaW4nKTtcbkludGVyZmFjZS5wcm90b3R5cGUuc3RvcCA9IExhbmd1YWdlLmRlZmluZSgnc3RvcCcsICdwdXNoJyk7XG5JbnRlcmZhY2UucHJvdG90eXBlLmRlc3Ryb3kgPSBMYW5ndWFnZS5kZWZpbmUoJ2Rlc3Ryb3knLCAncHVzaCcpO1xuSW50ZXJmYWNlLnByb3RvdHlwZS5uZXh0ID0gTGFuZ3VhZ2UuZGVmaW5lKCduZXh0JywgJ3B1c2gnKTtcbkludGVyZmFjZS5wcm90b3R5cGUuc2hpZnQgPSBMYW5ndWFnZS5kZWZpbmUoJ3NoaWZ0JywgJ3B1c2gnKTtcbkludGVyZmFjZS5wcm90b3R5cGUucmVzY3VlID0gTGFuZ3VhZ2UuZGVmaW5lKCdyZXNjdWUnLCAncHVzaCcpO1xuSW50ZXJmYWNlLnByb3RvdHlwZS53YWl0ID0gTGFuZ3VhZ2UuZGVmaW5lKCd3YWl0JywgJ3B1c2gnKTtcblxuLy8gSXQncyBub3QgYSBtZXRob2Qgb3ducyBzZW1hbnRpY3MgbWVhbmluZyBvZiB0aGUgZURTTCwgYnV0IGEgbWV0aG9kXG4vLyBpbnRlcmFjdHMgd2l0aCB0aGUgbWV0YWxhbmdhdWdlLCBzbyBkZWZpbmUgaXQgaW4gdGhpcyB3YXkuXG5JbnRlcmZhY2UucHJvdG90eXBlLnVudGlsID1cbmZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5fcnVudGltZS51bnRpbC5hcHBseSh0aGlzLl9ydW50aW1lLCBhcmd1bWVudHMpO1xufTtcblxuSW50ZXJmYWNlLnByb3RvdHlwZS5vbmNoYW5nZSA9IGZ1bmN0aW9uKGNvbnRleHQsIG5vZGUsIHN0YWNrKSB7XG4gIC8vIFdoZW4gaXQncyBjaGFuZ2VkLCBldmFsdWF0ZSBpdCB3aXRoIGFuYWx5emVycyAmIGludGVycHJldGVyLlxuICByZXR1cm4gdGhpcy5fZXZhbHVhdG9yKGNvbnRleHQsIG5vZGUsIHN0YWNrKTtcbn07XG5cbkludGVyZmFjZS5wcm90b3R5cGUuX2ludGVycHJldCA9IGZ1bmN0aW9uKGNvbnRleHQsIG5vZGUsIHN0YWNrKSB7XG4gIC8vIFdlbGwgaW4gdGhpcyBlRFNMIHdlIGRlbGVnYXRlIHRoZSBpbnRlcnByZXRpb24gdG8gdGhlIHJ1bnRpbWUuXG4gIHJldHVybiB0aGlzLl9ydW50aW1lLm9uY2hhbmdlLmFwcGx5KHRoaXMuX3J1bnRpbWUsIGFyZ3VtZW50cyk7XG59O1xuXG4vLyBJbiB0aGlzIGVEU0wgd2Ugbm93IG9ubHkgaGF2ZSB0aGlzIGFuYWx5emVyLiBDb3VsZCBhZGQgbW9yZSBhbmQgcmVnaXN0ZXIgaXRcbi8vIGluIHRoZSBjb250cnVjdGlvbiBvZiAndGhpcy5fZXZhbHVhdG9yJy5cbkludGVyZmFjZS5wcm90b3R5cGUuX2FuYWx5emVPcmRlciA9IGZ1bmN0aW9uKGNvbnRleHQsIGNoYW5nZSwgc3RhY2spIHtcbiAgaWYgKCdzdGFydCcgPT09IGNoYW5nZS50eXBlKSB7XG4gICAgY29udGV4dC5zdGFydGVkID0gdHJ1ZTtcbiAgfSBlbHNlIGlmICgnc3RvcCcpIHtcbiAgICBjb250ZXh0LnN0b3BwZWQgPSB0cnVlO1xuICB9XG4gIGlmICgnc3RhcnQnID09PSBjaGFuZ2UudHlwZSAmJiBjb250ZXh0LnN0b3BwZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Nob3VsZCBub3Qgc3RhcnQgYSBwcm9jZXNzIGFnYWluJyArXG4gICAgICAgICdhZnRlciBpdFxcJ3MgYWxyZWFkeSBzdG9wcGVkJyk7XG4gIH0gZWxzZSBpZiAoJ25leHQnID09PSBjaGFuZ2UudHlwZSAmJiAhY29udGV4dC5zdGFydGVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdTaG91bGQgbm90IGNvbmNhdCBzdGVwcyB3aGlsZSBpdFxcJ3Mgbm90IHN0YXJ0ZWQnKTtcbiAgfSBlbHNlIGlmICgnc3RvcCcgPT09IGNoYW5nZS50eXBlICYmICFjb250ZXh0LnN0YXJ0ZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Nob3VsZCBub3Qgc3RvcCBhIHByb2Nlc3MgYmVmb3JlIGl0XFwncyBzdGFydGVkJyk7XG4gIH1cbn07XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL2J1aWxkX3N0YWdlL3NyYy9wcm9jZXNzL2ludGVyZmFjZS5qc1xuICoqLyIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0IGZ1bmN0aW9uIFJ1bnRpbWUoKSB7XG4gIHRoaXMuc3RhdGVzID0ge1xuICAgIHBoYXNlOiBudWxsLFxuICAgIGN1cnJlbnRQcm9taXNlOiBudWxsLFxuICAgIHVudGlsOiB7XG4gICAgICByZXNvbHZlcjogbnVsbCxcbiAgICAgIHBoYXNlOiBudWxsXG4gICAgfSxcbiAgICAvLyBAc2VlOiAjbmV4dFxuICAgIHN0ZXBSZXN1bHRzOiBbXSxcbiAgfTtcbiAgdGhpcy5kZWJ1Z2dpbmcgPSB7XG4gICAgLy8gQHNlZTogI25leHRcbiAgICBjdXJyZW50UGhhc2VTdGVwczogMCxcbiAgICBjb2xvcnM6IHRoaXMuZ2VuZXJhdGVEZWJ1Z2dpbmdDb2xvcigpLFxuICAgIHRydW5jYXRpbmdMaW1pdDogNjRcbiAgfTtcbiAgdGhpcy5jb25maWdzID0ge1xuICAgIGRlYnVnOiBmYWxzZVxuICB9O1xufVxuXG4vKipcbiAqIFdoZW4gdGhlIHN0YWNrIG9mIERTTCBjaGFuZ2VzLCBldmFsdWF0ZSB0aGUgTGFuZ3VhZ2UuTm9kZS5cbiAqIE5vdGU6IHNpbmNlIGluIHRoaXMgRFNMIHdlIG5lZWRuJ3QgJ2V4aXQnIG5vZGUsIHdlIGRvbid0IGhhbmRsZSBpdC5cbiAqIEZvciBzb21lIG90aGVyIERTTCB0aGF0IG1heSByZXR1cm4gc29tZXRoaW5nLCB0aGUgJ2V4aXQnIG5vZGUgbXVzdFxuICoga2VlcCBhIGZpbmFsIHN0YWNrIHdpdGggb25seSByZXN1bHQgbm9kZSBpbnNpZGUgYXMgdGhlciByZXR1cm4gdmFsdWUuXG4gKi9cblJ1bnRpbWUucHJvdG90eXBlLm9uY2hhbmdlID0gZnVuY3Rpb24oaW5zdGFuY2UsIGNoYW5nZSwgc3RhY2spIHtcbiAgLy8gU2luY2Ugd2UgZG9uJ3QgbmVlZCB0byBrZWVwIHRoaW5ncyBpbiBzdGFjayB1bnRpbCB3ZSBoYXZlXG4gIC8vIHJlYWwgYW5hbHl6ZXJzLCB0aGUgJ29uY2hhbmdlJyBoYW5kbGVyIHdvdWxkIHJldHVybiBlbXB0eSBzdGFja1xuICAvLyB0byBsZXQgdGhlIGxhbmd1YWdlIHJ1bnRpbWUgY2xlYXIgdGhlIHN0YWNrIGV2ZXJ5IGluc3RydWN0aW9uLlxuICB0aGlzW2NoYW5nZS50eXBlXS5hcHBseSh0aGlzLCBjaGFuZ2UuYXJncyk7XG4gIHJldHVybiBbXTtcbn07XG5cblxuUnVudGltZS5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5zdGF0ZXMucGhhc2UgPSAnc3RhcnQnO1xuICB0aGlzLnN0YXRlcy5jdXJyZW50UHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSgpO1xufTtcblxuUnVudGltZS5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnNoaWZ0KCdzdGFydCcsICdzdG9wJyk7XG59O1xuXG5SdW50aW1lLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuc2hpZnQoJ3N0b3AnLCAnZGVzdHJveScpO1xufTtcblxuUnVudGltZS5wcm90b3R5cGUuc2hpZnQgPSBmdW5jdGlvbihwcmV2LCBjdXJyZW50KSB7XG4gIC8vIEFscmVhZHkgaW4uXG4gIGlmIChjdXJyZW50ID09PSB0aGlzLnN0YXRlcy5waGFzZSkge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAocHJldiAhPT0gdGhpcy5zdGF0ZXMucGhhc2UpIHtcbiAgICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IoYE11c3QgYmUgJHtwcmV2fSBiZWZvcmUgc2hpZnQgdG8gJHtjdXJyZW50fSxcbiAgICAgICAgICAgICAgICAgICAgIGJ1dCBub3cgaXQncyAke3RoaXMuc3RhdGVzLnBoYXNlfWApO1xuICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgIHRocm93IGVycm9yO1xuICB9XG4gIHRoaXMuc3RhdGVzLnBoYXNlID0gY3VycmVudDtcbiAgaWYgKHRoaXMudW50aWwucGhhc2UgPT09IHRoaXMuc3RhdGVzLnBoYXNlKSB7XG4gICAgdGhpcy51bnRpbC5yZXNvbHZlcigpO1xuICB9XG4gIC8vIENvbmNhdCBuZXcgc3RlcCB0byBzd2l0Y2ggdG8gdGhlICduZXh0IHByb21pc2UnLlxuICB0aGlzLnN0YXRlcy5jdXJyZW50UHJvbWlzZSA9XG4gIHRoaXMuc3RhdGVzLmN1cnJlbnRQcm9taXNlLmNhdGNoKChlcnIpID0+IHtcbiAgICBpZiAoIShlcnIgaW5zdGFuY2VvZiBSdW50aW1lLkludGVycnVwdEVycm9yKSkge1xuICAgICAgLy8gV2UgbmVlZCB0byByZS10aHJvdyBpdCBhZ2FpbiBhbmQgYnlwYXNzIHRoZSB3aG9sZVxuICAgICAgLy8gcGhhc2UsIHVudGlsIHRoZSBuZXh0IHBoYXNlIChmaW5hbCBwaGFzZSkgdG9cbiAgICAgIC8vIGhhbmRsZSBpdC4gU2luY2UgaW4gUHJvbWlzZSwgc3RlcHMgYWZ0ZXIgY2F0Y2ggd291bGRcbiAgICAgIC8vIG5vdCBiZSBhZmZlY3RlZCBieSB0aGUgY2F0Y2hlZCBlcnJvciBhbmQga2VlcCBleGVjdXRpbmcuXG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICAgIC8vIEFuZCBpZiBpdCdzIGFuIGludGVycnVwdCBlcnJvciB3ZSBkbyBub3RoaW5nLCBzbyB0aGF0IGl0IHdvdWxkXG4gICAgLy8gbWFrZSB0aGUgY2hhaW4gb21pdCB0aGlzIGVycm9yIGFuZCBleGVjdXRlIHRoZSBmb2xsb3dpbmcgc3RlcHMuXG4gIH0pO1xuICAvLyBBdCB0aGUgbW9tZW50IG9mIHNoaWZ0aW5nLCB0aGVyZSBhcmUgbm8gc3RlcHMgYmVsb25nIHRvIHRoZSBuZXcgcGhhc2UuXG4gIHRoaXMuZGVidWdnaW5nLmN1cnJlbnRQaGFzZVN0ZXBzID0gMDtcbn07XG5cbi8qKlxuICogUmV0dXJuIGEgUHJvbWlzZSB0aGF0IG9ubHkgYmUgcmVzb2x2ZWQgd2hlbiB3ZSBnZXQgc2hpZmVkIHRvIHRoZVxuICogdGFyZ2V0IHBoYXNlLlxuICovXG5SdW50aW1lLnByb3RvdHlwZS51bnRpbCA9IGZ1bmN0aW9uKHBoYXNlKSB7XG4gIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlcykgPT4ge1xuICAgIHRoaXMuc3RhdGVzLnVudGlsLnJlc29sdmVyID0gcmVzO1xuICB9KTtcbiAgcmV0dXJuIHByb21pc2U7XG59O1xuXG4vKipcbiAqIFRoZSAnc3RlcCcgY2FuIG9ubHkgYmUgYSBmdW5jdGlvbiByZXR1cm4gUHJvbWlzZS9Qcm9jZXNzL3BsYWluIHZhbHVlLlxuICogTm8gbWF0dGVyIGEgUHJvbWlzZSBvciBQcm9jZXNzIGl0IHdvdWxkIHJldHVybixcbiAqIHRoZSBjaGFpbiB3b3VsZCBjb25jYXQgaXQgYXMgdGhlIFByb21pc2UgcnVsZS5cbiAqIElmIGl0J3MgcGxhaW4gdmFsdWUgdGhlbiB0aGlzIHByb2Nlc3Mgd291bGQgaWdub3JlIGl0LCBhc1xuICogd2hhdCBhIFByb21pc2UgZG9lcy5cbiAqXG4gKiBBYm91dCB0aGUgcmVzb2x2aW5nIHZhbHVlczpcbiAqXG4gKiAubmV4dCggZm5SZXNvbHZlQSwgZm5SZXNvbHZlQiApICAtLT4gI3NhdmUgW2EsIGJdIGluIHRoaXMgcHJvY2Vzc1xuICogLm5leHQoIGZuUmVzb2x2ZUMgKSAgICAgICAgICAgICAgLS0+ICNyZWNlaXZlIFthLCBiXSBhcyBmaXJzdCBhcmd1bWVudFxuICogLm5leHQoIGZuUmVzb2x2ZUQgKSAgICAgICAgICAgICAgLS0+ICNyZWNlaXZlIGMgYXMgZmlyc3QgYXJndW1lbnRcbiAqIC5uZXh0KCBmblJlc29sdmVFLCBmblJlc29sdmVGKSAgIC0tPiAjZWFjaCBvZiB0aGVtIHJlY2VpdmUgZCBhcyBhcmd1bWVudFxuICovXG5SdW50aW1lLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24oLi4udGFza3MpIHtcbiAgaWYgKCF0aGlzLnN0YXRlcy5jdXJyZW50UHJvbWlzZSkge1xuICAgIHRocm93IG5ldyBFcnJvcignUHJvY2VzcyBzaG91bGQgaW5pdGlhbGl6ZSB3aXRoIHRoZSBgc3RhcnRgIG1ldGhvZCcpO1xuICB9XG4gIC8vIEF0IGRlZmluaXRpb24gc3RhZ2UsIHNldCBpdCdzIHBoYXNlLlxuICAvLyBBbmQgY2hlY2sgaWYgaXQncyBhIGZ1bmN0aW9uLlxuICB0YXNrcy5mb3JFYWNoKCh0YXNrKSA9PiB7XG4gICAgaWYgKCdmdW5jdGlvbicgIT09IHR5cGVvZiB0YXNrKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZSB0YXNrIGlzIG5vdCBhIGZ1bmN0aW9uOiAke3Rhc2t9YCk7XG4gICAgfVxuICAgIHRhc2sucGhhc2UgPSB0aGlzLnN0YXRlcy5waGFzZTtcbiAgICBpZiAodGhpcy5jb25maWdzLmRlYnVnKSB7XG4gICAgICAvLyBNdXN0IGFwcGVuZCBzdGFjayBpbmZvcm1hdGlvbiBoZXJlIHRvIGxldCBkZWJ1Z2dlciBvdXRwdXRcbiAgICAgIC8vIGl0J3MgZGVmaW5lZCBpbiB3aGVyZS5cbiAgICAgIHRhc2sudHJhY2luZyA9IHtcbiAgICAgICAgc3RhY2s6IChuZXcgRXJyb3IoKSkuc3RhY2tcbiAgICAgIH07XG4gICAgfVxuICB9KTtcblxuICAvLyBGaXJzdCwgY29uY2F0IGEgJ3RoZW4nIHRvIGNoZWNrIGludGVycnVwdC5cbiAgdGhpcy5zdGF0ZXMuY3VycmVudFByb21pc2UgPVxuICAgIHRoaXMuc3RhdGVzLmN1cnJlbnRQcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgLy8gV291bGQgY2hlY2s6IGlmIHRoZSBwaGFzZSBpdCBiZWxvbmdzIHRvIGlzIG5vdCB3aGF0IHdlJ3JlIGluLFxuICAgICAgLy8gdGhlIHByb2Nlc3MgbmVlZCB0byBiZSBpbnRlcnJwdXRlZC5cbiAgICAgIGZvciAodmFyIHRhc2sgb2YgdGFza3MpIHtcbiAgICAgICAgaWYgKHRoaXMuY2hlY2tJbnRlcnJ1cHQodGFzaykpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgUnVudGltZS5JbnRlcnJ1cHRFcnJvcigpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgLy8gUmVhZCBpdCBhczpcbiAgLy8gMS4gZXhlY3V0ZSBhbGwgdGFza3MgdG8gZ2VuZXJhdGUgcmVzb2x2YWJsZS1wcm9taXNlc1xuICAvLyAyLiBQcm9taXNlLmFsbCguLi4pIHRvIHdhaXQgdGhlc2UgcmVzb2x2YWJsZS1wcm9taXNlc1xuICAvLyAzLiBhcHBlbmQgYSBnZW5lcmFsIGVycm9yIGhhbmRsZXIgYWZ0ZXIgdGhlIFByb21pc2UuYWxsXG4gIC8vICAgIHNvIHRoYXQgaWYgYW55IGVycm9yIG9jY3VycyBpdCB3b3VsZCBwcmludCB0aGVtIG91dFxuICAvLyBTbywgaW5jbHVkaW5nIHRoZSBjb2RlIGFib3ZlLCB3ZSB3b3VsZCBoYXZlOlxuICAvL1xuICAvLyBjdXJyZW50UHJvbWlzZSB7XG4gIC8vICBbY2hlY2tJbnRlcnJ1cHQodGFza3MpXVxuICAvLyAgW1Byb21pc2UuYWxsKFt0YXNrQTEsIHRhc2tBMi4uLl0pXVxuICAvLyAgW2Vycm9yIGhhbmRsZXJdICt9XG4gIC8vXG4gIC8vIFRoZSAnY2hlY2tJbnRlcnJ1cHQnIGFuZCAnZXJyb3IgaGFuZGxlcicgd3JhcCB0aGUgYWN0dWFsIHN0ZXBzXG4gIC8vIHRvIGRvIHRoZSBuZWNlc3NhcnkgY2hlY2tzLlxuICB0aGlzLnN0YXRlcy5jdXJyZW50UHJvbWlzZSA9XG4gICAgdGhpcy5zdGF0ZXMuY3VycmVudFByb21pc2UudGhlbigoKSA9PiB0aGlzLmdlbmVyYXRlU3RlcCh0YXNrcykpO1xuICB0aGlzLnN0YXRlcy5jdXJyZW50UHJvbWlzZSA9XG4gICAgdGhpcy5zdGF0ZXMuY3VycmVudFByb21pc2UuY2F0Y2godGhpcy5nZW5lcmF0ZUVycm9yTG9nZ2VyKHtcbiAgICAgICdudGgtc3RlcCc6IHRoaXMuZGVidWdnaW5nLmN1cnJlbnRQaGFzZVN0ZXBzXG4gICAgfSkpO1xuXG4gIC8vIEEgd2F5IHRvIGtub3cgaWYgdGhlc2UgdGFza3MgaXMgdGhlIGZpcnN0IHN0ZXBzIGluIHRoZSBjdXJyZW50IHBoYXNlLFxuICAvLyBhbmQgaXQncyBhbHNvIGNvbnZlbmllbnQgZm9yIGRlYnVnZ2luZy5cbiAgdGhpcy5kZWJ1Z2dpbmcuY3VycmVudFBoYXNlU3RlcHMgKz0gMTtcblxufTtcblxuUnVudGltZS5wcm90b3R5cGUucmVzY3VlID0gZnVuY3Rpb24oaGFuZGxlcikge1xuICB0aGlzLnN0YXRlcy5jdXJyZW50UHJvbWlzZSA9XG4gICAgdGhpcy5zdGF0ZXMuY3VycmVudFByb21pc2UuY2F0Y2goKGVycikgPT4ge1xuICAgIGlmIChlcnIgaW5zdGFuY2VvZiBSdW50aW1lLkludGVycnVwdEVycm9yKSB7XG4gICAgICAvLyBPbmx5IGJ1aWx0LWluIHBoYXNlIHRyYW5zZmVycmluZyBjYXRjaCBjYW4gaGFuZGxlIGludGVycnVwdHMuXG4gICAgICAvLyBSZS10aHJvdyBpdCB1bnRpbCB3ZSByZWFjaCB0aGUgZmluYWwgY2F0Y2ggd2Ugc2V0LlxuICAgICAgdGhyb3cgZXJyO1xuICAgIH0gZWxzZSB7XG4gICAgICBoYW5kbGVyKGVycik7XG4gICAgfVxuICB9KTtcbn07XG5cbi8qKlxuICogQW4gaW50ZXJmYWNlIHRvIGV4cGxpY2l0bHkgcHV0IG11bHRpcGxlIHRhc2tzIGV4ZWN1dGUgYXQgb25lIHRpbWUuXG4gKiovXG5SdW50aW1lLnByb3RvdHlwZS53YWl0ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMubmV4dC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcblxuLyoqXG4gKiBFeGVjdXRlIHRhc2sgYW5kIGdldCBQcm9taXNlcyBvciBwbGFpbiB2YWx1ZXMgdGhlbSByZXR1cm4sXG4gKiBhbmQgdGhlbiByZXR1cm4gdGhlIHdyYXBwZWQgUHJvbWlzZSBhcyB0aGUgbmV4dCBzdGVwIG9mIHRoaXNcbiAqIHByb2Nlc3MuIFRoZSBuYW1lICdzdGVwJyBpbmRpY2F0ZXMgdGhlIGdlbmVyYXRlZCBQcm9taXNlLFxuICogd2hpY2ggaXMgb25lIHN0ZXAgb2YgdGhlIG1haW4gUHJvbWlzZSBvZiB0aGUgY3VycmVudCBwaGFzZS5cbiAqL1xuUnVudGltZS5wcm90b3R5cGUuZ2VuZXJhdGVTdGVwID0gZnVuY3Rpb24odGFza3MpIHtcbiAgLy8gJ3Rhc2tSZXN1bHRzJyBtZWFucyB0aGUgcmVzdWx0cyBvZiB0aGUgdGFza3MuXG4gIHZhciB0YXNrUmVzdWx0cyA9IFtdO1xuICBpZiAodHJ1ZSA9PT0gdGhpcy5jb25maWdzLmRlYnVnKSB7XG4gICAgdGhpcy50cmFjZSh0YXNrcyk7XG4gIH1cblxuICAvLyBTbyB3ZSB1bndyYXAgdGhlIHRhc2sgZmlyc3QsIGFuZCB0aGVuIHB1dCBpdCBpbiB0aGUgYXJyYXkuXG4gIC8vIFNpbmNlIHdlIG5lZWQgdG8gZ2l2ZSB0aGUgJ2N1cnJlbnRQcm9taXNlJyBhIGZ1bmN0aW9uIGFzIHdoYXQgdGhlXG4gIC8vIHRhc2tzIGdlbmVyYXRlIGhlcmUuXG4gIHZhciBjaGFpbnMgPSB0YXNrcy5tYXAoKHRhc2spID0+IHtcbiAgICAvLyBSZXNldCB0aGUgcmVnaXN0ZXJlZCByZXN1bHRzLlxuICAgIC8vICdwcmV2aW91c1Jlc3VsdHMnIG1lYW5zIHRoZSByZXN1bHRzIGxlZnQgYnkgdGhlIHByZXZpb3VzIHN0ZXAuXG4gICAgdmFyIHByZXZpb3VzUmVzdWx0cyA9IHRoaXMuc3RhdGVzLnN0ZXBSZXN1bHRzO1xuICAgIHZhciBjaGFpbjtcbiAgICAvLyBJZiBpdCBoYXMgbXVsdGlwbGUgcmVzdWx0cywgbWVhbnMgaXQncyBhIHRhc2sgZ3JvdXBcbiAgICAvLyBnZW5lcmF0ZWQgcmVzdWx0cy5cbiAgICBpZiAocHJldmlvdXNSZXN1bHRzLmxlbmd0aCA+IDEpIHtcbiAgICAgIGNoYWluID0gdGFzayhwcmV2aW91c1Jlc3VsdHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjaGFpbiA9IHRhc2socHJldmlvdXNSZXN1bHRzWzBdKTtcbiAgICB9XG4gICAgLy8gT3JkaW5hcnkgZnVuY3Rpb24gcmV0dXJucyAndW5kZWZpbmUnIG9yIG90aGVyIHRoaW5ncy5cbiAgICBpZiAoIWNoYWluKSB7XG4gICAgICAvLyBJdCdzIGEgcGxhaW4gdmFsdWUuXG4gICAgICAvLyBTdG9yZSBpdCBhcyBvbmUgb2YgcmVzdWx0cy5cbiAgICAgIHRhc2tSZXN1bHRzLnB1c2goY2hhaW4pO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShjaGFpbik7XG4gICAgfVxuXG4gICAgLy8gSXQncyBhIFByb2Nlc3MuXG4gICAgaWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgY2hhaW4uX3J1bnRpbWUgJiZcbiAgICAgICAgY2hhaW4uX3J1bnRpbWUgaW5zdGFuY2VvZiBSdW50aW1lKSB7XG4gICAgICAvLyBQcmVtaXNlOiBpdCdzIGEgc3RhcnRlZCBwcm9jZXNzLlxuICAgICAgcmV0dXJuIGNoYWluLl9ydW50aW1lLnN0YXRlcy5jdXJyZW50UHJvbWlzZS50aGVuKCgpID0+IHtcbiAgICAgICAgdmFyIGd1ZXN0UmVzdWx0cyA9IGNoYWluLl9ydW50aW1lLnN0YXRlcy5zdGVwUmVzdWx0cztcbiAgICAgICAgLy8gU2luY2Ugd2UgaW1wbGljaXRseSB1c2UgJ1Byb21pc2UuYWxsJyB0byBydW5cbiAgICAgICAgLy8gbXVsdGlwbGUgdGFza3MgaW4gb25lIHN0ZXAsIHdlIG5lZWQgdG8gZGV0ZXJtaW5hdGUgaWZcbiAgICAgICAgLy8gdGhlcmUgaXMgb25seSBvbmUgdGFzayBpbiB0aGUgdGFzaywgb3IgaXQgYWN0dWFsbHkgaGFzIG11bHRpcGxlXG4gICAgICAgIC8vIHJldHVybiB2YWx1ZXMgZnJvbSBtdWx0aXBsZSB0YXNrcy5cbiAgICAgICAgaWYgKGd1ZXN0UmVzdWx0cy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgLy8gV2UgbmVlZCB0byB0cmFuc2ZlciB0aGUgcmVzdWx0cyBmcm9tIHRoZSBndWVzdCBQcm9jZXNzIHRvIHRoZVxuICAgICAgICAgIC8vIGhvc3QgUHJvY2Vzcy5cbiAgICAgICAgICB0YXNrUmVzdWx0cyA9IHRhc2tSZXN1bHRzLnB1c2goZ3Vlc3RSZXN1bHRzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0YXNrUmVzdWx0cy5wdXNoKGNoYWluLl9ydW50aW1lLnN0YXRlcy5zdGVwUmVzdWx0c1swXSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoY2hhaW4udGhlbikge1xuICAgICAgLy8gT3JkaW5hcnkgcHJvbWlzZSBjYW4gYmUgY29uY2F0ZWQgaW1tZWRpYXRlbHkuXG4gICAgICByZXR1cm4gY2hhaW4udGhlbigocmVzb2x2ZWRWYWx1ZSkgPT4ge1xuICAgICAgICB0YXNrUmVzdWx0cy5wdXNoKHJlc29sdmVkVmFsdWUpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEl0J3MgYSBwbGFpbiB2YWx1ZS5cbiAgICAgIC8vIFN0b3JlIGl0IGFzIG9uZSBvZiByZXN1bHRzLlxuICAgICAgdGFza1Jlc3VsdHMucHVzaChjaGFpbik7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGNoYWluKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gUHJvbWlzZS5hbGwoY2hhaW5zKS50aGVuKCgpID0+IHtcbiAgICAvLyBCZWNhdXNlIGluIHRoZSBwcmV2aW91cyAnYWxsJyB3ZSBlbnN1cmUgYWxsIHRhc2tzIGFyZSBleGVjdXRlZCxcbiAgICAvLyBhbmQgdGhlIHJlc3VsdHMgb2YgdGhlc2UgdGFza3MgYXJlIGNvbGxlY3RlZCwgc28gd2UgbmVlZFxuICAgIC8vIHRvIHJlZ2lzdGVyIHRoZW0gYXMgdGhlIGxhc3QgcmVzdWx0cyBvZiB0aGUgbGFzdCBzdGVwLlxuICAgIHRoaXMuc3RhdGVzLnN0ZXBSZXN1bHRzID0gdGFza1Jlc3VsdHM7XG4gIH0pO1xufTtcblxuLyoqIFdlIG5lZWQgdGhpcyB0byBwcmV2ZW50IHRoZSBzdGVwKCkgdGhyb3cgZXJyb3JzLlxuKiBJbiB0aGlzIGNhdGNoLCB3ZSBkaXN0aW5ndWlzaCB0aGUgaW50ZXJydXB0IGFuZCBvdGhlciBlcnJvcnMsXG4qIGFuZCB0aGVuIGJ5cGFzcyB0aGUgZm9ybWVyIGFuZCBwcmludCB0aGUgbGF0ZXIgb3V0LlxuKlxuKiBUaGUgZmluYWwgZmF0ZSBvZiB0aGUgcmVhbCBlcnJvcnMgaXMgaXQgd291bGQgYmUgcmUtdGhyb3cgYWdhaW5cbiogYWZ0ZXIgd2UgcHJpbnQgdGhlIGluc3RhbmNlIG91dC4gV2UgbmVlZCB0byBkbyB0aGF0IHNpbmNlIGFmdGVyIGFuXG4qIGVycm9yIHRoZSBwcm9taXNlIHNob3VsZG4ndCBrZWVwIGV4ZWN1dGluZy4gSWYgd2UgZG9uJ3QgdGhyb3cgaXRcbiogYWdhaW4sIHNpbmNlIHRoZSBlcnJvciBoYXMgYmVlbiBjYXRjaGVkLCB0aGUgcmVzdCBzdGVwcyBpbiB0aGVcbiogcHJvbWlzZSB3b3VsZCBzdGlsbCBiZSBleGVjdXRlZCwgYW5kIHRoZSB1c2VyLXNldCByZXNjdWVzIHdvdWxkXG4qIG5vdCBjYXRjaCB0aGlzIGVycm9yLlxuKlxuKiBBcyBhIGNvbmNsdXNpb24sIG5vIG1hdHRlciB3aGV0aGVyIHRoZSBlcnJvciBpcyBhbiBpbnRlcnJ1cHQsXG4qIHdlIGFsbCBuZWVkIHRvIHRocm93IGl0IGFnYWluLiBUaGUgb25seSBkaWZmZXJlbmNlIGlzIGlmIGl0J3NcbiogYW5kIGludGVycnVwdCB3ZSBkb24ndCBwcmludCBpdCBvdXQuXG4qL1xuUnVudGltZS5wcm90b3R5cGUuZ2VuZXJhdGVFcnJvckxvZ2dlciA9IGZ1bmN0aW9uKGRlYnVnaW5mbykge1xuICByZXR1cm4gKGVycikgPT4ge1xuICAgIGlmICghKGVyciBpbnN0YW5jZW9mIFJ1bnRpbWUuSW50ZXJydXB0RXJyb3IpKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGBFUlJPUiBkdXJpbmcgIyR7ZGVidWdpbmZvWydudGgtc3RlcCddfVxuICAgICAgICAgIHN0ZXAgZXhlY3V0ZXM6ICR7ZXJyLm1lc3NhZ2V9YCwgZXJyKTtcbiAgICB9XG4gICAgdGhyb3cgZXJyO1xuICB9O1xufTtcblxuUnVudGltZS5wcm90b3R5cGUuY2hlY2tJbnRlcnJ1cHQgPSBmdW5jdGlvbihzdGVwKSB7XG4gIGlmIChzdGVwLnBoYXNlICE9PSB0aGlzLnN0YXRlcy5waGFzZSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cblJ1bnRpbWUucHJvdG90eXBlLmdlbmVyYXRlRGVidWdnaW5nQ29sb3IgPSBmdW5jdGlvbigpIHtcbiAgY29uc3QgY29sb3JzZXRzID0gW1xuICAgIHsgYmFja2dyb3VuZDogJ3JlZCcsIGZvcmVncm91bmQ6ICd3aGl0ZScgfSxcbiAgICB7IGJhY2tncm91bmQ6ICdncmVlbicsIGZvcmVncm91bmQ6ICd3aGl0ZScgfSxcbiAgICB7IGJhY2tncm91bmQ6ICdibHVlJywgZm9yZWdyb3VuZDogJ3doaXRlJyB9LFxuICAgIHsgYmFja2dyb3VuZDogJ3NhZGRsZUJyb3duJywgZm9yZWdyb3VuZDogJ3doaXRlJyB9LFxuICAgIHsgYmFja2dyb3VuZDogJ2N5YW4nLCBmb3JlZ3JvdW5kOiAnZGFya1NsYXRlR3JheScgfSxcbiAgICB7IGJhY2tncm91bmQ6ICdnb2xkJywgZm9yZWdyb3VuZDogJ2RhcmtTbGF0ZUdyYXknIH0sXG4gICAgeyBiYWNrZ3JvdW5kOiAncGFsZUdyZWVuJywgZm9yZWdyb3VuZDogJ2RhcmtTbGF0ZUdyYXknIH0sXG4gICAgeyBiYWNrZ3JvdW5kOiAncGx1bScsIGZvcmVncm91bmQ6ICdkYXJrU2xhdGVHcmF5JyB9XG4gIF07XG4gIHZhciBjb2xvcnNldCA9IGNvbG9yc2V0c1sgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY29sb3JzZXRzLmxlbmd0aCkgXTtcbiAgcmV0dXJuIGNvbG9yc2V0O1xufTtcblxuUnVudGltZS5wcm90b3R5cGUudHJhY2UgPSBmdW5jdGlvbih0YXNrcykge1xuICBpZiAoZmFsc2UgPT09IHRoaXMuY29uZmlncy5kZWJ1Zykge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgbG9nID0gdGFza3MucmVkdWNlKChtZXJnZWRNZXNzYWdlLCB0YXNrKSA9PiB7XG4gICAgdmFyIHNvdXJjZSA9IFN0cmluZy5zdWJzdHJpbmcodGFzay50b1NvdXJjZSgpLCAwLFxuICAgICAgdGhpcy5kZWJ1Z2dpbmcudHJ1bmNhdGluZ0xpbWl0KTtcbiAgICB2YXIgbWVzc2FnZSA9IGAgJHsgc291cmNlIH0gYDtcbiAgICByZXR1cm4gbWVyZ2VkTWVzc2FnZSArIG1lc3NhZ2U7XG4gIH0sIGAlYyAkeyB0YXNrc1swXS5waGFzZSB9IyR7IHRoaXMuZGVidWdnaW5nLmN1cnJlbnRQaGFzZVN0ZXBzIH0gfCBgKTtcbiAgLy8gRG9uJ3QgcHJpbnQgdGhvc2UgaW5oZXJpdGVkIGZ1bmN0aW9ucy5cbiAgdmFyIHN0YWNrRmlsdGVyID0gbmV3IFJlZ0V4cCgnXihHbGVpcG5pckJhc2ljfFByb2Nlc3N8U3RyZWFtKScpO1xuICB2YXIgc3RhY2sgPSB0YXNrc1swXS50cmFjaW5nLnN0YWNrLnNwbGl0KCdcXG4nKS5maWx0ZXIoKGxpbmUpID0+IHtcbiAgICByZXR1cm4gJycgIT09IGxpbmU7XG4gIH0pLmZpbHRlcigobGluZSkgPT4ge1xuICAgIHJldHVybiAhbGluZS5tYXRjaChzdGFja0ZpbHRlcik7XG4gIH0pLmpvaW4oJ1xcbicpO1xuXG4gIGxvZyA9IGxvZyArICcgfCBcXG5cXHInICsgc3RhY2s7XG4gIGNvbnNvbGUubG9nKGxvZywgJ2JhY2tncm91bmQtY29sb3I6ICcrIHRoaXMuZGVidWdnaW5nLmNvbG9ycy5iYWNrZ3JvdW5kICtcbiAgICAnOycgKyAnY29sb3I6ICcgKyB0aGlzLmRlYnVnZ2luZy5jb2xvcnMuZm9yZWdyb3VuZCk7XG59O1xuXG5SdW50aW1lLkludGVycnVwdEVycm9yID0gZnVuY3Rpb24obWVzc2FnZSkge1xuICB0aGlzLm5hbWUgPSAnSW50ZXJydXB0RXJyb3InO1xuICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlIHx8ICcnO1xufTtcblxuUnVudGltZS5JbnRlcnJ1cHRFcnJvci5wcm90b3R5cGUgPSBuZXcgRXJyb3IoKTtcblxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9idWlsZF9zdGFnZS9zcmMvcHJvY2Vzcy9ydW50aW1lLmpzXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgeyBTdGF0ZSBhcyBTdGF0ZUxvZ2dlciB9IGZyb20gJ3NyYy9sb2dnZXIvc3RhdGUuanMnO1xuXG4vKipcbiAqIENvbXBvbmVudCBwcm92aWRlczpcbiAqXG4gKiAxLiBSZXNvdXJjZSBrZWVwZXI6IHRvIGxldCBhbGwgc3RhdGVzIHNoYXJlIHRoZSBzYW1lIHJlc291cmNlcyAoY2FjaGUpLlxuICogMi4gUmVmZXJlbmNlIHRvIHRoZSBjdXJyZW50IGFjdGl2YXRlIHN0YXRlOiBzbyB0aGF0IHBhcmVudCBjb21wb25lbnQgY2FuXG4gKiAgICBjb21tYW5kIGFuZCB3YWl0IHRoZSBzdWItY29tcG9uZW50cyB0byBkbyB0aGluZ3Mgd2l0aG91dCB0cmFja2luZyB0aGVcbiAqICAgIGFjdHVhbCBhY3RpdmUgc3RhdGUuXG4gKlxuICogRXZlcnkgc3RhdGVzIG9mIHRoaXMgY29tcG9uZW50IHdvdWxkIHJlY2VpdmUgdGhlIENvbXBvbmVudCBpbnN0YW5jZSBhc1xuICogYSB3YXkgdG8gYWNjZXNzIHRoZXNlIGNvbW1vbiByZXNvdXJjZXMgJiBwcm9wZXJ0aWVzLiBBbmQgZXZlcnkgc3RhdGVcbiAqIHRyYW5zZmVycmluZyB3b3VsZCBkb25lIGJ5IHRoZSAndHJhbnNmZXJUbycgbWV0aG9kIGluIHRoaXMgY29tcG9uZW50LFxuICogc28gdGhhdCB0aGUgY29tcG9uZW50IGNhbiB1cGRhdGUgdGhlIGFjdGl2ZSBzdGF0ZSBjb3JyZWN0bHkuXG4gKi9cblxuLyoqXG4gKiBUaGUgYXJndW1lbnQgJ3ZpZXcnIGlzIHRoZSBvbmx5IHRoaW5nIHBhcmVudCBjb21wb25lbnQgbmVlZHMgdG8gbWFuYWdlLlxuICogUGxlYXNlIG5vdGUgdGhhdCB0aGUgJ3ZpZXcnIGlzbid0IGZvciBVSSByZW5kZXJpbmcsIGFsdGhvdWdoIHRoYXRcbiAqIFVJIHZpZXcgaXMgdGhlIG1vc3QgY29tbW9uIG9mIHRoZW0uIFVzZXIgY291bGQgY2hvc2Ugb3RoZXIgdmlld3MgbGlrZVxuICogZGF0YS12aWV3IG9yIGRlYnVnZ2luZy12aWV3IHRvIGNvbnRydWN0IHRoZSBwcm9ncmFtLiBJdCB3b3VsZCBzdGlsbFxuICogYmUgXCJyZW5kZXJlZFwiIChwZXJmb3JtIHRoZSBlZmZlY3QpLCBidXQgaG93IHRvIHN5bnRoZXNpemUgdGhlIGVmZmVjdHNcbiAqIG9mIHBhcmVudCBhbmQgY2hpbGRyZW4gbm93IGlzIHRoZSB1c2VyJ3MgZHV0eS4gRm9yIGV4YW1wbGUsIGlmIHdlIGhhdmUgYVxuICogJ2NvbnNvbGUtdmlldycgdG8gcHJpbnQgb3V0IHRoaW5ncyBpbnN0ZWFkIG9mIHJlbmRlcmluZyBVSSwgc2hvdWxkIGl0XG4gKiBwcmludCB0ZXh0IGZyb20gY2hpbGRyZW4gZmlyc3Q/IE9yIHRoZSBwYXJlbnQsIHNpbmNlIGl0J3MgYSB3cmFwcGluZ1xuICogb2JqZWN0LCBzaG91bGQgaW5mbyB0aGUgdXNlciBpdHMgc3RhdHVzIGVhcmxpZXIgdGhhbiBpdHMgY2hpbGRyZW4/XG4gKiBUaGVzZSBiZWhhdmlvcnMgc2hvdWxkIGJlIGVuY2Fwc3VsYXRlZCBpbnNpZGUgdGhlICd2aWV3JywgYW5kIGJlXG4gKiBoYW5kbGVkIGF0IHRoZSB1bmRlcmx5aW5nIGxldmVsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gQmFzaWModmlldykge1xuICB0aGlzLl9zdWJjb21wb25lbnRzID0gbnVsbDtcbiAgdGhpcy5fYWN0aXZlU3RhdGUgPSBudWxsO1xuICAvLyBDb25jcmV0ZSBjb21wb25lbnRzIHNob3VsZCBleHRlbmQgdGhlc2UgdG8gbGV0IFN0YXRlcyBhY2Nlc3MgdGhlbS5cbiAgLy8gVGhlIGZpcnN0IHN0YXRlIGNvbXBvbmVudCBraWNrIG9mZiBzaG91bGQgdGFrZSByZXNwb25zaWJpbGl0eSBmb3JcbiAgLy8gaW5pdGlhbGl6aW5nIHRoZXNlIHRoaW5ncy5cbiAgLy9cbiAgLy8gUmVzb3VyY2VzIGlzIGZvciBleHRlcm5hbCByZXNvdXJjZXMgbGlrZSBzZXR0aW5ncyB2YWx1ZSBvciBET00gZWxlbWVudHMuXG4gIHRoaXMucmVzb3VyY2VzID0ge1xuICAgIGVsZW1lbnRzOiB7fVxuICB9O1xuICB0aGlzLmNvbmZpZ3MgPSB7XG4gICAgbG9nZ2VyOiB7XG4gICAgICBkZWJ1ZzogZmFsc2UgICAgLy8gdHVybiBvbiBpdCB3aGVuIHdlJ3JlIGRlYnVnZ2luZyB0aGlzIGNvbXBvbmVudFxuICAgIH1cbiAgfTtcblxuICAvLyBUaGUgZGVmYXVsdCBsb2dnZXIuXG4gIC8vIEEgY3VzdG9taXplZCBsb2dnZXIgaXMgYWNjZXRhYmxlIGlmIGl0J3Mgd2l0aCB0aGUgJ3RyYW5zZmVyJyBtZXRob2RcbiAgLy8gZm9yIGxvZ2dpbmcgdGhlIHN0YXRlIHRyYW5zZmVycmluZy5cbiAgdGhpcy5sb2dnZXIgPSBuZXcgU3RhdGVMb2dnZXIoKTtcbiAgdGhpcy52aWV3ID0gdmlldztcbiAgLy8gU2hvdWxkIGF0IGxlYXN0IGFwcG9pbnQgdGhlc2UuXG4gIHRoaXMudHlwZSA9IG51bGw7XG4gIHRoaXMuX3NldHVwU3RhdGUgPSBudWxsO1xufVxuXG4vKipcbiAqIFN0YXRlJyBwaGFzZSBpcyB0aGUgY29tcG9uZW50J3MgcGhhc2UuXG4gKi9cbkJhc2ljLnByb3RvdHlwZS5waGFzZSA9XG5mdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuX2FjdGl2ZVN0YXRlLnBoYXNlKCk7XG59O1xuXG4vKipcbiAqIEV2ZXJ5IHN0YXRlIG9mIHRoaXMgY29tcG9uZW50IHNob3VsZCBjYWxsIHRoZSBtZXRob2QgdG8gZG8gdHJhbnNmZXJyaW5nLFxuICogc28gdGhhdCB0aGUgY29tcG9uZW50IGNhbiB1cGRhdGUgdGhlICdhY3RpdmVTdGF0ZScgY29ycmVjdGx5LlxuICpcbiAqIFRoZSBvcmRlciBvZiB0cmFuc2ZlcnJpbmcgaXM6XG4gKlxuICogIFtjdXJyZW50LnN0b3BdIC0+IFtuZXh0LnN0YXJ0XSAtPiAoY2FsbClbcHJldmlvdXMuZGVzdHJveV1cbiAqXG4gKiBOb3RlIHRoaXMgZnVuY3Rpb24gbWF5IHJldHVybiBhIG51bGxpemVkIHByb2Nlc3MgaWYgaXQncyB0cmFuc2ZlcnJpbmcsXG4gKiBzbyB0aGUgdXNlciBtdXN0IGRldGVjdCBpZiB0aGUgcmV0dXJuIHRoaW5nIGlzIGEgdmFsaWQgcHJvY2Vzc1xuICogY291bGQgYmUgY2hhaW5lZCwgb3IgcHJlLWNoZWNrIGl0IHdpdGggdGhlIHByb3BlcnR5LlxuICovXG5CYXNpYy5wcm90b3R5cGUudHJhbnNmZXJUbyA9IGZ1bmN0aW9uKGNsYXp6LCByZWFzb24gPSB7fSkge1xuICB2YXIgbmV4dFN0YXRlID0gbmV3IGNsYXp6KHRoaXMpO1xuICB2YXIgY3VycmVudFN0YXRlID0gdGhpcy5fYWN0aXZlU3RhdGU7XG4gIHRoaXMuX2FjdGl2ZVN0YXRlID0gbmV4dFN0YXRlO1xuICB0aGlzLmxvZ2dlci50cmFuc2ZlcihjdXJyZW50U3RhdGUuY29uZmlncy50eXBlLFxuICAgICAgbmV4dFN0YXRlLmNvbmZpZ3MudHlwZSwgcmVhc29uKTtcbiAgcmV0dXJuIGN1cnJlbnRTdGF0ZS5zdG9wKClcbiAgICAubmV4dCgoKSA9PiBuZXh0U3RhdGUuc3RhcnQoKSk7XG59O1xuXG4vKipcbiAqIFdvdWxkIHJlY2VpdmUgcmVzb3VyY2VzIGZyb20gcGFyZW50IGFuZCAqZXh0ZW5kcyogdGhlIGRlZmF1bHQgb25lLlxuICogQWZ0ZXIgdGhhdCwgdHJhbnNmZXIgdG8gdGhlIG5leHQgc3RhdGUsIHdoaWNoIGlzIHVzdWFsbHkgYW4gaW5pdGlhbGl6YXRpb25cbiAqIHN0YXRlLCB0aGF0IHdvdWxkIGRvIGxvdHMgb2Ygc3luYy9hc3luYyB0aGluZ3MgdG8gdXBkYXRlIHRoZVxuICogcmVzb3VyY2VzICYgcHJvcGVydGllcy5cbiAqXG4gKiBIb3dldmVyLCBzaW5jZSBiYXNpYyBjb21wb25lbnQgY291bGRuJ3Qga25vdyB3aGF0IGlzIHRoZVxuICogaW5pdGlhbGl6YXRpb24gc3RhdGUsIHNvIHRoYXQgdGhlIGNvbmNyZXRlIGNvbXBvbmVudCBzaG91bGRcbiAqIGltcGxlbWVudCB0aGUgc2V0dXAgZnVuY3Rpb24sIHdoaWNoIHdvdWxkIHJldHVybiB0aGUgc3RhdGUgYWZ0ZXJcbiAqIHJlY2VpdmUgdGhlIGNvbXBvbmVudCBpbnN0YW5jZS5cbiAqL1xuQmFzaWMucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24ocmVzb3VyY2VzKSB7XG4gIHRoaXMubG9nZ2VyLnN0YXJ0KHRoaXMuY29uZmlncy5sb2dnZXIpO1xuICBpZiAocmVzb3VyY2VzKSB7XG4gICAgZm9yICh2YXIga2V5IGluIHRoaXMucmVzb3VyY2VzKSB7XG4gICAgICBpZiAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiByZXNvdXJjZXNba2V5XSkge1xuICAgICAgICB0aGlzLnJlc291cmNlc1trZXldID0gcmVzb3VyY2VzW2tleV07XG4gICAgICB9XG4gICAgfVxuICB9XG4gIC8vIEdldCB0aGUgaW5pdGlhbGl6YXRpb24gc3RhdGUgYW5kIGxldCBpdCBmZXRjaCAmIHNldCBhbGwuXG4gIC8vICdpbml0aWFsaXplU3RhdGVNYWNoaW5lJywgaWYgSmF2YSBkb29tZWQgdGhlIHdvcmxkLlxuICAvLyAoYW5kIHRoaXMgaXMgRUNNQVNjcmlwdCwgYSBsYW5ndWFnZSAocGFydGlhbGx5KSBpbnNwaXJlZCBieSBTY2hlbWUhKS5cbiAgdGhpcy5fYWN0aXZlU3RhdGUgPSB0aGlzLl9zZXR1cFN0YXRlO1xuICByZXR1cm4gdGhpcy5fYWN0aXZlU3RhdGUuc3RhcnQoKTtcbn07XG5cbkJhc2ljLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLl9hY3RpdmVTdGF0ZS5zdG9wKClcbiAgICAubmV4dCh0aGlzLndhaXRDb21wb25lbnRzLmJpbmQodGhpcywgJ3N0b3AnKSk7XG59O1xuXG5CYXNpYy5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5fYWN0aXZlU3RhdGUuZGVzdHJveSgpXG4gICAgLm5leHQodGhpcy53YWl0Q29tcG9uZW50cy5iaW5kKHRoaXMsICdkZXN0cm95JykpXG4gICAgLm5leHQoKCkgPT4geyB0aGlzLmxvZ2dlci5zdG9wKCk7IH0pOyAgLy8gTG9nZ2VyIG5lZWQgYWRkIHBoYXNlIHN1cHBvcnQuXG59O1xuXG5CYXNpYy5wcm90b3R5cGUubGl2ZSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5fYWN0aXZlU3RhdGUudW50aWwoJ3N0b3AnKTtcbn07XG5cbkJhc2ljLnByb3RvdHlwZS5leGlzdCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5fYWN0aXZlU3RhdGUudW50aWwoJ2Rlc3Ryb3knKTtcbn07XG5cbi8qKlxuICogQ2FuIGNvbW1hbmQgYWxsIHN1Yi1jb21wb25lbnRzIHdpdGggb25lIG1ldGhvZCBhbmQgaXRzIGFyZ3VtZW50cy5cbiAqIEZvciBleGFtcGxlLCB0byAnc3RhcnQnLCBvciAnc3RvcCcgdGhlbS5cbiAqIFdpbGwgcmV0dXJuIGEgUHJvbWlzZSBvbmx5IGJlIHJlc29sdmVkIGFmdGVyIGFsbCBzdWItY29tcG9uZW50c1xuICogZXhlY3V0ZWQgdGhlIGNvbW1hbmQuIEZvciBleGFtcGxlOlxuICpcbiAqIHN1YmNvbXBvbmVudHM6IHtcbiAqICAgIGJ1dHRvbnM6IFtCdXR0b25Gb28sIEJ1dHRvbkJhcl1cbiAqICAgIHN1Ym1pdDogU3VibWl0XG4gKiB9XG4gKiB2YXIgcHJvbWlzZWQgPSBwYXJlbnQud2FpdENvbXBvbmVudHMocGFyZW50LnN0b3AuYmluZChwYXJlbnQpKTtcbiAqXG4gKiBUaGUgcHJvbWlzZWQgd291bGQgYmUgcmVzb2x2ZWQgb25seSBhZnRlciBCdXR0b25Gb28sIEJ1dHRvbkJhciBhbmQgU3VibWl0XG4gKiBhcmUgYWxsIHN0b3BwZWQuXG4gKlxuICogQW5kIHNpbmNlIGZvciBzdGF0ZXMgdGhlIHN1Yi1jb21wb25lbnRzIGlzIGRlbGVnYXRlZCB0byBDb21wb25lbnQsXG4gKiBzdGF0ZSBzaG91bGQgb25seSBjb21tYW5kIHRoZXNlIHN1Yi1jb21wb25lbnRzIHZpYSB0aGlzIG1ldGhvZCxcbiAqIG9yIGFjY2VzcyB0aGVtIGluZGl2aWR1YWxseSB2aWEgdGhlIGNvbXBvbmVudCBpbnN0YW5jZSBzZXQgYXQgdGhlXG4gKiBzZXR1cCBzdGFnZS5cbiAqL1xuQmFzaWMucHJvdG90eXBlLndhaXRDb21wb25lbnRzID0gZnVuY3Rpb24obWV0aG9kLCBhcmdzKSB7XG4gIGlmICghdGhpcy5fc3ViY29tcG9uZW50cykge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfVxuICB2YXIgd2FpdFByb21pc2VzID1cbiAgT2JqZWN0LmtleXModGhpcy5fc3ViY29tcG9uZW50cykucmVkdWNlKChzdGVwcywgbmFtZSkgPT4ge1xuICAgIHZhciBpbnN0YW5jZSA9IHRoaXMuX3N1YmNvbXBvbmVudHNbbmFtZV07XG4gICAgLy8gSWYgdGhlIGVudHJ5IG9mIHRoZSBjb21wb25lbnQgYWN0dWFsbHkgY29udGFpbnMgbXVsdGlwbGUgc3ViY29tcG9uZW50cy5cbiAgICAvLyBXZSBuZWVkIHRvIGFwcGx5IHRoZSBtZXRob2QgdG8gZWFjaCBvbmUgYW5kIGNvbmNhdCBhbGwgdGhlIHJlc3VsdFxuICAgIC8vIHByb21pc2VzIHdpdGggb3VyIG1haW4gYXJyYXkgb2YgYXBwbGllcy5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShpbnN0YW5jZSkpIHtcbiAgICAgIHZhciBhcHBsaWVzID0gaW5zdGFuY2UubWFwKChzdWJjb21wb25lbnQpID0+IHtcbiAgICAgICAgcmV0dXJuIHN1YmNvbXBvbmVudFttZXRob2RdLmFwcGx5KHN1YmNvbXBvbmVudCwgYXJncyk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBzdGVwcy5jb25jYXQoYXBwbGllcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBzdGVwcy5jb25jYXQoW2luc3RhbmNlW21ldGhvZF0uYXBwbHkoaW5zdGFuY2UsIGFyZ3MpXSk7XG4gICAgfVxuICB9LCBbXSk7XG4gIHJldHVybiBQcm9taXNlLmFsbCh3YWl0UHJvbWlzZXMpO1xufTtcblxuLyoqXG4gKiBGb3J3YXJkIHRoZSBkYXRhIHRvIHJlbmRlciB0aGUgdmlldy5cbiAqIElmIGl0J3MgYSByZWFsIFVJIHZpZXcgYW5kIHdpdGggdGVjaCBsaWtlIHZpcnR1YWwgRE9NIGluIFJlYWN0LmpzLFxuICogd2UgY291bGQgcGVyZm9ybSBhIGhpZ2gtZWZmaWNpZW5jeSByZW5kZXJpbmcgd2hpbGUga2VlcCB0aGUgY2xpZW50IGNvZGVcbiAqIGFzIHNpbXBsZSBhcyBwb3NzaWJsZS5cbiAqXG4gKiBUaGUgdGFyZ2V0IGlzIGFuIG9wdGlvbmFsICdjYW52YXMnIG9mIHRoZSByZW5kZXJpbmcgdGFyZ2V0LiBJdCB3b3VsZCxcbiAqIGlmIHRoZSB2aWV3IGlzIGFuIFVJIHZpZXcgZm9yIGV4YW1wbGUsICdlcmFzZScgaXQgYW5kIHJlbmRlciBuZXcgY29udGVudFxuICogZWFjaCB0aW1lIHRoaXMgZnVuY3Rpb24gZ2V0IGludm9rZWQuIEhvd2V2ZXIsIHNpbmNlIHdlIGhhdmUgbm90IG9ubHlcbiAqIFVJIHZpZXcsIHNvbWUgdGFyZ2V0aW5nICdjYW52YXMnIGNvdWxkIGJlIG1vcmUgdHJpY2t5LCBsaWtlIEZpbGVPYmplY3QsXG4gKiBCbG9iLCBzb3VuZCBzeXN0ZW0sIGV0Yy5cbiAqL1xuQmFzaWMucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKHByb3BzLCB0YXJnZXQpIHtcbiAgcmV0dXJuIHRoaXMudmlldy5yZW5kZXIocHJvcHMsIHRhcmdldCk7XG59O1xuXG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL2J1aWxkX3N0YWdlL3NyYy9jb21wb25lbnQvYmFzaWMuanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7IExhbmd1YWdlIH0gZnJvbSAnc3JjL3J1bmUvbGFuZ3VhZ2UuanMnO1xuaW1wb3J0IHsgQmFzaWMgYXMgQmFzaWNTdGF0ZSB9IGZyb20gJ3NyYy9zdGF0ZS9iYXNpYy5qcyc7XG5cbi8qKlxuICogVXNlIHRoaXMgYnVpbGRlciB0byBidWlsZCBzdGF0ZXMgaW4gYSBjb21wb25lbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTdGF0ZSgpIHtcbiAgdGhpcy5jb250ZXh0ID0ge1xuICAgIF9pbmZvOiB7fVxuICB9O1xuICB0aGlzLnN0YWNrID0gW107XG4gIC8vIFdpdGggdGhpcyBoZWxwZXIgd2UgZ2V0IHRoZSBldmFsdWF0b3IuXG4gIHRoaXMuX2V2YWx1YXRvciA9IChuZXcgTGFuZ3VhZ2UuRXZhbHVhdGUoKSlcbiAgICAuYW5hbHl6ZXIodGhpcy5fYW5hbHl6ZXIuYmluZCh0aGlzKSlcbiAgICAuaW50ZXJwcmV0ZXIodGhpcy5faW50ZXJwcmV0LmJpbmQodGhpcykpO1xuICB0aGlzLl9zdGF0ZSA9IG51bGw7XG59XG5cbi8vIFRoZSBsYW5ndWFnZSBpbnRlcmZhY2UuXG5TdGF0ZS5wcm90b3R5cGUuc3RhcnQgPSBMYW5ndWFnZS5kZWZpbmUoJ3N0YXJ0JyAsJ2JlZ2luJyk7XG5TdGF0ZS5wcm90b3R5cGUuY29tcG9uZW50ID0gTGFuZ3VhZ2UuZGVmaW5lKCdjb21wb25lbnQnICwncHVzaCcpO1xuU3RhdGUucHJvdG90eXBlLmV2ZW50cyA9IExhbmd1YWdlLmRlZmluZSgnZXZlbnRzJywgJ3B1c2gnKTtcblN0YXRlLnByb3RvdHlwZS5pbnRlcnJ1cHRzID0gTGFuZ3VhZ2UuZGVmaW5lKCdpbnRlcnJ1cHRzJywgJ3B1c2gnKTtcblN0YXRlLnByb3RvdHlwZS5zb3VyY2VzID0gTGFuZ3VhZ2UuZGVmaW5lKCdzb3VyY2VzJywgJ3B1c2gnKTtcblN0YXRlLnByb3RvdHlwZS50eXBlID0gTGFuZ3VhZ2UuZGVmaW5lKCd0eXBlJywgJ3B1c2gnKTtcblN0YXRlLnByb3RvdHlwZS5oYW5kbGVyID0gTGFuZ3VhZ2UuZGVmaW5lKCdoYW5kbGVyJywgJ3B1c2gnKTtcblN0YXRlLnByb3RvdHlwZS5tZXRob2RzID0gTGFuZ3VhZ2UuZGVmaW5lKCdtZXRob2RzJywgJ3B1c2gnKTtcbi8vIFRvIGJ1aWxkIGEgY29uc3RydWN0b3IgKyBwcm90b3R5cGVcblN0YXRlLnByb3RvdHlwZS5idWlsZCA9IExhbmd1YWdlLmRlZmluZSgnYnVpbGQnLCAnZXhpdCcpO1xuLy8gQmVzaWRlcyB0aGUgY29uc3RydWN0b3IgYW5kIHByb3RvdHlwZSwgY3JlYXRlIGFuIGluc3RhbmNlIGFuZCByZXR1cm4gaXQuXG5TdGF0ZS5wcm90b3R5cGUuaW5zdGFuY2UgPSBMYW5ndWFnZS5kZWZpbmUoJ2luc3RhbmNlJywgJ2V4aXQnKTtcblxuLy8gVGhlIHByaXZhdGUgbWV0aG9kcy5cblN0YXRlLnByb3RvdHlwZS5vbmNoYW5nZSA9IGZ1bmN0aW9uKGNvbnRleHQsIG5vZGUsIHN0YWNrKSB7XG4gIC8vIFdoZW4gaXQncyBjaGFuZ2VkLCBldmFsdWF0ZSBpdCB3aXRoIGFuYWx5emVycyAmIGludGVycHJldGVyLlxuICByZXR1cm4gdGhpcy5fZXZhbHVhdG9yKGNvbnRleHQsIG5vZGUsIHN0YWNrKTtcbn07XG5cblN0YXRlLnByb3RvdHlwZS5fYW5hbHl6ZXIgPSBmdW5jdGlvbihjb250ZXh0LCBub2RlLCBzdGFjaykge1xuICBpZiAoJ3N0YXJ0JyAhPT0gbm9kZS50eXBlICYmICFjb250ZXh0LnN0YXJ0ZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEJlZm9yZSAnJHtub2RlLnR5cGV9Jywgc2hvdWxkIHN0YXJ0IHRoZSBidWlsZGVyIGZpcnN0YCk7XG4gIH1cbiAgc3dpdGNoKG5vZGUudHlwZSkge1xuICAgIGNhc2UgJ3N0YXJ0JzpcbiAgICAgIGNvbnRleHQuc3RhcnRlZCA9IHRydWU7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjb21wb25lbnQnOlxuICAgICAgaWYgKDEgIT09IG5vZGUuYXJncy5sZW5ndGggfHwgJ29iamVjdCcgIT09IHR5cGVvZiBub2RlLmFyZ3NbMF0gfHxcbiAgICAgICAgICAnZnVuY3Rpb24nICE9PSB0eXBlb2Ygbm9kZS5hcmdzWzBdLnRyYW5zZmVyVG8pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAgJyR7bm9kZS50eXBlfSdcbiAgICAgICAgICBleHBlY3QgdG8gYmUgYSBjb21wb25lbnQgd2l0aCBtZXRob2QgJ3RyYW5zZmVyVG8nYCk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICd0eXBlJzpcbiAgICAgIGlmICgxICE9PSBub2RlLmFyZ3MubGVuZ3RoIHx8ICdzdHJpbmcnICE9PSB0eXBlb2Ygbm9kZS5hcmdzWzBdKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgICcke25vZGUudHlwZX0nXG4gICAgICAgICAgZXhwZWN0IHRvIGhhdmUgYSBzdHJpbmcgYXMgdGhlIHN0YXRlIHR5cGVgKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2V2ZW50cyc6XG4gICAgY2FzZSAnaW50ZXJydXB0cyc6XG4gICAgY2FzZSAnc291cmNlcyc6XG4gICAgICBpZiAoIW5vZGUuYXJnc1swXSB8fCAhQXJyYXkuaXNBcnJheShub2RlLmFyZ3NbMF0pKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgICcke25vZGUudHlwZX0nXG4gICAgICAgICAgZXhwZWN0cyB0byBoYXZlIGFuIGFycmF5IGFyZ3VtZW50YCk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdoYW5kbGVyJzpcbiAgICAgIGlmICghbm9kZS5hcmdzWzBdIHx8ICdmdW5jdGlvbicgIT09IHR5cGVvZiBub2RlLmFyZ3NbMF0pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAgJyR7bm9kZS50eXBlfSdcbiAgICAgICAgICBleHBlY3QgdG8gaGF2ZSBhbiBmdW5jdGlvbiBhcmd1bWVudGApO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbWV0aG9kcyc6XG4gICAgICBpZiAoIW5vZGUuYXJnc1swXSB8fCAnb2JqZWN0JyAhPT0gdHlwZW9mIG5vZGUuYXJnc1swXSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCAnJHtub2RlLnR5cGV9J1xuICAgICAgICAgIGV4cGVjdCB0byBoYXZlIGFuIG1hcCBvZiBmdW5jdGlvbnNgKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2J1aWxkJzpcbiAgICBjYXNlICdpbnN0YW5jZSc6XG4gICAgICAvLyBDaGVjayBpZiBuZWNlc3NhcnkgcHJvcGVydGllcyBhcmUgbWlzc2luZy5cbiAgICAgIC8vIEN1cnJlbnRseSBvbmx5ICd0eXBlJyBpcyBuZWNlc3NhcnkuXG4gICAgICBpZiAoIWNvbnRleHQuX2luZm8udHlwZSB8fCAnc3RyaW5nJyAhPT0gdHlwZW9mIGNvbnRleHQuX2luZm8udHlwZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEEgc3RhdGUgc2hvdWxkIGF0IGxlYXN0IHdpdGggdHlwZWApO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gIH1cbn07XG5cbi8qKlxuICogQXMgYW4gb3JkaW5hcnkgaW50ZXJwcmV0aW5nIGZ1bmN0aW9uOiBkbyBzb21lIGVmZmVjdHMgYWNjb3JkaW5nIHRvIHRoZSBub2RlLFxuICogYW5kIHJldHVybiB0aGUgZmluYWwgc3RhY2sgYWZ0ZXIgZW5kaW5nLlxuICovXG5TdGF0ZS5wcm90b3R5cGUuX2ludGVycHJldCA9IGZ1bmN0aW9uKGNvbnRleHQsIG5vZGUsIHN0YWNrKSB7XG4gIGlmICgnc3RhcnQnID09PSBub2RlLnR5cGUpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gSWYgdGhlIGluZm9ybWF0aW9uIGFyZSBnYXRoZXJlZCwgYWNjb3JkaW5nIHRvIHRoZSBpbmZvcm1hdGlvblxuICAvLyB1c2VyIGdhdmUgdG8gYnVpbGQgYSBzdGF0ZS5cbiAgaWYgKCdidWlsZCcgIT09IG5vZGUudHlwZSAmJiAnaW5zdGFuY2UnICE9PSBub2RlLnR5cGUpIHtcbiAgICAvLyBTaW5jZSBhbGwgdGhlc2UgbWV0aG9kcyBhcmUgb25seSBuZWVkIG9uZSBhcmd1bWVudC5cbiAgICBjb250ZXh0Ll9pbmZvW25vZGUudHlwZV0gPSBub2RlLmFyZ3NbMF07XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBfaW5mbyA9IGNvbnRleHQuX2luZm87XG4gIGNvbnRleHQuX3N0YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgQmFzaWNTdGF0ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMuY29uZmlncy50eXBlID0gX2luZm8udHlwZTtcbiAgICB0aGlzLmNvbmZpZ3Muc3RyZWFtLmV2ZW50cyA9IF9pbmZvLmV2ZW50cyB8fCBbXTtcbiAgICB0aGlzLmNvbmZpZ3Muc3RyZWFtLmludGVycnVwdHMgPSBfaW5mby5pbnRlcnJ1cHRzIHx8IFtdO1xuICAgIHRoaXMuY29uZmlncy5zdHJlYW0uc291cmNlcyA9IF9pbmZvLnNvdXJjZXMgfHwgW107XG4gICAgdGhpcy5oYW5kbGVTb3VyY2VFdmVudCA9IF9pbmZvLmhhbmRsZXIuYmluZCh0aGlzKTtcbiAgfTtcbiAgY29udGV4dC5fc3RhdGUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNpY1N0YXRlLnByb3RvdHlwZSk7XG4gIGlmIChfaW5mby5tZXRob2RzKSB7XG4gICAgT2JqZWN0LmtleXMoX2luZm8ubWV0aG9kcykuZm9yRWFjaChmdW5jdGlvbihtZXRob2ROYW1lKSB7XG4gICAgICBjb250ZXh0Ll9zdGF0ZS5wcm90b3R5cGVbbWV0aG9kTmFtZV0gPSBfaW5mby5tZXRob2RzW21ldGhvZE5hbWVdO1xuICAgIH0pO1xuICB9XG4gIGlmICgnYnVpbGQnID09PSBub2RlLnR5cGUpIHtcbiAgICAvLyBUaGUgb25seSBvbmUgbm9kZSBvbiB0aGUgc3RhY2sgd291bGQgYmUgcmV0dXJuZWQuXG4gICAgc3RhY2sgPSBbIGNvbnRleHQuX3N0YXRlIF07XG4gICAgcmV0dXJuIHN0YWNrO1xuICB9XG4gIGlmICgnaW5zdGFuY2UnID09PSBub2RlLnR5cGUpIHtcbiAgICBpZiAoJ29iamVjdCcgIT09IHR5cGVvZiBfaW5mby5jb21wb25lbnQgfHxcbiAgICAgICAgJ2Z1bmN0aW9uJyAhPT0gdHlwZW9mIF9pbmZvLmNvbXBvbmVudC50cmFuc2ZlclRvKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEEgc3RhdGUgaW5zdGFuY2Ugc2hvdWxkIGhhdmUgYSBjb21wb25lbnRgKTtcbiAgICB9XG4gICAgc3RhY2sgPSBbIG5ldyBjb250ZXh0Ll9zdGF0ZShfaW5mby5jb21wb25lbnQpIF07XG4gICAgcmV0dXJuIHN0YWNrO1xuICB9XG59O1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9idWlsZF9zdGFnZS9zcmMvYnVpbGRlci9zdGF0ZS5qc1xuICoqLyJdLCJzb3VyY2VSb290IjoiIn0=