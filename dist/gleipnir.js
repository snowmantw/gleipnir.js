/**
 * gleipnir.js - Gleipnir.js - a library for UI programming
 * @version v0.0.1
 * @link 
 * @license Apache 2.0
 */
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

	__webpack_require__(1);
	__webpack_require__(10);
	__webpack_require__(8);
	__webpack_require__(11);
	__webpack_require__(9);
	__webpack_require__(2);
	__webpack_require__(12);
	__webpack_require__(13);
	__webpack_require__(15);
	__webpack_require__(16);
	__webpack_require__(14);
	__webpack_require__(3);
	__webpack_require__(6);
	__webpack_require__(5);
	__webpack_require__(7);
	__webpack_require__(4);
	module.exports = __webpack_require__(17);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports.Builder = Builder;
	
	var _srcRuneLanguageJs = __webpack_require__(2);
	
	var _srcStateBasic_stateJs = __webpack_require__(3);
	
	var _srcComponentBasic_componentJs = __webpack_require__(8);
	
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
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports.BasicState = BasicState;
	
	var _srcStreamStreamJs = __webpack_require__(4);
	
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

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports.Stream = Stream;
	
	var _srcStreamProcessProcessJs = __webpack_require__(5);
	
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

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports.Process = Process;
	
	var _srcStreamProcessInterfaceJs = __webpack_require__(6);
	
	var _srcStreamProcessRuntimeJs = __webpack_require__(7);
	
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

/***/ },
/* 6 */
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
/* 7 */
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
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports.BasicComponent = BasicComponent;
	
	var _srcLoggerStateJs = __webpack_require__(9);
	
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

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

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

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports.Builder = Builder;
	
	var _srcRuneLanguageJs = __webpack_require__(2);
	
	var _srcStateBasic_stateJs = __webpack_require__(3);
	
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

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

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

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

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

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports.DOMEventSource = DOMEventSource;
	
	var _srcSourceSource_eventJs = __webpack_require__(14);
	
	/**
	 * DOM event source for Stream. One Stream can collect events from multiple
	 * sources, which pass different native events (not only DOM events)
	 * to Stream.
	 **/
	
	function DOMEventSource(configs) {
	  this.configs = {
	    events: configs.events || []
	  };
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

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

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

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports.MinuteClockSource = MinuteClockSource;
	
	var _srcSourceSource_eventJs = __webpack_require__(14);
	
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

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports.SettingSource = SettingSource;
	
	var _srcSourceSource_eventJs = __webpack_require__(14);
	
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

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

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

/***/ }
/******/ ]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNDAzMjQ5ODNiYzY0MmE2ZWM3NGEiLCJ3ZWJwYWNrOi8vLy4vYnVpbGRfc3RhZ2Uvc3JjL2J1aWxkZXIvY29tcG9uZW50LmpzIiwid2VicGFjazovLy8uL2J1aWxkX3N0YWdlL3NyYy9ydW5lL2xhbmd1YWdlLmpzIiwid2VicGFjazovLy8uL2J1aWxkX3N0YWdlL3NyYy9zdGF0ZS9iYXNpY19zdGF0ZS5qcyIsIndlYnBhY2s6Ly8vLi9idWlsZF9zdGFnZS9zcmMvc3RyZWFtL3N0cmVhbS5qcyIsIndlYnBhY2s6Ly8vLi9idWlsZF9zdGFnZS9zcmMvc3RyZWFtL3Byb2Nlc3MvcHJvY2Vzcy5qcyIsIndlYnBhY2s6Ly8vLi9idWlsZF9zdGFnZS9zcmMvc3RyZWFtL3Byb2Nlc3MvaW50ZXJmYWNlLmpzIiwid2VicGFjazovLy8uL2J1aWxkX3N0YWdlL3NyYy9zdHJlYW0vcHJvY2Vzcy9ydW50aW1lLmpzIiwid2VicGFjazovLy8uL2J1aWxkX3N0YWdlL3NyYy9jb21wb25lbnQvYmFzaWNfY29tcG9uZW50LmpzIiwid2VicGFjazovLy8uL2J1aWxkX3N0YWdlL3NyYy9sb2dnZXIvc3RhdGUuanMiLCJ3ZWJwYWNrOi8vLy4vYnVpbGRfc3RhZ2Uvc3JjL2J1aWxkZXIvc3RhdGUuanMiLCJ3ZWJwYWNrOi8vLy4vYnVpbGRfc3RhZ2Uvc3JjL2NvbXBvbmVudC9iYXNpY19zdG9yZS5qcyIsIndlYnBhY2s6Ly8vLi9idWlsZF9zdGFnZS9zcmMvc2V0dGluZ3Mvc2V0dGluZ3NfY2FjaGUuanMiLCJ3ZWJwYWNrOi8vLy4vYnVpbGRfc3RhZ2Uvc3JjL3NvdXJjZS9kb21fZXZlbnRfc291cmNlLmpzIiwid2VicGFjazovLy8uL2J1aWxkX3N0YWdlL3NyYy9zb3VyY2Uvc291cmNlX2V2ZW50LmpzIiwid2VicGFjazovLy8uL2J1aWxkX3N0YWdlL3NyYy9zb3VyY2UvbWludXRlX2Nsb2NrX3NvdXJjZS5qcyIsIndlYnBhY2s6Ly8vLi9idWlsZF9zdGFnZS9zcmMvc291cmNlL3NldHRpbmdfc291cmNlLmpzIiwid2VicGFjazovLy8uL2J1aWxkX3N0YWdlL3NyYy92aWV3L2Jhc2ljX3ZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHVCQUFlO0FBQ2Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3RDQSxhQUFZLENBQUM7Ozs7O1NBTUcsT0FBTyxHQUFQLE9BQU87OzhDQUpFLENBQXNCOztrREFDcEIsQ0FBMEI7OzBEQUN0QixDQUFrQzs7QUFFMUQsVUFBUyxPQUFPLEdBQUc7QUFDeEIsT0FBSSxDQUFDLE9BQU8sR0FBRztBQUNiLFVBQUssRUFBRSxFQUFFO0lBQ1YsQ0FBQztBQUNGLE9BQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO0FBQ2hCLE9BQUksQ0FBQyxVQUFVLEdBQUcsSUFBSyxtQkFUaEIsUUFBUSxDQVNpQixRQUFRLEVBQUUsQ0FDdkMsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQ25DLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQzNDLE9BQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0VBQ3hCOzs7QUFHRCxRQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxtQkFoQmpCLFFBQVEsQ0FnQmtCLE1BQU0sQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDNUQsUUFBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsbUJBakJoQixRQUFRLENBaUJpQixNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3pELFFBQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLG1CQWxCbkIsUUFBUSxDQWtCb0IsTUFBTSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQzs7QUFFL0QsUUFBTyxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsbUJBcEJyQixRQUFRLENBb0JzQixNQUFNLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ25FLFFBQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLG1CQXJCbEIsUUFBUSxDQXFCbUIsTUFBTSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUM3RCxRQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxtQkF0Qm5CLFFBQVEsQ0FzQm9CLE1BQU0sQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7O0FBRS9ELFFBQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLG1CQXhCakIsUUFBUSxDQXdCa0IsTUFBTSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQzs7QUFFM0QsUUFBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsbUJBMUJqQixRQUFRLENBMEJrQixNQUFNLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDOztBQUUzRCxRQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxtQkE1QnBCLFFBQVEsQ0E0QnFCLE1BQU0sQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUM7OztBQUdqRSxRQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxVQUFTLE9BQU8sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFOztBQUUxRCxVQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztFQUM5QyxDQUFDOztBQUVGLFFBQU8sQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLFVBQVMsT0FBTyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUU7QUFDM0QsT0FBSSxPQUFPLEtBQUssSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUU7QUFDN0MsV0FBTSxJQUFJLEtBQUssZUFBWSxJQUFJLENBQUMsSUFBSSx3Q0FBb0MsQ0FBQztJQUMxRTtBQUNELFdBQU8sSUFBSSxDQUFDLElBQUk7QUFDZCxVQUFLLE9BQU87QUFDVixjQUFPLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztBQUN2QixhQUFNO0FBQUEsVUFDSCxNQUFNO0FBQ1QsV0FBSSxDQUFDLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksUUFBUSxLQUFLLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUM5RCxlQUFNLElBQUksS0FBSyxTQUFNLElBQUksQ0FBQyxJQUFJLGlFQUNtQixDQUFDO1FBQ25EO0FBQ0QsYUFBTTtBQUFBLFVBQ0gsT0FBTyxDQUFDO0FBQ2IsVUFBSyxVQUFVOzs7QUFHYixXQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksUUFBUSxLQUFLLE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUU7QUFDakUsZUFBTSxJQUFJLEtBQUsscUNBQXFDLENBQUM7UUFDdEQ7QUFDRCxXQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLG1DQXhENUMsVUFBVSxFQXdEMEQ7QUFDckUsZUFBTSxJQUFJLEtBQUssNENBQTRDLENBQUM7UUFDN0Q7QUFDRCxhQUFNO0FBQUEsSUFDVDtFQUNGLENBQUM7Ozs7OztBQU1GLFFBQU8sQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLFVBQVMsT0FBTyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUU7QUFDNUQsT0FBSSxPQUFPLEtBQUssSUFBSSxDQUFDLElBQUksRUFBRTtBQUN6QixZQUFPO0lBQ1I7OztBQUdELE9BQUksT0FBTyxLQUFLLElBQUksQ0FBQyxJQUFJLElBQUksVUFBVSxLQUFLLElBQUksQ0FBQyxJQUFJLEVBQUU7O0FBRXJELFlBQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDeEMsWUFBTztJQUNSO0FBQ0QsT0FBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQztBQUMxQixVQUFPLENBQUMsVUFBVSxHQUFHLFVBQVMsSUFBSSxFQUFFO0FBQ2xDLG9DQS9FSyxjQUFjLENBK0VKLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDdEMsU0FBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUM7QUFDbkQsU0FBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUM7QUFDN0MsU0FBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDMUMsU0FBSSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO0FBQ3ZCLFNBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzFDLENBQUM7QUFDRixVQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLCtCQXRGdEMsY0FBYyxDQXNGdUMsU0FBUyxDQUFDLENBQUM7QUFDdkUsT0FBSSxLQUFLLENBQUMsT0FBTyxFQUFFO0FBQ2pCLFdBQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFTLFVBQVUsRUFBRTtBQUN0RCxjQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO01BQ3RFLENBQUMsQ0FBQztJQUNKO0FBQ0QsT0FBSSxPQUFPLEtBQUssSUFBSSxDQUFDLElBQUksRUFBRTs7QUFFekIsVUFBSyxHQUFHLENBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBRSxDQUFDO0FBQy9CLFlBQU8sS0FBSyxDQUFDO0lBQ2Q7QUFDRCxPQUFJLFVBQVUsS0FBSyxJQUFJLENBQUMsSUFBSSxFQUFFOzs7QUFHNUIsU0FBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3pELFlBQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDNUMsVUFBSyxHQUFHLENBQUUsTUFBTSxDQUFFLENBQUM7QUFDbkIsWUFBTyxLQUFLLENBQUM7SUFDZDtFQUNGLEM7Ozs7OztBQzdHRCxhQUFZLENBQUM7Ozs7O1NBcUdHLFFBQVEsR0FBUixRQUFROzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFqQixVQUFTLFFBQVEsR0FBRyxFQUFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFrQjdCLFNBQVEsQ0FBQyxNQUFNLEdBQUcsVUFBUyxNQUFNLEVBQUUsRUFBRSxFQUFFO0FBQ3JDLFVBQU8sWUFBa0I7QUFDdkIsU0FBSSxJQUFJLEVBQUUsV0FBVyxDQUFDOzt1Q0FETCxJQUFJO0FBQUosV0FBSTs7O0FBRXJCLGFBQVEsRUFBRTtBQUNSLFlBQUssTUFBTTtBQUNULGFBQUksR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDbkQsYUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdEIsb0JBQVcsR0FDVCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNoRCxlQUFNO0FBQUEsWUFDSCxPQUFPO0FBQ1YsYUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQzdCLGFBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO0FBQ2hCLGFBQUksR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDbkQsYUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdEIsb0JBQVcsR0FDVCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNoRCxlQUFNO0FBQUEsWUFDSCxLQUFLO0FBQ1IsYUFBSSxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNuRCxhQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN0QixhQUFJLENBQUMsS0FBSyxHQUNSLElBQUksQ0FBQyxVQUFVLENBQUM7QUFDbEIsb0JBQVcsR0FDVCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNoRCxlQUFNO0FBQUEsWUFDSCxNQUFNO0FBQ1QsYUFBSSxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNuRCxhQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN0QixvQkFBVyxHQUNULElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2hELGFBQUksQ0FBQyxXQUFXLEVBQUU7QUFDaEIsaUJBQU0sSUFBSSxLQUFLLHNCQUFpQixJQUFJLENBQUMsSUFBSSxrREFDaEIsQ0FBQztVQUMzQjtBQUNELGdCQUFPLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUFBLE1BQ3pCOztBQUVELFNBQUksV0FBVyxFQUFFO0FBQ2YsV0FBSSxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUM7TUFDMUI7QUFDRCxZQUFPLElBQUksQ0FBQztJQUNiLENBQUM7RUFDSCxDQUFDOztBQUVGLFNBQVEsQ0FBQyxJQUFJLEdBQUcsVUFBUyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRTtBQUMxQyxPQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztBQUNqQixPQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztBQUNqQixPQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztFQUNwQixDQUFDOztBQUVGLFNBQVEsQ0FBQyxRQUFRLEdBQUcsWUFBdUI7T0FBZCxPQUFPLHlEQUFHLEVBQUU7O0FBQ3ZDLE9BQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO0FBQ3JCLE9BQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO0FBQ3pCLE9BQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO0VBQ3pCLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXdCRixTQUFRLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsVUFBUyxDQUFDLEVBQUU7QUFDakQsT0FBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDeEIsVUFBTyxJQUFJLENBQUM7RUFDYixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBeUJGLFNBQVEsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxVQUFTLElBQUksRUFBRTs7OztBQUV2RCxVQUFPLFVBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUs7QUFDakMsU0FBSTs7QUFFRixhQUFLLFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBQyxHQUFHLEVBQUUsUUFBUSxFQUFLO0FBQ3hDLGlCQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzNDLEVBQUUsT0FBTyxDQUFDLENBQUM7TUFDYixDQUFDLE9BQU0sQ0FBQyxFQUFFO0FBQ1QsYUFBSyxZQUFZLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7TUFDOUM7O0FBRUQsU0FBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDNUMsWUFBTyxRQUFRLENBQUM7SUFDakIsQ0FBQztFQUNILENBQUM7O0FBRUYsU0FBUSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsWUFBWSxHQUN4QyxVQUFTLEdBQUcsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRTs7QUFFcEMsU0FBTSxJQUFJLEtBQUssa0JBQWdCLE1BQU0sQ0FBQyxJQUFJLHVCQUFpQixHQUFHLGlCQUFhLENBQUM7RUFDN0UsQzs7Ozs7O0FDdlBELGFBQVksQ0FBQzs7Ozs7U0FJRyxVQUFVLEdBQVYsVUFBVTs7OENBRkgsQ0FBc0I7O0FBRXRDLFVBQVMsVUFBVSxDQUFDLFNBQVMsRUFBRTs7OztBQUlwQyxPQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQzs7QUFFMUIsT0FBSSxDQUFDLE9BQU8sR0FBRztBQUNiLFNBQUksRUFBRSxZQUFZOztBQUVsQixXQUFNLEVBQUU7QUFDTixhQUFNLEVBQUUsRUFBRTtBQUNWLGlCQUFVLEVBQUUsRUFBRTtBQUNkLGNBQU8sRUFBRSxFQUFFO01BQ1o7SUFDRixDQUFDOzs7QUFHRixPQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztFQUM1Qjs7Ozs7QUFLRCxXQUFVLENBQUMsU0FBUyxDQUFDLEtBQUssR0FDMUIsWUFBVztBQUNULFVBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztFQUM1QixDQUFDOzs7OztBQUtGLFdBQVUsQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUMxQixZQUFXO0FBQ1QsT0FBSSxDQUFDLE1BQU0sR0FBRyx1QkFuQ1AsTUFBTSxDQW1DWSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzlDLFVBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUN4RCxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0VBQzlDLENBQUM7O0FBRUYsV0FBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsWUFBVztBQUNyQyxVQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7RUFDM0IsQ0FBQzs7QUFFRixXQUFVLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxZQUFXO0FBQ3hDLFVBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztFQUM5QixDQUFDOztBQUVGLFdBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLFlBQVc7QUFDckMsVUFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztFQUNsQyxDQUFDOztBQUVGLFdBQVUsQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLFlBQVc7QUFDdEMsVUFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztFQUNyQyxDQUFDOzs7Ozs7QUFNRixXQUFVLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxZQUFXO0FBQzNDLE9BQUksSUFBSSxDQUFDLFlBQVksRUFBRTtBQUNyQixTQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO0FBQ2pELFNBQUksVUFBVSxHQUFHLHVCQS9EWixNQUFNLEVBK0RrQixDQUFDOzs7O0FBSTlCLFlBQU8sVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQztjQUFNLFVBQVUsQ0FBQyxJQUFJLEVBQUU7TUFBQSxDQUFDLENBQUM7SUFDekQ7OztBQUdELE9BQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO0FBQ3pCLFVBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7RUFDbkUsQ0FBQzs7Ozs7O0FBTUYsV0FBVSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsR0FBRyxZQUFXLEVBQUUsQzs7Ozs7O0FDakZ0RCxhQUFZLENBQUM7Ozs7O1NBb0JHLE1BQU0sR0FBTixNQUFNOztzREFsQkUsQ0FBK0I7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFrQmhELFVBQVMsTUFBTSxHQUFlO09BQWQsT0FBTyx5REFBRyxFQUFFOztBQUNqQyxPQUFJLENBQUMsT0FBTyxHQUFHO0FBQ2IsV0FBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNLElBQUksRUFBRTtBQUM1QixlQUFVLEVBQUUsT0FBTyxDQUFDLFVBQVUsSUFBSSxFQUFFO0lBQ3JDLENBQUM7QUFDRixPQUFJLE9BQU8sQ0FBQyxPQUFPLElBQUksQ0FBQyxLQUFLLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFO0FBQ25ELFNBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUM7SUFDeEMsTUFBTTtBQUNMLFNBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztJQUMzQjtBQUNELE9BQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDOztBQUV2QixPQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0VBQzFDOztBQUVELE9BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLFlBQVc7QUFDbEMsVUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO0VBQzNDLENBQUM7O0FBRUYsT0FBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsVUFBUyxTQUFTLEVBQUU7QUFDM0MsT0FBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7QUFDNUIsT0FBSSxDQUFDLE9BQU8sR0FBRywrQkF2Q1IsT0FBTyxFQXVDYyxDQUFDO0FBQzdCLE9BQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDckIsVUFBTyxJQUFJLENBQUM7RUFDYixDQUFDOzs7OztBQUtGLE9BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLFlBQVc7OztBQUNsQyxPQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBQyxNQUFNLEVBQUs7QUFDdkMsV0FBTSxDQUFDLEtBQUssQ0FBQyxNQUFLLFFBQVEsQ0FBQyxDQUFDO0lBQzdCLENBQUMsQ0FBQztBQUNILFVBQU8sSUFBSSxDQUFDO0VBQ2IsQ0FBQzs7QUFFRixPQUFNLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxZQUFXO0FBQ2pDLE9BQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDcEIsT0FBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQUMsTUFBTSxFQUFLO0FBQ3ZDLFdBQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNmLENBQUMsQ0FBQztBQUNILFVBQU8sSUFBSSxDQUFDO0VBQ2IsQ0FBQzs7QUFFRixPQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxZQUFXO0FBQ3BDLE9BQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDdkIsVUFBTyxJQUFJLENBQUM7RUFDYixDQUFDOztBQUVGLE9BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLFVBQVMsSUFBSSxFQUFFO0FBQ3JDLE9BQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3hCLFVBQU8sSUFBSSxDQUFDO0VBQ2IsQ0FBQzs7QUFFRixPQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxVQUFTLE9BQU8sRUFBRTtBQUMxQyxPQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM3QixVQUFPLElBQUksQ0FBQztFQUNiLENBQUM7Ozs7Ozs7Ozs7QUFVRixPQUFNLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxVQUFTLEtBQUssRUFBRTtBQUN2QyxVQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0VBQ2xDLENBQUM7Ozs7OztBQU1GLE9BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLFVBQVMsS0FBSyxFQUFFO0FBQ3RDLE9BQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3pCLFVBQU8sSUFBSSxDQUFDO0VBQ2IsQ0FBQzs7Ozs7O0FBTUYsT0FBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsVUFBUyxHQUFHLEVBQUU7OztBQUN4QyxPQUFJLE9BQU8sS0FBSyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFO0FBQ2xELFlBQU8sSUFBSSxDQUFDO0lBQ2I7QUFDRCxPQUFJLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7O0FBRXBELFNBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDckIsWUFBTyxJQUFJLENBQUM7SUFDYixNQUFNOzs7O0FBSUwsU0FBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBTTtBQUN0QixjQUFPLE9BQUssVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO01BQzdCLENBQUMsQ0FBQztBQUNILFlBQU8sSUFBSSxDQUFDO0lBQ2I7RUFDRixDOzs7Ozs7QUN6SEQsYUFBWSxDQUFDOzs7OztTQXlHRyxPQUFPLEdBQVAsT0FBTzs7d0RBdkdHLENBQWlDOztzREFDbkMsQ0FBK0I7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXNHaEQsVUFBUyxPQUFPLEdBQUc7QUFDeEIsT0FBSSxDQUFDLFFBQVEsR0FBRywrQkF2R1QsT0FBTyxFQXVHZSxDQUFDO0FBQzlCLE9BQUksQ0FBQyxVQUFVLEdBQUcsaUNBekdYLFNBQVMsQ0F5R2dCLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMvQyxVQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7RUFDeEI7Ozs7O0FBS0QsUUFBTyxDQUFDLEtBQUssR0FBRyxZQUFXO0FBQ3pCLE9BQUksT0FBTyxFQUFFLE1BQU0sQ0FBQztBQUNwQixPQUFJLE9BQU8sR0FBRyxJQUFJLE9BQU8sQ0FBQyxVQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUs7QUFDdEMsWUFBTyxHQUFHLEdBQUcsQ0FBQztBQUNkLFdBQU0sR0FBRyxHQUFHLENBQUM7SUFDZCxDQUFDLENBQUM7QUFDSCxPQUFJLE1BQU0sR0FBRztBQUNYLGNBQVMsRUFBRSxPQUFPO0FBQ2xCLGFBQVEsRUFBRSxNQUFNO0FBQ2hCLGNBQVMsRUFBRSxPQUFPO0lBQ25CLENBQUM7QUFDRixVQUFPLE1BQU0sQ0FBQztFQUNmLENBQUM7OztBQUdGLFFBQU8sQ0FBQyxJQUFJLEdBQUcsWUFBVztBQUN4QixPQUFJLE9BQU8sR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO0FBQzVCLFVBQU8sT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0VBQ3ZELEM7Ozs7OztBQ3BJRCxhQUFZLENBQUM7Ozs7O1NBcUJHLFNBQVMsR0FBVCxTQUFTOzs4Q0FuQkEsQ0FBc0I7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBbUJ4QyxVQUFTLFNBQVMsQ0FBQyxPQUFPLEVBQUU7O0FBRWpDLE9BQUksQ0FBQyxPQUFPLEdBQUc7QUFDYixZQUFPLEVBQUUsS0FBSztBQUNkLFlBQU8sRUFBRSxLQUFLO0lBQ2YsQ0FBQztBQUNGLE9BQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO0FBQ2hCLE9BQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO0FBQ3hCLE9BQUksQ0FBQyxVQUFVLEdBQUcsSUFBSyxtQkEzQmhCLFFBQVEsQ0EyQmlCLFFBQVEsRUFBRSxDQUN2QyxRQUFRLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FDdkMsV0FBVyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7RUFDNUM7O0FBRUQsVUFBUyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsbUJBaENuQixRQUFRLENBZ0NvQixNQUFNLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQzlELFVBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLG1CQWpDbEIsUUFBUSxDQWlDbUIsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztBQUMzRCxVQUFTLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxtQkFsQ3JCLFFBQVEsQ0FrQ3NCLE1BQU0sQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDakUsVUFBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsbUJBbkNsQixRQUFRLENBbUNtQixNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQzNELFVBQVMsQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLG1CQXBDbkIsUUFBUSxDQW9Db0IsTUFBTSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztBQUM3RCxVQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxtQkFyQ3BCLFFBQVEsQ0FxQ3FCLE1BQU0sQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDL0QsVUFBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsbUJBdENsQixRQUFRLENBc0NtQixNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDOzs7O0FBSTNELFVBQVMsQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUN6QixZQUFXO0FBQ1QsVUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQztFQUM1RCxDQUFDOztBQUVGLFVBQVMsQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLFVBQVMsT0FBTyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUU7O0FBRTVELFVBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0VBQzlDLENBQUM7O0FBRUYsVUFBUyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsVUFBUyxPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRTs7QUFFOUQsVUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQztFQUMvRCxDQUFDOzs7O0FBSUYsVUFBUyxDQUFDLFNBQVMsQ0FBQyxhQUFhLEdBQUcsVUFBUyxPQUFPLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRTtBQUNuRSxPQUFJLE9BQU8sS0FBSyxNQUFNLENBQUMsSUFBSSxFQUFFO0FBQzNCLFlBQU8sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0lBQ3hCLE1BQU0sSUFBSSxNQUFNLEVBQUU7QUFDakIsWUFBTyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7SUFDeEI7QUFDRCxPQUFJLE9BQU8sS0FBSyxNQUFNLENBQUMsSUFBSSxJQUFJLE9BQU8sQ0FBQyxPQUFPLEVBQUU7QUFDOUMsV0FBTSxJQUFJLEtBQUssQ0FBQyxrQ0FBa0MsR0FDOUMsNkJBQTZCLENBQUMsQ0FBQztJQUNwQyxNQUFNLElBQUksTUFBTSxLQUFLLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFO0FBQ3JELFdBQU0sSUFBSSxLQUFLLENBQUMsaURBQWlELENBQUMsQ0FBQztJQUNwRSxNQUFNLElBQUksTUFBTSxLQUFLLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFO0FBQ3JELFdBQU0sSUFBSSxLQUFLLENBQUMsZ0RBQWdELENBQUMsQ0FBQztJQUNuRTtFQUNGLEM7Ozs7OztBQzNFRCxhQUFZLENBQUM7Ozs7O1NBRUcsT0FBTyxHQUFQLE9BQU87O0FBQWhCLFVBQVMsT0FBTyxHQUFHO0FBQ3hCLE9BQUksQ0FBQyxNQUFNLEdBQUc7QUFDWixVQUFLLEVBQUUsSUFBSTtBQUNYLG1CQUFjLEVBQUUsSUFBSTtBQUNwQixVQUFLLEVBQUU7QUFDTCxlQUFRLEVBQUUsSUFBSTtBQUNkLFlBQUssRUFBRSxJQUFJO01BQ1o7O0FBRUQsZ0JBQVcsRUFBRSxFQUFFO0lBQ2hCLENBQUM7QUFDRixPQUFJLENBQUMsU0FBUyxHQUFHOztBQUVmLHNCQUFpQixFQUFFLENBQUM7QUFDcEIsV0FBTSxFQUFFLElBQUksQ0FBQyxzQkFBc0IsRUFBRTtBQUNyQyxvQkFBZSxFQUFFLEVBQUU7SUFDcEIsQ0FBQztBQUNGLE9BQUksQ0FBQyxPQUFPLEdBQUc7QUFDYixVQUFLLEVBQUUsS0FBSztJQUNiLENBQUM7RUFDSDs7Ozs7Ozs7QUFRRCxRQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxVQUFTLFFBQVEsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFOzs7O0FBSTdELE9BQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDM0MsVUFBTyxFQUFFLENBQUM7RUFDWCxDQUFDOztBQUdGLFFBQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLFlBQVc7QUFDbkMsT0FBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDO0FBQzVCLE9BQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxHQUFHLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztFQUNoRCxDQUFDOztBQUVGLFFBQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLFlBQVc7QUFDbEMsT0FBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7RUFDN0IsQ0FBQzs7QUFFRixRQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxZQUFXO0FBQ3JDLE9BQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0VBQy9CLENBQUM7O0FBRUYsUUFBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsVUFBUyxJQUFJLEVBQUUsT0FBTyxFQUFFOztBQUVoRCxPQUFJLE9BQU8sS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRTtBQUNqQyxZQUFPO0lBQ1I7QUFDRCxPQUFJLElBQUksS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRTtBQUM5QixTQUFJLEtBQUssR0FBRyxJQUFJLEtBQUssY0FBWSxJQUFJLHlCQUFvQixPQUFPLDhDQUNoQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBRyxDQUFDO0FBQ3JELFlBQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDckIsV0FBTSxLQUFLLENBQUM7SUFDYjtBQUNELE9BQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQztBQUM1QixPQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFO0FBQzFDLFNBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDdkI7O0FBRUQsT0FBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEdBQzFCLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxTQUFNLENBQUMsVUFBQyxHQUFHLEVBQUs7QUFDeEMsU0FBSSxFQUFFLEdBQUcsWUFBWSxPQUFPLENBQUMsY0FBYyxHQUFHOzs7OztBQUs1QyxhQUFNLEdBQUcsQ0FBQztNQUNYOzs7QUFBQSxJQUdGLENBQUMsQ0FBQzs7QUFFSCxPQUFJLENBQUMsU0FBUyxDQUFDLGlCQUFpQixHQUFHLENBQUMsQ0FBQztFQUN0QyxDQUFDOzs7Ozs7QUFNRixRQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxVQUFTLEtBQUssRUFBRTs7O0FBQ3hDLE9BQUksT0FBTyxHQUFHLElBQUksT0FBTyxDQUFDLFVBQUMsR0FBRyxFQUFLO0FBQ2pDLFdBQUssTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsR0FBRyxDQUFDO0lBQ2xDLENBQUMsQ0FBQztBQUNILFVBQU8sT0FBTyxDQUFDO0VBQ2hCLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7QUFnQkYsUUFBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsWUFBbUI7OztxQ0FBUCxLQUFLO0FBQUwsVUFBSzs7O0FBQ3hDLE9BQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRTtBQUMvQixXQUFNLElBQUksS0FBSyxDQUFDLG1EQUFtRCxDQUFDLENBQUM7SUFDdEU7OztBQUdELFFBQUssQ0FBQyxPQUFPLENBQUMsVUFBQyxJQUFJLEVBQUs7QUFDdEIsU0FBSSxVQUFVLEtBQUssT0FBTyxJQUFJLEVBQUU7QUFDOUIsYUFBTSxJQUFJLEtBQUssa0NBQWdDLElBQUksQ0FBRyxDQUFDO01BQ3hEO0FBQ0QsU0FBSSxDQUFDLEtBQUssR0FBRyxPQUFLLE1BQU0sQ0FBQyxLQUFLLENBQUM7QUFDL0IsU0FBSSxPQUFLLE9BQU8sQ0FBQyxLQUFLLEVBQUU7OztBQUd0QixXQUFJLENBQUMsT0FBTyxHQUFHO0FBQ2IsY0FBSyxFQUFFLElBQUssS0FBSyxFQUFFLENBQUUsS0FBSztRQUMzQixDQUFDO01BQ0g7SUFDRixDQUFDLENBQUM7OztBQUdILE9BQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxHQUN4QixJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsWUFBTTs7Ozs7Ozs7QUFHcEMsNEJBQWlCLEtBQUssOEhBQUU7YUFBZixJQUFJOztBQUNYLGFBQUksT0FBSyxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDN0IsaUJBQU0sSUFBSSxPQUFPLENBQUMsY0FBYyxFQUFFLENBQUM7VUFDcEM7UUFDRjs7Ozs7Ozs7Ozs7Ozs7O0lBQ0YsQ0FBQyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7O0FBZ0JMLE9BQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxHQUN4QixJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUM7WUFBTSxPQUFLLFlBQVksQ0FBQyxLQUFLLENBQUM7SUFBQSxDQUFDLENBQUM7QUFDbEUsT0FBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEdBQ3hCLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxTQUFNLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDO0FBQ3hELGVBQVUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLGlCQUFpQjtJQUM3QyxDQUFDLENBQUMsQ0FBQzs7OztBQUlOLE9BQUksQ0FBQyxTQUFTLENBQUMsaUJBQWlCLElBQUksQ0FBQyxDQUFDO0VBRXZDLENBQUM7O0FBRUYsUUFBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsVUFBUyxPQUFPLEVBQUU7QUFDM0MsT0FBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEdBQ3hCLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxTQUFNLENBQUMsVUFBQyxHQUFHLEVBQUs7QUFDMUMsU0FBSSxHQUFHLFlBQVksT0FBTyxDQUFDLGNBQWMsRUFBRTs7O0FBR3pDLGFBQU0sR0FBRyxDQUFDO01BQ1gsTUFBTTtBQUNMLGNBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztNQUNkO0lBQ0YsQ0FBQyxDQUFDO0VBQ0osQ0FBQzs7Ozs7QUFLRixRQUFPLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxZQUFXO0FBQ2xDLE9BQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztFQUNsQyxDQUFDOzs7Ozs7OztBQVFGLFFBQU8sQ0FBQyxTQUFTLENBQUMsWUFBWSxHQUFHLFVBQVMsS0FBSyxFQUFFOzs7O0FBRS9DLE9BQUksV0FBVyxHQUFHLEVBQUUsQ0FBQztBQUNyQixPQUFJLElBQUksS0FBSyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRTtBQUMvQixTQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ25COzs7OztBQUtELE9BQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQyxJQUFJLEVBQUs7OztBQUcvQixTQUFJLGVBQWUsR0FBRyxPQUFLLE1BQU0sQ0FBQyxXQUFXLENBQUM7QUFDOUMsU0FBSSxLQUFLLENBQUM7OztBQUdWLFNBQUksZUFBZSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDOUIsWUFBSyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztNQUMvQixNQUFNO0FBQ0wsWUFBSyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztNQUNsQzs7QUFFRCxTQUFJLENBQUMsS0FBSyxFQUFFOzs7QUFHVixrQkFBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN4QixjQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7TUFDL0I7OztBQUdELFNBQUksV0FBVyxLQUFLLE9BQU8sS0FBSyxDQUFDLFFBQVEsSUFDckMsS0FBSyxDQUFDLFFBQVEsWUFBWSxPQUFPLEVBQUU7O0FBRXJDLGNBQU8sS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxZQUFNO0FBQ3JELGFBQUksWUFBWSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQzs7Ozs7QUFLckQsYUFBSSxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTs7O0FBRzNCLHNCQUFXLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztVQUM5QyxNQUFNO0FBQ0wsc0JBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7VUFDeEQ7UUFDRixDQUFDLENBQUM7TUFDSixNQUFNLElBQUksS0FBSyxDQUFDLElBQUksRUFBRTs7QUFFckIsY0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQUMsYUFBYSxFQUFLO0FBQ25DLG9CQUFXLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ2pDLENBQUMsQ0FBQztNQUNKLE1BQU07OztBQUdMLGtCQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3hCLGNBQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztNQUMvQjtJQUNGLENBQUMsQ0FBQztBQUNILFVBQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBTTs7OztBQUlwQyxZQUFLLE1BQU0sQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO0lBQ3ZDLENBQUMsQ0FBQztFQUNKLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaUJGLFFBQU8sQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEdBQUcsVUFBUyxTQUFTLEVBQUU7QUFDMUQsVUFBTyxVQUFDLEdBQUcsRUFBSztBQUNkLFNBQUksRUFBRSxHQUFHLFlBQVksT0FBTyxDQUFDLGNBQWMsR0FBRztBQUM1QyxjQUFPLENBQUMsS0FBSyxvQkFBa0IsU0FBUyxDQUFDLFVBQVUsQ0FBQyxtQ0FDL0IsR0FBRyxDQUFDLE9BQU8sRUFBSSxHQUFHLENBQUMsQ0FBQztNQUMxQztBQUNELFdBQU0sR0FBRyxDQUFDO0lBQ1gsQ0FBQztFQUNILENBQUM7O0FBRUYsUUFBTyxDQUFDLFNBQVMsQ0FBQyxjQUFjLEdBQUcsVUFBUyxJQUFJLEVBQUU7QUFDaEQsT0FBSSxJQUFJLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFO0FBQ3BDLFlBQU8sSUFBSSxDQUFDO0lBQ2I7QUFDRCxVQUFPLEtBQUssQ0FBQztFQUNkLENBQUM7O0FBRUYsUUFBTyxDQUFDLFNBQVMsQ0FBQyxzQkFBc0IsR0FBRyxZQUFXO0FBQ3BELE9BQU0sU0FBUyxHQUFHLENBQ2hCLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLEVBQzFDLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLEVBQzVDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLEVBQzNDLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLEVBQ2xELEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsZUFBZSxFQUFFLEVBQ25ELEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsZUFBZSxFQUFFLEVBQ25ELEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsZUFBZSxFQUFFLEVBQ3hELEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsZUFBZSxFQUFFLENBQ3BELENBQUM7QUFDRixPQUFJLFFBQVEsR0FBRyxTQUFTLENBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFFLENBQUM7QUFDekUsVUFBTyxRQUFRLENBQUM7RUFDakIsQ0FBQzs7QUFFRixRQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxVQUFTLEtBQUssRUFBRTs7O0FBQ3hDLE9BQUksS0FBSyxLQUFLLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFO0FBQ2hDLFlBQU87SUFDUjtBQUNELE9BQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBQyxhQUFhLEVBQUUsSUFBSSxFQUFLO0FBQzlDLFNBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsRUFDOUMsT0FBSyxTQUFTLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDbEMsU0FBSSxPQUFPLFNBQVEsTUFBTSxNQUFJLENBQUM7QUFDOUIsWUFBTyxhQUFhLEdBQUcsT0FBTyxDQUFDO0lBQ2hDLFVBQVMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBTSxJQUFJLENBQUMsU0FBUyxDQUFDLGlCQUFpQixTQUFPLENBQUM7O0FBRXRFLE9BQUksV0FBVyxHQUFHLElBQUksTUFBTSxDQUFDLGlDQUFpQyxDQUFDLENBQUM7QUFDaEUsT0FBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFDLElBQUksRUFBSztBQUM5RCxZQUFPLEVBQUUsS0FBSyxJQUFJLENBQUM7SUFDcEIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFDLElBQUksRUFBSztBQUNsQixZQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNqQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUVkLE1BQUcsR0FBRyxHQUFHLEdBQUcsU0FBUyxHQUFHLEtBQUssQ0FBQztBQUM5QixVQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxvQkFBb0IsR0FBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEdBQ3JFLEdBQUcsR0FBRyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7RUFDdkQsQ0FBQzs7QUFFRixRQUFPLENBQUMsY0FBYyxHQUFHLFVBQVMsT0FBTyxFQUFFO0FBQ3pDLE9BQUksQ0FBQyxJQUFJLEdBQUcsZ0JBQWdCLENBQUM7QUFDN0IsT0FBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLElBQUksRUFBRSxDQUFDO0VBQzlCLENBQUM7O0FBRUYsUUFBTyxDQUFDLGNBQWMsQ0FBQyxTQUFTLEdBQUcsSUFBSSxLQUFLLEVBQUUsQzs7Ozs7O0FDalY5QyxhQUFZLENBQUM7Ozs7O1NBK0JHLGNBQWMsR0FBZCxjQUFjOzs2Q0E3QlEsQ0FBcUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTZCcEQsVUFBUyxjQUFjLENBQUMsSUFBSSxFQUFFO0FBQ25DLE9BQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO0FBQzNCLE9BQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDOzs7Ozs7QUFNekIsT0FBSSxDQUFDLFNBQVMsR0FBRztBQUNmLGFBQVEsRUFBRSxFQUFFO0lBQ2IsQ0FBQztBQUNGLE9BQUksQ0FBQyxPQUFPLEdBQUc7QUFDYixXQUFNLEVBQUU7QUFDTixZQUFLLEVBQUUsS0FBSztBQUFBLE1BQ2I7SUFDRixDQUFDOzs7OztBQUtGLE9BQUksQ0FBQyxNQUFNLEdBQUcsc0JBakRQLE1BQU0sRUFpRGtCLENBQUM7QUFDaEMsT0FBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7O0FBRWpCLE9BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLE9BQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO0VBQ3pCOzs7OztBQUtELGVBQWMsQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUM5QixZQUFXO0FBQ1QsVUFBTyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxDQUFDO0VBQ2xDLENBQUM7Ozs7Ozs7Ozs7Ozs7O0FBY0YsZUFBYyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsVUFBUyxLQUFLLEVBQWU7T0FBYixNQUFNLHlEQUFHLEVBQUU7O0FBQy9ELE9BQUksU0FBUyxHQUFHLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2hDLE9BQUksWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7QUFDckMsT0FBSSxDQUFDLFlBQVksR0FBRyxTQUFTLENBQUM7QUFDOUIsT0FBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQzFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3BDLFVBQU8sWUFBWSxDQUFDLElBQUksRUFBRSxDQUN2QixJQUFJLENBQUM7WUFBTSxTQUFTLENBQUMsS0FBSyxFQUFFO0lBQUEsQ0FBQyxDQUFDO0VBQ2xDLENBQUM7Ozs7Ozs7Ozs7Ozs7QUFhRixlQUFjLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxVQUFTLFNBQVMsRUFBRTtBQUNuRCxPQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3ZDLE9BQUksU0FBUyxFQUFFO0FBQ2IsVUFBSyxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO0FBQzlCLFdBQUksV0FBVyxLQUFLLE9BQU8sU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQ3pDLGFBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3RDO01BQ0Y7SUFDRjs7OztBQUlELE9BQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztBQUNyQyxVQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUM7RUFDbEMsQ0FBQzs7QUFFRixlQUFjLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxZQUFXO0FBQ3pDLFVBQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FDNUIsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0VBQ2pELENBQUM7O0FBRUYsZUFBYyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsWUFBVzs7O0FBQzVDLFVBQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FDL0IsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUMvQyxJQUFJLENBQUMsWUFBTTtBQUFFLFdBQUssTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQUUsQ0FBQyxDQUFDO0VBQ3hDLENBQUM7O0FBRUYsZUFBYyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsWUFBVztBQUN6QyxVQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0VBQ3hDLENBQUM7O0FBRUYsZUFBYyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsWUFBVztBQUMxQyxVQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0VBQzNDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFzQkYsZUFBYyxDQUFDLFNBQVMsQ0FBQyxjQUFjLEdBQUcsVUFBUyxNQUFNLEVBQUUsSUFBSSxFQUFFOzs7QUFDL0QsT0FBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUU7QUFDeEIsWUFBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDMUI7QUFDRCxPQUFJLFlBQVksR0FDaEIsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQUMsS0FBSyxFQUFFLElBQUksRUFBSztBQUN2RCxTQUFJLFFBQVEsR0FBRyxPQUFLLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7OztBQUl6QyxTQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUU7QUFDM0IsV0FBSSxPQUFPLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxVQUFDLFlBQVksRUFBSztBQUMzQyxnQkFBTyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN2RCxDQUFDLENBQUM7QUFDSCxjQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7TUFDOUIsTUFBTTtBQUNMLGNBQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztNQUMvRDtJQUNGLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDUCxVQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7RUFDbEMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7QUFjRixlQUFjLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxVQUFTLEtBQUssRUFBRSxNQUFNLEVBQUU7QUFDeEQsVUFBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7RUFDeEMsQzs7Ozs7O0FDOUxELGFBQVksQ0FBQzs7Ozs7U0FNRyxNQUFNLEdBQU4sTUFBTTs7Ozs7O0FBQWYsVUFBUyxNQUFNLEdBQUcsRUFBRTs7QUFFM0IsT0FBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQ3RCLFNBQVMsU0FBUyxDQUFDLE9BQU8sRUFBRTtBQUMxQixPQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztBQUNyQixPQUFJLENBQUMsT0FBTyxHQUFHO0FBQ2IsWUFBTyxFQUFFLEtBQUssSUFBSSxPQUFPLENBQUMsT0FBTztBQUNqQyxZQUFPLEVBQUUsS0FBSyxJQUFJLE9BQU8sQ0FBQyxPQUFPO0FBQ2pDLFVBQUssRUFBRSxJQUFJLElBQUksT0FBTyxDQUFDLEtBQUs7QUFDNUIsVUFBSyxFQUFFLEtBQUssSUFBSSxPQUFPLENBQUMsS0FBSztBQUM3QixVQUFLLEVBQUUsSUFBSSxJQUFJLE9BQU8sQ0FBQyxLQUFLO0FBQzVCLGFBQVEsRUFBRSxPQUFPLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztJQUM5RCxDQUFDO0FBQ0YsVUFBTyxJQUFJLENBQUM7RUFDYixDQUFDOztBQUVGLE9BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUN0QixTQUFTLFNBQVMsR0FBRztBQUNuQixPQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFO0FBQ3RCLFNBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM5RDtBQUNELFVBQU8sSUFBSSxDQUFDO0VBQ2IsQ0FBQzs7QUFFRixPQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FDeEIsU0FBUyxXQUFXLEdBQUc7QUFDckIsT0FBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRTtBQUN4QixTQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDOUQ7QUFDRCxVQUFPLElBQUksQ0FBQztFQUNiLENBQUM7O0FBRUYsT0FBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsU0FBUyxXQUFXLEdBQUc7QUFDaEQsT0FBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRTtBQUNoRCxTQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDOUQ7QUFDRCxVQUFPLElBQUksQ0FBQztFQUNiLENBQUM7O0FBRUYsT0FBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQ3RCLFNBQVMsU0FBUyxHQUFHO0FBQ25CLE9BQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLElBQzFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFO0FBQ3hCLFNBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM5RDtBQUNELFVBQU8sSUFBSSxDQUFDO0VBQ2IsQ0FBQzs7Ozs7Ozs7O0FBU0YsT0FBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsU0FBUyxTQUFTLEdBQUc7QUFDNUMsT0FBSSxDQUFDLEdBQUcsQ0FBQyxJQUFLLEtBQUssRUFBRSxDQUFFLEtBQUssQ0FBQyxDQUFDO0FBQzlCLFVBQU8sSUFBSSxDQUFDO0VBQ2IsQ0FBQzs7Ozs7Ozs7Ozs7OztBQWFGLE9BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUN6QixTQUFTLFlBQVksQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFtQjtPQUFqQixVQUFVLHlEQUFHLEVBQUU7O0FBQzdDLE9BQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRTtBQUN2QixZQUFPO0lBQ1I7QUFDRCxPQUFJLGVBQWUsR0FBRztBQUNwQixTQUFJLEVBQUUsSUFBSTtBQUNWLE9BQUUsRUFBRSxFQUFFO0FBQ04sZUFBVSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNuRCxDQUFDO0FBQ0YsT0FBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRTtBQUN0QixTQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUN2QztBQUNELE9BQUksQ0FBQyxLQUFLLDJCQUF5QixJQUFJLFlBQU8sRUFBRSxtQkFDOUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzlCLFVBQU8sSUFBSSxDQUFDO0VBQ2IsQ0FBQzs7Ozs7Ozs7O0FBU0YsT0FBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQ3RCLFNBQVMsU0FBUyxHQUFHO0FBQ25CLFVBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBQyxJQUFJLEVBQUUsSUFBSSxFQUFLO0FBQzVDLFlBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUMzRCxFQUFFLEVBQUUsQ0FBQyxDQUFDO0VBQ1IsQ0FBQzs7QUFFRixPQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FDcEIsU0FBUyxPQUFPLEdBQUc7QUFDakIsT0FBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUM7QUFDckMsV0FBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDaEMsVUFBTyxJQUFJLENBQUM7RUFDYixDQUFDOztBQUVGLE9BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUNyQixTQUFTLFFBQVEsR0FBRztBQUNsQixPQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDM0IsVUFBTyxJQUFJLENBQUM7RUFDYixDQUFDOztBQUVGLE9BQU0sQ0FBQyxTQUFTLENBQUMsZUFBZSxHQUNoQyxTQUFTLG1CQUFtQixHQUFHO0FBQzdCLFVBQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztBQUN0QyxVQUFPLElBQUksQ0FBQztFQUNiLEM7Ozs7OztBQzlIRCxhQUFZLENBQUM7Ozs7O1NBUUcsT0FBTyxHQUFQLE9BQU87OzhDQU5FLENBQXNCOztrREFDcEIsQ0FBMEI7Ozs7OztBQUs5QyxVQUFTLE9BQU8sR0FBRztBQUN4QixPQUFJLENBQUMsT0FBTyxHQUFHO0FBQ2IsVUFBSyxFQUFFLEVBQUU7SUFDVixDQUFDO0FBQ0YsT0FBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7O0FBRWhCLE9BQUksQ0FBQyxVQUFVLEdBQUcsSUFBSyxtQkFaaEIsUUFBUSxDQVlpQixRQUFRLEVBQUUsQ0FDdkMsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQ25DLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQzNDLE9BQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0VBQ3BCOzs7QUFHRCxRQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxtQkFuQmpCLFFBQVEsQ0FtQmtCLE1BQU0sQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDNUQsUUFBTyxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsbUJBcEJyQixRQUFRLENBb0JzQixNQUFNLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ25FLFFBQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLG1CQXJCbEIsUUFBUSxDQXFCbUIsTUFBTSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUM3RCxRQUFPLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxtQkF0QnRCLFFBQVEsQ0FzQnVCLE1BQU0sQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDckUsUUFBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsbUJBdkJuQixRQUFRLENBdUJvQixNQUFNLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQy9ELFFBQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLG1CQXhCaEIsUUFBUSxDQXdCaUIsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztBQUN6RCxRQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxtQkF6Qm5CLFFBQVEsQ0F5Qm9CLE1BQU0sQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDL0QsUUFBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsbUJBMUJuQixRQUFRLENBMEJvQixNQUFNLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDOztBQUUvRCxRQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxtQkE1QmpCLFFBQVEsQ0E0QmtCLE1BQU0sQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7O0FBRTNELFFBQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLG1CQTlCcEIsUUFBUSxDQThCcUIsTUFBTSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQzs7O0FBR2pFLFFBQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLFVBQVMsT0FBTyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUU7O0FBRTFELFVBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0VBQzlDLENBQUM7O0FBRUYsUUFBTyxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsVUFBUyxPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRTtBQUMzRCxPQUFJLE9BQU8sS0FBSyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRTtBQUM3QyxXQUFNLElBQUksS0FBSyxlQUFZLElBQUksQ0FBQyxJQUFJLHdDQUFvQyxDQUFDO0lBQzFFO0FBQ0QsV0FBTyxJQUFJLENBQUMsSUFBSTtBQUNkLFVBQUssT0FBTztBQUNWLGNBQU8sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0FBQ3ZCLGFBQU07QUFBQSxVQUNILFdBQVc7QUFDZCxXQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxRQUFRLEtBQUssT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUMxRCxVQUFVLEtBQUssT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRTtBQUNqRCxlQUFNLElBQUksS0FBSyxTQUFNLElBQUksQ0FBQyxJQUFJLHVFQUN1QixDQUFDO1FBQ3ZEO0FBQ0QsYUFBTTtBQUFBLFVBQ0gsTUFBTTtBQUNULFdBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLFFBQVEsS0FBSyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDOUQsZUFBTSxJQUFJLEtBQUssU0FBTSxJQUFJLENBQUMsSUFBSSw2REFDZSxDQUFDO1FBQy9DO0FBQ0QsYUFBTTtBQUFBLFVBQ0gsUUFBUSxDQUFDO0FBQ2QsVUFBSyxZQUFZLENBQUM7QUFDbEIsVUFBSyxTQUFTO0FBQ1osV0FBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUNqRCxlQUFNLElBQUksS0FBSyxTQUFNLElBQUksQ0FBQyxJQUFJLHFEQUNPLENBQUM7UUFDdkM7QUFDRCxhQUFNO0FBQUEsVUFDSCxTQUFTO0FBQ1osV0FBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksVUFBVSxLQUFLLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUN2RCxlQUFNLElBQUksS0FBSyxTQUFNLElBQUksQ0FBQyxJQUFJLHVEQUNTLENBQUM7UUFDekM7QUFDRCxhQUFNO0FBQUEsVUFDSCxTQUFTO0FBQ1osV0FBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksUUFBUSxLQUFLLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUNyRCxlQUFNLElBQUksS0FBSyxTQUFNLElBQUksQ0FBQyxJQUFJLHNEQUNRLENBQUM7UUFDeEM7QUFDRCxhQUFNO0FBQUEsVUFDSCxPQUFPLENBQUM7QUFDYixVQUFLLFVBQVU7OztBQUdiLFdBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxRQUFRLEtBQUssT0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRTtBQUNqRSxlQUFNLElBQUksS0FBSyxxQ0FBcUMsQ0FBQztRQUN0RDtBQUNELGFBQU07QUFBQSxJQUNUO0VBQ0YsQ0FBQzs7Ozs7O0FBTUYsUUFBTyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsVUFBUyxPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRTtBQUM1RCxPQUFJLE9BQU8sS0FBSyxJQUFJLENBQUMsSUFBSSxFQUFFO0FBQ3pCLFlBQU87SUFDUjs7O0FBR0QsT0FBSSxPQUFPLEtBQUssSUFBSSxDQUFDLElBQUksSUFBSSxVQUFVLEtBQUssSUFBSSxDQUFDLElBQUksRUFBRTs7QUFFckQsWUFBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN4QyxZQUFPO0lBQ1I7QUFDRCxPQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO0FBQzFCLFVBQU8sQ0FBQyxNQUFNLEdBQUcsWUFBVztBQUMxQiw0QkExR0ssVUFBVSxDQTBHSixLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQ2xDLFNBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7QUFDL0IsU0FBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFDO0FBQ2hELFNBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUMsVUFBVSxJQUFJLEVBQUUsQ0FBQztBQUN4RCxTQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUM7QUFDbEQsU0FBSSxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ25ELENBQUM7QUFDRixVQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLHVCQWpIbEMsVUFBVSxDQWlIbUMsU0FBUyxDQUFDLENBQUM7QUFDL0QsT0FBSSxLQUFLLENBQUMsT0FBTyxFQUFFO0FBQ2pCLFdBQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFTLFVBQVUsRUFBRTtBQUN0RCxjQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO01BQ2xFLENBQUMsQ0FBQztJQUNKO0FBQ0QsT0FBSSxPQUFPLEtBQUssSUFBSSxDQUFDLElBQUksRUFBRTs7QUFFekIsVUFBSyxHQUFHLENBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBRSxDQUFDO0FBQzNCLFlBQU8sS0FBSyxDQUFDO0lBQ2Q7QUFDRCxPQUFJLFVBQVUsS0FBSyxJQUFJLENBQUMsSUFBSSxFQUFFO0FBQzVCLFNBQUksUUFBUSxLQUFLLE9BQU8sS0FBSyxDQUFDLFNBQVMsSUFDbkMsVUFBVSxLQUFLLE9BQU8sS0FBSyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUU7QUFDcEQsYUFBTSxJQUFJLEtBQUssNENBQTRDLENBQUM7TUFDN0Q7QUFDRCxVQUFLLEdBQUcsQ0FBRSxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFFLENBQUM7QUFDaEQsWUFBTyxLQUFLLENBQUM7SUFDZDtFQUNGLEM7Ozs7OztBQ3ZJQSxhQUFZLENBQUM7Ozs7O1NBU0UsVUFBVSxHQUFWLFVBQVU7Ozs7Ozs7O0FBQW5CLFVBQVMsVUFBVSxHQUFHOzs7OztBQUszQixPQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQzs7Ozs7OztBQ2RyQixhQUFZLENBQUM7Ozs7O1NBTUUsYUFBYSxHQUFiLGFBQWE7Ozs7OztBQUF0QixVQUFTLGFBQWEsR0FBRztBQUM5QixPQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztBQUNoQixPQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0VBQ3REOztBQUVELGNBQWEsQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFHLFVBQVMsS0FBSyxFQUFFOzs7QUFDNUMsT0FBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQ3JCLFlBQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDM0M7O0FBRUQsT0FBSSxPQUFPLEVBQUUsTUFBTSxDQUFDO0FBQ3BCLE9BQUksT0FBTyxHQUFHLElBQUksT0FBTyxDQUFDLFVBQUMsR0FBRyxFQUFFLEdBQUcsRUFBSztBQUN0QyxZQUFPLEdBQUcsR0FBRyxDQUFDO0FBQ2QsV0FBTSxHQUFHLEdBQUcsQ0FBQztJQUNkLENBQUMsQ0FBQztBQUNILE9BQUksSUFBSSxHQUFHLFNBQVMsQ0FBQyxXQUFXLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDOUMsT0FBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMxQixNQUFHLENBQUMsSUFBSSxDQUFDLFlBQU07QUFDYixXQUFLLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUV0QyxjQUFTLENBQUMsV0FBVyxDQUNsQixXQUFXLENBQUMsS0FBSyxFQUFFLE1BQUssY0FBYyxDQUFDLENBQUM7QUFDM0MsWUFBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUM1QixDQUFDLFNBQU0sQ0FBQyxZQUFNO0FBQ2IsV0FBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNuQixDQUFDLENBQUM7QUFDSCxVQUFPLE9BQU8sQ0FBQztFQUNoQixDQUFDO0FBQ0YsY0FBYSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUcsVUFBUyxLQUFLLEVBQUUsS0FBSyxFQUFFOzs7QUFDbkQsT0FBSSxPQUFPLEVBQUUsTUFBTSxDQUFDO0FBQ3BCLE9BQUksT0FBTyxHQUFHLElBQUksT0FBTyxDQUFDLFVBQUMsR0FBRyxFQUFFLEdBQUcsRUFBSztBQUN0QyxZQUFPLEdBQUcsR0FBRyxDQUFDO0FBQ2QsV0FBTSxHQUFHLEdBQUcsQ0FBQztJQUNkLENBQUMsQ0FBQztBQUNILE9BQUksSUFBSSxHQUFHLFNBQVMsQ0FBQyxXQUFXLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDOUMsT0FBSSxVQUFVLEdBQUcsRUFBRSxDQUFDO0FBQ3BCLGFBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUM7QUFDMUIsT0FBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUMvQixNQUFHLENBQUMsSUFBSSxDQUFDLFlBQU07QUFDYixZQUFLLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUM7QUFDMUIsWUFBTyxFQUFFLENBQUM7SUFDWCxDQUFDLFNBQU0sQ0FBQyxZQUFNO0FBQ2IsV0FBTSxFQUFFLENBQUM7SUFDVixDQUFDLENBQUM7QUFDSCxVQUFPLE9BQU8sQ0FBQztFQUNoQixDQUFDO0FBQ0YsY0FBYSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEdBQUcsVUFBUyxHQUFHLEVBQUU7T0FDL0MsWUFBWSxHQUFvQixHQUFHLENBQW5DLFlBQVk7T0FBRSxhQUFhLEdBQUssR0FBRyxDQUFyQixhQUFhOztBQUNqQyxPQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxHQUFHLGFBQWEsQ0FBQztFQUMxQyxDQUFDO0FBQ0YsY0FBYSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsWUFBVzs7O0FBQ3hDLFNBQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFDLEtBQUssRUFBSztBQUN6QyxjQUFTLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsT0FBSyxjQUFjLENBQUMsQ0FBQztJQUNsRSxDQUFDLENBQUM7RUFDSixDOzs7Ozs7QUM1REQsYUFBWSxDQUFDOzs7OztTQVNHLGNBQWMsR0FBZCxjQUFjOztvREFQRixFQUE0Qjs7Ozs7Ozs7QUFPakQsVUFBUyxjQUFjLENBQUMsT0FBTyxFQUFFO0FBQ3RDLE9BQUksQ0FBQyxPQUFPLEdBQUc7QUFDYixXQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU0sSUFBSSxFQUFFO0lBQzdCLENBQUM7QUFDRixPQUFJLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDdkQsT0FBSSxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzVELE9BQUksQ0FBQyxVQUFVLENBQUM7Ozs7QUFJaEIsT0FBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUMxQzs7QUFFRCxlQUFjLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxVQUFTLFNBQVMsRUFBRTs7O0FBQ25ELE9BQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFDLEtBQUssRUFBSztBQUNyQyxXQUFLLFVBQVUsQ0FBQyxLQUFLLEVBQUUsTUFBSyxRQUFRLENBQUMsQ0FBQztJQUN2QyxDQUFDLENBQUM7QUFDSCxPQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztBQUM1QixVQUFPLElBQUksQ0FBQztFQUNiLENBQUM7O0FBRUYsZUFBYyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsWUFBVzs7O0FBQ3pDLE9BQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0FBQ3ZCLE9BQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFDLEtBQUssRUFBSztBQUNyQyxZQUFLLFlBQVksQ0FBQyxLQUFLLEVBQUUsT0FBSyxRQUFRLENBQUMsQ0FBQztJQUN6QyxDQUFDLENBQUM7QUFDSCxVQUFPLElBQUksQ0FBQztFQUNiLENBQUM7Ozs7O0FBS0YsZUFBYyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsVUFBUyxNQUFNLEVBQUU7QUFDbkQsT0FBSSxJQUFJLENBQUMsVUFBVSxFQUFFO0FBQ25CLFNBQUksV0FBVyxHQUFHLDZCQXpDYixXQUFXLENBMENkLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztBQUN0QyxTQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQzlCO0VBQ0YsQzs7Ozs7O0FDL0NBLGFBQVksQ0FBQzs7Ozs7QUFLZCxFQUFDLFVBQVMsT0FBTyxFQUFFO0FBQ2pCLE9BQUksV0FBVyxHQUFHLFNBQWQsV0FBVyxDQUFZLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFO0FBQ2pELFNBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLFNBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQ3JCLFNBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0lBQzFCLENBQUM7QUFDRixVQUFPLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztFQUNuQyxFQUFFLE1BQU0sQ0FBQyxDOzs7Ozs7QUNaVixhQUFZLENBQUM7Ozs7O1NBT0csaUJBQWlCLEdBQWpCLGlCQUFpQjs7b0RBTEwsRUFBNEI7Ozs7OztBQUtqRCxVQUFTLGlCQUFpQixDQUFDLE9BQU8sRUFBRTtBQUN6QyxPQUFJLENBQUMsT0FBTyxHQUFHO0FBQ2IsU0FBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJO0FBQ2xCLGFBQVEsRUFBRSxLQUFLO0FBQUEsSUFDaEIsQ0FBQztBQUNGLE9BQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0FBQ3BCLE9BQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDOzs7QUFHdkIsT0FBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUMxQzs7QUFFRCxrQkFBaUIsQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLFVBQVMsU0FBUyxFQUFFOzs7QUFDdEQsT0FBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7QUFDNUIsT0FBSSxPQUFPLEdBQUcsSUFBSyxJQUFJLEVBQUUsQ0FBRSxVQUFVLEVBQUUsQ0FBQzs7O0FBR3hDLE9BQUksQ0FBQyxLQUFLLE9BQU8sRUFBRTtBQUNqQixTQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDakI7O0FBRUQsT0FBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLFlBQU07QUFDckMsV0FBSyxJQUFJLEVBQUUsQ0FBQztJQUNiLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQztBQUNoQyxVQUFPLElBQUksQ0FBQztFQUNiLENBQUM7O0FBRUYsa0JBQWlCLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxZQUFXOzs7QUFDNUMsT0FBSSxDQUFDLFFBQVEsRUFBRSxDQUFDOztBQUVoQixPQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsWUFBTTtBQUNyQyxZQUFLLElBQUksRUFBRSxDQUFDO0lBQ2IsRUFBRSxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDO0VBQ2pDLENBQUM7O0FBRUYsa0JBQWlCLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxZQUFXO0FBQzVDLE9BQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0FBQ3ZCLE9BQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNoQixXQUFNLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNuQztBQUNELFVBQU8sSUFBSSxDQUFDO0VBQ2IsQ0FBQzs7Ozs7OztBQU9GLGtCQUFpQixDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsWUFBVztBQUNoRCxPQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7QUFDbkIsU0FBSSxDQUFDLFVBQVUsQ0FBQyw2QkF2RFgsV0FBVyxDQXVEZ0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3JEO0VBQ0YsQ0FBQzs7QUFFRixrQkFBaUIsQ0FBQyxTQUFTLENBQUMsb0JBQW9CLEdBQUcsWUFBVztBQUM1RCxPQUFJLE9BQU8sR0FBRyxJQUFLLElBQUksRUFBRSxDQUFFLFVBQVUsRUFBRSxDQUFDOztBQUV4QyxPQUFJLGdCQUFnQixHQUFHLENBQUMsRUFBRSxHQUFHLE9BQU8sSUFBSSxJQUFJLENBQUM7QUFDN0MsVUFBTyxnQkFBZ0IsQ0FBQztFQUN6QixDOzs7Ozs7QUNsRUQsYUFBWSxDQUFDOzs7OztTQVNHLGFBQWEsR0FBYixhQUFhOztvREFQRCxFQUE0Qjs7Ozs7Ozs7QUFPakQsVUFBUyxhQUFhLENBQUMsT0FBTyxFQUFFO0FBQ3JDLE9BQUksQ0FBQyxPQUFPLEdBQUc7QUFDYixhQUFRLEVBQUUsT0FBTyxDQUFDLFFBQVEsSUFBSSxFQUFFO0lBQ2pDLENBQUM7QUFDRixPQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUNoRCxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQy9CLE9BQUksQ0FBQyxZQUFZLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQ3JELElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDL0IsT0FBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7OztBQUd2QixPQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0VBQzFDOztBQUVELGNBQWEsQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLFVBQVMsU0FBUyxFQUFFOzs7QUFDbEQsT0FBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQUMsR0FBRyxFQUFLO0FBQ3JDLFdBQUssVUFBVSxDQUFDLEdBQUcsRUFBRSxNQUFLLFFBQVEsQ0FBQyxDQUFDO0lBQ3JDLENBQUMsQ0FBQztBQUNILE9BQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO0FBQzVCLFVBQU8sSUFBSSxDQUFDO0VBQ2IsQ0FBQzs7QUFFRixjQUFhLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxZQUFXOzs7QUFDeEMsT0FBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7QUFDdkIsT0FBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQUMsR0FBRyxFQUFLO0FBQ3JDLFlBQUssWUFBWSxDQUFDLEdBQUcsRUFBRSxPQUFLLFFBQVEsQ0FBQyxDQUFDO0lBQ3ZDLENBQUMsQ0FBQztBQUNILFVBQU8sSUFBSSxDQUFDO0VBQ2IsQ0FBQzs7Ozs7OztBQU9GLGNBQWEsQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLFVBQVMsTUFBTSxFQUFFO0FBQ2xELE9BQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtBQUNuQixTQUFJLENBQUMsVUFBVSxDQUNiLDZCQTdDRyxXQUFXLENBNkNFLE1BQU0sQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7SUFDN0Q7RUFDRixDOzs7Ozs7QUNqREEsYUFBWSxDQUFDOzs7OztTQWlCSSxTQUFTLEdBQVQsU0FBUzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBbEIsVUFBUyxTQUFTLEdBQUcsRUFBRTs7Ozs7Ozs7OztBQVU5QixVQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxVQUFTLElBQUksRUFBRSxFQUFFLEMiLCJmaWxlIjoiZ2xlaXBuaXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0ZXhwb3J0czoge30sXG4gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuIFx0XHRcdGxvYWRlZDogZmFsc2VcbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIHdlYnBhY2svYm9vdHN0cmFwIDQwMzI0OTgzYmM2NDJhNmVjNzRhXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgeyBMYW5ndWFnZSB9IGZyb20gJ3NyYy9ydW5lL2xhbmd1YWdlLmpzJztcbmltcG9ydCB7IEJhc2ljU3RhdGUgfSBmcm9tICdzcmMvc3RhdGUvYmFzaWNfc3RhdGUuanMnO1xuaW1wb3J0IHsgQmFzaWNDb21wb25lbnQgfSBmcm9tICdzcmMvY29tcG9uZW50L2Jhc2ljX2NvbXBvbmVudC5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBCdWlsZGVyKCkge1xuICB0aGlzLmNvbnRleHQgPSB7XG4gICAgX2luZm86IHt9XG4gIH07XG4gIHRoaXMuc3RhY2sgPSBbXTtcbiAgdGhpcy5fZXZhbHVhdG9yID0gKG5ldyBMYW5ndWFnZS5FdmFsdWF0ZSgpKVxuICAgIC5hbmFseXplcih0aGlzLl9hbmFseXplci5iaW5kKHRoaXMpKVxuICAgIC5pbnRlcnByZXRlcih0aGlzLl9pbnRlcnByZXQuYmluZCh0aGlzKSk7XG4gIHRoaXMuX2NvbXBvbmVudCA9IG51bGw7XG59XG5cbi8vIFRoZSBsYW5ndWFnZSBpbnRlcmZhY2UuXG5CdWlsZGVyLnByb3RvdHlwZS5zdGFydCA9IExhbmd1YWdlLmRlZmluZSgnc3RhcnQnLCAnYmVnaW4nKTtcbkJ1aWxkZXIucHJvdG90eXBlLnR5cGUgPSBMYW5ndWFnZS5kZWZpbmUoJ3R5cGUnLCAncHVzaCcpO1xuQnVpbGRlci5wcm90b3R5cGUuY29uZmlncyA9IExhbmd1YWdlLmRlZmluZSgnY29uZmlncycsICdwdXNoJyk7XG4vLyBTZXQgdGhlIGRlZmF1bHQgcmVzb3VyY2VzLlxuQnVpbGRlci5wcm90b3R5cGUucmVzb3VyY2VzID0gTGFuZ3VhZ2UuZGVmaW5lKCdyZXNvdXJjZXMnLCAncHVzaCcpO1xuQnVpbGRlci5wcm90b3R5cGUubG9nZ2VyID0gTGFuZ3VhZ2UuZGVmaW5lKCdsb2dnZXInLCAncHVzaCcpO1xuQnVpbGRlci5wcm90b3R5cGUubWV0aG9kcyA9IExhbmd1YWdlLmRlZmluZSgnbWV0aG9kcycsICdwdXNoJyk7XG4vLyBUaGUgc2V0dXAgc3RhdGUuIFNob3VsZCBnaXZlIHRoZSBjb25zdHJ1Y3Rvci5cbkJ1aWxkZXIucHJvdG90eXBlLnNldHVwID0gTGFuZ3VhZ2UuZGVmaW5lKCdzZXR1cCcsICdwdXNoJyk7XG4vLyBUbyBidWlsZCBhIGNvbnN0cnVjdG9yICsgcHJvdG90eXBlXG5CdWlsZGVyLnByb3RvdHlwZS5idWlsZCA9IExhbmd1YWdlLmRlZmluZSgnYnVpbGQnLCAnZXhpdCcpO1xuLy8gQmVzaWRlcyB0aGUgY29uc3RydWN0b3IgYW5kIHByb3RvdHlwZSwgY3JlYXRlIGFuIGluc3RhbmNlIGFuZCByZXR1cm4gaXQuXG5CdWlsZGVyLnByb3RvdHlwZS5pbnN0YW5jZSA9IExhbmd1YWdlLmRlZmluZSgnaW5zdGFuY2UnLCAnZXhpdCcpO1xuXG4vLyBUaGUgcHJpdmF0ZSBtZXRob2RzLlxuQnVpbGRlci5wcm90b3R5cGUub25jaGFuZ2UgPSBmdW5jdGlvbihjb250ZXh0LCBub2RlLCBzdGFjaykge1xuICAvLyBXaGVuIGl0J3MgY2hhbmdlZCwgZXZhbHVhdGUgaXQgd2l0aCBhbmFseXplcnMgJiBpbnRlcnByZXRlci5cbiAgcmV0dXJuIHRoaXMuX2V2YWx1YXRvcihjb250ZXh0LCBub2RlLCBzdGFjayk7XG59O1xuXG5CdWlsZGVyLnByb3RvdHlwZS5fYW5hbHl6ZXIgPSBmdW5jdGlvbihjb250ZXh0LCBub2RlLCBzdGFjaykge1xuICBpZiAoJ3N0YXJ0JyAhPT0gbm9kZS50eXBlICYmICFjb250ZXh0LnN0YXJ0ZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEJlZm9yZSAnJHtub2RlLnR5cGV9Jywgc2hvdWxkIHN0YXJ0IHRoZSBidWlsZGVyIGZpcnN0YCk7XG4gIH1cbiAgc3dpdGNoKG5vZGUudHlwZSkge1xuICAgIGNhc2UgJ3N0YXJ0JzpcbiAgICAgIGNvbnRleHQuc3RhcnRlZCA9IHRydWU7XG4gICAgICBicmVhaztcbiAgICBjYXNlICd0eXBlJzpcbiAgICAgIGlmICgxICE9PSBub2RlLmFyZ3MubGVuZ3RoIHx8ICdzdHJpbmcnICE9PSB0eXBlb2Ygbm9kZS5hcmdzWzBdKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgICcke25vZGUudHlwZX0nXG4gICAgICAgICAgZXhwZWN0IHRvIGhhdmUgYSBzdHJpbmcgYXMgdGhlIGNvbXBvbmVudCB0eXBlYCk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdidWlsZCc6XG4gICAgY2FzZSAnaW5zdGFuY2UnOlxuICAgICAgLy8gQ2hlY2sgaWYgbmVjZXNzYXJ5IHByb3BlcnRpZXMgYXJlIG1pc3NpbmcuXG4gICAgICAvLyBDdXJyZW50bHksICdzZXR1cCcgYW5kICd0eXBlJyBpcyBuZWNlc3NhcnkuXG4gICAgICBpZiAoIWNvbnRleHQuX2luZm8udHlwZSB8fCAnc3RyaW5nJyAhPT0gdHlwZW9mIGNvbnRleHQuX2luZm8udHlwZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEEgc3RhdGUgc2hvdWxkIGF0IGxlYXN0IHdpdGggdHlwZWApO1xuICAgICAgfVxuICAgICAgaWYgKCFjb250ZXh0Ll9pbmZvLnNldHVwIHx8IGNvbnRleHQuX2luZm8uc2V0dXAgaW5zdGFuY2VvZiBCYXNpY1N0YXRlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQSBzdGF0ZSBzaG91bGQgYXQgbGVhc3Qgd2l0aCBzZXR1cCBzdGF0ZWApO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gIH1cbn07XG5cbi8qKlxuICogQXMgYW4gb3JkaW5hcnkgaW50ZXJwcmV0aW5nIGZ1bmN0aW9uOiBkbyBzb21lIGVmZmVjdHMgYWNjb3JkaW5nIHRvIHRoZSBub2RlLFxuICogYW5kIHJldHVybiB0aGUgZmluYWwgc3RhY2sgYWZ0ZXIgZW5kaW5nLlxuICovXG5CdWlsZGVyLnByb3RvdHlwZS5faW50ZXJwcmV0ID0gZnVuY3Rpb24oY29udGV4dCwgbm9kZSwgc3RhY2spIHtcbiAgaWYgKCdzdGFydCcgPT09IG5vZGUudHlwZSkge1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBJZiB0aGUgaW5mb3JtYXRpb24gYXJlIGdhdGhlcmVkLCBhY2NvcmRpbmcgdG8gdGhlIGluZm9ybWF0aW9uXG4gIC8vIHVzZXIgZ2F2ZSB0byBidWlsZCBhIHN0YXRlLlxuICBpZiAoJ2J1aWxkJyAhPT0gbm9kZS50eXBlICYmICdpbnN0YW5jZScgIT09IG5vZGUudHlwZSkge1xuICAgIC8vIFNpbmNlIGFsbCB0aGVzZSBtZXRob2RzIGFyZSBvbmx5IG5lZWQgb25lIGFyZ3VtZW50LlxuICAgIGNvbnRleHQuX2luZm9bbm9kZS50eXBlXSA9IG5vZGUuYXJnc1swXTtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIF9pbmZvID0gY29udGV4dC5faW5mbztcbiAgY29udGV4dC5fY29tcG9uZW50ID0gZnVuY3Rpb24odmlldykge1xuICAgIEJhc2ljQ29tcG9uZW50LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5yZXNvdXJjZXMgPSBfaW5mby5yZXNvdXJjZXMgfHwgdGhpcy5yZXNvdXJjZXM7XG4gICAgdGhpcy5jb25maWdzID0gX2luZm8uY29uZmlncyB8fCB0aGlzLmNvbmZpZ3M7XG4gICAgdGhpcy5sb2dnZXIgPSBfaW5mby5sb2dnZXIgfHwgdGhpcy5sb2dnZXI7XG4gICAgdGhpcy50eXBlID0gX2luZm8udHlwZTtcbiAgICB0aGlzLl9zZXR1cFN0YXRlID0gbmV3IF9pbmZvLnNldHVwKHRoaXMpO1xuICB9O1xuICBjb250ZXh0Ll9jb21wb25lbnQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNpY0NvbXBvbmVudC5wcm90b3R5cGUpO1xuICBpZiAoX2luZm8ubWV0aG9kcykge1xuICAgIE9iamVjdC5rZXlzKF9pbmZvLm1ldGhvZHMpLmZvckVhY2goZnVuY3Rpb24obWV0aG9kTmFtZSkge1xuICAgICAgY29udGV4dC5fY29tcG9uZW50LnByb3RvdHlwZVttZXRob2ROYW1lXSA9IF9pbmZvLm1ldGhvZHNbbWV0aG9kTmFtZV07XG4gICAgfSk7XG4gIH1cbiAgaWYgKCdidWlsZCcgPT09IG5vZGUudHlwZSkge1xuICAgIC8vIFRoZSBvbmx5IG9uZSBub2RlIG9uIHRoZSBzdGFjayB3b3VsZCBiZSByZXR1cm5lZC5cbiAgICBzdGFjayA9IFsgY29udGV4dC5fY29tcG9uZW50IF07XG4gICAgcmV0dXJuIHN0YWNrO1xuICB9XG4gIGlmICgnaW5zdGFuY2UnID09PSBub2RlLnR5cGUpIHtcbiAgICAvLyBTaW5jZSAnaW5zdGFuY2UnIG1heSBwYXNzIHNvbWUgYXJndW1lbnRzIHRvIHRoZSBjb25zdHJ1Y3RvcixcbiAgICAvLyB3ZSBuZWVkIHRvIGFwcGx5IGl0IHJhdGhlciB0aGFuIG5ldyBpdC5cbiAgICB2YXIgdGFyZ2V0ID0gT2JqZWN0LmNyZWF0ZShjb250ZXh0Ll9jb21wb25lbnQucHJvdG90eXBlKTtcbiAgICBjb250ZXh0Ll9jb21wb25lbnQuYXBwbHkodGFyZ2V0LCBub2RlLmFyZ3MpO1xuICAgIHN0YWNrID0gWyB0YXJnZXQgXTtcbiAgICByZXR1cm4gc3RhY2s7XG4gIH1cbn07XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL2J1aWxkX3N0YWdlL3NyYy9idWlsZGVyL2NvbXBvbmVudC5qc1xuICoqLyIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBHZW5lcmljIGJ1aWxkZXIgdGhhdCB3b3VsZCBwdXNoIG5vZGVzIGludG8gdGhlIGVEU0wgc3RhY2suXG4gKiBVc2VyIGNvdWxkIGluaGVyaXQgdGhpcyB0byBkZWZpbmUgdGhlIG5ldyBlRFNMLlxuICogLS0tXG4gKiBUaGUgZGVmYXVsdCBzZW1hbnRpY3Mgb25seSBjb250YWluIHRoZXNlIG9wZXJhdGlvbnM6XG4gKlxuICogMS4gW3B1c2hdIDogcHVzaCB0byB0aGUgY3VycmVudCBzdGFja1xuICogMi4gW2JlZ2luXTogY3JlYXRlIGEgbmV3IHN0YWNrIGFuZCBzd2l0Y2ggdG8gaXQsXG4gKiAgICAgICAgICAgICBhbmQgdGhlbiBwdXNoIHRoZSBub2RlIGludG8gdGhlIHN0YWNrLlxuICogMy4gW2VuZF0gIDogYWZ0ZXIgcHVzaCB0aGUgbm9kZSBpbnRvIHRoZSBzdGFjayxcbiAqICAgICAgICAgICAgIGNoYW5nZSB0aGUgY3VycmVudCBzdGFjayB0byB0aGUgcHJldmlvdXMgb25lLlxuICogNC4gW2V4aXRdIDogZXhpdCB0aGUgY29udGV4dCBvZiB0aGlzIGVEU0w7IHRoZSBsYXN0IHJlc3VsdFxuICogICAgICAgICAgICAgb2YgaXQgd291bGQgYmUgcGFzc2VkIHRvIHRoZSByZXR1cm4gdmFsdWUgb2ZcbiAqICAgICAgICAgICAgIHRoaXMgY2hhaW4uXG4gKlxuICogU3RhY2sgY291bGQgYmUgbmVzdGVkOiB3aGVuIFtiZWdpbl0gYSBuZXcgc3RhY2sgaW4gZmFjdCBpdCB3b3VsZFxuICogcHVzaCB0aGUgc3RhY2sgaW50byB0aGUgcHJldmlvdXMgb25lLiBTbyB0aGUgc3RhY2sgY29tcHJpc2VcbiAqIFtub2RlXSBhbmQgW3N0YWNrXS5cbiAqIC0tLVxuICogQWx0aG91Z2ggdGhlIGVEU0wgaW5zdGFuY2Ugc2hvdWxkIHdyYXAgdGhlc2UgYmFzaWMgb3BlcmF0aW9uc1xuICogdG8gbWFuaXB1bGF0ZSB0aGUgc3RhY2ssIHRoZXkgYWxsIG5lZWQgdG8gY29udmVydCB0aGUgbWV0aG9kXG4gKiBjYWxsIHRvIG5vZGVzLiBTbyAnTGFuZ3VhZ2UnIHByb3ZpZGUgYSB3YXkgdG8gc2ltcGxpZnkgdGhlIHdvcms6IGlmXG4gKiB0aGUgaW5zdGFuY2UgY2FsbCB0aGUgW2RlZmluZV0gbWV0aG9kIHRoZSBuYW1lIG9mIHRoZSBtZXRob2QsXG4gKiBpdCBjb3VsZCBhc3NvY2lhdGUgdGhlIG9wZXJhbmQgb2YgdGhlIGVEU0wgd2l0aCB0aGUgc3RhY2sgbWFuaXB1bGF0aW9uLlxuICogRm9yIGV4YW1wbGU6XG4gKlxuICogICAgdmFyIGVEU0wgPSBmdW5jdGlvbigpIHt9O1xuICogICAgZURTTC5wcm90b3R5cGUudHJhbnNhY3Rpb24gPSBMYW5ndWFnZS5kZWZpbmUoJ3RyYW5zYWN0aW9uJywgJ2JlZ2luJyk7XG4gKiAgICBlRFNMLnByb3RvdHlwZS5wcmUgPSBMYW5ndWFnZS5kZWZpbmUoJ3ByZScsICdwdXNoJyk7XG4gKiAgICBlRFNMLnByb3RvdHlwZS5wZXJmb3JtID0gTGFuZ3VhZ2UuZGVmaW5lKCdwZXJmb3JtJywgJ3B1c2gnKTtcbiAqICAgIGVEU0wucHJvdG90eXBlLnBvc3QgPSBMYW5ndWFnZS5kZWZpbmUoJ3Bvc3QnLCAnZW5kJyk7XG4gKlxuICogVGhlbiB0aGUgZURTTCBjb3VsZCBiZSB1c2VkIGFzOlxuICpcbiAqICAgIChuZXcgZURTTClcbiAqICAgICAgLnRyYW5zYWN0aW9uKClcbiAqICAgICAgLnByZShjYilcbiAqICAgICAgLnBlcmZvcm0oY2IpXG4gKiAgICAgIC5wb3N0KGNiKVxuICpcbiAqIEFuZCB0aGUgc3RhY2sgd291bGQgYmU6XG4gKlxuICogICAgW1xuICogICAgICBub2RlPCd0cmFuc2FjdGlvbicsPlxuICogICAgICBub2RlPCdwcmUnLCBjYj5cbiAqICAgICAgbm9kZTwncHJlZm9ybScsIGNiPlxuICogICAgICBub2RlPCdwb3N0JywgY2I+XG4gKiAgICBdXG4gKlxuICogSG93ZXZlciwgdGhpcyBzaW1wbGUgYXBwcm9hY2ggdGhlIHNlbWFudGljcyBydWxlcyBhbmQgYW5hbHl6ZXJzIHRvXG4gKiBndWFyYW50ZWUgdGhlIHN0YWNrIGlzIHZhbGlkLiBGb3IgZXhhbXBsZSwgaWYgd2UgaGF2ZSBhIG1hbGZvcm1lZFxuICogc3RhY2sgYmVjYXVzZSBvZiB0aGUgZm9sbG93aW5nIGVEU0wgcHJvZ3JhbTpcbiAqXG4gKiAgICAobmV3IGVEU0wpXG4gKiAgICAgIC5wb3N0KGNiKVxuICogICAgICAucHJlKGNiKVxuICogICAgICAucGVyZm9ybShjYilcbiAqICAgICAgLnRyYW5zYWN0aW9uKClcbiAqXG4gKiBUaGUgcnVudGltZSBtYXkgcmVwb3J0IGVycm90IGJlY2F1c2Ugd2hlbiAnLnBvc3QoY2IpJyB0aGVyZSBpcyBubyBzdGFja1xuICogY3JlYXRlZCBieSB0aGUgYmVnaW5uaW5nIHN0ZXAsIG5hbWVseSB0aGUgJy5wcmUoY2IpJyBpbiBvdXIgY2FzZS5cbiAqIE5ldmVydGhlbGVzcywgdGhlIGVycm9yIG1lc3NhZ2UgaXMgdG9vIGxvdy1sZXZlbCBmb3IgdGhlIGxhbmd1YWdlIHVzZXIsXG4gKiBzaW5jZSB0aGV5IHNob3VsZCBjYXJlIG5vIHN0YWNrIHRoaW5ncyBhbmQgc2hvdWxkIG9ubHkgY2FyZSBhYm91dCB0aGUgZURTTFxuICogaXRzZWxmLlxuICpcbiAqIFRoZSBzb2x1dGlvbiBpcyB0byBwcm92aWRlIGEgYmFzaWMgc3RhY2sgb3JkZXJpbmcgYW5hbHl6ZXIgYW5kIGxldCB0aGVcbiAqIGxhbmd1YWdlIGRlY2lkZSBob3cgdG8gZGVzY3JpYmUgdGhlIGVycm9yLiBBbmQgc2luY2Ugd2UgZG9uJ3QgaGF2ZVxuICogYW55IGNvbnRleHQgaW5mb3JtYXRpb24gYWJvdXQgdmFyaWFibGVzLCBzY29wZSBhbmQgb3RoZXIgZWxlbWVudHNcbiAqIGFzIGEgY29tcGxldGUgcHJvZ3JhbW1pbmcgbGFuZ3VhZ2UsIHdlIG9ubHkgbmVlZCB0byBndWFyYW50ZWUgdGhlIG9yZGVyIGlzXG4gKiBjb3JyZWN0LCBhbmQgbWFrZSBpbmNvcnJlY3QgY2FzZXMgbWVhbmluZ2Z1bC4gTW9yZW92ZXIsIHNpbmNlIHRoZSBhbmFseXplclxuICogbmVlZHMgdG8gYW5hbHl6ZSB0aGUgc3RhdGVzIHdoZW5ldmVyIHRoZSBpbmNvbWluZyBub2RlIGNvbWVzLCBpdCBpcyBpbiBmYWN0XG4gKiBhbiBldmFsdWF0aW9uIHByb2Nlc3MsIHNvIHVzZXIgY291bGQgY29tYmluZSB0aGUgYW5hbHl6aW5nIGFuZCBpbnRlcnByZXRpbmdcbiAqIHBoYXNlIGludG8gdGhlIHNhbWUgZnVuY3Rpb24uIEZvciBleGFtcGxlOlxuICpcbiAqICAgIHJ1bnRpbWUub25jaGFuZ2UoKGNvbnRleHQsIG5vZGUsIHN0YWNrKSA9PiB7XG4gKiAgICAgICAgLy8gSWYgdGhlIGNoYW5nZSBpcyB0byBzd2l0Y2ggdG8gYSBuZXcgc3RhY2ssXG4gKiAgICAgICAgLy8gdGhlICdzdGFjaycgaGVyZSB3b3VsZCBiZSB0aGUgbmV3IHN0YWNrLlxuICogICAgICAgIHZhciB7dHlwZSwgYXJnc30gPSBub2RlO1xuICogICAgICAgIGlmICgncHJlJyA9PT0gdHlwZSkge1xuICogICAgICAgICAgY29udGV4dC5pbml0ID0gdHJ1ZTtcbiAqICAgICAgICB9IGVsc2UgaWYgKCdwb3N0JyA9PT0gdHlwZSAmJiAhY29udGV4dC5pbml0KSB7XG4gKiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZXJlIG11c3QgYmUgb25lIFwicHJlXCIgbm9kZSBiZWZvcmUgdGhlIFwicG9zdFwiLicpO1xuICogICAgICAgIH1cbiAqICAgIH0pO1xuICpcbiAqIFdpdGggc3VjaCBmZWF0dXJlLCBpZiB0aGUgaW5jb21pbmcgbm9kZSBvciB0aGUgc3RhY2sgaXMgbWFsZm9ybWVkLFxuICogaXQgc2hvdWxkIHRocm93IHRoZSBlcnJvci4gVGhlIGVycm9yIGNhcHR1cmVkIGJ5IHRoZSBpbnN0YW5jZSBsaWtlIHRoaXNcbiAqIGNvdWxkIGJlIGEgJ2NvbXBpbGF0aW9uIGVycm9yJy5cbiAqXG4gKiBUaGUgbm90aWNlYWJsZSBmYWN0IGlzIFRoZSBjYWxsYmFjayBvZiB0aGUgJ29uY2hhbmdlJyBpcyBhY3R1YWxseSBhIHJlZHVjZXIsXG4gKiBzbyB1c2VyIGNvdWxkIHRyZWF0IHRoZSBwcm9jZXNzIG9mIHRoaXMgZXZhbHVhdGlvbiAmIGFuYWx5emluZyBhcyBhIHJlZHVjaW5nXG4gKiBwcm9jZXNzIG9uIGFuIGluZmluaXRlIHN0cmVhbS4gQW5kIHNpbmNlIHdlIGhhdmUgYSBzdGFjayBtYWNoaW5lLCBpZiB0aGVcbiAqIHJlZHVjZXIgcmV0dXJuIG5vdGhpbmcsIHRoZSBzdGFjayB3b3VsZCBiZSBlbXB0eS4gT3RoZXJ3aXNlLCBpZiB0aGUgcmVkdWNlclxuICogcmV0dXJuIGEgbmV3IHN0YWNrLCBpdCB3b3VsZCByZXBsYWNlIHRoZSBvbGQgb25lLlxuICpcbiAqIEFuZCBwbGVhc2Ugbm90ZSB0aGUgZXhhbXBsZSBpcyBtdWNoIHNpbXBsaWZpZWQuIEZvciB0aGVcbiAqIHJlYWwgZURTTCBpdCBzaG91bGQgYmUgdXNlZCBvbmx5IGFzIGFuIGVudHJ5IHRvIGRpc3BhdGNoIHRoZSBjaGFuZ2UgdG9cbiAqIHRoZSByZWFsIGhhbmRsZXJzLCB3aGljaCBtYXkgY29tcHJpc2Ugc2V2ZXJhbCBzdGF0ZXMgYW5kIGNvbXBvbmVudHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBMYW5ndWFnZSgpIHt9XG5cbi8qKlxuICogSGVscGVyIG1ldGhvZCB0byBidWlsZCBpbnRlcmZhY2Ugb2YgYSBzcGVjaWZpYyBEU0wuIEl0IHdvdWxkIHJldHVybiBhIG1ldGhvZFxuICogb2YgdGhlIERTTCBhbmQgdGhlbiB0aGUgaW50ZXJmYWNlIGNvdWxkIGF0dGFjaCBpdC5cbiAqXG4gKiBUaGUgcmV0dXJuaW5nIGZ1bmN0aW9uIHdvdWxkIGFzc3VtZSB0aGF0IHRoZSAndGhpcycgaW5zaWRlIGl0IGlzIHRoZSBydW50aW1lXG4gKiBvZiB0aGUgbGFuZ3VhZ2UuIEFuZCBzaW5jZSB0aGUgbWV0aG9kIGl0IHJldHVybnMgd291bGQgcmVxdWlyZSB0byBhY2Nlc3Mgc29tZVxuICogbWVtYmVycyBvZiB0aGUgJ3RoaXMnLCB0aGUgJ3RoaXMnIHNob3VsZCBoYXZlICd0aGlzLnN0YWNrJyBhbmQgJ3RoaXMuY29udGV4dCdcbiAqIGFzIHRoZSBtZXRob2QgcmVxdWlyZXMuXG4gKlxuICogSWYgaXQncyBhbiAnZXhpdCcgbm9kZSwgbWVhbnMgdGhlIHNlc3Npb24gaXMgZW5kZWQgYW5kIHRoZSBpbnRlcnByZXRlciBzaG91bGRcbiAqIHJldHVybiBhIHN0YWNrIGNvbnRhaW5zIG9ubHkgb25lIG5vZGUgYXMgdGhlIHJlc3VsdCBvZiB0aGUgc2Vzc2lvbiwgb3IgdGhlXG4gKiBzZXNzaW9uIHJldHVybnMgbm90aGluZy5cbiAqXG4gKiBQbGVhc2Ugbm90ZSB0aGF0IGZyb20gdGhlIGRlc2NyaXB0aW9uIGFib3ZlLCAnZW5kJyBtZWFucyBzdGFjayAoc3Vic3RhY2spXG4gKiBlbmRzLiBJdCdzIHRvdGFsbHkgaXJyZWxldmFudCB0byAnZXhpdCcuXG4gKi9cbkxhbmd1YWdlLmRlZmluZSA9IGZ1bmN0aW9uKG1ldGhvZCwgYXMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICB2YXIgbm9kZSwgcmVzdWx0c3RhY2s7XG4gICAgc3dpdGNoIChhcykge1xuICAgICAgY2FzZSAncHVzaCc6XG4gICAgICAgIG5vZGUgPSBuZXcgTGFuZ3VhZ2UuTm9kZShtZXRob2QsIGFyZ3MsIHRoaXMuc3RhY2spO1xuICAgICAgICB0aGlzLnN0YWNrLnB1c2gobm9kZSk7XG4gICAgICAgIHJlc3VsdHN0YWNrID1cbiAgICAgICAgICB0aGlzLm9uY2hhbmdlKHRoaXMuY29udGV4dCwgbm9kZSwgdGhpcy5zdGFjayk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnYmVnaW4nOlxuICAgICAgICB0aGlzLl9wcmV2c3RhY2sgPSB0aGlzLnN0YWNrO1xuICAgICAgICB0aGlzLnN0YWNrID0gW107XG4gICAgICAgIG5vZGUgPSBuZXcgTGFuZ3VhZ2UuTm9kZShtZXRob2QsIGFyZ3MsIHRoaXMuc3RhY2spO1xuICAgICAgICB0aGlzLnN0YWNrLnB1c2gobm9kZSk7ICAvLyBhcyB0aGUgZmlyc3Qgbm9kZSBvZiB0aGUgbmV3IHN0YWNrLlxuICAgICAgICByZXN1bHRzdGFjayA9XG4gICAgICAgICAgdGhpcy5vbmNoYW5nZSh0aGlzLmNvbnRleHQsIG5vZGUsIHRoaXMuc3RhY2spO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2VuZCc6XG4gICAgICAgIG5vZGUgPSBuZXcgTGFuZ3VhZ2UuTm9kZShtZXRob2QsIGFyZ3MsIHRoaXMuc3RhY2spO1xuICAgICAgICB0aGlzLnN0YWNrLnB1c2gobm9kZSk7ICAvLyB0aGUgbGFzdCBub2RlIG9mIHRoZSBzdGFjay5cbiAgICAgICAgdGhpcy5zdGFjayA9XG4gICAgICAgICAgdGhpcy5fcHJldnN0YWNrOyAvLyBzd2l0Y2ggYmFjayB0byB0aGUgcHJldmlvdXMgc3RhY2suXG4gICAgICAgIHJlc3VsdHN0YWNrID1cbiAgICAgICAgICB0aGlzLm9uY2hhbmdlKHRoaXMuY29udGV4dCwgbm9kZSwgdGhpcy5zdGFjayk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZXhpdCc6XG4gICAgICAgIG5vZGUgPSBuZXcgTGFuZ3VhZ2UuTm9kZShtZXRob2QsIGFyZ3MsIHRoaXMuc3RhY2spO1xuICAgICAgICB0aGlzLnN0YWNrLnB1c2gobm9kZSk7ICAvLyB0aGUgbGFzdCBub2RlIG9mIHRoZSBzdGFjay5cbiAgICAgICAgcmVzdWx0c3RhY2sgPVxuICAgICAgICAgIHRoaXMub25jaGFuZ2UodGhpcy5jb250ZXh0LCBub2RlLCB0aGlzLnN0YWNrKTtcbiAgICAgICAgaWYgKCFyZXN1bHRzdGFjaykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJ2V4aXQnIG5vZGUgJyR7bm9kZS50eXBlfScgc2hvdWxkXG4gICAgICAgICAgICByZXR1cm4gYSByZXN1bHRzdGFjay5gKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0c3RhY2tbMF07XG4gICAgfVxuICAgIC8vIElmIHRoZSBoYW5kbGVyIHVwZGF0ZXMgdGhlIHN0YWNrLCBpdCB3b3VsZCByZXBsYWNlIHRoZSBleGlzdGluZyBvbmUuXG4gICAgaWYgKHJlc3VsdHN0YWNrKSB7XG4gICAgICB0aGlzLnN0YWNrID0gcmVzdWx0c3RhY2s7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9O1xufTtcblxuTGFuZ3VhZ2UuTm9kZSA9IGZ1bmN0aW9uKHR5cGUsIGFyZ3MsIHN0YWNrKSB7XG4gIHRoaXMudHlwZSA9IHR5cGU7XG4gIHRoaXMuYXJncyA9IGFyZ3M7XG4gIHRoaXMuc3RhY2sgPSBzdGFjaztcbn07XG5cbkxhbmd1YWdlLkV2YWx1YXRlID0gZnVuY3Rpb24oY29udGV4dCA9IHt9KSB7XG4gIHRoaXMuX2FuYWx5emVycyA9IFtdO1xuICB0aGlzLl9pbnRlcnByZXRlciA9IG51bGw7XG4gIHRoaXMuX2NvbnRleHQgPSBjb250ZXh0O1xufTtcblxuLyoqXG4gKiBBbmFseXplciBjb3VsZCByZWNlaXZlIHRoZSBzdGFjayBjaGFuZ2UgZnJvbSAnTGFuZ3VhZ2UjZXZhbHVhdGUnLFxuICogYW5kIGl0IHdvdWxkIGJlIGNhbGxlZCB3aXRoIHRoZSBhcmd1bWVudHMgYXMgdGhlIGZ1bmN0aW9uIGRlc2NyaWJlczpcbiAqXG4gKiAgICAgTGFuZ3VhZ2UucHJvdG90eXBlLmV2YWx1YXRlKChjb250ZXh0LCBjaGFuZ2UsIHN0YWNrKSA9PiB7XG4gKiAgICAgICAgLy8gLi4uXG4gKiAgICAgfSk7XG4gKlxuICogU28gdGhlIGFuYWx5emVyIGNvdWxkIGJlOlxuICpcbiAqICAgIGZ1bmN0aW9uKGNvbnRleHQsIGNoYW5nZSwgc3RhY2spIHtcbiAqICAgICAgLy8gRG8gc29tZSBjaGVjayBhbmQgbWF5YmUgY2hhbmdlZCB0aGUgY29udGV4dC5cbiAqICAgICAgLy8gVGhlIG5leHQgYW5hbHl6ZXIgdG8gdGhlIGludGVycHJldGVyIHdvdWxkIGFjY2VwdCB0aGUgYWx0ZXJuYXRlZFxuICogICAgICAvLyBjb250ZXh0IGFzIHRoZSBhcmd1bWVudCAnY29udGV4dCcuXG4gKiAgICAgIGNvbnRleHQuc29tZUZsYWcgPSB0cnVlO1xuICogICAgICAvLyBXaGVuIHRoZXJlIGlzIHdyb25nLCB0aHJvdyBpdC5cbiAqICAgICAgdGhyb3cgbmV3IEVycm9yKCdTb21lIGFuYWx5emluZyBlcnJvcicpO1xuICogICAgfTtcbiAqXG4gKiBOb3RlIHRoYXQgdGhlIGFuYWx5emVyICgnYScpIHdvdWxkIGJlIGludm9rZWQgd2l0aCBlbXB0eSAndGhpcycgb2JqZWN0LFxuICogc28gdGhlIGZ1bmN0aW9uIHJlbGllcyBvbiAndGhpcycgc2hvdWxkIGJpbmQgaXRzZWxmIGZpcnN0LlxuICovXG5MYW5ndWFnZS5FdmFsdWF0ZS5wcm90b3R5cGUuYW5hbHl6ZXIgPSBmdW5jdGlvbihhKSB7XG4gIHRoaXMuX2FuYWx5emVycy5wdXNoKGEpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogT25lIEV2YWx1YXRlIGNhbiBvbmx5IGhhdmUgb25lIGludGVycHJldGVyLCBhbmQgaXQgd291bGQgcmV0dXJuXG4gKiB0aGUgZnVuY3Rpb24gY291bGQgY29uc3VtZSBldmVyeSBzdGFjayBjaGFuZ2UgZnJvbSAnTGFuZ3VhZ2UjZXZhbHVhdGUnLlxuICpcbiAqIFRoZSBjb2RlIGlzIGEgbGl0dGxlIGNvbXBsaWNhdGVkOiB3ZSBoYXZlIHR3byBraW5kcyBvZiAncmVkdWNpbmcnOlxuICogb25lIGlzIHRvIHJlZHVjZSBhbGwgYW5hbHl6ZXJzIHdpdGggdGhlIHNpbmdsZSBpbmNvbWluZyBjaGFuZ2UsXG4gKiBhbm90aGVyIGlzIHRvIHJlZHVjZSBhbGwgaW5jb21pbmcgY2hhbmdlcyB3aXRoIHRoaXMgYW5hbHl6ZXJzICsgaW50ZXJwcmV0ZXIuXG4gKlxuICogVGhlIGFuYWx5emVyIGFuZCBpbnRlcnByZXRlciBzaG91bGQgY2hhbmdlIHRoZSBjb250ZXh0LCB0byBtZW1vcml6ZSB0aGVcbiAqIHN0YXRlcyBvZiB0aGUgZXZhbHVhdGlvbi4gVGhlIGRpZmZlcmVuY2UgaXMgaW50ZXJwcmV0ZXIgc2hvdWxkIHJldHVybiBvbmVcbiAqIG5ldyBzdGFjayBpZiBpdCBuZWVkcyB0byB1cGRhdGUgdGhlIGV4aXN0aW5nIG9uZS4gVGhlIHN0YWNrIGl0IHJldHVybnMgd291bGRcbiAqIHJlcGxhY2UgdGhlIGV4aXN0aW5nIG9uZSwgc28gYW55dGhpbmcgc3RpbGwgaW4gdGhlIG9sZCBvbmUgd291bGQgYmUgd2lwZWRcbiAqIG91dC4gVGhlIGludGVycHJldGVyIGNvdWxkIHJldHVybiBub3RoaW5nICgndW5kZWZpbmVkJykgdG8ga2VlcCB0aGUgc3RhY2tcbiAqIHVudG91Y2hlZC5cbiAqXG4gKiBUaGUgYW5hbHl6ZXJzIGFuZCBpbnRlcnByZXRlciBjb3VsZCBjaGFuZ2UgdGhlICdjb250ZXh0JyBwYXNzIHRvIHRoZW0uXG4gKiBBbmQgc2luY2Ugd2UgbWF5IHVwZGF0ZSB0aGUgc3RhY2sgYXMgYWJvdmUsIHRoZSBjb250ZXh0IHNob3VsZCBtZW1vcml6ZVxuICogdGhvc2UgaW5mb3JtYXRpb24gbm90IHRvIGJlIG92ZXJ3cml0dGVuIHdoaWxlIHRoZSBzdGFjayBnZXQgd2lwZWQgb3V0LlxuICpcbiAqIEFuZCBpZiB0aGUgaW50ZXJwcmV0aW5nIG5vZGUgaXMgdGhlIGV4aXQgbm9kZSBvZiB0aGUgc2Vzc2lvbiwgaW50ZXJwcmV0ZXJcbiAqIHNob3VsZCByZXR1cm4gYSBuZXcgc3RhY2sgY29udGFpbnMgb25seSBvbmUgZmluYWwgcmVzdWx0IG5vZGUuIElmIHRoZXJlXG4gKiBpcyBubyBzdWNoIG5vZGUsIHRoZSByZXN1bHQgb2YgdGhpcyBzZXNzaW9uIGlzICd1bmRlZmluZWQnLlxuICovXG5MYW5ndWFnZS5FdmFsdWF0ZS5wcm90b3R5cGUuaW50ZXJwcmV0ZXIgPSBmdW5jdGlvbihpbnB0KSB7XG4gIC8vIFRoZSBjdXN0b21pemVkIGxhbmd1YWdlIHNob3VsZCBnaXZlIHRoZSBkZWZhdWx0IGNvbnRleHQuXG4gIHJldHVybiAoY29udGV4dCwgY2hhbmdlLCBzdGFjaykgPT4ge1xuICAgIHRyeSB7XG4gICAgICAvLyBBbmFseXplcnMgY291bGQgY2hhbmdlIHRoZSBjb250ZXh0LlxuICAgICAgdGhpcy5fYW5hbHl6ZXJzLnJlZHVjZSgoY3R4LCBhbmFseXplcikgPT4ge1xuICAgICAgICBhbmFseXplci5jYWxsKHt9LCBjb250ZXh0LCBjaGFuZ2UsIHN0YWNrKTtcbiAgICAgIH0sIGNvbnRleHQpO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgdGhpcy5faGFuZGxlRXJyb3IoZSwgY29udGV4dCwgY2hhbmdlLCBzdGFjayk7XG4gICAgfVxuICAgIC8vIEFmdGVyIGFuYWx5emUgaXQsIGludGVycHJldCB0aGUgbm9kZSBhbmQgcmV0dXJuIHRoZSBuZXcgc3RhY2sgKGlmIGFueSkuXG4gICAgdmFyIG5ld1N0YWNrID0gaW5wdChjb250ZXh0LCBjaGFuZ2UsIHN0YWNrKTtcbiAgICByZXR1cm4gbmV3U3RhY2s7XG4gIH07XG59O1xuXG5MYW5ndWFnZS5FdmFsdWF0ZS5wcm90b3R5cGUuX2hhbmRsZUVycm9yID1cbmZ1bmN0aW9uKGVyciwgY29udGV4dCwgY2hhbmdlLCBzdGFjaykge1xuICAvLyBUT0RPOiBleHBhbmQgaXQgdG8gcHJvdmlkZSBtb3JlIHNvcGhpc3RpYyBkZWJ1Z2dpbmcgbWVzc2FnZS5cbiAgdGhyb3cgbmV3IEVycm9yKGBXaGVuIGNoYW5nZSAke2NoYW5nZS50eXBlfSBjb21lcyBlcnJvciAnJHtlcnJ9JyBoYXBwZW5lZGApO1xufTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vYnVpbGRfc3RhZ2Uvc3JjL3J1bmUvbGFuZ3VhZ2UuanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7IFN0cmVhbSB9IGZyb20gJ3NyYy9zdHJlYW0vc3RyZWFtLmpzJztcblxuZXhwb3J0IGZ1bmN0aW9uIEJhc2ljU3RhdGUoY29tcG9uZW50KSB7XG4gIC8vIEEgbG9jayB0byBwcmV2ZW50IHRyYW5zZmVycmluZyByYWNpbmcuIFRoaXMgaXMgYmVjYXVzZSBtb3N0IG9mIHNvdXJjZVxuICAvLyBldmVudHMgYXJlIG1hcHBlZCBpbnRvIGludGVycnVwdHMgdG8gdHJpZ2dlciB0cmFuc2ZlcnJpbmdzLiBUbyBwcmV2ZW50XG4gIC8vIGNsaWVudCBuZWVkIHRvIGltcGxlbWVudCB0aGlzIGFnYWluIGFuZCBhZ2FpbiB3ZSBwdXQgdGhlIGxvY2sgaGVyZS5cbiAgdGhpcy5fdHJhbnNmZXJyZWQgPSBmYWxzZTtcbiAgLy8gUmVwbGFjZSB3aXRoIHRoZSBuYW1lIG9mIGNvbmNyZXRlIHN0YXRlLlxuICB0aGlzLmNvbmZpZ3MgPSB7XG4gICAgdHlwZTogJ0Jhc2ljU3RhdGUnLFxuICAgIC8vIE5vdGUgdGhlIGV2ZW50IG1lYW5zIGV2ZW50cyBmb3J3YXJkZWQgZnJvbSBzb3VyY2VzLCBub3QgRE9NIGV2ZW50cy5cbiAgICBzdHJlYW06IHtcbiAgICAgIGV2ZW50czogW10sXG4gICAgICBpbnRlcnJ1cHRzOiBbXSxcbiAgICAgIHNvdXJjZXM6IFtdXG4gICAgfVxuICB9O1xuICAvLyBDb21wb25lbnQgcmVmZXJlbmNlIHByb2l2ZGVzIGV2ZXJ5IHJlc291cmNlICYgcHJvcGVydHlcbiAgLy8gbmVlZCBieSBhbGwgc3RhdGVzLlxuICB0aGlzLmNvbXBvbmVudCA9IGNvbXBvbmVudDtcbn1cblxuLyoqXG4gKiBTdHJlYW0nIHBoYXNlIGlzIHRoZSBzdGF0ZSdzIHBoYXNlLlxuICovXG5CYXNpY1N0YXRlLnByb3RvdHlwZS5waGFzZSA9XG5mdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuc3RyZWFtLnBoYXNlKCk7XG59O1xuXG4vKipcbiAqIERlcml2ZWQgc3RhdGVzIHNob3VsZCBleHRlbmQgdGhlc2UgYmFzaWMgbWV0aG9kcy5cbiAqL1xuQmFzaWNTdGF0ZS5wcm90b3R5cGUuc3RhcnQgPVxuZnVuY3Rpb24oKSB7XG4gIHRoaXMuc3RyZWFtID0gbmV3IFN0cmVhbSh0aGlzLmNvbmZpZ3Muc3RyZWFtKTtcbiAgcmV0dXJuIHRoaXMuc3RyZWFtLnN0YXJ0KHRoaXMuaGFuZGxlU291cmNlRXZlbnQuYmluZCh0aGlzKSlcbiAgICAubmV4dCh0aGlzLnN0cmVhbS5yZWFkeS5iaW5kKHRoaXMuc3RyZWFtKSk7XG59O1xuXG5CYXNpY1N0YXRlLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnN0cmVhbS5zdG9wKCk7XG59O1xuXG5CYXNpY1N0YXRlLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnN0cmVhbS5kZXN0cm95KCk7XG59O1xuXG5CYXNpY1N0YXRlLnByb3RvdHlwZS5saXZlID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnN0cmVhbS51bnRpbCgnc3RvcCcpO1xufTtcblxuQmFzaWNTdGF0ZS5wcm90b3R5cGUuZXhpc3QgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuc3RyZWFtLnVudGlsKCdkZXN0cm95Jyk7XG59O1xuXG4vKipcbiAqIE11c3QgdHJhbnNmZXIgdG8gbmV4dCBzdGF0ZSB2aWEgY29tcG9uZW50J3MgbWV0aG9kLlxuICogT3IgdGhlIGNvbXBvbmVudCBjYW5ub3QgdHJhY2sgdGhlIGxhc3QgYWN0aXZlIHN0YXRlLlxuICovXG5CYXNpY1N0YXRlLnByb3RvdHlwZS50cmFuc2ZlclRvID0gZnVuY3Rpb24oKSB7XG4gIGlmICh0aGlzLl90cmFuc2ZlcnJlZCkge1xuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdQcmV2ZW50IHRyYW5zZmVycmluZyByYWNpbmcnKTtcbiAgICB2YXIgbnVsbGlmaXplZCA9IG5ldyBTdHJlYW0oKTtcbiAgICAvLyBUaGlzIHdvdWxkIHJldHVybiBhIHByb2Nlc3MgY291bGQgYmUgY29uY2F0ZWQgYnV0IHdvdWxkIGRvIG5vdGhpbmcuXG4gICAgLy8gSXQncyBiZXR0ZXIgdG8gZm9ybWFsbHkgcHJvdmlkZSBhIEFQSSBmcm9tIFByb2Nlc3MsIGxpa2VcbiAgICAvLyBQcm9jZXNzLm1heWJlKCkgb3IgUHJvY2VzcyNudWxsaXplKCksIGJ1dCB0aGlzIGlzIGEgc2ltcGxpZXIgc29sdXRpb24uXG4gICAgcmV0dXJuIG51bGxpZml6ZWQuc3RhcnQoKS5uZXh0KCgpID0+IG51bGxpZml6ZWQuc3RvcCgpKTtcbiAgfVxuICAvLyBObyBuZWVkIHRvIHJlc2V0IGl0IGFnYWluIHNpbmNlIGEgc3RhdGUgaW5zdGFuY2Ugc2hvdWxkIG5vdCBiZVxuICAvLyB0cmFuc2ZlcnJlZCB0byB0d2ljZS5cbiAgdGhpcy5fdHJhbnNmZXJyZWQgPSB0cnVlO1xuICByZXR1cm4gdGhpcy5jb21wb25lbnQudHJhbnNmZXJUby5hcHBseSh0aGlzLmNvbXBvbmVudCwgYXJndW1lbnRzKTtcbn07XG5cbi8qKlxuICogSWYgdGhpcyBoYW5kbGVyIHJldHVybiBhIFByb21pc2UsIG9yIFByb2Nlc3MsIHRoZSB1bmRlcmx5aW5nIFN0cmVhbVxuICogY2FuIG1ha2Ugc3VyZSB0aGUgc3RlcHMgYXJlIHF1ZXVlZCBldmVuIHdpdGggYXN5bmNocm9ub3VzIHN0ZXBzLlxuICovXG5CYXNpY1N0YXRlLnByb3RvdHlwZS5oYW5kbGVTb3VyY2VFdmVudCA9IGZ1bmN0aW9uKCkge307XG5cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vYnVpbGRfc3RhZ2Uvc3JjL3N0YXRlL2Jhc2ljX3N0YXRlLmpzXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgeyBQcm9jZXNzIH0gZnJvbSAnc3JjL3N0cmVhbS9wcm9jZXNzL3Byb2Nlc3MuanMnO1xuXG4vKipcbiAqIENvbWJpbmUgdGhlIGFiaWxpdGllcyBvZiB0aGUgZXZlbnQgaGFuZGxpbmcgYW5kIGFzeW5jaHJvbm91cyBvcGVyYXRpb25zXG4gKiBzZXF1ZW50aWFsaXppbmcgdG9nZXRoZXIuIFNvIHRoYXQgZXZlcnkgU3RyZWFtIGNvdWxkOlxuICpcbiAqIDEuIEZvciB0aGUgb3JkaW5hcnkgZXZlbnRzLCBhcHBlbmQgc3RlcHMgdG8gdGhlIG1haW4gUHJvY2VzcyB0byBxdWV1ZVxuICogICAgdGhlIGV2ZW50IGhhbmRsZXJzLlxuICogMi4gRm9yIG90aGVyIHVyZ2VudCBldmVudHMgKGludGVycnVwdHMpLCBpbW1lZGlhdGVseSBleGVjdXRlIHRoZSBldmVudFxuICogICAgaGFuZGxlciB3aXRob3V0IHF1ZXVpbmcgaXQuXG4gKiAzLiBPbmx5IHJlY2VpdmUgZXZlbnRzIHdoZW4gaXQncyAncmVhZHknLiBCZWZvcmUgdGhhdCwgbm8gc291cmNlIGV2ZW50c1xuICogICAgd291bGQgYmUgZm9yd2FyZGVkIGFuZCBoYW5kbGVkLlxuICogNC4gT25jZSBwaGFzZSBiZWNvbWVzICdzdG9wJywgbm8gZXZlbnRzIHdvdWxkIGJlIHJlY2VpdmVkIGFnYWluLlxuICpcbiAqIFN0cmVhbSBzaG91bGQgY3JlYXRlIHdpdGggYSBjb25maWdzIG9iamVjdCBpZiB1c2VyIHdhbnQgdG8gc2V0IHVwIHNvdXJjZXMsXG4gKiBldmVudHMgYW5kIGludGVycnVwdHMuIElmIHRoZXJlIGlzIG5vIHN1Y2ggb2JqZWN0LCBpdCB3b3VsZCBhY3QgbGlrZSBhXG4gKiBQcm9jZXNzLCBhbmQgd2l0aG91dCBhbnkgZnVuY3Rpb24gaGFuZGxlcyBldmVudHMuXG4gKiovXG5leHBvcnQgZnVuY3Rpb24gU3RyZWFtKGNvbmZpZ3MgPSB7fSkge1xuICB0aGlzLmNvbmZpZ3MgPSB7XG4gICAgZXZlbnRzOiBjb25maWdzLmV2ZW50cyB8fCBbXSxcbiAgICBpbnRlcnJ1cHRzOiBjb25maWdzLmludGVycnVwdHMgfHwgW11cbiAgfTtcbiAgaWYgKGNvbmZpZ3Muc291cmNlcyAmJiAwICE9PSBjb25maWdzLnNvdXJjZXMubGVuZ3RoKSB7XG4gICAgdGhpcy5jb25maWdzLnNvdXJjZXMgPSBjb25maWdzLnNvdXJjZXM7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5jb25maWdzLnNvdXJjZXMgPSBbXTtcbiAgfVxuICB0aGlzLl9mb3J3YXJkVG8gPSBudWxsO1xuICAvLyBOZWVkIHRvIGRlbGVnYXRlIHRvIFNvdXJjZS5cbiAgdGhpcy5vbmNoYW5nZSA9IHRoaXMub25jaGFuZ2UuYmluZCh0aGlzKTtcbn1cblxuU3RyZWFtLnByb3RvdHlwZS5waGFzZSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5wcm9jZXNzLl9ydW50aW1lLnN0YXRlcy5waGFzZTtcbn07XG5cblN0cmVhbS5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbihmb3J3YXJkVG8pIHtcbiAgdGhpcy5fZm9yd2FyZFRvID0gZm9yd2FyZFRvO1xuICB0aGlzLnByb2Nlc3MgPSBuZXcgUHJvY2VzcygpO1xuICB0aGlzLnByb2Nlc3Muc3RhcnQoKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEtpY2sgb2ZmIFNvdXJjZSBhbmQgc3RhcnQgZG8gdGhpbmdzLlxuICovXG5TdHJlYW0ucHJvdG90eXBlLnJlYWR5ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuY29uZmlncy5zb3VyY2VzLmZvckVhY2goKHNvdXJjZSkgPT4ge1xuICAgIHNvdXJjZS5zdGFydCh0aGlzLm9uY2hhbmdlKTtcbiAgfSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuU3RyZWFtLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMucHJvY2Vzcy5zdG9wKCk7XG4gIHRoaXMuY29uZmlncy5zb3VyY2VzLmZvckVhY2goKHNvdXJjZSkgPT4ge1xuICAgIHNvdXJjZS5zdG9wKCk7XG4gIH0pO1xuICByZXR1cm4gdGhpcztcbn07XG5cblN0cmVhbS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnByb2Nlc3MuZGVzdHJveSgpO1xuICByZXR1cm4gdGhpcztcbn07XG5cblN0cmVhbS5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uKHN0ZXApIHtcbiAgdGhpcy5wcm9jZXNzLm5leHQoc3RlcCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuU3RyZWFtLnByb3RvdHlwZS5yZXNjdWUgPSBmdW5jdGlvbihyZXNjdWVyKSB7XG4gIHRoaXMucHJvY2Vzcy5yZXNjdWUocmVzY3Vlcik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYSBQcm9taXNlIGdldCByZXNvbHZlZCB3aGVuIHRoZSBzdHJlYW0gdHVybiB0b1xuICogdGhlIHNwZWNpZmljIHBoYXNlLiBGb3IgZXhhbXBsZTpcbiAqXG4gKiAgICBzdHJlYW0udW50aWwoJ3N0b3AnKVxuICogICAgICAgICAgLnRoZW4oKCkgPT4geyBjb25zb2xlLmxvZygnc3RyZWFtIHN0b3BwZWQnKSB9KTtcbiAqICAgIHN0cmVhbS5zdGFydCgpO1xuICovXG5TdHJlYW0ucHJvdG90eXBlLnVudGlsID0gZnVuY3Rpb24ocGhhc2UpIHtcbiAgcmV0dXJuIHRoaXMucHJvY2Vzcy51bnRpbChwaGFzZSk7XG59O1xuXG4vKipcbiAqIE9ubHkgd2hlbiBhbGwgdGFza3MgcGFzc2VkIGluIGdldCByZXNvbHZlZCxcbiAqIHRoZSBwcm9jZXNzIHdvdWxkIGdvIHRvIHRoZSBuZXh0LlxuICovXG5TdHJlYW0ucHJvdG90eXBlLndhaXQgPSBmdW5jdGlvbih0YXNrcykge1xuICB0aGlzLnByb2Nlc3Mud2FpdCh0YXNrcyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBJdCB3b3VsZCByZWNlaXZlIGV2ZW50cyBmcm9tIFNvdXJjZSwgYW5kIHRoYW4gcXVldWUgb3Igbm90IHF1ZXVlXG4gKiBpdCwgZGVwZW5kcyBvbiB3aGV0aGVyIHRoZSBldmVudCBpcyBhbiBpbnRlcnJ1cHQuXG4gKi9cblN0cmVhbS5wcm90b3R5cGUub25jaGFuZ2UgPSBmdW5jdGlvbihldnQpIHtcbiAgaWYgKCdzdGFydCcgIT09IHRoaXMucHJvY2Vzcy5fcnVudGltZS5zdGF0ZXMucGhhc2UpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBpZiAoLTEgIT09IHRoaXMuY29uZmlncy5pbnRlcnJ1cHRzLmluZGV4T2YoZXZ0LnR5cGUpKSB7XG4gICAgLy8gSW50ZXJydXB0IHdvdWxkIGJlIGhhbmRsZWQgaW1tZWRpYXRlbHkuXG4gICAgdGhpcy5fZm9yd2FyZFRvKGV2dCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0gZWxzZSB7XG4gICAgLy8gRXZlbnQgd291bGQgYmUgaGFuZGxlZCBhZnRlciBxdWV1aW5nLlxuICAgIC8vIFRoaXMgaXMsIGlmIHRoZSBldmVudCBoYW5kbGUgcmV0dXJuIGEgUHJvbWlzZSBvciBQcm9jZXNzLFxuICAgIC8vIHRoYXQgY2FuIGJlIGZ1bGZpbGxlZCBsYXRlci5cbiAgICB0aGlzLnByb2Nlc3MubmV4dCgoKSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5fZm9yd2FyZFRvKGV2dCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn07XG5cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vYnVpbGRfc3RhZ2Uvc3JjL3N0cmVhbS9zdHJlYW0uanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7IEludGVyZmFjZSB9IGZyb20gJ3NyYy9zdHJlYW0vcHJvY2Vzcy9pbnRlcmZhY2UuanMnO1xuaW1wb3J0IHsgUnVudGltZSB9IGZyb20gJ3NyYy9zdHJlYW0vcHJvY2Vzcy9ydW50aW1lLmpzJztcblxuLyoqXG4gKiBUaGUgY29yZSBjb21wb25lbnQgdG8gc2VxdWVudGlhbGl6ZSBhc3luY2hyb25vdXMgc3RlcHMuXG4gKiBCYXNpY2FsbHkgaXQncyBhbiAnaW50ZXJydXB0YWJsZSBwcm9taXNlJywgYnV0IG1vcmUgdGhhbiBiZSBpbnRlcnJ1cHRlZCxcbiAqIGl0IGNvdWxkICdzaGlmdCcgZnJvbSBvbmUgdG8gYW5vdGhlciBwaGFzZSwgd2l0aCB0aGUgbm9uLXByZWVtcHRpdmVcbiAqIGludGVycnVwdGluZyBtb2RlbC5cbiAqXG4gKiBFeGFtcGxlOlxuICogICAgdmFyIHByb2Nlc3MgPSBuZXcgUHJvY2VzcygpO1xuICogICAgcHJvY2Vzcy5zdGFydCgpICAgICAgIC8vIHRoZSBkZWZhdWx0IHBoYXNlIGlzICdzdGFydCdcbiAqICAgICAgICAgICAubmV4dChzdGVwQSlcbiAqICAgICAgICAgICAubmV4dChzdGVwQilcbiAqICAgICAgICAgICAuLi5cbiAqICAgIC8vIGxhdGVyLCBzb21lIHVyZ2VudCBldmVudHMgY29tZVxuICogICAgcHJvY2Vzcy5zdG9wKCkgICAgICAgLy8gb25lIG9mIHRoZSBkZWZhdWx0IHRocmVlIHBoYXNlc1xuICogICAgICAgICAgIC5uZXh0KHN0b3BTdGVwQSlcbiAqICAgICAgICAgICAubmV4dChzdG9wU3RlcEIpXG4gKiAgICAgICAgICAgLi4uLlxuICogICAvLyBsYXRlciwgc29tZSBvdGhlciBpbnRlcnJ1cHRzIGNvbWVcbiAqICAgcHJvY2Vzcy5zaGlmdCgnc3RvcCcsICdkaXp6eScpXG4gKiAgICAgICAgICAubmV4dChkaXp6eVN0ZXBBKVxuICogICAgICAgICAgLm5leHQoZGl6enlTdGVwQilcbiAqXG4gKiBUaGUgcGhhc2VzIGxpc3RlZCBhYm92ZSB3b3VsZCBpbW1lZGlhdGVseSBpbnRlcnJ1cHQgdGhlIHN0ZXBzIHNjaGVkdWxlZFxuICogYXQgdGhlIHByZXZpb3VzIHBoYXNlLiBIb3dldmVyLCB0aGlzIGlzIGEgKm5vbi1wcmVlbXB0aXZlKiBwcm9jZXNzIGJ5XG4gKiBkZWZhdWx0LiBTbywgaWYgdGhlcmUgaXMgYSBsb25nLXdhaXRpbmcgUHJvbWlzZSBzdGVwIGluIHRoZSAnc3RhcnQnIHBoYXNlOlxuICpcbiAqICAgcHJvY2Vzcy5zdGFydCgpXG4gKiAgICAgICAgICAubmV4dCggbG9uZ2xvbmdsb25nV2FpdGluZ1Byb21pc2UgKSAgIC8vIDwtLS0gbm93IGl0J3Mgd2FpdGluZyB0aGlzXG4gKiAgICAgICAgICAubmV4dCggdGhpc1N0ZXBJc1N0YXJ2aW5nIClcbiAqICAgICAgICAgIC5uZXh0KCBhbmRUaGlzT25lVG9vIClcbiAqICAgICAgICAgIC5uZXh0KCBwb29yU3RlcHMgKVxuICogICAgICAgICAgLi4uLlxuICogICAvLyBzb21lIHVyZ2VudCBldmVudCBvY2N1cnMgd2hlbiBpdCBnb2VzIHRvIHRoZSBsb25nIHdhaXRpbmcgcHJvbWlzZVxuICogICBwcm9jZXNzLnN0b3AoKVxuICogICAgICAgICAgLm5leHQoIGRvVGhpc0FzUXVpY2tBc1Bvc3NpYmxlIClcbiAqXG4gKiBUaGUgZmlyc3Qgc3RlcCBvZiB0aGUgJ3N0b3AnIHBoYXNlLCBuYW1lbHkgdGhlICdkb1RoaXNBc1F1aWNrQXNQb3NzaWJsZScsXG4gKiB3b3VsZCAqbm90KiBnZXQgZXhlY3V0ZWQgaW1tZWRpYXRlbHksIHNpbmNlIHRoZSBwcm9taXNlIGlzIHN0aWxsIHdhaXRpbmcgdGhlXG4gKiBsYXN0IHN0ZXAgZWFybGllciBpbnRlcnJ1cHRpb24uIFNvLCBldmVuIHRoZSBmb2xsb3dpbmcgc3RlcHMgb2YgdGhlICdzdGFydCdcbiAqIHBoYXNlIHdvdWxkIGFsbCBnZXQgZHJvcHBlZCwgdGhlIG5ldyBwaGFzZSBzdGlsbCBuZWVkIHRvIHdhaXQgdGhlIGxhc3Qgb25lXG4gKiBhc3luY2hyb25vdXMgc3RlcCBnZXQgcmVzb2x2ZWQgdG8gZ2V0IGtpY2tlZCBvZmYuXG4gKlxuICogLS0tXG4gKiAjIyBBYm91dCB0aGUgbm9uLXByZWVtcHRpdmUgbW9kZWxcbiAqXG4gKiBUaGUgcmVhc29uIHdoeSB3ZSBjYW4ndCBoYXZlIGEgcHJlZW1wdGl2ZSBwcm9jZXNzIGlzIGJlY2F1c2Ugd2UgY291bGRuJ3RcbiAqIGludGVycnVwdCBlYWNoIHNpbmdsZSBzdGVwIGluIHRoZSBwcm9jZXNzLCBzbyB0aGUgbW9zdCBiYXNpYyB1bml0IGNvdWxkIGJlXG4gKiBpbnRlcnJ1cHRlZCBpcyB0aGUgc3RlcC4gU28sIHRoZSBjYXZlYXQgaGVyZSBpcyBtYWtlIHRoZSBzdGVwIGFzIHNtYWxsIGFzXG4gKiBwb3NzaWJsZSwgYW5kIHRyZWF0IGl0IGFzIHNvbWUgYXRvbWljIG9wZXJhdGlvbiB0aGF0IGd1YXJhbnRlZWQgdG8gbm90IGJlZW5cbiAqIGludGVycnVwdGVkIGJ5IFByb2Nlc3MuIEZvciBleGFtcGxlLCBpZiB3ZSBhbGlhcyAnbmV4dCcgYXMgJ2F0b21pYyc6XG4gKlxuICogICAgcHJvY2Vzcy5zdGFydCgpXG4gKiAgICAgICAgICAgLmF0b21pYyhzdGVwQSkgICAgICAgLy8gPC0tLSBub3cgaXQncyB3YWl0aW5nIHRoaXNcbiAqICAgICAgICAgICAuYXRvbWljKHN0ZXBCKVxuICpcbiAqICAgLy8gc29tZSB1cmdlbnQgZXZlbnQgb2NjdXJzXG4gKiAgIHByb2Nlc3Muc3RvcCgpXG4gKiAgICAgICAgICAuYXRvbWljKCBkb1RoaXNBc1F1aWNrQXNQb3NzaWJsZSApXG4gKlxuICogSXQgd291bGQgYmUgYmV0dGVyIHRoYW46XG4gKlxuICogICAgcHJvY2Vzcy5zdGFydCgpXG4gKiAgICAgICAgICAgLmF0b21pYygoKSA9PiBzdGVwQS50aGVuKHN0ZXBCKSlcbiAqXG4gKiAgIC8vIHNvbWUgdXJnZW50IGV2ZW50IG9jY3Vyc1xuICogICBwcm9jZXNzLnN0b3AoKVxuICogICAgICAgICAgLmF0b21pYyggZG9UaGlzQXNRdWlja0FzUG9zc2libGUgKVxuICpcbiAqIFNpbmNlIGluIHRoZSBzZWNvbmQgZXhhbXBsZSB0aGUgZmlyc3Qgc3RlcCBvZiB0aGUgJ3N0b3AnIHBoYXNlIG11c3Qgd2FpdFxuICogYm90aCB0aGUgc3RlcEEgJiBzdGVwQiwgd2hpbGUgaW4gdGhlIGZpcnN0IG9uZSBpdCBvbmx5IG5lZWRzIHRvIHdhaXQgc3RlcEEuXG4gKiBIb3dldmVyLCB0aGlzIGRlcGVuZHMgb24gd2hpY2ggYXRvbWljIG9wZXJhdGlvbnMgaXMgbmVlZGVkLlxuICpcbiAqIE5ldmVydGhlbGVzcywgdXNlciBpcyBhYmxlIHRvIG1ha2UgdGhlIHN0ZXBzICdpbnRlcnJ1cHRpYmxlJyB2aWEgc29tZSBzcGVjaWFsXG4gKiBtZXRob2RzIG9mIHRoZSBwcm9jZXNzLiBUaGF0IGlzLCB0byBtb25pdG9yIHRoZSBwaGFzZSBjaGFuZ2VzIHRvIG51bGxpZnkgdGhlXG4gKiBzdGVwOlxuICpcbiAqICAgIHZhciBwcm9jZXNzID0gbmV3IFByb2Nlc3MoKTtcbiAqICAgIHByb2Nlc3Muc3RhcnQoKVxuICogICAgICAubmV4dCgoKSA9PiB7XG4gKiAgICAgICAgdmFyIHBoYXNlU2hpZnRlZCA9IGZhbHNlO1xuICogICAgICAgIHByb2Nlc3MudW50aWwoJ3N0b3AnKVxuICogICAgICAgICAgLm5leHQoKCkgPT4ge3BoYXNlU2hpZnRlZCA9IHRydWU7fSk7XG4gKiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyLCByaikgPT4ge1xuICogICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gKiAgICAgICAgICAgIGlmIChwaGFzZVNoaWZ0ZWQpIHsgY29uc29sZS5sb2coJ2RvIG5vdGhpbmcnKTsgfVxuICogICAgICAgICAgICBlbHNlICAgICAgICAgICAgICB7IGNvbnNvbGUubG9nKCdkbyBzb21ldGhpbmcnKTsgfVxuICogICAgICAgICAgfSwgMTAwMClcbiAqICAgICAgICB9KTtcbiAqICAgICAgfSlcbiAqXG4gKiAgIC8vIHNvbWUgdXJnZW50IGV2ZW50IG9jY3Vyc1xuICogICBwcm9jZXNzLnN0b3AoKVxuICogICAgICAgICAgLm5leHQoIGRvVGhpc0FzUXVpY2tBc1Bvc3NpYmxlIClcbiAqXG4gKiBTbyB0aGF0IHRoZSBmaXJzdCBzdGVwIG9mIHRoZSAnc3RvcCcgcGhhc2Ugd291bGQgZXhlY3V0ZSBpbW1lZGlhdGVseSBhZnRlclxuICogdGhlIHBoYXNlIHNoaWZ0ZWQsIHNpbmNlIHRoZSBsYXN0IHN0ZXAgb2YgdGhlIHByZXZpb3VzIHBoYXNlIGFib3J0ZWQgaXRzZWxmLlxuICogSW4gZnV0dXJlIHRoZSB0cmljayB0byBudWxsaWZ5IHRoZSBsYXN0IHN0ZXAgbWF5IGJlIGluY2x1ZGVkIGluIGFzIGEgbWV0aG9kXG4gKiBvZiBQcm9jZXNzLCBidXQgY3VycmVudGx5IHRoZSBtYW51YWwgZGV0ZWN0aW5nIGlzIHN0aWxsIG5lY2Vzc2FyeS5cbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gUHJvY2VzcygpIHtcbiAgdGhpcy5fcnVudGltZSA9IG5ldyBSdW50aW1lKCk7XG4gIHRoaXMuX2ludGVyZmFjZSA9IG5ldyBJbnRlcmZhY2UodGhpcy5fcnVudGltZSk7XG4gIHJldHVybiB0aGlzLl9pbnRlcmZhY2U7XG59XG5cbi8qKlxuICogQmVjYXVzZSBEUlkuXG4gKi9cblByb2Nlc3MuZGVmZXIgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHJlc29sdmUsIHJlamVjdDtcbiAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IHtcbiAgICByZXNvbHZlID0gcmVzO1xuICAgIHJlamVjdCA9IHJlajtcbiAgfSk7XG4gIHZhciByZXN1bHQgPSB7XG4gICAgJ3Jlc29sdmUnOiByZXNvbHZlLFxuICAgICdyZWplY3QnOiByZWplY3QsXG4gICAgJ3Byb21pc2UnOiBwcm9taXNlXG4gIH07XG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKiBTdGF0aWMgdmVyc2lvbiBmb3IgbWltaWNraW5nIFByb21pc2UuYWxsICovXG5Qcm9jZXNzLndhaXQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHByb2Nlc3MgPSBuZXcgUHJvY2VzcygpO1xuICByZXR1cm4gcHJvY2Vzcy5zdGFydCgpLndhaXQuYXBwbHkocHJvY2VzcywgYXJndW1lbnRzKTtcbn07XG5cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vYnVpbGRfc3RhZ2Uvc3JjL3N0cmVhbS9wcm9jZXNzL3Byb2Nlc3MuanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7IExhbmd1YWdlIH0gZnJvbSAnc3JjL3J1bmUvbGFuZ3VhZ2UuanMnO1xuXG4vKipcbiAqIFRoaXMgbGFuZ3VhZ2UgaW50ZXJmYWNlIHdvdWxkIHByb3ZpZGUgY2FsbGFibGUgbWV0aG9kcyBvZiB0aGUgUHJvY2VzcyBlRFNMLlxuICpcbiAqIFRoZSBkaWZmZXJlbmNlIGJldHdlZW4gaW50ZXJmYW5jZSAmIHJ1bnRpbWUgaXM6XG4gKlxuICogIEludGVyZmFjZTogbWFuYWdlIHRoZSBzdGFjayBhbmQgcHJvdmlkZXMgYW5hbHl6ZXJzIGlmIGl0J3MgbmVjZXNzYXJ5LlxuICogIFJ1bnRpbWU6IGV2YWx1YXRlIGV2ZXJ5IGNoYW5nZSAobm9kZSkgb2YgdGhlIHN0YWNrLlxuICpcbiAqIFNvIHRoaXMgaW50ZXJmYWNlIHdvdWxkIGNoZWNrIGlmIHRoZXJlIGFyZSBhbnkgJ3N5bnRheCcgZXJyb3IgZHVyaW5nIGNvbXBvc2VcbiAqIHRoZSBlRFNMIGluc3RhbmNlLiBGb3IgZXhhbXBsZSwgdGhlIGFuYWx5emVyIG9mIHRoZSBpbnRlcmZhY2UgY291bGQgcmVwb3J0XG4gKiB0aGlzIGtpbmQgb2YgZXJyb3I6XG4gKlxuICogIHByb2Nlc3Muc3RvcCgpLnN0YXJ0KCkubmV4dCgpOyAgICAvLyBFUlJPUjogJ3N0b3AnIGJlZm9yZSAnc3RhcnQnXG4gKlxuICogQW5kIHNpbmNlIHRoZSBpbnRlcmZhY2Ugd291bGQgbm90IGV2YWx1YXRlIG5vZGVzLCBpdCB3b3VsZCBmb3J3YXJkIHN0YWNrXG4gKiBjaGFuZ2VzIHRvIHRoZSBydW50aW1lLlxuICovXG5leHBvcnQgZnVuY3Rpb24gSW50ZXJmYWNlKHJ1bnRpbWUpIHtcbiAgLy8gUmVxdWlyZWQgYnkgdGhlICdMYW5ndWFnZScgbW9kdWxlLlxuICB0aGlzLmNvbnRleHQgPSB7XG4gICAgc3RhcnRlZDogZmFsc2UsXG4gICAgc3RvcHBlZDogZmFsc2VcbiAgfTtcbiAgdGhpcy5zdGFjayA9IFtdO1xuICB0aGlzLl9ydW50aW1lID0gcnVudGltZTtcbiAgdGhpcy5fZXZhbHVhdG9yID0gKG5ldyBMYW5ndWFnZS5FdmFsdWF0ZSgpKVxuICAgIC5hbmFseXplcih0aGlzLl9hbmFseXplT3JkZXIuYmluZCh0aGlzKSlcbiAgICAuaW50ZXJwcmV0ZXIodGhpcy5faW50ZXJwcmV0LmJpbmQodGhpcykpO1xufVxuXG5JbnRlcmZhY2UucHJvdG90eXBlLnN0YXJ0ID0gTGFuZ3VhZ2UuZGVmaW5lKCdzdGFydCcsICdiZWdpbicpO1xuSW50ZXJmYWNlLnByb3RvdHlwZS5zdG9wID0gTGFuZ3VhZ2UuZGVmaW5lKCdzdG9wJywgJ3B1c2gnKTtcbkludGVyZmFjZS5wcm90b3R5cGUuZGVzdHJveSA9IExhbmd1YWdlLmRlZmluZSgnZGVzdHJveScsICdwdXNoJyk7XG5JbnRlcmZhY2UucHJvdG90eXBlLm5leHQgPSBMYW5ndWFnZS5kZWZpbmUoJ25leHQnLCAncHVzaCcpO1xuSW50ZXJmYWNlLnByb3RvdHlwZS5zaGlmdCA9IExhbmd1YWdlLmRlZmluZSgnc2hpZnQnLCAncHVzaCcpO1xuSW50ZXJmYWNlLnByb3RvdHlwZS5yZXNjdWUgPSBMYW5ndWFnZS5kZWZpbmUoJ3Jlc2N1ZScsICdwdXNoJyk7XG5JbnRlcmZhY2UucHJvdG90eXBlLndhaXQgPSBMYW5ndWFnZS5kZWZpbmUoJ3dhaXQnLCAncHVzaCcpO1xuXG4vLyBJdCdzIG5vdCBhIG1ldGhvZCBvd25zIHNlbWFudGljcyBtZWFuaW5nIG9mIHRoZSBlRFNMLCBidXQgYSBtZXRob2Rcbi8vIGludGVyYWN0cyB3aXRoIHRoZSBtZXRhbGFuZ2F1Z2UsIHNvIGRlZmluZSBpdCBpbiB0aGlzIHdheS5cbkludGVyZmFjZS5wcm90b3R5cGUudW50aWwgPVxuZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLl9ydW50aW1lLnVudGlsLmFwcGx5KHRoaXMuX3J1bnRpbWUsIGFyZ3VtZW50cyk7XG59O1xuXG5JbnRlcmZhY2UucHJvdG90eXBlLm9uY2hhbmdlID0gZnVuY3Rpb24oY29udGV4dCwgbm9kZSwgc3RhY2spIHtcbiAgLy8gV2hlbiBpdCdzIGNoYW5nZWQsIGV2YWx1YXRlIGl0IHdpdGggYW5hbHl6ZXJzICYgaW50ZXJwcmV0ZXIuXG4gIHJldHVybiB0aGlzLl9ldmFsdWF0b3IoY29udGV4dCwgbm9kZSwgc3RhY2spO1xufTtcblxuSW50ZXJmYWNlLnByb3RvdHlwZS5faW50ZXJwcmV0ID0gZnVuY3Rpb24oY29udGV4dCwgbm9kZSwgc3RhY2spIHtcbiAgLy8gV2VsbCBpbiB0aGlzIGVEU0wgd2UgZGVsZWdhdGUgdGhlIGludGVycHJldGlvbiB0byB0aGUgcnVudGltZS5cbiAgcmV0dXJuIHRoaXMuX3J1bnRpbWUub25jaGFuZ2UuYXBwbHkodGhpcy5fcnVudGltZSwgYXJndW1lbnRzKTtcbn07XG5cbi8vIEluIHRoaXMgZURTTCB3ZSBub3cgb25seSBoYXZlIHRoaXMgYW5hbHl6ZXIuIENvdWxkIGFkZCBtb3JlIGFuZCByZWdpc3RlciBpdFxuLy8gaW4gdGhlIGNvbnRydWN0aW9uIG9mICd0aGlzLl9ldmFsdWF0b3InLlxuSW50ZXJmYWNlLnByb3RvdHlwZS5fYW5hbHl6ZU9yZGVyID0gZnVuY3Rpb24oY29udGV4dCwgY2hhbmdlLCBzdGFjaykge1xuICBpZiAoJ3N0YXJ0JyA9PT0gY2hhbmdlLnR5cGUpIHtcbiAgICBjb250ZXh0LnN0YXJ0ZWQgPSB0cnVlO1xuICB9IGVsc2UgaWYgKCdzdG9wJykge1xuICAgIGNvbnRleHQuc3RvcHBlZCA9IHRydWU7XG4gIH1cbiAgaWYgKCdzdGFydCcgPT09IGNoYW5nZS50eXBlICYmIGNvbnRleHQuc3RvcHBlZCkge1xuICAgIHRocm93IG5ldyBFcnJvcignU2hvdWxkIG5vdCBzdGFydCBhIHByb2Nlc3MgYWdhaW4nICtcbiAgICAgICAgJ2FmdGVyIGl0XFwncyBhbHJlYWR5IHN0b3BwZWQnKTtcbiAgfSBlbHNlIGlmICgnbmV4dCcgPT09IGNoYW5nZS50eXBlICYmICFjb250ZXh0LnN0YXJ0ZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Nob3VsZCBub3QgY29uY2F0IHN0ZXBzIHdoaWxlIGl0XFwncyBub3Qgc3RhcnRlZCcpO1xuICB9IGVsc2UgaWYgKCdzdG9wJyA9PT0gY2hhbmdlLnR5cGUgJiYgIWNvbnRleHQuc3RhcnRlZCkge1xuICAgIHRocm93IG5ldyBFcnJvcignU2hvdWxkIG5vdCBzdG9wIGEgcHJvY2VzcyBiZWZvcmUgaXRcXCdzIHN0YXJ0ZWQnKTtcbiAgfVxufTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vYnVpbGRfc3RhZ2Uvc3JjL3N0cmVhbS9wcm9jZXNzL2ludGVyZmFjZS5qc1xuICoqLyIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0IGZ1bmN0aW9uIFJ1bnRpbWUoKSB7XG4gIHRoaXMuc3RhdGVzID0ge1xuICAgIHBoYXNlOiBudWxsLFxuICAgIGN1cnJlbnRQcm9taXNlOiBudWxsLFxuICAgIHVudGlsOiB7XG4gICAgICByZXNvbHZlcjogbnVsbCxcbiAgICAgIHBoYXNlOiBudWxsXG4gICAgfSxcbiAgICAvLyBAc2VlOiAjbmV4dFxuICAgIHN0ZXBSZXN1bHRzOiBbXSxcbiAgfTtcbiAgdGhpcy5kZWJ1Z2dpbmcgPSB7XG4gICAgLy8gQHNlZTogI25leHRcbiAgICBjdXJyZW50UGhhc2VTdGVwczogMCxcbiAgICBjb2xvcnM6IHRoaXMuZ2VuZXJhdGVEZWJ1Z2dpbmdDb2xvcigpLFxuICAgIHRydW5jYXRpbmdMaW1pdDogNjRcbiAgfTtcbiAgdGhpcy5jb25maWdzID0ge1xuICAgIGRlYnVnOiBmYWxzZVxuICB9O1xufVxuXG4vKipcbiAqIFdoZW4gdGhlIHN0YWNrIG9mIERTTCBjaGFuZ2VzLCBldmFsdWF0ZSB0aGUgTGFuZ3VhZ2UuTm9kZS5cbiAqIE5vdGU6IHNpbmNlIGluIHRoaXMgRFNMIHdlIG5lZWRuJ3QgJ2V4aXQnIG5vZGUsIHdlIGRvbid0IGhhbmRsZSBpdC5cbiAqIEZvciBzb21lIG90aGVyIERTTCB0aGF0IG1heSByZXR1cm4gc29tZXRoaW5nLCB0aGUgJ2V4aXQnIG5vZGUgbXVzdFxuICoga2VlcCBhIGZpbmFsIHN0YWNrIHdpdGggb25seSByZXN1bHQgbm9kZSBpbnNpZGUgYXMgdGhlciByZXR1cm4gdmFsdWUuXG4gKi9cblJ1bnRpbWUucHJvdG90eXBlLm9uY2hhbmdlID0gZnVuY3Rpb24oaW5zdGFuY2UsIGNoYW5nZSwgc3RhY2spIHtcbiAgLy8gU2luY2Ugd2UgZG9uJ3QgbmVlZCB0byBrZWVwIHRoaW5ncyBpbiBzdGFjayB1bnRpbCB3ZSBoYXZlXG4gIC8vIHJlYWwgYW5hbHl6ZXJzLCB0aGUgJ29uY2hhbmdlJyBoYW5kbGVyIHdvdWxkIHJldHVybiBlbXB0eSBzdGFja1xuICAvLyB0byBsZXQgdGhlIGxhbmd1YWdlIHJ1bnRpbWUgY2xlYXIgdGhlIHN0YWNrIGV2ZXJ5IGluc3RydWN0aW9uLlxuICB0aGlzW2NoYW5nZS50eXBlXS5hcHBseSh0aGlzLCBjaGFuZ2UuYXJncyk7XG4gIHJldHVybiBbXTtcbn07XG5cblxuUnVudGltZS5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5zdGF0ZXMucGhhc2UgPSAnc3RhcnQnO1xuICB0aGlzLnN0YXRlcy5jdXJyZW50UHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSgpO1xufTtcblxuUnVudGltZS5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnNoaWZ0KCdzdGFydCcsICdzdG9wJyk7XG59O1xuXG5SdW50aW1lLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuc2hpZnQoJ3N0b3AnLCAnZGVzdHJveScpO1xufTtcblxuUnVudGltZS5wcm90b3R5cGUuc2hpZnQgPSBmdW5jdGlvbihwcmV2LCBjdXJyZW50KSB7XG4gIC8vIEFscmVhZHkgaW4uXG4gIGlmIChjdXJyZW50ID09PSB0aGlzLnN0YXRlcy5waGFzZSkge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAocHJldiAhPT0gdGhpcy5zdGF0ZXMucGhhc2UpIHtcbiAgICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IoYE11c3QgYmUgJHtwcmV2fSBiZWZvcmUgc2hpZnQgdG8gJHtjdXJyZW50fSxcbiAgICAgICAgICAgICAgICAgICAgIGJ1dCBub3cgaXQncyAke3RoaXMuc3RhdGVzLnBoYXNlfWApO1xuICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgIHRocm93IGVycm9yO1xuICB9XG4gIHRoaXMuc3RhdGVzLnBoYXNlID0gY3VycmVudDtcbiAgaWYgKHRoaXMudW50aWwucGhhc2UgPT09IHRoaXMuc3RhdGVzLnBoYXNlKSB7XG4gICAgdGhpcy51bnRpbC5yZXNvbHZlcigpO1xuICB9XG4gIC8vIENvbmNhdCBuZXcgc3RlcCB0byBzd2l0Y2ggdG8gdGhlICduZXh0IHByb21pc2UnLlxuICB0aGlzLnN0YXRlcy5jdXJyZW50UHJvbWlzZSA9XG4gIHRoaXMuc3RhdGVzLmN1cnJlbnRQcm9taXNlLmNhdGNoKChlcnIpID0+IHtcbiAgICBpZiAoIShlcnIgaW5zdGFuY2VvZiBSdW50aW1lLkludGVycnVwdEVycm9yKSkge1xuICAgICAgLy8gV2UgbmVlZCB0byByZS10aHJvdyBpdCBhZ2FpbiBhbmQgYnlwYXNzIHRoZSB3aG9sZVxuICAgICAgLy8gcGhhc2UsIHVudGlsIHRoZSBuZXh0IHBoYXNlIChmaW5hbCBwaGFzZSkgdG9cbiAgICAgIC8vIGhhbmRsZSBpdC4gU2luY2UgaW4gUHJvbWlzZSwgc3RlcHMgYWZ0ZXIgY2F0Y2ggd291bGRcbiAgICAgIC8vIG5vdCBiZSBhZmZlY3RlZCBieSB0aGUgY2F0Y2hlZCBlcnJvciBhbmQga2VlcCBleGVjdXRpbmcuXG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICAgIC8vIEFuZCBpZiBpdCdzIGFuIGludGVycnVwdCBlcnJvciB3ZSBkbyBub3RoaW5nLCBzbyB0aGF0IGl0IHdvdWxkXG4gICAgLy8gbWFrZSB0aGUgY2hhaW4gb21pdCB0aGlzIGVycm9yIGFuZCBleGVjdXRlIHRoZSBmb2xsb3dpbmcgc3RlcHMuXG4gIH0pO1xuICAvLyBBdCB0aGUgbW9tZW50IG9mIHNoaWZ0aW5nLCB0aGVyZSBhcmUgbm8gc3RlcHMgYmVsb25nIHRvIHRoZSBuZXcgcGhhc2UuXG4gIHRoaXMuZGVidWdnaW5nLmN1cnJlbnRQaGFzZVN0ZXBzID0gMDtcbn07XG5cbi8qKlxuICogUmV0dXJuIGEgUHJvbWlzZSB0aGF0IG9ubHkgYmUgcmVzb2x2ZWQgd2hlbiB3ZSBnZXQgc2hpZmVkIHRvIHRoZVxuICogdGFyZ2V0IHBoYXNlLlxuICovXG5SdW50aW1lLnByb3RvdHlwZS51bnRpbCA9IGZ1bmN0aW9uKHBoYXNlKSB7XG4gIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlcykgPT4ge1xuICAgIHRoaXMuc3RhdGVzLnVudGlsLnJlc29sdmVyID0gcmVzO1xuICB9KTtcbiAgcmV0dXJuIHByb21pc2U7XG59O1xuXG4vKipcbiAqIFRoZSAnc3RlcCcgY2FuIG9ubHkgYmUgYSBmdW5jdGlvbiByZXR1cm4gUHJvbWlzZS9Qcm9jZXNzL3BsYWluIHZhbHVlLlxuICogTm8gbWF0dGVyIGEgUHJvbWlzZSBvciBQcm9jZXNzIGl0IHdvdWxkIHJldHVybixcbiAqIHRoZSBjaGFpbiB3b3VsZCBjb25jYXQgaXQgYXMgdGhlIFByb21pc2UgcnVsZS5cbiAqIElmIGl0J3MgcGxhaW4gdmFsdWUgdGhlbiB0aGlzIHByb2Nlc3Mgd291bGQgaWdub3JlIGl0LCBhc1xuICogd2hhdCBhIFByb21pc2UgZG9lcy5cbiAqXG4gKiBBYm91dCB0aGUgcmVzb2x2aW5nIHZhbHVlczpcbiAqXG4gKiAubmV4dCggZm5SZXNvbHZlQSwgZm5SZXNvbHZlQiApICAtLT4gI3NhdmUgW2EsIGJdIGluIHRoaXMgcHJvY2Vzc1xuICogLm5leHQoIGZuUmVzb2x2ZUMgKSAgICAgICAgICAgICAgLS0+ICNyZWNlaXZlIFthLCBiXSBhcyBmaXJzdCBhcmd1bWVudFxuICogLm5leHQoIGZuUmVzb2x2ZUQgKSAgICAgICAgICAgICAgLS0+ICNyZWNlaXZlIGMgYXMgZmlyc3QgYXJndW1lbnRcbiAqIC5uZXh0KCBmblJlc29sdmVFLCBmblJlc29sdmVGKSAgIC0tPiAjZWFjaCBvZiB0aGVtIHJlY2VpdmUgZCBhcyBhcmd1bWVudFxuICovXG5SdW50aW1lLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24oLi4udGFza3MpIHtcbiAgaWYgKCF0aGlzLnN0YXRlcy5jdXJyZW50UHJvbWlzZSkge1xuICAgIHRocm93IG5ldyBFcnJvcignUHJvY2VzcyBzaG91bGQgaW5pdGlhbGl6ZSB3aXRoIHRoZSBgc3RhcnRgIG1ldGhvZCcpO1xuICB9XG4gIC8vIEF0IGRlZmluaXRpb24gc3RhZ2UsIHNldCBpdCdzIHBoYXNlLlxuICAvLyBBbmQgY2hlY2sgaWYgaXQncyBhIGZ1bmN0aW9uLlxuICB0YXNrcy5mb3JFYWNoKCh0YXNrKSA9PiB7XG4gICAgaWYgKCdmdW5jdGlvbicgIT09IHR5cGVvZiB0YXNrKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZSB0YXNrIGlzIG5vdCBhIGZ1bmN0aW9uOiAke3Rhc2t9YCk7XG4gICAgfVxuICAgIHRhc2sucGhhc2UgPSB0aGlzLnN0YXRlcy5waGFzZTtcbiAgICBpZiAodGhpcy5jb25maWdzLmRlYnVnKSB7XG4gICAgICAvLyBNdXN0IGFwcGVuZCBzdGFjayBpbmZvcm1hdGlvbiBoZXJlIHRvIGxldCBkZWJ1Z2dlciBvdXRwdXRcbiAgICAgIC8vIGl0J3MgZGVmaW5lZCBpbiB3aGVyZS5cbiAgICAgIHRhc2sudHJhY2luZyA9IHtcbiAgICAgICAgc3RhY2s6IChuZXcgRXJyb3IoKSkuc3RhY2tcbiAgICAgIH07XG4gICAgfVxuICB9KTtcblxuICAvLyBGaXJzdCwgY29uY2F0IGEgJ3RoZW4nIHRvIGNoZWNrIGludGVycnVwdC5cbiAgdGhpcy5zdGF0ZXMuY3VycmVudFByb21pc2UgPVxuICAgIHRoaXMuc3RhdGVzLmN1cnJlbnRQcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgLy8gV291bGQgY2hlY2s6IGlmIHRoZSBwaGFzZSBpdCBiZWxvbmdzIHRvIGlzIG5vdCB3aGF0IHdlJ3JlIGluLFxuICAgICAgLy8gdGhlIHByb2Nlc3MgbmVlZCB0byBiZSBpbnRlcnJwdXRlZC5cbiAgICAgIGZvciAodmFyIHRhc2sgb2YgdGFza3MpIHtcbiAgICAgICAgaWYgKHRoaXMuY2hlY2tJbnRlcnJ1cHQodGFzaykpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgUnVudGltZS5JbnRlcnJ1cHRFcnJvcigpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgLy8gUmVhZCBpdCBhczpcbiAgLy8gMS4gZXhlY3V0ZSBhbGwgdGFza3MgdG8gZ2VuZXJhdGUgcmVzb2x2YWJsZS1wcm9taXNlc1xuICAvLyAyLiBQcm9taXNlLmFsbCguLi4pIHRvIHdhaXQgdGhlc2UgcmVzb2x2YWJsZS1wcm9taXNlc1xuICAvLyAzLiBhcHBlbmQgYSBnZW5lcmFsIGVycm9yIGhhbmRsZXIgYWZ0ZXIgdGhlIFByb21pc2UuYWxsXG4gIC8vICAgIHNvIHRoYXQgaWYgYW55IGVycm9yIG9jY3VycyBpdCB3b3VsZCBwcmludCB0aGVtIG91dFxuICAvLyBTbywgaW5jbHVkaW5nIHRoZSBjb2RlIGFib3ZlLCB3ZSB3b3VsZCBoYXZlOlxuICAvL1xuICAvLyBjdXJyZW50UHJvbWlzZSB7XG4gIC8vICBbY2hlY2tJbnRlcnJ1cHQodGFza3MpXVxuICAvLyAgW1Byb21pc2UuYWxsKFt0YXNrQTEsIHRhc2tBMi4uLl0pXVxuICAvLyAgW2Vycm9yIGhhbmRsZXJdICt9XG4gIC8vXG4gIC8vIFRoZSAnY2hlY2tJbnRlcnJ1cHQnIGFuZCAnZXJyb3IgaGFuZGxlcicgd3JhcCB0aGUgYWN0dWFsIHN0ZXBzXG4gIC8vIHRvIGRvIHRoZSBuZWNlc3NhcnkgY2hlY2tzLlxuICB0aGlzLnN0YXRlcy5jdXJyZW50UHJvbWlzZSA9XG4gICAgdGhpcy5zdGF0ZXMuY3VycmVudFByb21pc2UudGhlbigoKSA9PiB0aGlzLmdlbmVyYXRlU3RlcCh0YXNrcykpO1xuICB0aGlzLnN0YXRlcy5jdXJyZW50UHJvbWlzZSA9XG4gICAgdGhpcy5zdGF0ZXMuY3VycmVudFByb21pc2UuY2F0Y2godGhpcy5nZW5lcmF0ZUVycm9yTG9nZ2VyKHtcbiAgICAgICdudGgtc3RlcCc6IHRoaXMuZGVidWdnaW5nLmN1cnJlbnRQaGFzZVN0ZXBzXG4gICAgfSkpO1xuXG4gIC8vIEEgd2F5IHRvIGtub3cgaWYgdGhlc2UgdGFza3MgaXMgdGhlIGZpcnN0IHN0ZXBzIGluIHRoZSBjdXJyZW50IHBoYXNlLFxuICAvLyBhbmQgaXQncyBhbHNvIGNvbnZlbmllbnQgZm9yIGRlYnVnZ2luZy5cbiAgdGhpcy5kZWJ1Z2dpbmcuY3VycmVudFBoYXNlU3RlcHMgKz0gMTtcblxufTtcblxuUnVudGltZS5wcm90b3R5cGUucmVzY3VlID0gZnVuY3Rpb24oaGFuZGxlcikge1xuICB0aGlzLnN0YXRlcy5jdXJyZW50UHJvbWlzZSA9XG4gICAgdGhpcy5zdGF0ZXMuY3VycmVudFByb21pc2UuY2F0Y2goKGVycikgPT4ge1xuICAgIGlmIChlcnIgaW5zdGFuY2VvZiBSdW50aW1lLkludGVycnVwdEVycm9yKSB7XG4gICAgICAvLyBPbmx5IGJ1aWx0LWluIHBoYXNlIHRyYW5zZmVycmluZyBjYXRjaCBjYW4gaGFuZGxlIGludGVycnVwdHMuXG4gICAgICAvLyBSZS10aHJvdyBpdCB1bnRpbCB3ZSByZWFjaCB0aGUgZmluYWwgY2F0Y2ggd2Ugc2V0LlxuICAgICAgdGhyb3cgZXJyO1xuICAgIH0gZWxzZSB7XG4gICAgICBoYW5kbGVyKGVycik7XG4gICAgfVxuICB9KTtcbn07XG5cbi8qKlxuICogQW4gaW50ZXJmYWNlIHRvIGV4cGxpY2l0bHkgcHV0IG11bHRpcGxlIHRhc2tzIGV4ZWN1dGUgYXQgb25lIHRpbWUuXG4gKiovXG5SdW50aW1lLnByb3RvdHlwZS53YWl0ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMubmV4dC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcblxuLyoqXG4gKiBFeGVjdXRlIHRhc2sgYW5kIGdldCBQcm9taXNlcyBvciBwbGFpbiB2YWx1ZXMgdGhlbSByZXR1cm4sXG4gKiBhbmQgdGhlbiByZXR1cm4gdGhlIHdyYXBwZWQgUHJvbWlzZSBhcyB0aGUgbmV4dCBzdGVwIG9mIHRoaXNcbiAqIHByb2Nlc3MuIFRoZSBuYW1lICdzdGVwJyBpbmRpY2F0ZXMgdGhlIGdlbmVyYXRlZCBQcm9taXNlLFxuICogd2hpY2ggaXMgb25lIHN0ZXAgb2YgdGhlIG1haW4gUHJvbWlzZSBvZiB0aGUgY3VycmVudCBwaGFzZS5cbiAqL1xuUnVudGltZS5wcm90b3R5cGUuZ2VuZXJhdGVTdGVwID0gZnVuY3Rpb24odGFza3MpIHtcbiAgLy8gJ3Rhc2tSZXN1bHRzJyBtZWFucyB0aGUgcmVzdWx0cyBvZiB0aGUgdGFza3MuXG4gIHZhciB0YXNrUmVzdWx0cyA9IFtdO1xuICBpZiAodHJ1ZSA9PT0gdGhpcy5jb25maWdzLmRlYnVnKSB7XG4gICAgdGhpcy50cmFjZSh0YXNrcyk7XG4gIH1cblxuICAvLyBTbyB3ZSB1bndyYXAgdGhlIHRhc2sgZmlyc3QsIGFuZCB0aGVuIHB1dCBpdCBpbiB0aGUgYXJyYXkuXG4gIC8vIFNpbmNlIHdlIG5lZWQgdG8gZ2l2ZSB0aGUgJ2N1cnJlbnRQcm9taXNlJyBhIGZ1bmN0aW9uIGFzIHdoYXQgdGhlXG4gIC8vIHRhc2tzIGdlbmVyYXRlIGhlcmUuXG4gIHZhciBjaGFpbnMgPSB0YXNrcy5tYXAoKHRhc2spID0+IHtcbiAgICAvLyBSZXNldCB0aGUgcmVnaXN0ZXJlZCByZXN1bHRzLlxuICAgIC8vICdwcmV2aW91c1Jlc3VsdHMnIG1lYW5zIHRoZSByZXN1bHRzIGxlZnQgYnkgdGhlIHByZXZpb3VzIHN0ZXAuXG4gICAgdmFyIHByZXZpb3VzUmVzdWx0cyA9IHRoaXMuc3RhdGVzLnN0ZXBSZXN1bHRzO1xuICAgIHZhciBjaGFpbjtcbiAgICAvLyBJZiBpdCBoYXMgbXVsdGlwbGUgcmVzdWx0cywgbWVhbnMgaXQncyBhIHRhc2sgZ3JvdXBcbiAgICAvLyBnZW5lcmF0ZWQgcmVzdWx0cy5cbiAgICBpZiAocHJldmlvdXNSZXN1bHRzLmxlbmd0aCA+IDEpIHtcbiAgICAgIGNoYWluID0gdGFzayhwcmV2aW91c1Jlc3VsdHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjaGFpbiA9IHRhc2socHJldmlvdXNSZXN1bHRzWzBdKTtcbiAgICB9XG4gICAgLy8gT3JkaW5hcnkgZnVuY3Rpb24gcmV0dXJucyAndW5kZWZpbmUnIG9yIG90aGVyIHRoaW5ncy5cbiAgICBpZiAoIWNoYWluKSB7XG4gICAgICAvLyBJdCdzIGEgcGxhaW4gdmFsdWUuXG4gICAgICAvLyBTdG9yZSBpdCBhcyBvbmUgb2YgcmVzdWx0cy5cbiAgICAgIHRhc2tSZXN1bHRzLnB1c2goY2hhaW4pO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShjaGFpbik7XG4gICAgfVxuXG4gICAgLy8gSXQncyBhIFByb2Nlc3MuXG4gICAgaWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgY2hhaW4uX3J1bnRpbWUgJiZcbiAgICAgICAgY2hhaW4uX3J1bnRpbWUgaW5zdGFuY2VvZiBSdW50aW1lKSB7XG4gICAgICAvLyBQcmVtaXNlOiBpdCdzIGEgc3RhcnRlZCBwcm9jZXNzLlxuICAgICAgcmV0dXJuIGNoYWluLl9ydW50aW1lLnN0YXRlcy5jdXJyZW50UHJvbWlzZS50aGVuKCgpID0+IHtcbiAgICAgICAgdmFyIGd1ZXN0UmVzdWx0cyA9IGNoYWluLl9ydW50aW1lLnN0YXRlcy5zdGVwUmVzdWx0cztcbiAgICAgICAgLy8gU2luY2Ugd2UgaW1wbGljaXRseSB1c2UgJ1Byb21pc2UuYWxsJyB0byBydW5cbiAgICAgICAgLy8gbXVsdGlwbGUgdGFza3MgaW4gb25lIHN0ZXAsIHdlIG5lZWQgdG8gZGV0ZXJtaW5hdGUgaWZcbiAgICAgICAgLy8gdGhlcmUgaXMgb25seSBvbmUgdGFzayBpbiB0aGUgdGFzaywgb3IgaXQgYWN0dWFsbHkgaGFzIG11bHRpcGxlXG4gICAgICAgIC8vIHJldHVybiB2YWx1ZXMgZnJvbSBtdWx0aXBsZSB0YXNrcy5cbiAgICAgICAgaWYgKGd1ZXN0UmVzdWx0cy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgLy8gV2UgbmVlZCB0byB0cmFuc2ZlciB0aGUgcmVzdWx0cyBmcm9tIHRoZSBndWVzdCBQcm9jZXNzIHRvIHRoZVxuICAgICAgICAgIC8vIGhvc3QgUHJvY2Vzcy5cbiAgICAgICAgICB0YXNrUmVzdWx0cyA9IHRhc2tSZXN1bHRzLnB1c2goZ3Vlc3RSZXN1bHRzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0YXNrUmVzdWx0cy5wdXNoKGNoYWluLl9ydW50aW1lLnN0YXRlcy5zdGVwUmVzdWx0c1swXSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoY2hhaW4udGhlbikge1xuICAgICAgLy8gT3JkaW5hcnkgcHJvbWlzZSBjYW4gYmUgY29uY2F0ZWQgaW1tZWRpYXRlbHkuXG4gICAgICByZXR1cm4gY2hhaW4udGhlbigocmVzb2x2ZWRWYWx1ZSkgPT4ge1xuICAgICAgICB0YXNrUmVzdWx0cy5wdXNoKHJlc29sdmVkVmFsdWUpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEl0J3MgYSBwbGFpbiB2YWx1ZS5cbiAgICAgIC8vIFN0b3JlIGl0IGFzIG9uZSBvZiByZXN1bHRzLlxuICAgICAgdGFza1Jlc3VsdHMucHVzaChjaGFpbik7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGNoYWluKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gUHJvbWlzZS5hbGwoY2hhaW5zKS50aGVuKCgpID0+IHtcbiAgICAvLyBCZWNhdXNlIGluIHRoZSBwcmV2aW91cyAnYWxsJyB3ZSBlbnN1cmUgYWxsIHRhc2tzIGFyZSBleGVjdXRlZCxcbiAgICAvLyBhbmQgdGhlIHJlc3VsdHMgb2YgdGhlc2UgdGFza3MgYXJlIGNvbGxlY3RlZCwgc28gd2UgbmVlZFxuICAgIC8vIHRvIHJlZ2lzdGVyIHRoZW0gYXMgdGhlIGxhc3QgcmVzdWx0cyBvZiB0aGUgbGFzdCBzdGVwLlxuICAgIHRoaXMuc3RhdGVzLnN0ZXBSZXN1bHRzID0gdGFza1Jlc3VsdHM7XG4gIH0pO1xufTtcblxuLyoqIFdlIG5lZWQgdGhpcyB0byBwcmV2ZW50IHRoZSBzdGVwKCkgdGhyb3cgZXJyb3JzLlxuKiBJbiB0aGlzIGNhdGNoLCB3ZSBkaXN0aW5ndWlzaCB0aGUgaW50ZXJydXB0IGFuZCBvdGhlciBlcnJvcnMsXG4qIGFuZCB0aGVuIGJ5cGFzcyB0aGUgZm9ybWVyIGFuZCBwcmludCB0aGUgbGF0ZXIgb3V0LlxuKlxuKiBUaGUgZmluYWwgZmF0ZSBvZiB0aGUgcmVhbCBlcnJvcnMgaXMgaXQgd291bGQgYmUgcmUtdGhyb3cgYWdhaW5cbiogYWZ0ZXIgd2UgcHJpbnQgdGhlIGluc3RhbmNlIG91dC4gV2UgbmVlZCB0byBkbyB0aGF0IHNpbmNlIGFmdGVyIGFuXG4qIGVycm9yIHRoZSBwcm9taXNlIHNob3VsZG4ndCBrZWVwIGV4ZWN1dGluZy4gSWYgd2UgZG9uJ3QgdGhyb3cgaXRcbiogYWdhaW4sIHNpbmNlIHRoZSBlcnJvciBoYXMgYmVlbiBjYXRjaGVkLCB0aGUgcmVzdCBzdGVwcyBpbiB0aGVcbiogcHJvbWlzZSB3b3VsZCBzdGlsbCBiZSBleGVjdXRlZCwgYW5kIHRoZSB1c2VyLXNldCByZXNjdWVzIHdvdWxkXG4qIG5vdCBjYXRjaCB0aGlzIGVycm9yLlxuKlxuKiBBcyBhIGNvbmNsdXNpb24sIG5vIG1hdHRlciB3aGV0aGVyIHRoZSBlcnJvciBpcyBhbiBpbnRlcnJ1cHQsXG4qIHdlIGFsbCBuZWVkIHRvIHRocm93IGl0IGFnYWluLiBUaGUgb25seSBkaWZmZXJlbmNlIGlzIGlmIGl0J3NcbiogYW5kIGludGVycnVwdCB3ZSBkb24ndCBwcmludCBpdCBvdXQuXG4qL1xuUnVudGltZS5wcm90b3R5cGUuZ2VuZXJhdGVFcnJvckxvZ2dlciA9IGZ1bmN0aW9uKGRlYnVnaW5mbykge1xuICByZXR1cm4gKGVycikgPT4ge1xuICAgIGlmICghKGVyciBpbnN0YW5jZW9mIFJ1bnRpbWUuSW50ZXJydXB0RXJyb3IpKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGBFUlJPUiBkdXJpbmcgIyR7ZGVidWdpbmZvWydudGgtc3RlcCddfVxuICAgICAgICAgIHN0ZXAgZXhlY3V0ZXM6ICR7ZXJyLm1lc3NhZ2V9YCwgZXJyKTtcbiAgICB9XG4gICAgdGhyb3cgZXJyO1xuICB9O1xufTtcblxuUnVudGltZS5wcm90b3R5cGUuY2hlY2tJbnRlcnJ1cHQgPSBmdW5jdGlvbihzdGVwKSB7XG4gIGlmIChzdGVwLnBoYXNlICE9PSB0aGlzLnN0YXRlcy5waGFzZSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cblJ1bnRpbWUucHJvdG90eXBlLmdlbmVyYXRlRGVidWdnaW5nQ29sb3IgPSBmdW5jdGlvbigpIHtcbiAgY29uc3QgY29sb3JzZXRzID0gW1xuICAgIHsgYmFja2dyb3VuZDogJ3JlZCcsIGZvcmVncm91bmQ6ICd3aGl0ZScgfSxcbiAgICB7IGJhY2tncm91bmQ6ICdncmVlbicsIGZvcmVncm91bmQ6ICd3aGl0ZScgfSxcbiAgICB7IGJhY2tncm91bmQ6ICdibHVlJywgZm9yZWdyb3VuZDogJ3doaXRlJyB9LFxuICAgIHsgYmFja2dyb3VuZDogJ3NhZGRsZUJyb3duJywgZm9yZWdyb3VuZDogJ3doaXRlJyB9LFxuICAgIHsgYmFja2dyb3VuZDogJ2N5YW4nLCBmb3JlZ3JvdW5kOiAnZGFya1NsYXRlR3JheScgfSxcbiAgICB7IGJhY2tncm91bmQ6ICdnb2xkJywgZm9yZWdyb3VuZDogJ2RhcmtTbGF0ZUdyYXknIH0sXG4gICAgeyBiYWNrZ3JvdW5kOiAncGFsZUdyZWVuJywgZm9yZWdyb3VuZDogJ2RhcmtTbGF0ZUdyYXknIH0sXG4gICAgeyBiYWNrZ3JvdW5kOiAncGx1bScsIGZvcmVncm91bmQ6ICdkYXJrU2xhdGVHcmF5JyB9XG4gIF07XG4gIHZhciBjb2xvcnNldCA9IGNvbG9yc2V0c1sgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY29sb3JzZXRzLmxlbmd0aCkgXTtcbiAgcmV0dXJuIGNvbG9yc2V0O1xufTtcblxuUnVudGltZS5wcm90b3R5cGUudHJhY2UgPSBmdW5jdGlvbih0YXNrcykge1xuICBpZiAoZmFsc2UgPT09IHRoaXMuY29uZmlncy5kZWJ1Zykge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgbG9nID0gdGFza3MucmVkdWNlKChtZXJnZWRNZXNzYWdlLCB0YXNrKSA9PiB7XG4gICAgdmFyIHNvdXJjZSA9IFN0cmluZy5zdWJzdHJpbmcodGFzay50b1NvdXJjZSgpLCAwLFxuICAgICAgdGhpcy5kZWJ1Z2dpbmcudHJ1bmNhdGluZ0xpbWl0KTtcbiAgICB2YXIgbWVzc2FnZSA9IGAgJHsgc291cmNlIH0gYDtcbiAgICByZXR1cm4gbWVyZ2VkTWVzc2FnZSArIG1lc3NhZ2U7XG4gIH0sIGAlYyAkeyB0YXNrc1swXS5waGFzZSB9IyR7IHRoaXMuZGVidWdnaW5nLmN1cnJlbnRQaGFzZVN0ZXBzIH0gfCBgKTtcbiAgLy8gRG9uJ3QgcHJpbnQgdGhvc2UgaW5oZXJpdGVkIGZ1bmN0aW9ucy5cbiAgdmFyIHN0YWNrRmlsdGVyID0gbmV3IFJlZ0V4cCgnXihHbGVpcG5pckJhc2ljfFByb2Nlc3N8U3RyZWFtKScpO1xuICB2YXIgc3RhY2sgPSB0YXNrc1swXS50cmFjaW5nLnN0YWNrLnNwbGl0KCdcXG4nKS5maWx0ZXIoKGxpbmUpID0+IHtcbiAgICByZXR1cm4gJycgIT09IGxpbmU7XG4gIH0pLmZpbHRlcigobGluZSkgPT4ge1xuICAgIHJldHVybiAhbGluZS5tYXRjaChzdGFja0ZpbHRlcik7XG4gIH0pLmpvaW4oJ1xcbicpO1xuXG4gIGxvZyA9IGxvZyArICcgfCBcXG5cXHInICsgc3RhY2s7XG4gIGNvbnNvbGUubG9nKGxvZywgJ2JhY2tncm91bmQtY29sb3I6ICcrIHRoaXMuZGVidWdnaW5nLmNvbG9ycy5iYWNrZ3JvdW5kICtcbiAgICAnOycgKyAnY29sb3I6ICcgKyB0aGlzLmRlYnVnZ2luZy5jb2xvcnMuZm9yZWdyb3VuZCk7XG59O1xuXG5SdW50aW1lLkludGVycnVwdEVycm9yID0gZnVuY3Rpb24obWVzc2FnZSkge1xuICB0aGlzLm5hbWUgPSAnSW50ZXJydXB0RXJyb3InO1xuICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlIHx8ICcnO1xufTtcblxuUnVudGltZS5JbnRlcnJ1cHRFcnJvci5wcm90b3R5cGUgPSBuZXcgRXJyb3IoKTtcblxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9idWlsZF9zdGFnZS9zcmMvc3RyZWFtL3Byb2Nlc3MvcnVudGltZS5qc1xuICoqLyIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHsgTG9nZ2VyIGFzIFN0YXRlTG9nZ2VyIH0gZnJvbSAnc3JjL2xvZ2dlci9zdGF0ZS5qcyc7XG5cbi8qKlxuICogQ29tcG9uZW50IHByb3ZpZGVzOlxuICpcbiAqIDEuIFJlc291cmNlIGtlZXBlcjogdG8gbGV0IGFsbCBzdGF0ZXMgc2hhcmUgdGhlIHNhbWUgcmVzb3VyY2VzIChjYWNoZSkuXG4gKiAyLiBSZWZlcmVuY2UgdG8gdGhlIGN1cnJlbnQgYWN0aXZhdGUgc3RhdGU6IHNvIHRoYXQgcGFyZW50IGNvbXBvbmVudCBjYW5cbiAqICAgIGNvbW1hbmQgYW5kIHdhaXQgdGhlIHN1Yi1jb21wb25lbnRzIHRvIGRvIHRoaW5ncyB3aXRob3V0IHRyYWNraW5nIHRoZVxuICogICAgYWN0dWFsIGFjdGl2ZSBzdGF0ZS5cbiAqXG4gKiBFdmVyeSBzdGF0ZXMgb2YgdGhpcyBjb21wb25lbnQgd291bGQgcmVjZWl2ZSB0aGUgQ29tcG9uZW50IGluc3RhbmNlIGFzXG4gKiBhIHdheSB0byBhY2Nlc3MgdGhlc2UgY29tbW9uIHJlc291cmNlcyAmIHByb3BlcnRpZXMuIEFuZCBldmVyeSBzdGF0ZVxuICogdHJhbnNmZXJyaW5nIHdvdWxkIGRvbmUgYnkgdGhlICd0cmFuc2ZlclRvJyBtZXRob2QgaW4gdGhpcyBjb21wb25lbnQsXG4gKiBzbyB0aGF0IHRoZSBjb21wb25lbnQgY2FuIHVwZGF0ZSB0aGUgYWN0aXZlIHN0YXRlIGNvcnJlY3RseS5cbiAqL1xuXG4vKipcbiAqIFRoZSBhcmd1bWVudCAndmlldycgaXMgdGhlIG9ubHkgdGhpbmcgcGFyZW50IGNvbXBvbmVudCBuZWVkcyB0byBtYW5hZ2UuXG4gKiBQbGVhc2Ugbm90ZSB0aGF0IHRoZSAndmlldycgaXNuJ3QgZm9yIFVJIHJlbmRlcmluZywgYWx0aG91Z2ggdGhhdFxuICogVUkgdmlldyBpcyB0aGUgbW9zdCBjb21tb24gb2YgdGhlbS4gVXNlciBjb3VsZCBjaG9zZSBvdGhlciB2aWV3cyBsaWtlXG4gKiBkYXRhLXZpZXcgb3IgZGVidWdnaW5nLXZpZXcgdG8gY29udHJ1Y3QgdGhlIHByb2dyYW0uIEl0IHdvdWxkIHN0aWxsXG4gKiBiZSBcInJlbmRlcmVkXCIgKHBlcmZvcm0gdGhlIGVmZmVjdCksIGJ1dCBob3cgdG8gc3ludGhlc2l6ZSB0aGUgZWZmZWN0c1xuICogb2YgcGFyZW50IGFuZCBjaGlsZHJlbiBub3cgaXMgdGhlIHVzZXIncyBkdXR5LiBGb3IgZXhhbXBsZSwgaWYgd2UgaGF2ZSBhXG4gKiAnY29uc29sZS12aWV3JyB0byBwcmludCBvdXQgdGhpbmdzIGluc3RlYWQgb2YgcmVuZGVyaW5nIFVJLCBzaG91bGQgaXRcbiAqIHByaW50IHRleHQgZnJvbSBjaGlsZHJlbiBmaXJzdD8gT3IgdGhlIHBhcmVudCwgc2luY2UgaXQncyBhIHdyYXBwaW5nXG4gKiBvYmplY3QsIHNob3VsZCBpbmZvIHRoZSB1c2VyIGl0cyBzdGF0dXMgZWFybGllciB0aGFuIGl0cyBjaGlsZHJlbj9cbiAqIFRoZXNlIGJlaGF2aW9ycyBzaG91bGQgYmUgZW5jYXBzdWxhdGVkIGluc2lkZSB0aGUgJ3ZpZXcnLCBhbmQgYmVcbiAqIGhhbmRsZWQgYXQgdGhlIHVuZGVybHlpbmcgbGV2ZWwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBCYXNpY0NvbXBvbmVudCh2aWV3KSB7XG4gIHRoaXMuX3N1YmNvbXBvbmVudHMgPSBudWxsO1xuICB0aGlzLl9hY3RpdmVTdGF0ZSA9IG51bGw7XG4gIC8vIENvbmNyZXRlIGNvbXBvbmVudHMgc2hvdWxkIGV4dGVuZCB0aGVzZSB0byBsZXQgU3RhdGVzIGFjY2VzcyB0aGVtLlxuICAvLyBUaGUgZmlyc3Qgc3RhdGUgY29tcG9uZW50IGtpY2sgb2ZmIHNob3VsZCB0YWtlIHJlc3BvbnNpYmlsaXR5IGZvclxuICAvLyBpbml0aWFsaXppbmcgdGhlc2UgdGhpbmdzLlxuICAvL1xuICAvLyBSZXNvdXJjZXMgaXMgZm9yIGV4dGVybmFsIHJlc291cmNlcyBsaWtlIHNldHRpbmdzIHZhbHVlIG9yIERPTSBlbGVtZW50cy5cbiAgdGhpcy5yZXNvdXJjZXMgPSB7XG4gICAgZWxlbWVudHM6IHt9XG4gIH07XG4gIHRoaXMuY29uZmlncyA9IHtcbiAgICBsb2dnZXI6IHtcbiAgICAgIGRlYnVnOiBmYWxzZSAgICAvLyB0dXJuIG9uIGl0IHdoZW4gd2UncmUgZGVidWdnaW5nIHRoaXMgY29tcG9uZW50XG4gICAgfVxuICB9O1xuXG4gIC8vIFRoZSBkZWZhdWx0IGxvZ2dlci5cbiAgLy8gQSBjdXN0b21pemVkIGxvZ2dlciBpcyBhY2NldGFibGUgaWYgaXQncyB3aXRoIHRoZSAndHJhbnNmZXInIG1ldGhvZFxuICAvLyBmb3IgbG9nZ2luZyB0aGUgc3RhdGUgdHJhbnNmZXJyaW5nLlxuICB0aGlzLmxvZ2dlciA9IG5ldyBTdGF0ZUxvZ2dlcigpO1xuICB0aGlzLnZpZXcgPSB2aWV3O1xuICAvLyBTaG91bGQgYXQgbGVhc3QgYXBwb2ludCB0aGVzZS5cbiAgdGhpcy50eXBlID0gbnVsbDtcbiAgdGhpcy5fc2V0dXBTdGF0ZSA9IG51bGw7XG59XG5cbi8qKlxuICogU3RhdGUnIHBoYXNlIGlzIHRoZSBjb21wb25lbnQncyBwaGFzZS5cbiAqL1xuQmFzaWNDb21wb25lbnQucHJvdG90eXBlLnBoYXNlID1cbmZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5fYWN0aXZlU3RhdGUucGhhc2UoKTtcbn07XG5cbi8qKlxuICogRXZlcnkgc3RhdGUgb2YgdGhpcyBjb21wb25lbnQgc2hvdWxkIGNhbGwgdGhlIG1ldGhvZCB0byBkbyB0cmFuc2ZlcnJpbmcsXG4gKiBzbyB0aGF0IHRoZSBjb21wb25lbnQgY2FuIHVwZGF0ZSB0aGUgJ2FjdGl2ZVN0YXRlJyBjb3JyZWN0bHkuXG4gKlxuICogVGhlIG9yZGVyIG9mIHRyYW5zZmVycmluZyBpczpcbiAqXG4gKiAgW2N1cnJlbnQuc3RvcF0gLT4gW25leHQuc3RhcnRdIC0+IChjYWxsKVtwcmV2aW91cy5kZXN0cm95XVxuICpcbiAqIE5vdGUgdGhpcyBmdW5jdGlvbiBtYXkgcmV0dXJuIGEgbnVsbGl6ZWQgcHJvY2VzcyBpZiBpdCdzIHRyYW5zZmVycmluZyxcbiAqIHNvIHRoZSB1c2VyIG11c3QgZGV0ZWN0IGlmIHRoZSByZXR1cm4gdGhpbmcgaXMgYSB2YWxpZCBwcm9jZXNzXG4gKiBjb3VsZCBiZSBjaGFpbmVkLCBvciBwcmUtY2hlY2sgaXQgd2l0aCB0aGUgcHJvcGVydHkuXG4gKi9cbkJhc2ljQ29tcG9uZW50LnByb3RvdHlwZS50cmFuc2ZlclRvID0gZnVuY3Rpb24oY2xhenosIHJlYXNvbiA9IHt9KSB7XG4gIHZhciBuZXh0U3RhdGUgPSBuZXcgY2xhenoodGhpcyk7XG4gIHZhciBjdXJyZW50U3RhdGUgPSB0aGlzLl9hY3RpdmVTdGF0ZTtcbiAgdGhpcy5fYWN0aXZlU3RhdGUgPSBuZXh0U3RhdGU7XG4gIHRoaXMubG9nZ2VyLnRyYW5zZmVyKGN1cnJlbnRTdGF0ZS5jb25maWdzLnR5cGUsXG4gICAgICBuZXh0U3RhdGUuY29uZmlncy50eXBlLCByZWFzb24pO1xuICByZXR1cm4gY3VycmVudFN0YXRlLnN0b3AoKVxuICAgIC5uZXh0KCgpID0+IG5leHRTdGF0ZS5zdGFydCgpKTtcbn07XG5cbi8qKlxuICogV291bGQgcmVjZWl2ZSByZXNvdXJjZXMgZnJvbSBwYXJlbnQgYW5kICpleHRlbmRzKiB0aGUgZGVmYXVsdCBvbmUuXG4gKiBBZnRlciB0aGF0LCB0cmFuc2ZlciB0byB0aGUgbmV4dCBzdGF0ZSwgd2hpY2ggaXMgdXN1YWxseSBhbiBpbml0aWFsaXphdGlvblxuICogc3RhdGUsIHRoYXQgd291bGQgZG8gbG90cyBvZiBzeW5jL2FzeW5jIHRoaW5ncyB0byB1cGRhdGUgdGhlXG4gKiByZXNvdXJjZXMgJiBwcm9wZXJ0aWVzLlxuICpcbiAqIEhvd2V2ZXIsIHNpbmNlIGJhc2ljIGNvbXBvbmVudCBjb3VsZG4ndCBrbm93IHdoYXQgaXMgdGhlXG4gKiBpbml0aWFsaXphdGlvbiBzdGF0ZSwgc28gdGhhdCB0aGUgY29uY3JldGUgY29tcG9uZW50IHNob3VsZFxuICogaW1wbGVtZW50IHRoZSBzZXR1cCBmdW5jdGlvbiwgd2hpY2ggd291bGQgcmV0dXJuIHRoZSBzdGF0ZSBhZnRlclxuICogcmVjZWl2ZSB0aGUgY29tcG9uZW50IGluc3RhbmNlLlxuICovXG5CYXNpY0NvbXBvbmVudC5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbihyZXNvdXJjZXMpIHtcbiAgdGhpcy5sb2dnZXIuc3RhcnQodGhpcy5jb25maWdzLmxvZ2dlcik7XG4gIGlmIChyZXNvdXJjZXMpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gdGhpcy5yZXNvdXJjZXMpIHtcbiAgICAgIGlmICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mIHJlc291cmNlc1trZXldKSB7XG4gICAgICAgIHRoaXMucmVzb3VyY2VzW2tleV0gPSByZXNvdXJjZXNba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLy8gR2V0IHRoZSBpbml0aWFsaXphdGlvbiBzdGF0ZSBhbmQgbGV0IGl0IGZldGNoICYgc2V0IGFsbC5cbiAgLy8gJ2luaXRpYWxpemVTdGF0ZU1hY2hpbmUnLCBpZiBKYXZhIGRvb21lZCB0aGUgd29ybGQuXG4gIC8vIChhbmQgdGhpcyBpcyBFQ01BU2NyaXB0LCBhIGxhbmd1YWdlIChwYXJ0aWFsbHkpIGluc3BpcmVkIGJ5IFNjaGVtZSEpLlxuICB0aGlzLl9hY3RpdmVTdGF0ZSA9IHRoaXMuX3NldHVwU3RhdGU7XG4gIHJldHVybiB0aGlzLl9hY3RpdmVTdGF0ZS5zdGFydCgpO1xufTtcblxuQmFzaWNDb21wb25lbnQucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuX2FjdGl2ZVN0YXRlLnN0b3AoKVxuICAgIC5uZXh0KHRoaXMud2FpdENvbXBvbmVudHMuYmluZCh0aGlzLCAnc3RvcCcpKTtcbn07XG5cbkJhc2ljQ29tcG9uZW50LnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLl9hY3RpdmVTdGF0ZS5kZXN0cm95KClcbiAgICAubmV4dCh0aGlzLndhaXRDb21wb25lbnRzLmJpbmQodGhpcywgJ2Rlc3Ryb3knKSlcbiAgICAubmV4dCgoKSA9PiB7IHRoaXMubG9nZ2VyLnN0b3AoKTsgfSk7ICAvLyBMb2dnZXIgbmVlZCBhZGQgcGhhc2Ugc3VwcG9ydC5cbn07XG5cbkJhc2ljQ29tcG9uZW50LnByb3RvdHlwZS5saXZlID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLl9hY3RpdmVTdGF0ZS51bnRpbCgnc3RvcCcpO1xufTtcblxuQmFzaWNDb21wb25lbnQucHJvdG90eXBlLmV4aXN0ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLl9hY3RpdmVTdGF0ZS51bnRpbCgnZGVzdHJveScpO1xufTtcblxuLyoqXG4gKiBDYW4gY29tbWFuZCBhbGwgc3ViLWNvbXBvbmVudHMgd2l0aCBvbmUgbWV0aG9kIGFuZCBpdHMgYXJndW1lbnRzLlxuICogRm9yIGV4YW1wbGUsIHRvICdzdGFydCcsIG9yICdzdG9wJyB0aGVtLlxuICogV2lsbCByZXR1cm4gYSBQcm9taXNlIG9ubHkgYmUgcmVzb2x2ZWQgYWZ0ZXIgYWxsIHN1Yi1jb21wb25lbnRzXG4gKiBleGVjdXRlZCB0aGUgY29tbWFuZC4gRm9yIGV4YW1wbGU6XG4gKlxuICogc3ViY29tcG9uZW50czoge1xuICogICAgYnV0dG9uczogW0J1dHRvbkZvbywgQnV0dG9uQmFyXVxuICogICAgc3VibWl0OiBTdWJtaXRcbiAqIH1cbiAqIHZhciBwcm9taXNlZCA9IHBhcmVudC53YWl0Q29tcG9uZW50cyhwYXJlbnQuc3RvcC5iaW5kKHBhcmVudCkpO1xuICpcbiAqIFRoZSBwcm9taXNlZCB3b3VsZCBiZSByZXNvbHZlZCBvbmx5IGFmdGVyIEJ1dHRvbkZvbywgQnV0dG9uQmFyIGFuZCBTdWJtaXRcbiAqIGFyZSBhbGwgc3RvcHBlZC5cbiAqXG4gKiBBbmQgc2luY2UgZm9yIHN0YXRlcyB0aGUgc3ViLWNvbXBvbmVudHMgaXMgZGVsZWdhdGVkIHRvIENvbXBvbmVudCxcbiAqIHN0YXRlIHNob3VsZCBvbmx5IGNvbW1hbmQgdGhlc2Ugc3ViLWNvbXBvbmVudHMgdmlhIHRoaXMgbWV0aG9kLFxuICogb3IgYWNjZXNzIHRoZW0gaW5kaXZpZHVhbGx5IHZpYSB0aGUgY29tcG9uZW50IGluc3RhbmNlIHNldCBhdCB0aGVcbiAqIHNldHVwIHN0YWdlLlxuICovXG5CYXNpY0NvbXBvbmVudC5wcm90b3R5cGUud2FpdENvbXBvbmVudHMgPSBmdW5jdGlvbihtZXRob2QsIGFyZ3MpIHtcbiAgaWYgKCF0aGlzLl9zdWJjb21wb25lbnRzKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9XG4gIHZhciB3YWl0UHJvbWlzZXMgPVxuICBPYmplY3Qua2V5cyh0aGlzLl9zdWJjb21wb25lbnRzKS5yZWR1Y2UoKHN0ZXBzLCBuYW1lKSA9PiB7XG4gICAgdmFyIGluc3RhbmNlID0gdGhpcy5fc3ViY29tcG9uZW50c1tuYW1lXTtcbiAgICAvLyBJZiB0aGUgZW50cnkgb2YgdGhlIGNvbXBvbmVudCBhY3R1YWxseSBjb250YWlucyBtdWx0aXBsZSBzdWJjb21wb25lbnRzLlxuICAgIC8vIFdlIG5lZWQgdG8gYXBwbHkgdGhlIG1ldGhvZCB0byBlYWNoIG9uZSBhbmQgY29uY2F0IGFsbCB0aGUgcmVzdWx0XG4gICAgLy8gcHJvbWlzZXMgd2l0aCBvdXIgbWFpbiBhcnJheSBvZiBhcHBsaWVzLlxuICAgIGlmIChBcnJheS5pc0FycmF5KGluc3RhbmNlKSkge1xuICAgICAgdmFyIGFwcGxpZXMgPSBpbnN0YW5jZS5tYXAoKHN1YmNvbXBvbmVudCkgPT4ge1xuICAgICAgICByZXR1cm4gc3ViY29tcG9uZW50W21ldGhvZF0uYXBwbHkoc3ViY29tcG9uZW50LCBhcmdzKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHN0ZXBzLmNvbmNhdChhcHBsaWVzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHN0ZXBzLmNvbmNhdChbaW5zdGFuY2VbbWV0aG9kXS5hcHBseShpbnN0YW5jZSwgYXJncyldKTtcbiAgICB9XG4gIH0sIFtdKTtcbiAgcmV0dXJuIFByb21pc2UuYWxsKHdhaXRQcm9taXNlcyk7XG59O1xuXG4vKipcbiAqIEZvcndhcmQgdGhlIGRhdGEgdG8gcmVuZGVyIHRoZSB2aWV3LlxuICogSWYgaXQncyBhIHJlYWwgVUkgdmlldyBhbmQgd2l0aCB0ZWNoIGxpa2UgdmlydHVhbCBET00gaW4gUmVhY3QuanMsXG4gKiB3ZSBjb3VsZCBwZXJmb3JtIGEgaGlnaC1lZmZpY2llbmN5IHJlbmRlcmluZyB3aGlsZSBrZWVwIHRoZSBjbGllbnQgY29kZVxuICogYXMgc2ltcGxlIGFzIHBvc3NpYmxlLlxuICpcbiAqIFRoZSB0YXJnZXQgaXMgYW4gb3B0aW9uYWwgJ2NhbnZhcycgb2YgdGhlIHJlbmRlcmluZyB0YXJnZXQuIEl0IHdvdWxkLFxuICogaWYgdGhlIHZpZXcgaXMgYW4gVUkgdmlldyBmb3IgZXhhbXBsZSwgJ2VyYXNlJyBpdCBhbmQgcmVuZGVyIG5ldyBjb250ZW50XG4gKiBlYWNoIHRpbWUgdGhpcyBmdW5jdGlvbiBnZXQgaW52b2tlZC4gSG93ZXZlciwgc2luY2Ugd2UgaGF2ZSBub3Qgb25seVxuICogVUkgdmlldywgc29tZSB0YXJnZXRpbmcgJ2NhbnZhcycgY291bGQgYmUgbW9yZSB0cmlja3ksIGxpa2UgRmlsZU9iamVjdCxcbiAqIEJsb2IsIHNvdW5kIHN5c3RlbSwgZXRjLlxuICovXG5CYXNpY0NvbXBvbmVudC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24ocHJvcHMsIHRhcmdldCkge1xuICByZXR1cm4gdGhpcy52aWV3LnJlbmRlcihwcm9wcywgdGFyZ2V0KTtcbn07XG5cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vYnVpbGRfc3RhZ2Uvc3JjL2NvbXBvbmVudC9iYXNpY19jb21wb25lbnQuanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVG8gbG9nIHN0YXRlIHRyYW5zZmVycmluZyBpbiBhIHByb3BlciB3YXksIHJhdGhlciBkdW1wIHJhdyBjb25zb2xlXG4gKiBtZXNzYWdlcyBhbmQgdGhlbiBvdmVyd2hlbG0gaXQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBMb2dnZXIoKSB7fVxuXG5Mb2dnZXIucHJvdG90eXBlLnN0YXJ0ID1cbmZ1bmN0aW9uIGxzc19zdGFydChjb25maWdzKSB7XG4gIHRoaXMuc3RhdGVTdGFjayA9IFtdO1xuICB0aGlzLmNvbmZpZ3MgPSB7XG4gICAgdmVyYm9zZTogZmFsc2UgfHwgY29uZmlncy52ZXJib3NlLFxuICAgIHdhcm5pbmc6IGZhbHNlIHx8IGNvbmZpZ3Mud2FybmluZyxcbiAgICBlcnJvcjogdHJ1ZSAmJiBjb25maWdzLmVycm9yLFxuICAgIGdyYXBoOiBmYWxzZSB8fCBjb25maWdzLmdyYXBoLFxuICAgIGRlYnVnOiB0cnVlICYmIGNvbmZpZ3MuZGVidWcsXG4gICAgcmVwb3J0ZXI6IGNvbmZpZ3MucmVwb3J0ZXIgfHwgdGhpcy5jb25zb2xlUmVwb3J0ZXIuYmluZCh0aGlzKVxuICB9O1xuICByZXR1cm4gdGhpcztcbn07XG5cbkxvZ2dlci5wcm90b3R5cGUuZGVidWcgPVxuZnVuY3Rpb24gbHNzX2RlYnVnKCkge1xuICBpZiAodGhpcy5jb25maWdzLmRlYnVnKSB7XG4gICAgdGhpcy5sb2cuYXBwbHkodGhpcywgWydbSV0gJ10uY29uY2F0KEFycmF5LmZyb20oYXJndW1lbnRzKSkpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuTG9nZ2VyLnByb3RvdHlwZS52ZXJib3NlID1cbmZ1bmN0aW9uIGxzc192ZXJib3NlKCkge1xuICBpZiAodGhpcy5jb25maWdzLnZlcmJvc2UpIHtcbiAgICB0aGlzLmxvZy5hcHBseSh0aGlzLCBbJ1tWXSAnXS5jb25jYXQoQXJyYXkuZnJvbShhcmd1bWVudHMpKSk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5Mb2dnZXIucHJvdG90eXBlLndhcm5pbmcgPSBmdW5jdGlvbiBsc3Nfd2FybmluZygpIHtcbiAgaWYgKHRoaXMuY29uZmlncy53YXJuaW5nIHx8IHRoaXMuY29uZmlncy52ZXJib3NlKSB7XG4gICAgdGhpcy5sb2cuYXBwbHkodGhpcywgWydbIV0gJ10uY29uY2F0KEFycmF5LmZyb20oYXJndW1lbnRzKSkpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuTG9nZ2VyLnByb3RvdHlwZS5lcnJvciA9XG5mdW5jdGlvbiBsc3NfZXJyb3IoKSB7XG4gIGlmICh0aGlzLmNvbmZpZ3MuZXJyb3IgfHwgdGhpcy5jb25maWdzLndhcm5pbmcgfHxcbiAgICAgIHRoaXMuY29uZmlncy52ZXJib3NlKSB7XG4gICAgdGhpcy5sb2cuYXBwbHkodGhpcywgWydbRV0gJ10uY29uY2F0KEFycmF5LmZyb20oYXJndW1lbnRzKSkpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBQcmludCB0aGUgc3RhY2suIEZvciBleGFtcGxlOlxuICpcbiAqICBsb2dnZXIuZGVidWcoJ3RoZSB0aGluZyBhdCBzdGFjazogJykuc3RhY2soKVxuICpcbiAqIHdvdWxkIHByaW50IG91dCB0aGUgbWVzc2FnZSBhbmQgdGhlIHN0YWNrLlxuICovXG5Mb2dnZXIucHJvdG90eXBlLnN0YWNrID0gZnVuY3Rpb24gbHNzX3N0YWNrKCkge1xuICB0aGlzLmxvZygobmV3IEVycm9yKCkpLnN0YWNrKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIExvZyB0aGUgdHJhbnNmZXJyaW5nIG1hbmlwdWxhdGlvbi5cbiAqXG4gKiBUbyBsb2cgdGhlIGNvbmRpdGlvbnMsIHRoaXMgZnVuY3Rpb24gd291bGQgc3RyaW5naWZ5IHRoZSBjb25kaXRpb25zXG4gKiBhbmQgdGhlbiBwYXJzZSBpdCB0byBkbyB0aGUgZGVlcCBjb3B5LiBTbyBwbGVhc2UgdHVybiBvZmYgdGhlXG4gKiBgY29uZmlnLmRlYnVnYCBpbiBwcm9kdWN0aW9uIG1vZGUuXG4gKlxuICogQHBhcmFtIGZyb20ge3N0cmluZ30gLSBmcm9tIHN0YXRlIHR5cGVcbiAqIEBwYXJhbSB0byB7c3RyaW5nfSAtIHRvIHN0YXRlIHR5cGVcbiAqIEBwYXJhbSBjb25kaXRpb25zIHtvYmplY3R9IC0gdW5kZXIgd2hhdCBjb25kaXRpb25zIHdlIGRvIHRoZSB0cmFuc2ZlcnJpbmdcbiAqL1xuTG9nZ2VyLnByb3RvdHlwZS50cmFuc2ZlciA9XG5mdW5jdGlvbiBsc3NfdHJhbnNmZXIoZnJvbSwgdG8sIGNvbmRpdGlvbnMgPSB7fSkge1xuICBpZiAoIXRoaXMuY29uZmlncy5kZWJ1Zykge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgdHJhbnNmZXJEZXRhaWxzID0ge1xuICAgIGZyb206IGZyb20sXG4gICAgdG86IHRvLFxuICAgIGNvbmRpdGlvbnM6IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoY29uZGl0aW9ucykpXG4gIH07XG4gIGlmICh0aGlzLmNvbmZpZ3MuZ3JhcGgpIHtcbiAgICB0aGlzLnN0YXRlU3RhY2sucHVzaCh0cmFuc2ZlckRldGFpbHMpO1xuICB9XG4gIHRoaXMuZGVidWcoYFN0YXRlIHRyYW5zZmVyOiBmcm9tICR7ZnJvbX0gdG8gJHt0b30gYmVjYXVzZSBvZjpgLFxuICAgIHRyYW5zZmVyRGV0YWlscy5jb25kaXRpb25zKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFRvIGdldCB0aGUgZ3JhcGguIFRoZSBhcnJheSBpdCByZXR1cm4gd291bGQgYmU6XG4gKlxuICogICAgIFsgJ2ZvbycsIHtjb25kaXRpb25zfSwgJ2JhcicsIHtjb25kaXRpb25zfSwgJ2dhbW1hJy4uLl1cbiAqXG4gKiB3aGljaCBjYW4gYmUgcmVuZGVyZWQgYXMgYSByZWFsIGdyYXBoLlxuICovXG5Mb2dnZXIucHJvdG90eXBlLmdyYXBoID1cbmZ1bmN0aW9uIGxzc19ncmFwaCgpIHtcbiAgcmV0dXJuIHRoaXMuc3RhdGVTdGFjay5yZWR1Y2UoKHByZXYsIGluZm8pID0+IHtcbiAgICByZXR1cm4gcHJldi5jb25jYXQoW2luZm8uZnJvbSwgaW5mby5jb25kaXRpb25zLCBpbmZvLnRvXSk7XG4gIH0sIFtdKTtcbn07XG5cbkxvZ2dlci5wcm90b3R5cGUubG9nID1cbmZ1bmN0aW9uIGxzc19sb2coKSB7XG4gIHZhciByZXBvcnRlciA9IHRoaXMuY29uZmlncy5yZXBvcnRlcjtcbiAgcmVwb3J0ZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5Mb2dnZXIucHJvdG90eXBlLnN0b3AgPVxuZnVuY3Rpb24gbHNzX3N0b3AoKSB7XG4gIHRoaXMuc3RhdGVTdGFjay5sZW5ndGggPSAwO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkxvZ2dlci5wcm90b3R5cGUuY29uc29sZVJlcG9ydGVyID1cbmZ1bmN0aW9uIGxzc19jb25zb2xlUmVwb3J0ZXIoKSB7XG4gIGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIGFyZ3VtZW50cyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vYnVpbGRfc3RhZ2Uvc3JjL2xvZ2dlci9zdGF0ZS5qc1xuICoqLyIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHsgTGFuZ3VhZ2UgfSBmcm9tICdzcmMvcnVuZS9sYW5ndWFnZS5qcyc7XG5pbXBvcnQgeyBCYXNpY1N0YXRlIH0gZnJvbSAnc3JjL3N0YXRlL2Jhc2ljX3N0YXRlLmpzJztcblxuLyoqXG4gKiBVc2UgdGhpcyBidWlsZGVyIHRvIGJ1aWxkIHN0YXRlcyBpbiBhIGNvbXBvbmVudC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEJ1aWxkZXIoKSB7XG4gIHRoaXMuY29udGV4dCA9IHtcbiAgICBfaW5mbzoge31cbiAgfTtcbiAgdGhpcy5zdGFjayA9IFtdO1xuICAvLyBXaXRoIHRoaXMgaGVscGVyIHdlIGdldCB0aGUgZXZhbHVhdG9yLlxuICB0aGlzLl9ldmFsdWF0b3IgPSAobmV3IExhbmd1YWdlLkV2YWx1YXRlKCkpXG4gICAgLmFuYWx5emVyKHRoaXMuX2FuYWx5emVyLmJpbmQodGhpcykpXG4gICAgLmludGVycHJldGVyKHRoaXMuX2ludGVycHJldC5iaW5kKHRoaXMpKTtcbiAgdGhpcy5fc3RhdGUgPSBudWxsO1xufVxuXG4vLyBUaGUgbGFuZ3VhZ2UgaW50ZXJmYWNlLlxuQnVpbGRlci5wcm90b3R5cGUuc3RhcnQgPSBMYW5ndWFnZS5kZWZpbmUoJ3N0YXJ0JyAsJ2JlZ2luJyk7XG5CdWlsZGVyLnByb3RvdHlwZS5jb21wb25lbnQgPSBMYW5ndWFnZS5kZWZpbmUoJ2NvbXBvbmVudCcgLCdwdXNoJyk7XG5CdWlsZGVyLnByb3RvdHlwZS5ldmVudHMgPSBMYW5ndWFnZS5kZWZpbmUoJ2V2ZW50cycsICdwdXNoJyk7XG5CdWlsZGVyLnByb3RvdHlwZS5pbnRlcnJ1cHRzID0gTGFuZ3VhZ2UuZGVmaW5lKCdpbnRlcnJ1cHRzJywgJ3B1c2gnKTtcbkJ1aWxkZXIucHJvdG90eXBlLnNvdXJjZXMgPSBMYW5ndWFnZS5kZWZpbmUoJ3NvdXJjZXMnLCAncHVzaCcpO1xuQnVpbGRlci5wcm90b3R5cGUudHlwZSA9IExhbmd1YWdlLmRlZmluZSgndHlwZScsICdwdXNoJyk7XG5CdWlsZGVyLnByb3RvdHlwZS5oYW5kbGVyID0gTGFuZ3VhZ2UuZGVmaW5lKCdoYW5kbGVyJywgJ3B1c2gnKTtcbkJ1aWxkZXIucHJvdG90eXBlLm1ldGhvZHMgPSBMYW5ndWFnZS5kZWZpbmUoJ21ldGhvZHMnLCAncHVzaCcpO1xuLy8gVG8gYnVpbGQgYSBjb25zdHJ1Y3RvciArIHByb3RvdHlwZVxuQnVpbGRlci5wcm90b3R5cGUuYnVpbGQgPSBMYW5ndWFnZS5kZWZpbmUoJ2J1aWxkJywgJ2V4aXQnKTtcbi8vIEJlc2lkZXMgdGhlIGNvbnN0cnVjdG9yIGFuZCBwcm90b3R5cGUsIGNyZWF0ZSBhbiBpbnN0YW5jZSBhbmQgcmV0dXJuIGl0LlxuQnVpbGRlci5wcm90b3R5cGUuaW5zdGFuY2UgPSBMYW5ndWFnZS5kZWZpbmUoJ2luc3RhbmNlJywgJ2V4aXQnKTtcblxuLy8gVGhlIHByaXZhdGUgbWV0aG9kcy5cbkJ1aWxkZXIucHJvdG90eXBlLm9uY2hhbmdlID0gZnVuY3Rpb24oY29udGV4dCwgbm9kZSwgc3RhY2spIHtcbiAgLy8gV2hlbiBpdCdzIGNoYW5nZWQsIGV2YWx1YXRlIGl0IHdpdGggYW5hbHl6ZXJzICYgaW50ZXJwcmV0ZXIuXG4gIHJldHVybiB0aGlzLl9ldmFsdWF0b3IoY29udGV4dCwgbm9kZSwgc3RhY2spO1xufTtcblxuQnVpbGRlci5wcm90b3R5cGUuX2FuYWx5emVyID0gZnVuY3Rpb24oY29udGV4dCwgbm9kZSwgc3RhY2spIHtcbiAgaWYgKCdzdGFydCcgIT09IG5vZGUudHlwZSAmJiAhY29udGV4dC5zdGFydGVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBCZWZvcmUgJyR7bm9kZS50eXBlfScsIHNob3VsZCBzdGFydCB0aGUgYnVpbGRlciBmaXJzdGApO1xuICB9XG4gIHN3aXRjaChub2RlLnR5cGUpIHtcbiAgICBjYXNlICdzdGFydCc6XG4gICAgICBjb250ZXh0LnN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY29tcG9uZW50JzpcbiAgICAgIGlmICgxICE9PSBub2RlLmFyZ3MubGVuZ3RoIHx8ICdvYmplY3QnICE9PSB0eXBlb2Ygbm9kZS5hcmdzWzBdIHx8XG4gICAgICAgICAgJ2Z1bmN0aW9uJyAhPT0gdHlwZW9mIG5vZGUuYXJnc1swXS50cmFuc2ZlclRvKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgICcke25vZGUudHlwZX0nXG4gICAgICAgICAgZXhwZWN0IHRvIGJlIGEgY29tcG9uZW50IHdpdGggbWV0aG9kICd0cmFuc2ZlclRvJ2ApO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAndHlwZSc6XG4gICAgICBpZiAoMSAhPT0gbm9kZS5hcmdzLmxlbmd0aCB8fCAnc3RyaW5nJyAhPT0gdHlwZW9mIG5vZGUuYXJnc1swXSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCAnJHtub2RlLnR5cGV9J1xuICAgICAgICAgIGV4cGVjdCB0byBoYXZlIGEgc3RyaW5nIGFzIHRoZSBzdGF0ZSB0eXBlYCk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdldmVudHMnOlxuICAgIGNhc2UgJ2ludGVycnVwdHMnOlxuICAgIGNhc2UgJ3NvdXJjZXMnOlxuICAgICAgaWYgKCFub2RlLmFyZ3NbMF0gfHwgIUFycmF5LmlzQXJyYXkobm9kZS5hcmdzWzBdKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCAnJHtub2RlLnR5cGV9J1xuICAgICAgICAgIGV4cGVjdHMgdG8gaGF2ZSBhbiBhcnJheSBhcmd1bWVudGApO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnaGFuZGxlcic6XG4gICAgICBpZiAoIW5vZGUuYXJnc1swXSB8fCAnZnVuY3Rpb24nICE9PSB0eXBlb2Ygbm9kZS5hcmdzWzBdKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgICcke25vZGUudHlwZX0nXG4gICAgICAgICAgZXhwZWN0IHRvIGhhdmUgYW4gZnVuY3Rpb24gYXJndW1lbnRgKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ21ldGhvZHMnOlxuICAgICAgaWYgKCFub2RlLmFyZ3NbMF0gfHwgJ29iamVjdCcgIT09IHR5cGVvZiBub2RlLmFyZ3NbMF0pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAgJyR7bm9kZS50eXBlfSdcbiAgICAgICAgICBleHBlY3QgdG8gaGF2ZSBhbiBtYXAgb2YgZnVuY3Rpb25zYCk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdidWlsZCc6XG4gICAgY2FzZSAnaW5zdGFuY2UnOlxuICAgICAgLy8gQ2hlY2sgaWYgbmVjZXNzYXJ5IHByb3BlcnRpZXMgYXJlIG1pc3NpbmcuXG4gICAgICAvLyBDdXJyZW50bHkgb25seSAndHlwZScgaXMgbmVjZXNzYXJ5LlxuICAgICAgaWYgKCFjb250ZXh0Ll9pbmZvLnR5cGUgfHwgJ3N0cmluZycgIT09IHR5cGVvZiBjb250ZXh0Ll9pbmZvLnR5cGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBBIHN0YXRlIHNob3VsZCBhdCBsZWFzdCB3aXRoIHR5cGVgKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICB9XG59O1xuXG4vKipcbiAqIEFzIGFuIG9yZGluYXJ5IGludGVycHJldGluZyBmdW5jdGlvbjogZG8gc29tZSBlZmZlY3RzIGFjY29yZGluZyB0byB0aGUgbm9kZSxcbiAqIGFuZCByZXR1cm4gdGhlIGZpbmFsIHN0YWNrIGFmdGVyIGVuZGluZy5cbiAqL1xuQnVpbGRlci5wcm90b3R5cGUuX2ludGVycHJldCA9IGZ1bmN0aW9uKGNvbnRleHQsIG5vZGUsIHN0YWNrKSB7XG4gIGlmICgnc3RhcnQnID09PSBub2RlLnR5cGUpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gSWYgdGhlIGluZm9ybWF0aW9uIGFyZSBnYXRoZXJlZCwgYWNjb3JkaW5nIHRvIHRoZSBpbmZvcm1hdGlvblxuICAvLyB1c2VyIGdhdmUgdG8gYnVpbGQgYSBzdGF0ZS5cbiAgaWYgKCdidWlsZCcgIT09IG5vZGUudHlwZSAmJiAnaW5zdGFuY2UnICE9PSBub2RlLnR5cGUpIHtcbiAgICAvLyBTaW5jZSBhbGwgdGhlc2UgbWV0aG9kcyBhcmUgb25seSBuZWVkIG9uZSBhcmd1bWVudC5cbiAgICBjb250ZXh0Ll9pbmZvW25vZGUudHlwZV0gPSBub2RlLmFyZ3NbMF07XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBfaW5mbyA9IGNvbnRleHQuX2luZm87XG4gIGNvbnRleHQuX3N0YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgQmFzaWNTdGF0ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMuY29uZmlncy50eXBlID0gX2luZm8udHlwZTtcbiAgICB0aGlzLmNvbmZpZ3Muc3RyZWFtLmV2ZW50cyA9IF9pbmZvLmV2ZW50cyB8fCBbXTtcbiAgICB0aGlzLmNvbmZpZ3Muc3RyZWFtLmludGVycnVwdHMgPSBfaW5mby5pbnRlcnJ1cHRzIHx8IFtdO1xuICAgIHRoaXMuY29uZmlncy5zdHJlYW0uc291cmNlcyA9IF9pbmZvLnNvdXJjZXMgfHwgW107XG4gICAgdGhpcy5oYW5kbGVTb3VyY2VFdmVudCA9IF9pbmZvLmhhbmRsZXIuYmluZCh0aGlzKTtcbiAgfTtcbiAgY29udGV4dC5fc3RhdGUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNpY1N0YXRlLnByb3RvdHlwZSk7XG4gIGlmIChfaW5mby5tZXRob2RzKSB7XG4gICAgT2JqZWN0LmtleXMoX2luZm8ubWV0aG9kcykuZm9yRWFjaChmdW5jdGlvbihtZXRob2ROYW1lKSB7XG4gICAgICBjb250ZXh0Ll9zdGF0ZS5wcm90b3R5cGVbbWV0aG9kTmFtZV0gPSBfaW5mby5tZXRob2RzW21ldGhvZE5hbWVdO1xuICAgIH0pO1xuICB9XG4gIGlmICgnYnVpbGQnID09PSBub2RlLnR5cGUpIHtcbiAgICAvLyBUaGUgb25seSBvbmUgbm9kZSBvbiB0aGUgc3RhY2sgd291bGQgYmUgcmV0dXJuZWQuXG4gICAgc3RhY2sgPSBbIGNvbnRleHQuX3N0YXRlIF07XG4gICAgcmV0dXJuIHN0YWNrO1xuICB9XG4gIGlmICgnaW5zdGFuY2UnID09PSBub2RlLnR5cGUpIHtcbiAgICBpZiAoJ29iamVjdCcgIT09IHR5cGVvZiBfaW5mby5jb21wb25lbnQgfHxcbiAgICAgICAgJ2Z1bmN0aW9uJyAhPT0gdHlwZW9mIF9pbmZvLmNvbXBvbmVudC50cmFuc2ZlclRvKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEEgc3RhdGUgaW5zdGFuY2Ugc2hvdWxkIGhhdmUgYSBjb21wb25lbnRgKTtcbiAgICB9XG4gICAgc3RhY2sgPSBbIG5ldyBjb250ZXh0Ll9zdGF0ZShfaW5mby5jb21wb25lbnQpIF07XG4gICAgcmV0dXJuIHN0YWNrO1xuICB9XG59O1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9idWlsZF9zdGFnZS9zcmMvYnVpbGRlci9zdGF0ZS5qc1xuICoqLyIsIiAndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQ29tcG9uZW50IHNob3VsZCBjb250cm9sIGl0cyByZXNvdXJjZXMgb25seSB2aWEgbWV0aG9kc1xuICogZGVmaW5lZCBoZXJlLiBUaGlzIGlzIGp1c3QgYSBlbXB0eSBpbnRlcmZhY2UgdGhhdCByZXF1aXJlZFxuICogYnkgQmFzaWNDb21wb25lbnQuIEluIHRoaXMgd2F5LCB3ZSBjb3VsZCBzZWUgaG93IHRvIGltcGxlbWVudFxuICogdGhlIHNhbWUgYXJjaGl0ZWN0dXJlIGZvciByZWFsIGNvbXBvbmVudHMuXG4gKiovXG5cbmV4cG9ydCBmdW5jdGlvbiBCYXNpY1N0b3JlKCkge1xuICAvLyBSZXNvdXJjZXMgaW5jbHVkZSBET00gZWxlbWVudHMgYW5kIG90aGVyIHN0dWZmIHRoYXQgY29tcG9uZW50XG4gIC8vIG5lZWQgdG8gcmVxdWlyZSB0aGVtIGZyb20gdGhlICdvdXRzaWRlJy4gU28gZXZlbiBpdCdzIG9ubHkgYSBzdHJpbmcsXG4gIC8vIGlmIHRoZSBvbmUgY29tZXMgZnJvbSBTeXN0ZW0gc2V0dGluZ3Mgb3IgWEhSLCBpdCBzaG91bGQgYmUgYSByZXNvdXJjZVxuICAvLyBpdGVtIGFuZCB0byBiZSBtYW5hZ2VkIGhlcmUuXG4gIHRoaXMucmVzb3VyY2VzID0ge307XG59XG5cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vYnVpbGRfc3RhZ2Uvc3JjL2NvbXBvbmVudC9iYXNpY19zdG9yZS5qc1xuICoqLyIsIiAndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQSBzZXR0aW5ncyBnZXR0ZXIvc2V0dGVyIGNhY2hlLlxuICogUHJvdmlkZSBhcyBmZXcgYXMgcG9zc2libGUgQVBJcyBsaWtlIHRoZSBuYXRpdmUgQVBJcyBkby5cbiAqKi9cbmV4cG9ydCBmdW5jdGlvbiBTZXR0aW5nc0NhY2hlKCkge1xuICB0aGlzLmNhY2hlID0ge307XG4gIHRoaXMuaGFuZGxlU2V0dGluZ3MgPSB0aGlzLmhhbmRsZVNldHRpbmdzLmJpbmQodGhpcyk7XG59XG5cblNldHRpbmdzQ2FjaGUucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKGVudHJ5KSB7XG4gIGlmICh0aGlzLmNhY2hlW2VudHJ5XSkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5jYWNoZVtlbnRyeV0pO1xuICB9XG5cbiAgdmFyIHJlc29sdmUsIHJlamVjdDtcbiAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmV2LCByZWopID0+IHtcbiAgICByZXNvbHZlID0gcmV2O1xuICAgIHJlamVjdCA9IHJlajtcbiAgfSk7XG4gIHZhciBsb2NrID0gbmF2aWdhdG9yLm1velNldHRpbmdzLmNyZWF0ZUxvY2soKTtcbiAgdmFyIHJlcSA9IGxvY2suZ2V0KGVudHJ5KTtcbiAgcmVxLnRoZW4oKCkgPT4ge1xuICAgIHRoaXMuY2FjaGVbZW50cnldID0gcmVxLnJlc3VsdFtlbnRyeV07XG4gICAgLy8gT25jZSBpdCBnZXR0ZWQsIG1vbml0b3IgaXQgdG8gdXBkYXRlIGNhY2hlLlxuICAgIG5hdmlnYXRvci5tb3pTZXR0aW5nc1xuICAgICAgLmFkZE9ic2VydmVyKGVudHJ5LCB0aGlzLmhhbmRsZVNldHRpbmdzKTtcbiAgICByZXNvbHZlKHJlcS5yZXN1bHRbZW50cnldKTtcbiAgfSkuY2F0Y2goKCkgPT4ge1xuICAgIHJlamVjdChyZXEuZXJyb3IpO1xuICB9KTtcbiAgcmV0dXJuIHByb21pc2U7XG59O1xuU2V0dGluZ3NDYWNoZS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24oZW50cnksIHZhbHVlKSB7XG4gIHZhciByZXNvbHZlLCByZWplY3Q7XG4gIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoKHJldiwgcmVqKSA9PiB7XG4gICAgcmVzb2x2ZSA9IHJldjtcbiAgICByZWplY3QgPSByZWo7XG4gIH0pO1xuICB2YXIgbG9jayA9IG5hdmlnYXRvci5tb3pTZXR0aW5ncy5jcmVhdGVMb2NrKCk7XG4gIHZhciByZXFjb250ZW50ID0ge307XG4gIHJlcWNvbnRlbnRbZW50cnldID0gdmFsdWU7XG4gIHZhciByZXEgPSBsb2NrLnNldChyZXFjb250ZW50KTtcbiAgcmVxLnRoZW4oKCkgPT4ge1xuICAgIHRoaXMuY2FjaGVbZW50cnldID0gdmFsdWU7XG4gICAgcmVzb2x2ZSgpO1xuICB9KS5jYXRjaCgoKSA9PiB7XG4gICAgcmVqZWN0KCk7XG4gIH0pO1xuICByZXR1cm4gcHJvbWlzZTtcbn07XG5TZXR0aW5nc0NhY2hlLnByb3RvdHlwZS5oYW5kbGVTZXR0aW5ncyA9IGZ1bmN0aW9uKGV2dCkge1xuICB2YXIgeyBzZXR0aW5nc05hbWUsIHNldHRpbmdzVmFsdWUgfSA9IGV2dDtcbiAgdGhpcy5jYWNoZVtzZXR0aW5nc05hbWVdID0gc2V0dGluZ3NWYWx1ZTtcbn07XG5TZXR0aW5nc0NhY2hlLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XG4gIE9iamVjdC5rZXlzKHRoaXMuY2FjaGUpLmZvckVhY2goKGVudHJ5KSA9PiB7XG4gICAgbmF2aWdhdG9yLm1velNldHRpbmdzLnJlbW92ZU9ic2VydmVyKGVudHJ5LCB0aGlzLmhhbmRsZVNldHRpbmdzKTtcbiAgfSk7XG59O1xuXG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL2J1aWxkX3N0YWdlL3NyYy9zZXR0aW5ncy9zZXR0aW5nc19jYWNoZS5qc1xuICoqLyIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHsgU291cmNlRXZlbnQgfSBmcm9tICdzcmMvc291cmNlL3NvdXJjZV9ldmVudC5qcyc7XG5cbi8qKlxuICogRE9NIGV2ZW50IHNvdXJjZSBmb3IgU3RyZWFtLiBPbmUgU3RyZWFtIGNhbiBjb2xsZWN0IGV2ZW50cyBmcm9tIG11bHRpcGxlXG4gKiBzb3VyY2VzLCB3aGljaCBwYXNzIGRpZmZlcmVudCBuYXRpdmUgZXZlbnRzIChub3Qgb25seSBET00gZXZlbnRzKVxuICogdG8gU3RyZWFtLlxuICoqL1xuZXhwb3J0IGZ1bmN0aW9uIERPTUV2ZW50U291cmNlKGNvbmZpZ3MpIHtcbiAgdGhpcy5jb25maWdzID0ge1xuICAgIGV2ZW50czogY29uZmlncy5ldmVudHMgfHwgW10sXG4gIH07XG4gIHRoaXMuX2NvbGxlY3RvciA9IHdpbmRvdy5hZGRFdmVudExpc3RlbmVyLmJpbmQod2luZG93KTtcbiAgdGhpcy5fZGVjb2xsZWN0b3IgPSB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lci5iaW5kKHdpbmRvdyk7XG4gIHRoaXMuX2ZvcndhcmRUbzsgLy8gVGhlIGZvcndhcmRpbmcgdGFyZ2V0LlxuXG4gIC8vIFNvbWUgQVBJIHlvdSBqdXN0IGNhbid0IGJpbmQgaXQgd2l0aCB0aGUgb2JqZWN0LFxuICAvLyBidXQgYSBmdW5jdGlvbi5cbiAgdGhpcy5vbmNoYW5nZSA9IHRoaXMub25jaGFuZ2UuYmluZCh0aGlzKTtcbn1cblxuRE9NRXZlbnRTb3VyY2UucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oZm9yd2FyZFRvKSB7XG4gIHRoaXMuY29uZmlncy5ldmVudHMuZm9yRWFjaCgoZW5hbWUpID0+IHtcbiAgICB0aGlzLl9jb2xsZWN0b3IoZW5hbWUsIHRoaXMub25jaGFuZ2UpO1xuICB9KTtcbiAgdGhpcy5fZm9yd2FyZFRvID0gZm9yd2FyZFRvO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkRPTUV2ZW50U291cmNlLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuX2ZvcndhcmRUbyA9IG51bGw7XG4gIHRoaXMuY29uZmlncy5ldmVudHMuZm9yRWFjaCgoZW5hbWUpID0+IHtcbiAgICB0aGlzLl9kZWNvbGxlY3RvcihlbmFtZSwgdGhpcy5vbmNoYW5nZSk7XG4gIH0pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRm9yIGZvcndhcmRpbmcgdG8gdGhlIHRhcmdldC5cbiAqL1xuRE9NRXZlbnRTb3VyY2UucHJvdG90eXBlLm9uY2hhbmdlID0gZnVuY3Rpb24oZG9tZXZ0KSB7XG4gIGlmICh0aGlzLl9mb3J3YXJkVG8pIHtcbiAgICB2YXIgc291cmNlRXZlbnQgPSBuZXcgU291cmNlRXZlbnQoXG4gICAgICBkb21ldnQudHlwZSwgZG9tZXZ0LmRldGFpbCwgZG9tZXZ0KTtcbiAgICB0aGlzLl9mb3J3YXJkVG8oc291cmNlRXZlbnQpO1xuICB9XG59O1xuXG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL2J1aWxkX3N0YWdlL3NyYy9zb3VyY2UvZG9tX2V2ZW50X3NvdXJjZS5qc1xuICoqLyIsIiAndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQSBkYXR1bSB0aGF0IGV2ZXJ5IHNvdXJjZSB3b3VsZCBmaXJlLlxuICoqL1xuKGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiAgdmFyIFNvdXJjZUV2ZW50ID0gZnVuY3Rpb24odHlwZSwgZGV0YWlsLCBvcmlnaW5hbCkge1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgdGhpcy5kZXRhaWwgPSBkZXRhaWw7XG4gICAgdGhpcy5vcmlnaW5hbCA9IG9yaWdpbmFsOyAvLyBvcmlnaW5hbCBldmVudCwgaWYgYW55LlxuICB9O1xuICBleHBvcnRzLlNvdXJjZUV2ZW50ID0gU291cmNlRXZlbnQ7XG59KSh3aW5kb3cpO1xuXG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL2J1aWxkX3N0YWdlL3NyYy9zb3VyY2Uvc291cmNlX2V2ZW50LmpzXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgeyBTb3VyY2VFdmVudCB9IGZyb20gJ3NyYy9zb3VyY2Uvc291cmNlX2V2ZW50LmpzJztcblxuLyoqXG4gKiBBIHNvdXJjZSBmaXJlIGV2ZW50cyBldmVyeSBjbG9jayBtaW51dGVzLlxuICoqL1xuZXhwb3J0IGZ1bmN0aW9uIE1pbnV0ZUNsb2NrU291cmNlKGNvbmZpZ3MpIHtcbiAgdGhpcy5jb25maWdzID0ge1xuICAgIHR5cGU6IGNvbmZpZ3MudHlwZSxcbiAgICBpbnRlcnZhbDogNjAwMDAgICAgICAgLy8gb25lIG1pbnV0ZS5cbiAgfTtcbiAgdGhpcy5fdGlja0lkID0gbnVsbDtcbiAgdGhpcy5fZm9yd2FyZFRvID0gbnVsbDtcbiAgLy8gU29tZSBBUEkgeW91IGp1c3QgY2FuJ3QgYmluZCBpdCB3aXRoIHRoZSBvYmplY3QsXG4gIC8vIGJ1dCBhIGZ1bmN0aW9uLlxuICB0aGlzLm9uY2hhbmdlID0gdGhpcy5vbmNoYW5nZS5iaW5kKHRoaXMpO1xufVxuXG5NaW51dGVDbG9ja1NvdXJjZS5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbihmb3J3YXJkVG8pIHtcbiAgdGhpcy5fZm9yd2FyZFRvID0gZm9yd2FyZFRvO1xuICB2YXIgc2Vjb25kcyA9IChuZXcgRGF0ZSgpKS5nZXRTZWNvbmRzKCk7XG4gIC8vIElmIGl0J3MgdGhlICMwIHNlY29uZCBvZiB0aGF0IG1pbnV0ZSxcbiAgLy8gaW1tZWRpYXRlbHkgdGljayBvciB3ZSB3b3VsZCBsb3N0IHRoaXMgbWludXRlLlxuICBpZiAoMCA9PT0gc2Vjb25kcykge1xuICAgIHRoaXMub25jaGFuZ2UoKTtcbiAgfVxuICAvLyBGb3IgdGhlIGZpcnN0IHRpY2sgd2UgbXVzdCBzZXQgdGltZW91dCBmb3IgaXQuXG4gIHRoaXMuX3RpY2tJZCA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICB0aGlzLnRpY2soKTtcbiAgfSwgdGhpcy5jYWxjTGVmdE1pbGxpc2Vjb25kcygpKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5NaW51dGVDbG9ja1NvdXJjZS5wcm90b3R5cGUudGljayA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLm9uY2hhbmdlKCk7XG4gIC8vIEZvciB0aGUgZmlyc3QgdGljayB3ZSBtdXN0IHNldCB0aW1lb3V0IGZvciBpdC5cbiAgdGhpcy5fdGlja0lkID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgIHRoaXMudGljaygpO1xuICB9LCB0aGlzLmNhbGNMZWZ0TWlsbGlzZWNvbmRzKCkpO1xufTtcblxuTWludXRlQ2xvY2tTb3VyY2UucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5fZm9yd2FyZFRvID0gbnVsbDtcbiAgaWYgKHRoaXMuX3RpY2tJZCkge1xuICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGhpcy5fdGlja0lkKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRm9yIGZvcndhcmRpbmcgdG8gdGhlIHRhcmdldC5cbiAqIFdoZW4gdGhlIHRpbWUgaXMgdXAsIGZpcmUgYW4gZXZlbnQgYnkgZ2VuZXJhdG9yLlxuICogU28gdGhhdCB0aGUgb25jaGFuZ2UgbWV0aG9kIHdvdWxkIGZvcndhcmQgaXQgdG8gdGhlIHRhcmdldC5cbiAqL1xuTWludXRlQ2xvY2tTb3VyY2UucHJvdG90eXBlLm9uY2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gIGlmICh0aGlzLl9mb3J3YXJkVG8pIHtcbiAgICB0aGlzLl9mb3J3YXJkVG8obmV3IFNvdXJjZUV2ZW50KHRoaXMuY29uZmlncy50eXBlKSk7XG4gIH1cbn07XG5cbk1pbnV0ZUNsb2NrU291cmNlLnByb3RvdHlwZS5jYWxjTGVmdE1pbGxpc2Vjb25kcyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc2Vjb25kcyA9IChuZXcgRGF0ZSgpKS5nZXRTZWNvbmRzKCk7XG4gIC8vIElmIGl0J3MgYXQgdGhlIHNlY29uZCAwdGggb2YgdGhlIG1pbnV0ZSwgaW1tZWRpYXRlIHN0YXJ0IHRvIHRpY2suXG4gIHZhciBsZWZ0TWlsbGlzZWNvbmRzID0gKDYwIC0gc2Vjb25kcykgKiAxMDAwO1xuICByZXR1cm4gbGVmdE1pbGxpc2Vjb25kcztcbn07XG5cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vYnVpbGRfc3RhZ2Uvc3JjL3NvdXJjZS9taW51dGVfY2xvY2tfc291cmNlLmpzXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgeyBTb3VyY2VFdmVudCB9IGZyb20gJ3NyYy9zb3VyY2Uvc291cmNlX2V2ZW50LmpzJztcblxuLyoqXG4gKiBFdmVudCBzb3VyY2UgZm9yIFN0cmVhbS4gT25lIFN0cmVhbSBjYW4gY29sbGVjdCBldmVudHMgZnJvbSBtdWx0aXBsZVxuICogc291cmNlcywgd2hpY2ggcGFzcyBkaWZmZXJlbnQgbmF0aXZlIGV2ZW50cyAobm90IG9ubHkgRE9NIGV2ZW50cylcbiAqIHRvIFN0cmVhbS5cbiAqKi9cbmV4cG9ydCBmdW5jdGlvbiBTZXR0aW5nU291cmNlKGNvbmZpZ3MpIHtcbiAgdGhpcy5jb25maWdzID0ge1xuICAgIHNldHRpbmdzOiBjb25maWdzLnNldHRpbmdzIHx8IFtdXG4gIH07XG4gIHRoaXMuX2NvbGxlY3RvciA9IG5hdmlnYXRvci5tb3pTZXR0aW5ncy5hZGRPYnNlcnZlclxuICAgIC5iaW5kKG5hdmlnYXRvci5tb3pTZXR0aW5ncyk7XG4gIHRoaXMuX2RlY29sbGVjdG9yID0gbmF2aWdhdG9yLm1velNldHRpbmdzLnJlbW92ZU9ic2VydmVyXG4gICAgLmJpbmQobmF2aWdhdG9yLm1velNldHRpbmdzKTtcbiAgdGhpcy5fZm9yd2FyZFRvID0gbnVsbDtcbiAgLy8gU29tZSBBUEkgeW91IGp1c3QgY2FuJ3QgYmluZCBpdCB3aXRoIHRoZSBvYmplY3QsXG4gIC8vIGJ1dCBhIGZ1bmN0aW9uLlxuICB0aGlzLm9uY2hhbmdlID0gdGhpcy5vbmNoYW5nZS5iaW5kKHRoaXMpO1xufVxuXG5TZXR0aW5nU291cmNlLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKGZvcndhcmRUbykge1xuICB0aGlzLmNvbmZpZ3Muc2V0dGluZ3MuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgdGhpcy5fY29sbGVjdG9yKGtleSwgdGhpcy5vbmNoYW5nZSk7XG4gIH0pO1xuICB0aGlzLl9mb3J3YXJkVG8gPSBmb3J3YXJkVG87XG4gIHJldHVybiB0aGlzO1xufTtcblxuU2V0dGluZ1NvdXJjZS5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLl9mb3J3YXJkVG8gPSBudWxsO1xuICB0aGlzLmNvbmZpZ3Muc2V0dGluZ3MuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgdGhpcy5fZGVjb2xsZWN0b3Ioa2V5LCB0aGlzLm9uY2hhbmdlKTtcbiAgfSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBGb3IgZm9yd2FyZGluZyB0byB0aGUgdGFyZ2V0LlxuICogV291bGQgdHJhbnNmb3JtIHRoZSBvcmlnaW5hbCAnc2V0dGluZ05hbWUnIGFuZCAnc2V0dGluZ1ZhbHVlJyBwYWlyIGFzXG4gKiAndHlwZScgYW5kICdkZXRhaWwnLCBhcyB0aGUgZXZlbnQgZm9ybWFudC5cbiAqL1xuU2V0dGluZ1NvdXJjZS5wcm90b3R5cGUub25jaGFuZ2UgPSBmdW5jdGlvbihjaGFuZ2UpIHtcbiAgaWYgKHRoaXMuX2ZvcndhcmRUbykge1xuICAgIHRoaXMuX2ZvcndhcmRUbyhcbiAgICAgIG5ldyBTb3VyY2VFdmVudChjaGFuZ2Uuc2V0dGluZ05hbWUsIGNoYW5nZS5zZXR0aW5nVmFsdWUpKTtcbiAgfVxufTtcblxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9idWlsZF9zdGFnZS9zcmMvc291cmNlL3NldHRpbmdfc291cmNlLmpzXG4gKiovIiwiICd1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBUaGUgYmFzaWMgaW50ZXJmYWNlIG9mIHZpZXcuXG4gKiBWaWV3IG9ubHkgbmVlZCB0byBrbm93IGhvdyB0byB0cmFuc2Zvcm0gZGF0YSB0byB0aGVcbiAqIHN5bnRoZXRpYyAnZWZmZWN0cycuXG4gKlxuICogRm9yIFVJLCBpdCBtZWFucyB0byBkcmF3IHNvbWV0aGluZyBvbiB0aGUgc2NyZWVuLlxuICogRm9yIG90aGVyIHZpZXdzLCBpdCBtZWFucyB0byBwZXJmb3JtIHJlbW90ZSBxdWVyaWVzLFxuICogcGxheSBzb3VuZHMsIHNlbmQgY29tbWFuZHMgdmlhIG5ldHdvcmssIGV0Yy5cbiAqXG4gKiBBbmQgaG93IHRvIGNvbXBvc2UgdGhlICdlZmZlY3RzJyBpcyBkZWNpZGVkIGJ5IHRoZSBjb21wb25lbnQuXG4gKiBJZiBvbmUgcGFyZW50IG5lZWQgdG8gd2FpdCBpdHMgY2hpbGRyZW4sIG9yIHRvIGNvbGxlY3QgcmVzdWx0c1xuICogZnJvbSB0aGVtLCB0aGUgY29tcG9uZW50IG11c3QgZGVyaXZlIHRoaXMgdmlldyB0byBwcm92aWRlXG4gKiAndGhlbi1hYmxlJyBhYmlsaXR5IHRvIHRoZSAncmVuZGVyJyBtZXRob2QuXG4gKiBXZSBkb24ndCBtYWtlIGFueSBhc3N1bXB0aW9ucyBpbiB0aGlzIGJhc2ljIGludGVyZmFjZS5cbiAqKi9cbiAgZXhwb3J0IGZ1bmN0aW9uIEJhc2ljVmlldygpIHt9XG5cbiAgLyoqXG4gICAqIElmIGl0J3MgYSBVSSB2aWV3IGJ1dCB3aXRob3V0IHZpcnR1YWwgRE9NLFxuICAgKiB0aGUgdmlld3MgbXVzdCBoYW5kbGUgZGV0YWlsZWQgRE9NIG1hbmlwdWxhdGlvbnNcbiAgICogbWFudWFsbHkuIFNvIFVJIHZpZXcgY291bGQgYmUgY29tcGxpY2F0ZWQuXG4gICAqXG4gICAqIFdpdGggdmlydHVhbCBET00gaXQgY291bGQgYmUgdmVyeSBzaW1wbGUsIGJ1dCB0aGlzIGRlcGVuZHMgb24gdGhlXG4gICAqIGZhY2lsaXRpZXMgb2YgdGhlIHByb2plY3QuXG4gICAqL1xuICBCYXNpY1ZpZXcucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKGRhdGEpIHt9O1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9idWlsZF9zdGFnZS9zcmMvdmlldy9iYXNpY192aWV3LmpzXG4gKiovIl0sInNvdXJjZVJvb3QiOiIifQ==