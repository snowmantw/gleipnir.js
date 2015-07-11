/**
 * gleipnir.js - Gleipnir.js - a library for UI programming
 * @version v0.0.1
 * @link 
 * @license Apache 2.0
 */
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

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