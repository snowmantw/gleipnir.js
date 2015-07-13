/**
 * gleipnir.js - Gleipnir.js - a library for UI programming
 * @version v0.0.1
 * @link 
 * @license Apache 2.0
 */
var Gleipnir = Gleipnir || {}; Gleipnir["Stream"] =
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

	module.exports = __webpack_require__(8);


/***/ },
/* 1 */,
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
/* 6 */,
/* 7 */,
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

/***/ }
/******/ ]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNjgzYzcyYWJiOGUxNDNhMTM4MGM/N2MyNyoqKioqKioqKiIsIndlYnBhY2s6Ly8vLi9idWlsZF9zdGFnZS9zcmMvcnVuZS9sYW5ndWFnZS5qcz8xZjBjKioqIiwid2VicGFjazovLy8uL2J1aWxkX3N0YWdlL3NyYy9zdHJlYW0vc3RyZWFtLmpzPzhkMzcqIiwid2VicGFjazovLy8uL2J1aWxkX3N0YWdlL3NyYy9wcm9jZXNzL3Byb2Nlc3MuanM/NjY3NCoqIiwid2VicGFjazovLy8uL2J1aWxkX3N0YWdlL3NyYy9wcm9jZXNzL2ludGVyZmFjZS5qcz9hYzA3KioiLCJ3ZWJwYWNrOi8vLy4vYnVpbGRfc3RhZ2Uvc3JjL3Byb2Nlc3MvcnVudGltZS5qcz8yY2YwKioiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx1QkFBZTtBQUNmO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7QUN0Q0EsYUFBWSxDQUFDOzs7OztTQXFHRyxRQUFRLEdBQVIsUUFBUTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBakIsVUFBUyxRQUFRLEdBQUcsRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBa0I3QixTQUFRLENBQUMsTUFBTSxHQUFHLFVBQVMsTUFBTSxFQUFFLEVBQUUsRUFBRTtBQUNyQyxVQUFPLFlBQWtCO0FBQ3ZCLFNBQUksSUFBSSxFQUFFLFdBQVcsQ0FBQzs7dUNBREwsSUFBSTtBQUFKLFdBQUk7OztBQUVyQixhQUFRLEVBQUU7QUFDUixZ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QUNwQixDQUFDLENBQUMsTUFBTSxDQUFDLFVBQUMsSUFBSSxFQUFLO0FBQ2xCLFlBQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ2pDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRWQsTUFBRyxHQUFHLEdBQUcsR0FBRyxTQUFTLEdBQUcsS0FBSyxDQUFDO0FBQzlCLFVBQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLG9CQUFvQixHQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVUsR0FDckUsR0FBRyxHQUFHLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztFQUN2RCxDQUFDOztBQUVGLFFBQU8sQ0FBQyxjQUFjLEdBQUcsVUFBUyxPQUFPLEVBQUU7QUFDekMsT0FBSSxDQUFDLElBQUksR0FBRyxnQkFBZ0IsQ0FBQztBQUM3QixPQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sSUFBSSxFQUFFLENBQUM7RUFDOUIsQ0FBQzs7QUFFRixRQUFPLENBQUMsY0FBYyxDQUFDLFNBQVMsR0FBRyxJQUFJLEtBQUssRUFBRSxDIiwiZmlsZSI6IkdsZWlwbmlyLlN0cmVhbS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKVxuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuXG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRleHBvcnRzOiB7fSxcbiBcdFx0XHRpZDogbW9kdWxlSWQsXG4gXHRcdFx0bG9hZGVkOiBmYWxzZVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sb2FkZWQgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogd2VicGFjay9ib290c3RyYXAgNjgzYzcyYWJiOGUxNDNhMTM4MGNcbiAqKi8iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogR2VuZXJpYyBidWlsZGVyIHRoYXQgd291bGQgcHVzaCBub2RlcyBpbnRvIHRoZSBlRFNMIHN0YWNrLlxuICogVXNlciBjb3VsZCBpbmhlcml0IHRoaXMgdG8gZGVmaW5lIHRoZSBuZXcgZURTTC5cbiAqIC0tLVxuICogVGhlIGRlZmF1bHQgc2VtYW50aWNzIG9ubHkgY29udGFpbiB0aGVzZSBvcGVyYXRpb25zOlxuICpcbiAqIDEuIFtwdXNoXSA6IHB1c2ggdG8gdGhlIGN1cnJlbnQgc3RhY2tcbiAqIDIuIFtiZWdpbl06IGNyZWF0ZSBhIG5ldyBzdGFjayBhbmQgc3dpdGNoIHRvIGl0LFxuICogICAgICAgICAgICAgYW5kIHRoZW4gcHVzaCB0aGUgbm9kZSBpbnRvIHRoZSBzdGFjay5cbiAqIDMuIFtlbmRdICA6IGFmdGVyIHB1c2ggdGhlIG5vZGUgaW50byB0aGUgc3RhY2ssXG4gKiAgICAgICAgICAgICBjaGFuZ2UgdGhlIGN1cnJlbnQgc3RhY2sgdG8gdGhlIHByZXZpb3VzIG9uZS5cbiAqIDQuIFtleGl0XSA6IGV4aXQgdGhlIGNvbnRleHQgb2YgdGhpcyBlRFNMOyB0aGUgbGFzdCByZXN1bHRcbiAqICAgICAgICAgICAgIG9mIGl0IHdvdWxkIGJlIHBhc3NlZCB0byB0aGUgcmV0dXJuIHZhbHVlIG9mXG4gKiAgICAgICAgICAgICB0aGlzIGNoYWluLlxuICpcbiAqIFN0YWNrIGNvdWxkIGJlIG5lc3RlZDogd2hlbiBbYmVnaW5dIGEgbmV3IHN0YWNrIGluIGZhY3QgaXQgd291bGRcbiAqIHB1c2ggdGhlIHN0YWNrIGludG8gdGhlIHByZXZpb3VzIG9uZS4gU28gdGhlIHN0YWNrIGNvbXByaXNlXG4gKiBbbm9kZV0gYW5kIFtzdGFja10uXG4gKiAtLS1cbiAqIEFsdGhvdWdoIHRoZSBlRFNMIGluc3RhbmNlIHNob3VsZCB3cmFwIHRoZXNlIGJhc2ljIG9wZXJhdGlvbnNcbiAqIHRvIG1hbmlwdWxhdGUgdGhlIHN0YWNrLCB0aGV5IGFsbCBuZWVkIHRvIGNvbnZlcnQgdGhlIG1ldGhvZFxuICogY2FsbCB0byBub2Rlcy4gU28gJ0xhbmd1YWdlJyBwcm92aWRlIGEgd2F5IHRvIHNpbXBsaWZ5IHRoZSB3b3JrOiBpZlxuICogdGhlIGluc3RhbmNlIGNhbGwgdGhlIFtkZWZpbmVdIG1ldGhvZCB0aGUgbmFtZSBvZiB0aGUgbWV0aG9kLFxuICogaXQgY291bGQgYXNzb2NpYXRlIHRoZSBvcGVyYW5kIG9mIHRoZSBlRFNMIHdpdGggdGhlIHN0YWNrIG1hbmlwdWxhdGlvbi5cbiAqIEZvciBleGFtcGxlOlxuICpcbiAqICAgIHZhciBlRFNMID0gZnVuY3Rpb24oKSB7fTtcbiAqICAgIGVEU0wucHJvdG90eXBlLnRyYW5zYWN0aW9uID0gTGFuZ3VhZ2UuZGVmaW5lKCd0cmFuc2FjdGlvbicsICdiZWdpbicpO1xuICogICAgZURTTC5wcm90b3R5cGUucHJlID0gTGFuZ3VhZ2UuZGVmaW5lKCdwcmUnLCAncHVzaCcpO1xuICogICAgZURTTC5wcm90b3R5cGUucGVyZm9ybSA9IExhbmd1YWdlLmRlZmluZSgncGVyZm9ybScsICdwdXNoJyk7XG4gKiAgICBlRFNMLnByb3RvdHlwZS5wb3N0ID0gTGFuZ3VhZ2UuZGVmaW5lKCdwb3N0JywgJ2VuZCcpO1xuICpcbiAqIFRoZW4gdGhlIGVEU0wgY291bGQgYmUgdXNlZCBhczpcbiAqXG4gKiAgICAobmV3IGVEU0wpXG4gKiAgICAgIC50cmFuc2FjdGlvbigpXG4gKiAgICAgIC5wcmUoY2IpXG4gKiAgICAgIC5wZXJmb3JtKGNiKVxuICogICAgICAucG9zdChjYilcbiAqXG4gKiBBbmQgdGhlIHN0YWNrIHdvdWxkIGJlOlxuICpcbiAqICAgIFtcbiAqICAgICAgbm9kZTwndHJhbnNhY3Rpb24nLD5cbiAqICAgICAgbm9kZTwncHJlJywgY2I+XG4gKiAgICAgIG5vZGU8J3ByZWZvcm0nLCBjYj5cbiAqICAgICAgbm9kZTwncG9zdCcsIGNiPlxuICogICAgXVxuICpcbiAqIEhvd2V2ZXIsIHRoaXMgc2ltcGxlIGFwcHJvYWNoIHRoZSBzZW1hbnRpY3MgcnVsZXMgYW5kIGFuYWx5emVycyB0b1xuICogZ3VhcmFudGVlIHRoZSBzdGFjayBpcyB2YWxpZC4gRm9yIGV4YW1wbGUsIGlmIHdlIGhhdmUgYSBtYWxmb3JtZWRcbiAqIHN0YWNrIGJlY2F1c2Ugb2YgdGhlIGZvbGxvd2luZyBlRFNMIHByb2dyYW06XG4gKlxuICogICAgKG5ldyBlRFNMKVxuICogICAgICAucG9zdChjYilcbiAqICAgICAgLnByZShjYilcbiAqICAgICAgLnBlcmZvcm0oY2IpXG4gKiAgICAgIC50cmFuc2FjdGlvbigpXG4gKlxuICogVGhlIHJ1bnRpbWUgbWF5IHJlcG9ydCBlcnJvdCBiZWNhdXNlIHdoZW4gJy5wb3N0KGNiKScgdGhlcmUgaXMgbm8gc3RhY2tcbiAqIGNyZWF0ZWQgYnkgdGhlIGJlZ2lubmluZyBzdGVwLCBuYW1lbHkgdGhlICcucHJlKGNiKScgaW4gb3VyIGNhc2UuXG4gKiBOZXZlcnRoZWxlc3MsIHRoZSBlcnJvciBtZXNzYWdlIGlzIHRvbyBsb3ctbGV2ZWwgZm9yIHRoZSBsYW5ndWFnZSB1c2VyLFxuICogc2luY2UgdGhleSBzaG91bGQgY2FyZSBubyBzdGFjayB0aGluZ3MgYW5kIHNob3VsZCBvbmx5IGNhcmUgYWJvdXQgdGhlIGVEU0xcbiAqIGl0c2VsZi5cbiAqXG4gKiBUaGUgc29sdXRpb24gaXMgdG8gcHJvdmlkZSBhIGJhc2ljIHN0YWNrIG9yZGVyaW5nIGFuYWx5emVyIGFuZCBsZXQgdGhlXG4gKiBsYW5ndWFnZSBkZWNpZGUgaG93IHRvIGRlc2NyaWJlIHRoZSBlcnJvci4gQW5kIHNpbmNlIHdlIGRvbid0IGhhdmVcbiAqIGFueSBjb250ZXh0IGluZm9ybWF0aW9uIGFib3V0IHZhcmlhYmxlcywgc2NvcGUgYW5kIG90aGVyIGVsZW1lbnRzXG4gKiBhcyBhIGNvbXBsZXRlIHByb2dyYW1taW5nIGxhbmd1YWdlLCB3ZSBvbmx5IG5lZWQgdG8gZ3VhcmFudGVlIHRoZSBvcmRlciBpc1xuICogY29ycmVjdCwgYW5kIG1ha2UgaW5jb3JyZWN0IGNhc2VzIG1lYW5pbmdmdWwuIE1vcmVvdmVyLCBzaW5jZSB0aGUgYW5hbHl6ZXJcbiAqIG5lZWRzIHRvIGFuYWx5emUgdGhlIHN0YXRlcyB3aGVuZXZlciB0aGUgaW5jb21pbmcgbm9kZSBjb21lcywgaXQgaXMgaW4gZmFjdFxuICogYW4gZXZhbHVhdGlvbiBwcm9jZXNzLCBzbyB1c2VyIGNvdWxkIGNvbWJpbmUgdGhlIGFuYWx5emluZyBhbmQgaW50ZXJwcmV0aW5nXG4gKiBwaGFzZSBpbnRvIHRoZSBzYW1lIGZ1bmN0aW9uLiBGb3IgZXhhbXBsZTpcbiAqXG4gKiAgICBydW50aW1lLm9uY2hhbmdlKChjb250ZXh0LCBub2RlLCBzdGFjaykgPT4ge1xuICogICAgICAgIC8vIElmIHRoZSBjaGFuZ2UgaXMgdG8gc3dpdGNoIHRvIGEgbmV3IHN0YWNrLFxuICogICAgICAgIC8vIHRoZSAnc3RhY2snIGhlcmUgd291bGQgYmUgdGhlIG5ldyBzdGFjay5cbiAqICAgICAgICB2YXIge3R5cGUsIGFyZ3N9ID0gbm9kZTtcbiAqICAgICAgICBpZiAoJ3ByZScgPT09IHR5cGUpIHtcbiAqICAgICAgICAgIGNvbnRleHQuaW5pdCA9IHRydWU7XG4gKiAgICAgICAgfSBlbHNlIGlmICgncG9zdCcgPT09IHR5cGUgJiYgIWNvbnRleHQuaW5pdCkge1xuICogICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGVyZSBtdXN0IGJlIG9uZSBcInByZVwiIG5vZGUgYmVmb3JlIHRoZSBcInBvc3RcIi4nKTtcbiAqICAgICAgICB9XG4gKiAgICB9KTtcbiAqXG4gKiBXaXRoIHN1Y2ggZmVhdHVyZSwgaWYgdGhlIGluY29taW5nIG5vZGUgb3IgdGhlIHN0YWNrIGlzIG1hbGZvcm1lZCxcbiAqIGl0IHNob3VsZCB0aHJvdyB0aGUgZXJyb3IuIFRoZSBlcnJvciBjYXB0dXJlZCBieSB0aGUgaW5zdGFuY2UgbGlrZSB0aGlzXG4gKiBjb3VsZCBiZSBhICdjb21waWxhdGlvbiBlcnJvcicuXG4gKlxuICogVGhlIG5vdGljZWFibGUgZmFjdCBpcyBUaGUgY2FsbGJhY2sgb2YgdGhlICdvbmNoYW5nZScgaXMgYWN0dWFsbHkgYSByZWR1Y2VyLFxuICogc28gdXNlciBjb3VsZCB0cmVhdCB0aGUgcHJvY2VzcyBvZiB0aGlzIGV2YWx1YXRpb24gJiBhbmFseXppbmcgYXMgYSByZWR1Y2luZ1xuICogcHJvY2VzcyBvbiBhbiBpbmZpbml0ZSBzdHJlYW0uIEFuZCBzaW5jZSB3ZSBoYXZlIGEgc3RhY2sgbWFjaGluZSwgaWYgdGhlXG4gKiByZWR1Y2VyIHJldHVybiBub3RoaW5nLCB0aGUgc3RhY2sgd291bGQgYmUgZW1wdHkuIE90aGVyd2lzZSwgaWYgdGhlIHJlZHVjZXJcbiAqIHJldHVybiBhIG5ldyBzdGFjaywgaXQgd291bGQgcmVwbGFjZSB0aGUgb2xkIG9uZS5cbiAqXG4gKiBBbmQgcGxlYXNlIG5vdGUgdGhlIGV4YW1wbGUgaXMgbXVjaCBzaW1wbGlmaWVkLiBGb3IgdGhlXG4gKiByZWFsIGVEU0wgaXQgc2hvdWxkIGJlIHVzZWQgb25seSBhcyBhbiBlbnRyeSB0byBkaXNwYXRjaCB0aGUgY2hhbmdlIHRvXG4gKiB0aGUgcmVhbCBoYW5kbGVycywgd2hpY2ggbWF5IGNvbXByaXNlIHNldmVyYWwgc3RhdGVzIGFuZCBjb21wb25lbnRzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gTGFuZ3VhZ2UoKSB7fVxuXG4vKipcbiAqIEhlbHBlciBtZXRob2QgdG8gYnVpbGQgaW50ZXJmYWNlIG9mIGEgc3BlY2lmaWMgRFNMLiBJdCB3b3VsZCByZXR1cm4gYSBtZXRob2RcbiAqIG9mIHRoZSBEU0wgYW5kIHRoZW4gdGhlIGludGVyZmFjZSBjb3VsZCBhdHRhY2ggaXQuXG4gKlxuICogVGhlIHJldHVybmluZyBmdW5jdGlvbiB3b3VsZCBhc3N1bWUgdGhhdCB0aGUgJ3RoaXMnIGluc2lkZSBpdCBpcyB0aGUgcnVudGltZVxuICogb2YgdGhlIGxhbmd1YWdlLiBBbmQgc2luY2UgdGhlIG1ldGhvZCBpdCByZXR1cm5zIHdvdWxkIHJlcXVpcmUgdG8gYWNjZXNzIHNvbWVcbiAqIG1lbWJlcnMgb2YgdGhlICd0aGlzJywgdGhlICd0aGlzJyBzaG91bGQgaGF2ZSAndGhpcy5zdGFjaycgYW5kICd0aGlzLmNvbnRleHQnXG4gKiBhcyB0aGUgbWV0aG9kIHJlcXVpcmVzLlxuICpcbiAqIElmIGl0J3MgYW4gJ2V4aXQnIG5vZGUsIG1lYW5zIHRoZSBzZXNzaW9uIGlzIGVuZGVkIGFuZCB0aGUgaW50ZXJwcmV0ZXIgc2hvdWxkXG4gKiByZXR1cm4gYSBzdGFjayBjb250YWlucyBvbmx5IG9uZSBub2RlIGFzIHRoZSByZXN1bHQgb2YgdGhlIHNlc3Npb24sIG9yIHRoZVxuICogc2Vzc2lvbiByZXR1cm5zIG5vdGhpbmcuXG4gKlxuICogUGxlYXNlIG5vdGUgdGhhdCBmcm9tIHRoZSBkZXNjcmlwdGlvbiBhYm92ZSwgJ2VuZCcgbWVhbnMgc3RhY2sgKHN1YnN0YWNrKVxuICogZW5kcy4gSXQncyB0b3RhbGx5IGlycmVsZXZhbnQgdG8gJ2V4aXQnLlxuICovXG5MYW5ndWFnZS5kZWZpbmUgPSBmdW5jdGlvbihtZXRob2QsIGFzKSB7XG4gIHJldHVybiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgdmFyIG5vZGUsIHJlc3VsdHN0YWNrO1xuICAgIHN3aXRjaCAoYXMpIHtcbiAgICAgIGNhc2UgJ3B1c2gnOlxuICAgICAgICBub2RlID0gbmV3IExhbmd1YWdlLk5vZGUobWV0aG9kLCBhcmdzLCB0aGlzLnN0YWNrKTtcbiAgICAgICAgdGhpcy5zdGFjay5wdXNoKG5vZGUpO1xuICAgICAgICByZXN1bHRzdGFjayA9XG4gICAgICAgICAgdGhpcy5vbmNoYW5nZSh0aGlzLmNvbnRleHQsIG5vZGUsIHRoaXMuc3RhY2spO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2JlZ2luJzpcbiAgICAgICAgdGhpcy5fcHJldnN0YWNrID0gdGhpcy5zdGFjaztcbiAgICAgICAgdGhpcy5zdGFjayA9IFtdO1xuICAgICAgICBub2RlID0gbmV3IExhbmd1YWdlLk5vZGUobWV0aG9kLCBhcmdzLCB0aGlzLnN0YWNrKTtcbiAgICAgICAgdGhpcy5zdGFjay5wdXNoKG5vZGUpOyAgLy8gYXMgdGhlIGZpcnN0IG5vZGUgb2YgdGhlIG5ldyBzdGFjay5cbiAgICAgICAgcmVzdWx0c3RhY2sgPVxuICAgICAgICAgIHRoaXMub25jaGFuZ2UodGhpcy5jb250ZXh0LCBub2RlLCB0aGlzLnN0YWNrKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdlbmQnOlxuICAgICAgICBub2RlID0gbmV3IExhbmd1YWdlLk5vZGUobWV0aG9kLCBhcmdzLCB0aGlzLnN0YWNrKTtcbiAgICAgICAgdGhpcy5zdGFjay5wdXNoKG5vZGUpOyAgLy8gdGhlIGxhc3Qgbm9kZSBvZiB0aGUgc3RhY2suXG4gICAgICAgIHRoaXMuc3RhY2sgPVxuICAgICAgICAgIHRoaXMuX3ByZXZzdGFjazsgLy8gc3dpdGNoIGJhY2sgdG8gdGhlIHByZXZpb3VzIHN0YWNrLlxuICAgICAgICByZXN1bHRzdGFjayA9XG4gICAgICAgICAgdGhpcy5vbmNoYW5nZSh0aGlzLmNvbnRleHQsIG5vZGUsIHRoaXMuc3RhY2spO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2V4aXQnOlxuICAgICAgICBub2RlID0gbmV3IExhbmd1YWdlLk5vZGUobWV0aG9kLCBhcmdzLCB0aGlzLnN0YWNrKTtcbiAgICAgICAgdGhpcy5zdGFjay5wdXNoKG5vZGUpOyAgLy8gdGhlIGxhc3Qgbm9kZSBvZiB0aGUgc3RhY2suXG4gICAgICAgIHJlc3VsdHN0YWNrID1cbiAgICAgICAgICB0aGlzLm9uY2hhbmdlKHRoaXMuY29udGV4dCwgbm9kZSwgdGhpcy5zdGFjayk7XG4gICAgICAgIGlmICghcmVzdWx0c3RhY2spIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCdleGl0JyBub2RlICcke25vZGUudHlwZX0nIHNob3VsZFxuICAgICAgICAgICAgcmV0dXJuIGEgcmVzdWx0c3RhY2suYCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdHN0YWNrWzBdO1xuICAgIH1cbiAgICAvLyBJZiB0aGUgaGFuZGxlciB1cGRhdGVzIHRoZSBzdGFjaywgaXQgd291bGQgcmVwbGFjZSB0aGUgZXhpc3Rpbmcgb25lLlxuICAgIGlmIChyZXN1bHRzdGFjaykge1xuICAgICAgdGhpcy5zdGFjayA9IHJlc3VsdHN0YWNrO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbn07XG5cbkxhbmd1YWdlLk5vZGUgPSBmdW5jdGlvbih0eXBlLCBhcmdzLCBzdGFjaykge1xuICB0aGlzLnR5cGUgPSB0eXBlO1xuICB0aGlzLmFyZ3MgPSBhcmdzO1xuICB0aGlzLnN0YWNrID0gc3RhY2s7XG59O1xuXG5MYW5ndWFnZS5FdmFsdWF0ZSA9IGZ1bmN0aW9uKGNvbnRleHQgPSB7fSkge1xuICB0aGlzLl9hbmFseXplcnMgPSBbXTtcbiAgdGhpcy5faW50ZXJwcmV0ZXIgPSBudWxsO1xuICB0aGlzLl9jb250ZXh0ID0gY29udGV4dDtcbn07XG5cbi8qKlxuICogQW5hbHl6ZXIgY291bGQgcmVjZWl2ZSB0aGUgc3RhY2sgY2hhbmdlIGZyb20gJ0xhbmd1YWdlI2V2YWx1YXRlJyxcbiAqIGFuZCBpdCB3b3VsZCBiZSBjYWxsZWQgd2l0aCB0aGUgYXJndW1lbnRzIGFzIHRoZSBmdW5jdGlvbiBkZXNjcmliZXM6XG4gKlxuICogICAgIExhbmd1YWdlLnByb3RvdHlwZS5ldmFsdWF0ZSgoY29udGV4dCwgY2hhbmdlLCBzdGFjaykgPT4ge1xuICogICAgICAgIC8vIC4uLlxuICogICAgIH0pO1xuICpcbiAqIFNvIHRoZSBhbmFseXplciBjb3VsZCBiZTpcbiAqXG4gKiAgICBmdW5jdGlvbihjb250ZXh0LCBjaGFuZ2UsIHN0YWNrKSB7XG4gKiAgICAgIC8vIERvIHNvbWUgY2hlY2sgYW5kIG1heWJlIGNoYW5nZWQgdGhlIGNvbnRleHQuXG4gKiAgICAgIC8vIFRoZSBuZXh0IGFuYWx5emVyIHRvIHRoZSBpbnRlcnByZXRlciB3b3VsZCBhY2NlcHQgdGhlIGFsdGVybmF0ZWRcbiAqICAgICAgLy8gY29udGV4dCBhcyB0aGUgYXJndW1lbnQgJ2NvbnRleHQnLlxuICogICAgICBjb250ZXh0LnNvbWVGbGFnID0gdHJ1ZTtcbiAqICAgICAgLy8gV2hlbiB0aGVyZSBpcyB3cm9uZywgdGhyb3cgaXQuXG4gKiAgICAgIHRocm93IG5ldyBFcnJvcignU29tZSBhbmFseXppbmcgZXJyb3InKTtcbiAqICAgIH07XG4gKlxuICogTm90ZSB0aGF0IHRoZSBhbmFseXplciAoJ2EnKSB3b3VsZCBiZSBpbnZva2VkIHdpdGggZW1wdHkgJ3RoaXMnIG9iamVjdCxcbiAqIHNvIHRoZSBmdW5jdGlvbiByZWxpZXMgb24gJ3RoaXMnIHNob3VsZCBiaW5kIGl0c2VsZiBmaXJzdC5cbiAqL1xuTGFuZ3VhZ2UuRXZhbHVhdGUucHJvdG90eXBlLmFuYWx5emVyID0gZnVuY3Rpb24oYSkge1xuICB0aGlzLl9hbmFseXplcnMucHVzaChhKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIE9uZSBFdmFsdWF0ZSBjYW4gb25seSBoYXZlIG9uZSBpbnRlcnByZXRlciwgYW5kIGl0IHdvdWxkIHJldHVyblxuICogdGhlIGZ1bmN0aW9uIGNvdWxkIGNvbnN1bWUgZXZlcnkgc3RhY2sgY2hhbmdlIGZyb20gJ0xhbmd1YWdlI2V2YWx1YXRlJy5cbiAqXG4gKiBUaGUgY29kZSBpcyBhIGxpdHRsZSBjb21wbGljYXRlZDogd2UgaGF2ZSB0d28ga2luZHMgb2YgJ3JlZHVjaW5nJzpcbiAqIG9uZSBpcyB0byByZWR1Y2UgYWxsIGFuYWx5emVycyB3aXRoIHRoZSBzaW5nbGUgaW5jb21pbmcgY2hhbmdlLFxuICogYW5vdGhlciBpcyB0byByZWR1Y2UgYWxsIGluY29taW5nIGNoYW5nZXMgd2l0aCB0aGlzIGFuYWx5emVycyArIGludGVycHJldGVyLlxuICpcbiAqIFRoZSBhbmFseXplciBhbmQgaW50ZXJwcmV0ZXIgc2hvdWxkIGNoYW5nZSB0aGUgY29udGV4dCwgdG8gbWVtb3JpemUgdGhlXG4gKiBzdGF0ZXMgb2YgdGhlIGV2YWx1YXRpb24uIFRoZSBkaWZmZXJlbmNlIGlzIGludGVycHJldGVyIHNob3VsZCByZXR1cm4gb25lXG4gKiBuZXcgc3RhY2sgaWYgaXQgbmVlZHMgdG8gdXBkYXRlIHRoZSBleGlzdGluZyBvbmUuIFRoZSBzdGFjayBpdCByZXR1cm5zIHdvdWxkXG4gKiByZXBsYWNlIHRoZSBleGlzdGluZyBvbmUsIHNvIGFueXRoaW5nIHN0aWxsIGluIHRoZSBvbGQgb25lIHdvdWxkIGJlIHdpcGVkXG4gKiBvdXQuIFRoZSBpbnRlcnByZXRlciBjb3VsZCByZXR1cm4gbm90aGluZyAoJ3VuZGVmaW5lZCcpIHRvIGtlZXAgdGhlIHN0YWNrXG4gKiB1bnRvdWNoZWQuXG4gKlxuICogVGhlIGFuYWx5emVycyBhbmQgaW50ZXJwcmV0ZXIgY291bGQgY2hhbmdlIHRoZSAnY29udGV4dCcgcGFzcyB0byB0aGVtLlxuICogQW5kIHNpbmNlIHdlIG1heSB1cGRhdGUgdGhlIHN0YWNrIGFzIGFib3ZlLCB0aGUgY29udGV4dCBzaG91bGQgbWVtb3JpemVcbiAqIHRob3NlIGluZm9ybWF0aW9uIG5vdCB0byBiZSBvdmVyd3JpdHRlbiB3aGlsZSB0aGUgc3RhY2sgZ2V0IHdpcGVkIG91dC5cbiAqXG4gKiBBbmQgaWYgdGhlIGludGVycHJldGluZyBub2RlIGlzIHRoZSBleGl0IG5vZGUgb2YgdGhlIHNlc3Npb24sIGludGVycHJldGVyXG4gKiBzaG91bGQgcmV0dXJuIGEgbmV3IHN0YWNrIGNvbnRhaW5zIG9ubHkgb25lIGZpbmFsIHJlc3VsdCBub2RlLiBJZiB0aGVyZVxuICogaXMgbm8gc3VjaCBub2RlLCB0aGUgcmVzdWx0IG9mIHRoaXMgc2Vzc2lvbiBpcyAndW5kZWZpbmVkJy5cbiAqL1xuTGFuZ3VhZ2UuRXZhbHVhdGUucHJvdG90eXBlLmludGVycHJldGVyID0gZnVuY3Rpb24oaW5wdCkge1xuICAvLyBUaGUgY3VzdG9taXplZCBsYW5ndWFnZSBzaG91bGQgZ2l2ZSB0aGUgZGVmYXVsdCBjb250ZXh0LlxuICByZXR1cm4gKGNvbnRleHQsIGNoYW5nZSwgc3RhY2spID0+IHtcbiAgICB0cnkge1xuICAgICAgLy8gQW5hbHl6ZXJzIGNvdWxkIGNoYW5nZSB0aGUgY29udGV4dC5cbiAgICAgIHRoaXMuX2FuYWx5emVycy5yZWR1Y2UoKGN0eCwgYW5hbHl6ZXIpID0+IHtcbiAgICAgICAgYW5hbHl6ZXIuY2FsbCh7fSwgY29udGV4dCwgY2hhbmdlLCBzdGFjayk7XG4gICAgICB9LCBjb250ZXh0KTtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIHRoaXMuX2hhbmRsZUVycm9yKGUsIGNvbnRleHQsIGNoYW5nZSwgc3RhY2spO1xuICAgIH1cbiAgICAvLyBBZnRlciBhbmFseXplIGl0LCBpbnRlcnByZXQgdGhlIG5vZGUgYW5kIHJldHVybiB0aGUgbmV3IHN0YWNrIChpZiBhbnkpLlxuICAgIHZhciBuZXdTdGFjayA9IGlucHQoY29udGV4dCwgY2hhbmdlLCBzdGFjayk7XG4gICAgcmV0dXJuIG5ld1N0YWNrO1xuICB9O1xufTtcblxuTGFuZ3VhZ2UuRXZhbHVhdGUucHJvdG90eXBlLl9oYW5kbGVFcnJvciA9XG5mdW5jdGlvbihlcnIsIGNvbnRleHQsIGNoYW5nZSwgc3RhY2spIHtcbiAgLy8gVE9ETzogZXhwYW5kIGl0IHRvIHByb3ZpZGUgbW9yZSBzb3BoaXN0aWMgZGVidWdnaW5nIG1lc3NhZ2UuXG4gIHRocm93IG5ldyBFcnJvcihgV2hlbiBjaGFuZ2UgJHtjaGFuZ2UudHlwZX0gY29tZXMgZXJyb3IgJyR7ZXJyfScgaGFwcGVuZWRgKTtcbn07XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL2J1aWxkX3N0YWdlL3NyYy9ydW5lL2xhbmd1YWdlLmpzXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgeyBQcm9jZXNzIH0gZnJvbSAnc3JjL3Byb2Nlc3MvcHJvY2Vzcy5qcyc7XG5cbi8qKlxuICogQ29tYmluZSB0aGUgYWJpbGl0aWVzIG9mIHRoZSBldmVudCBoYW5kbGluZyBhbmQgYXN5bmNocm9ub3VzIG9wZXJhdGlvbnNcbiAqIHNlcXVlbnRpYWxpemluZyB0b2dldGhlci4gU28gdGhhdCBldmVyeSBTdHJlYW0gY291bGQ6XG4gKlxuICogMS4gRm9yIHRoZSBvcmRpbmFyeSBldmVudHMsIGFwcGVuZCBzdGVwcyB0byB0aGUgbWFpbiBQcm9jZXNzIHRvIHF1ZXVlXG4gKiAgICB0aGUgZXZlbnQgaGFuZGxlcnMuXG4gKiAyLiBGb3Igb3RoZXIgdXJnZW50IGV2ZW50cyAoaW50ZXJydXB0cyksIGltbWVkaWF0ZWx5IGV4ZWN1dGUgdGhlIGV2ZW50XG4gKiAgICBoYW5kbGVyIHdpdGhvdXQgcXVldWluZyBpdC5cbiAqIDMuIE9ubHkgcmVjZWl2ZSBldmVudHMgd2hlbiBpdCdzICdyZWFkeScuIEJlZm9yZSB0aGF0LCBubyBzb3VyY2UgZXZlbnRzXG4gKiAgICB3b3VsZCBiZSBmb3J3YXJkZWQgYW5kIGhhbmRsZWQuXG4gKiA0LiBPbmNlIHBoYXNlIGJlY29tZXMgJ3N0b3AnLCBubyBldmVudHMgd291bGQgYmUgcmVjZWl2ZWQgYWdhaW4uXG4gKlxuICogU3RyZWFtIHNob3VsZCBjcmVhdGUgd2l0aCBhIGNvbmZpZ3Mgb2JqZWN0IGlmIHVzZXIgd2FudCB0byBzZXQgdXAgc291cmNlcyxcbiAqIGV2ZW50cyBhbmQgaW50ZXJydXB0cy4gSWYgdGhlcmUgaXMgbm8gc3VjaCBvYmplY3QsIGl0IHdvdWxkIGFjdCBsaWtlIGFcbiAqIFByb2Nlc3MsIGFuZCB3aXRob3V0IGFueSBmdW5jdGlvbiBoYW5kbGVzIGV2ZW50cy5cbiAqKi9cbmV4cG9ydCBmdW5jdGlvbiBTdHJlYW0oY29uZmlncyA9IHt9KSB7XG4gIHRoaXMuY29uZmlncyA9IHtcbiAgICBldmVudHM6IGNvbmZpZ3MuZXZlbnRzIHx8IFtdLFxuICAgIGludGVycnVwdHM6IGNvbmZpZ3MuaW50ZXJydXB0cyB8fCBbXVxuICB9O1xuICBpZiAoY29uZmlncy5zb3VyY2VzICYmIDAgIT09IGNvbmZpZ3Muc291cmNlcy5sZW5ndGgpIHtcbiAgICB0aGlzLmNvbmZpZ3Muc291cmNlcyA9IGNvbmZpZ3Muc291cmNlcztcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmNvbmZpZ3Muc291cmNlcyA9IFtdO1xuICB9XG4gIHRoaXMuX2ZvcndhcmRUbyA9IG51bGw7XG4gIC8vIE5lZWQgdG8gZGVsZWdhdGUgdG8gU291cmNlLlxuICB0aGlzLm9uY2hhbmdlID0gdGhpcy5vbmNoYW5nZS5iaW5kKHRoaXMpO1xufVxuXG5TdHJlYW0ucHJvdG90eXBlLnBoYXNlID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnByb2Nlc3MuX3J1bnRpbWUuc3RhdGVzLnBoYXNlO1xufTtcblxuU3RyZWFtLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKGZvcndhcmRUbykge1xuICB0aGlzLl9mb3J3YXJkVG8gPSBmb3J3YXJkVG87XG4gIHRoaXMucHJvY2VzcyA9IG5ldyBQcm9jZXNzKCk7XG4gIHRoaXMucHJvY2Vzcy5zdGFydCgpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogS2ljayBvZmYgU291cmNlIGFuZCBzdGFydCBkbyB0aGluZ3MuXG4gKi9cblN0cmVhbS5wcm90b3R5cGUucmVhZHkgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5jb25maWdzLnNvdXJjZXMuZm9yRWFjaCgoc291cmNlKSA9PiB7XG4gICAgc291cmNlLnN0YXJ0KHRoaXMub25jaGFuZ2UpO1xuICB9KTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5TdHJlYW0ucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5wcm9jZXNzLnN0b3AoKTtcbiAgdGhpcy5jb25maWdzLnNvdXJjZXMuZm9yRWFjaCgoc291cmNlKSA9PiB7XG4gICAgc291cmNlLnN0b3AoKTtcbiAgfSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuU3RyZWFtLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMucHJvY2Vzcy5kZXN0cm95KCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuU3RyZWFtLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24oc3RlcCkge1xuICB0aGlzLnByb2Nlc3MubmV4dChzdGVwKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5TdHJlYW0ucHJvdG90eXBlLnJlc2N1ZSA9IGZ1bmN0aW9uKHJlc2N1ZXIpIHtcbiAgdGhpcy5wcm9jZXNzLnJlc2N1ZShyZXNjdWVyKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJldHVybiBhIFByb21pc2UgZ2V0IHJlc29sdmVkIHdoZW4gdGhlIHN0cmVhbSB0dXJuIHRvXG4gKiB0aGUgc3BlY2lmaWMgcGhhc2UuIEZvciBleGFtcGxlOlxuICpcbiAqICAgIHN0cmVhbS51bnRpbCgnc3RvcCcpXG4gKiAgICAgICAgICAudGhlbigoKSA9PiB7IGNvbnNvbGUubG9nKCdzdHJlYW0gc3RvcHBlZCcpIH0pO1xuICogICAgc3RyZWFtLnN0YXJ0KCk7XG4gKi9cblN0cmVhbS5wcm90b3R5cGUudW50aWwgPSBmdW5jdGlvbihwaGFzZSkge1xuICByZXR1cm4gdGhpcy5wcm9jZXNzLnVudGlsKHBoYXNlKTtcbn07XG5cbi8qKlxuICogT25seSB3aGVuIGFsbCB0YXNrcyBwYXNzZWQgaW4gZ2V0IHJlc29sdmVkLFxuICogdGhlIHByb2Nlc3Mgd291bGQgZ28gdG8gdGhlIG5leHQuXG4gKi9cblN0cmVhbS5wcm90b3R5cGUud2FpdCA9IGZ1bmN0aW9uKHRhc2tzKSB7XG4gIHRoaXMucHJvY2Vzcy53YWl0KHRhc2tzKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEl0IHdvdWxkIHJlY2VpdmUgZXZlbnRzIGZyb20gU291cmNlLCBhbmQgdGhhbiBxdWV1ZSBvciBub3QgcXVldWVcbiAqIGl0LCBkZXBlbmRzIG9uIHdoZXRoZXIgdGhlIGV2ZW50IGlzIGFuIGludGVycnVwdC5cbiAqL1xuU3RyZWFtLnByb3RvdHlwZS5vbmNoYW5nZSA9IGZ1bmN0aW9uKGV2dCkge1xuICBpZiAoJ3N0YXJ0JyAhPT0gdGhpcy5wcm9jZXNzLl9ydW50aW1lLnN0YXRlcy5waGFzZSkge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIGlmICgtMSAhPT0gdGhpcy5jb25maWdzLmludGVycnVwdHMuaW5kZXhPZihldnQudHlwZSkpIHtcbiAgICAvLyBJbnRlcnJ1cHQgd291bGQgYmUgaGFuZGxlZCBpbW1lZGlhdGVseS5cbiAgICB0aGlzLl9mb3J3YXJkVG8oZXZ0KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSBlbHNlIHtcbiAgICAvLyBFdmVudCB3b3VsZCBiZSBoYW5kbGVkIGFmdGVyIHF1ZXVpbmcuXG4gICAgLy8gVGhpcyBpcywgaWYgdGhlIGV2ZW50IGhhbmRsZSByZXR1cm4gYSBQcm9taXNlIG9yIFByb2Nlc3MsXG4gICAgLy8gdGhhdCBjYW4gYmUgZnVsZmlsbGVkIGxhdGVyLlxuICAgIHRoaXMucHJvY2Vzcy5uZXh0KCgpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLl9mb3J3YXJkVG8oZXZ0KTtcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxufTtcblxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9idWlsZF9zdGFnZS9zcmMvc3RyZWFtL3N0cmVhbS5qc1xuICoqLyIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHsgSW50ZXJmYWNlIH0gZnJvbSAnc3JjL3Byb2Nlc3MvaW50ZXJmYWNlLmpzJztcbmltcG9ydCB7IFJ1bnRpbWUgfSBmcm9tICdzcmMvcHJvY2Vzcy9ydW50aW1lLmpzJztcblxuLyoqXG4gKiBUaGUgY29yZSBjb21wb25lbnQgdG8gc2VxdWVudGlhbGl6ZSBhc3luY2hyb25vdXMgc3RlcHMuXG4gKiBCYXNpY2FsbHkgaXQncyBhbiAnaW50ZXJydXB0YWJsZSBwcm9taXNlJywgYnV0IG1vcmUgdGhhbiBiZSBpbnRlcnJ1cHRlZCxcbiAqIGl0IGNvdWxkICdzaGlmdCcgZnJvbSBvbmUgdG8gYW5vdGhlciBwaGFzZSwgd2l0aCB0aGUgbm9uLXByZWVtcHRpdmVcbiAqIGludGVycnVwdGluZyBtb2RlbC5cbiAqXG4gKiBFeGFtcGxlOlxuICogICAgdmFyIHByb2Nlc3MgPSBuZXcgUHJvY2VzcygpO1xuICogICAgcHJvY2Vzcy5zdGFydCgpICAgICAgIC8vIHRoZSBkZWZhdWx0IHBoYXNlIGlzICdzdGFydCdcbiAqICAgICAgICAgICAubmV4dChzdGVwQSlcbiAqICAgICAgICAgICAubmV4dChzdGVwQilcbiAqICAgICAgICAgICAuLi5cbiAqICAgIC8vIGxhdGVyLCBzb21lIHVyZ2VudCBldmVudHMgY29tZVxuICogICAgcHJvY2Vzcy5zdG9wKCkgICAgICAgLy8gb25lIG9mIHRoZSBkZWZhdWx0IHRocmVlIHBoYXNlc1xuICogICAgICAgICAgIC5uZXh0KHN0b3BTdGVwQSlcbiAqICAgICAgICAgICAubmV4dChzdG9wU3RlcEIpXG4gKiAgICAgICAgICAgLi4uLlxuICogICAvLyBsYXRlciwgc29tZSBvdGhlciBpbnRlcnJ1cHRzIGNvbWVcbiAqICAgcHJvY2Vzcy5zaGlmdCgnc3RvcCcsICdkaXp6eScpXG4gKiAgICAgICAgICAubmV4dChkaXp6eVN0ZXBBKVxuICogICAgICAgICAgLm5leHQoZGl6enlTdGVwQilcbiAqXG4gKiBUaGUgcGhhc2VzIGxpc3RlZCBhYm92ZSB3b3VsZCBpbW1lZGlhdGVseSBpbnRlcnJ1cHQgdGhlIHN0ZXBzIHNjaGVkdWxlZFxuICogYXQgdGhlIHByZXZpb3VzIHBoYXNlLiBIb3dldmVyLCB0aGlzIGlzIGEgKm5vbi1wcmVlbXB0aXZlKiBwcm9jZXNzIGJ5XG4gKiBkZWZhdWx0LiBTbywgaWYgdGhlcmUgaXMgYSBsb25nLXdhaXRpbmcgUHJvbWlzZSBzdGVwIGluIHRoZSAnc3RhcnQnIHBoYXNlOlxuICpcbiAqICAgcHJvY2Vzcy5zdGFydCgpXG4gKiAgICAgICAgICAubmV4dCggbG9uZ2xvbmdsb25nV2FpdGluZ1Byb21pc2UgKSAgIC8vIDwtLS0gbm93IGl0J3Mgd2FpdGluZyB0aGlzXG4gKiAgICAgICAgICAubmV4dCggdGhpc1N0ZXBJc1N0YXJ2aW5nIClcbiAqICAgICAgICAgIC5uZXh0KCBhbmRUaGlzT25lVG9vIClcbiAqICAgICAgICAgIC5uZXh0KCBwb29yU3RlcHMgKVxuICogICAgICAgICAgLi4uLlxuICogICAvLyBzb21lIHVyZ2VudCBldmVudCBvY2N1cnMgd2hlbiBpdCBnb2VzIHRvIHRoZSBsb25nIHdhaXRpbmcgcHJvbWlzZVxuICogICBwcm9jZXNzLnN0b3AoKVxuICogICAgICAgICAgLm5leHQoIGRvVGhpc0FzUXVpY2tBc1Bvc3NpYmxlIClcbiAqXG4gKiBUaGUgZmlyc3Qgc3RlcCBvZiB0aGUgJ3N0b3AnIHBoYXNlLCBuYW1lbHkgdGhlICdkb1RoaXNBc1F1aWNrQXNQb3NzaWJsZScsXG4gKiB3b3VsZCAqbm90KiBnZXQgZXhlY3V0ZWQgaW1tZWRpYXRlbHksIHNpbmNlIHRoZSBwcm9taXNlIGlzIHN0aWxsIHdhaXRpbmcgdGhlXG4gKiBsYXN0IHN0ZXAgZWFybGllciBpbnRlcnJ1cHRpb24uIFNvLCBldmVuIHRoZSBmb2xsb3dpbmcgc3RlcHMgb2YgdGhlICdzdGFydCdcbiAqIHBoYXNlIHdvdWxkIGFsbCBnZXQgZHJvcHBlZCwgdGhlIG5ldyBwaGFzZSBzdGlsbCBuZWVkIHRvIHdhaXQgdGhlIGxhc3Qgb25lXG4gKiBhc3luY2hyb25vdXMgc3RlcCBnZXQgcmVzb2x2ZWQgdG8gZ2V0IGtpY2tlZCBvZmYuXG4gKlxuICogLS0tXG4gKiAjIyBBYm91dCB0aGUgbm9uLXByZWVtcHRpdmUgbW9kZWxcbiAqXG4gKiBUaGUgcmVhc29uIHdoeSB3ZSBjYW4ndCBoYXZlIGEgcHJlZW1wdGl2ZSBwcm9jZXNzIGlzIGJlY2F1c2Ugd2UgY291bGRuJ3RcbiAqIGludGVycnVwdCBlYWNoIHNpbmdsZSBzdGVwIGluIHRoZSBwcm9jZXNzLCBzbyB0aGUgbW9zdCBiYXNpYyB1bml0IGNvdWxkIGJlXG4gKiBpbnRlcnJ1cHRlZCBpcyB0aGUgc3RlcC4gU28sIHRoZSBjYXZlYXQgaGVyZSBpcyBtYWtlIHRoZSBzdGVwIGFzIHNtYWxsIGFzXG4gKiBwb3NzaWJsZSwgYW5kIHRyZWF0IGl0IGFzIHNvbWUgYXRvbWljIG9wZXJhdGlvbiB0aGF0IGd1YXJhbnRlZWQgdG8gbm90IGJlZW5cbiAqIGludGVycnVwdGVkIGJ5IFByb2Nlc3MuIEZvciBleGFtcGxlLCBpZiB3ZSBhbGlhcyAnbmV4dCcgYXMgJ2F0b21pYyc6XG4gKlxuICogICAgcHJvY2Vzcy5zdGFydCgpXG4gKiAgICAgICAgICAgLmF0b21pYyhzdGVwQSkgICAgICAgLy8gPC0tLSBub3cgaXQncyB3YWl0aW5nIHRoaXNcbiAqICAgICAgICAgICAuYXRvbWljKHN0ZXBCKVxuICpcbiAqICAgLy8gc29tZSB1cmdlbnQgZXZlbnQgb2NjdXJzXG4gKiAgIHByb2Nlc3Muc3RvcCgpXG4gKiAgICAgICAgICAuYXRvbWljKCBkb1RoaXNBc1F1aWNrQXNQb3NzaWJsZSApXG4gKlxuICogSXQgd291bGQgYmUgYmV0dGVyIHRoYW46XG4gKlxuICogICAgcHJvY2Vzcy5zdGFydCgpXG4gKiAgICAgICAgICAgLmF0b21pYygoKSA9PiBzdGVwQS50aGVuKHN0ZXBCKSlcbiAqXG4gKiAgIC8vIHNvbWUgdXJnZW50IGV2ZW50IG9jY3Vyc1xuICogICBwcm9jZXNzLnN0b3AoKVxuICogICAgICAgICAgLmF0b21pYyggZG9UaGlzQXNRdWlja0FzUG9zc2libGUgKVxuICpcbiAqIFNpbmNlIGluIHRoZSBzZWNvbmQgZXhhbXBsZSB0aGUgZmlyc3Qgc3RlcCBvZiB0aGUgJ3N0b3AnIHBoYXNlIG11c3Qgd2FpdFxuICogYm90aCB0aGUgc3RlcEEgJiBzdGVwQiwgd2hpbGUgaW4gdGhlIGZpcnN0IG9uZSBpdCBvbmx5IG5lZWRzIHRvIHdhaXQgc3RlcEEuXG4gKiBIb3dldmVyLCB0aGlzIGRlcGVuZHMgb24gd2hpY2ggYXRvbWljIG9wZXJhdGlvbnMgaXMgbmVlZGVkLlxuICpcbiAqIE5ldmVydGhlbGVzcywgdXNlciBpcyBhYmxlIHRvIG1ha2UgdGhlIHN0ZXBzICdpbnRlcnJ1cHRpYmxlJyB2aWEgc29tZSBzcGVjaWFsXG4gKiBtZXRob2RzIG9mIHRoZSBwcm9jZXNzLiBUaGF0IGlzLCB0byBtb25pdG9yIHRoZSBwaGFzZSBjaGFuZ2VzIHRvIG51bGxpZnkgdGhlXG4gKiBzdGVwOlxuICpcbiAqICAgIHZhciBwcm9jZXNzID0gbmV3IFByb2Nlc3MoKTtcbiAqICAgIHByb2Nlc3Muc3RhcnQoKVxuICogICAgICAubmV4dCgoKSA9PiB7XG4gKiAgICAgICAgdmFyIHBoYXNlU2hpZnRlZCA9IGZhbHNlO1xuICogICAgICAgIHByb2Nlc3MudW50aWwoJ3N0b3AnKVxuICogICAgICAgICAgLm5leHQoKCkgPT4ge3BoYXNlU2hpZnRlZCA9IHRydWU7fSk7XG4gKiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyLCByaikgPT4ge1xuICogICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gKiAgICAgICAgICAgIGlmIChwaGFzZVNoaWZ0ZWQpIHsgY29uc29sZS5sb2coJ2RvIG5vdGhpbmcnKTsgfVxuICogICAgICAgICAgICBlbHNlICAgICAgICAgICAgICB7IGNvbnNvbGUubG9nKCdkbyBzb21ldGhpbmcnKTsgfVxuICogICAgICAgICAgfSwgMTAwMClcbiAqICAgICAgICB9KTtcbiAqICAgICAgfSlcbiAqXG4gKiAgIC8vIHNvbWUgdXJnZW50IGV2ZW50IG9jY3Vyc1xuICogICBwcm9jZXNzLnN0b3AoKVxuICogICAgICAgICAgLm5leHQoIGRvVGhpc0FzUXVpY2tBc1Bvc3NpYmxlIClcbiAqXG4gKiBTbyB0aGF0IHRoZSBmaXJzdCBzdGVwIG9mIHRoZSAnc3RvcCcgcGhhc2Ugd291bGQgZXhlY3V0ZSBpbW1lZGlhdGVseSBhZnRlclxuICogdGhlIHBoYXNlIHNoaWZ0ZWQsIHNpbmNlIHRoZSBsYXN0IHN0ZXAgb2YgdGhlIHByZXZpb3VzIHBoYXNlIGFib3J0ZWQgaXRzZWxmLlxuICogSW4gZnV0dXJlIHRoZSB0cmljayB0byBudWxsaWZ5IHRoZSBsYXN0IHN0ZXAgbWF5IGJlIGluY2x1ZGVkIGluIGFzIGEgbWV0aG9kXG4gKiBvZiBQcm9jZXNzLCBidXQgY3VycmVudGx5IHRoZSBtYW51YWwgZGV0ZWN0aW5nIGlzIHN0aWxsIG5lY2Vzc2FyeS5cbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gUHJvY2VzcygpIHtcbiAgdGhpcy5fcnVudGltZSA9IG5ldyBSdW50aW1lKCk7XG4gIHRoaXMuX2ludGVyZmFjZSA9IG5ldyBJbnRlcmZhY2UodGhpcy5fcnVudGltZSk7XG4gIHJldHVybiB0aGlzLl9pbnRlcmZhY2U7XG59XG5cbi8qKlxuICogQmVjYXVzZSBEUlkuXG4gKi9cblByb2Nlc3MuZGVmZXIgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHJlc29sdmUsIHJlamVjdDtcbiAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IHtcbiAgICByZXNvbHZlID0gcmVzO1xuICAgIHJlamVjdCA9IHJlajtcbiAgfSk7XG4gIHZhciByZXN1bHQgPSB7XG4gICAgJ3Jlc29sdmUnOiByZXNvbHZlLFxuICAgICdyZWplY3QnOiByZWplY3QsXG4gICAgJ3Byb21pc2UnOiBwcm9taXNlXG4gIH07XG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKiBTdGF0aWMgdmVyc2lvbiBmb3IgbWltaWNraW5nIFByb21pc2UuYWxsICovXG5Qcm9jZXNzLndhaXQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHByb2Nlc3MgPSBuZXcgUHJvY2VzcygpO1xuICByZXR1cm4gcHJvY2Vzcy5zdGFydCgpLndhaXQuYXBwbHkocHJvY2VzcywgYXJndW1lbnRzKTtcbn07XG5cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vYnVpbGRfc3RhZ2Uvc3JjL3Byb2Nlc3MvcHJvY2Vzcy5qc1xuICoqLyIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHsgTGFuZ3VhZ2UgfSBmcm9tICdzcmMvcnVuZS9sYW5ndWFnZS5qcyc7XG5cbi8qKlxuICogVGhpcyBsYW5ndWFnZSBpbnRlcmZhY2Ugd291bGQgcHJvdmlkZSBjYWxsYWJsZSBtZXRob2RzIG9mIHRoZSBQcm9jZXNzIGVEU0wuXG4gKlxuICogVGhlIGRpZmZlcmVuY2UgYmV0d2VlbiBpbnRlcmZhbmNlICYgcnVudGltZSBpczpcbiAqXG4gKiAgSW50ZXJmYWNlOiBtYW5hZ2UgdGhlIHN0YWNrIGFuZCBwcm92aWRlcyBhbmFseXplcnMgaWYgaXQncyBuZWNlc3NhcnkuXG4gKiAgUnVudGltZTogZXZhbHVhdGUgZXZlcnkgY2hhbmdlIChub2RlKSBvZiB0aGUgc3RhY2suXG4gKlxuICogU28gdGhpcyBpbnRlcmZhY2Ugd291bGQgY2hlY2sgaWYgdGhlcmUgYXJlIGFueSAnc3ludGF4JyBlcnJvciBkdXJpbmcgY29tcG9zZVxuICogdGhlIGVEU0wgaW5zdGFuY2UuIEZvciBleGFtcGxlLCB0aGUgYW5hbHl6ZXIgb2YgdGhlIGludGVyZmFjZSBjb3VsZCByZXBvcnRcbiAqIHRoaXMga2luZCBvZiBlcnJvcjpcbiAqXG4gKiAgcHJvY2Vzcy5zdG9wKCkuc3RhcnQoKS5uZXh0KCk7ICAgIC8vIEVSUk9SOiAnc3RvcCcgYmVmb3JlICdzdGFydCdcbiAqXG4gKiBBbmQgc2luY2UgdGhlIGludGVyZmFjZSB3b3VsZCBub3QgZXZhbHVhdGUgbm9kZXMsIGl0IHdvdWxkIGZvcndhcmQgc3RhY2tcbiAqIGNoYW5nZXMgdG8gdGhlIHJ1bnRpbWUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJbnRlcmZhY2UocnVudGltZSkge1xuICAvLyBSZXF1aXJlZCBieSB0aGUgJ0xhbmd1YWdlJyBtb2R1bGUuXG4gIHRoaXMuY29udGV4dCA9IHtcbiAgICBzdGFydGVkOiBmYWxzZSxcbiAgICBzdG9wcGVkOiBmYWxzZVxuICB9O1xuICB0aGlzLnN0YWNrID0gW107XG4gIHRoaXMuX3J1bnRpbWUgPSBydW50aW1lO1xuICB0aGlzLl9ldmFsdWF0b3IgPSAobmV3IExhbmd1YWdlLkV2YWx1YXRlKCkpXG4gICAgLmFuYWx5emVyKHRoaXMuX2FuYWx5emVPcmRlci5iaW5kKHRoaXMpKVxuICAgIC5pbnRlcnByZXRlcih0aGlzLl9pbnRlcnByZXQuYmluZCh0aGlzKSk7XG59XG5cbkludGVyZmFjZS5wcm90b3R5cGUuc3RhcnQgPSBMYW5ndWFnZS5kZWZpbmUoJ3N0YXJ0JywgJ2JlZ2luJyk7XG5JbnRlcmZhY2UucHJvdG90eXBlLnN0b3AgPSBMYW5ndWFnZS5kZWZpbmUoJ3N0b3AnLCAncHVzaCcpO1xuSW50ZXJmYWNlLnByb3RvdHlwZS5kZXN0cm95ID0gTGFuZ3VhZ2UuZGVmaW5lKCdkZXN0cm95JywgJ3B1c2gnKTtcbkludGVyZmFjZS5wcm90b3R5cGUubmV4dCA9IExhbmd1YWdlLmRlZmluZSgnbmV4dCcsICdwdXNoJyk7XG5JbnRlcmZhY2UucHJvdG90eXBlLnNoaWZ0ID0gTGFuZ3VhZ2UuZGVmaW5lKCdzaGlmdCcsICdwdXNoJyk7XG5JbnRlcmZhY2UucHJvdG90eXBlLnJlc2N1ZSA9IExhbmd1YWdlLmRlZmluZSgncmVzY3VlJywgJ3B1c2gnKTtcbkludGVyZmFjZS5wcm90b3R5cGUud2FpdCA9IExhbmd1YWdlLmRlZmluZSgnd2FpdCcsICdwdXNoJyk7XG5cbi8vIEl0J3Mgbm90IGEgbWV0aG9kIG93bnMgc2VtYW50aWNzIG1lYW5pbmcgb2YgdGhlIGVEU0wsIGJ1dCBhIG1ldGhvZFxuLy8gaW50ZXJhY3RzIHdpdGggdGhlIG1ldGFsYW5nYXVnZSwgc28gZGVmaW5lIGl0IGluIHRoaXMgd2F5LlxuSW50ZXJmYWNlLnByb3RvdHlwZS51bnRpbCA9XG5mdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuX3J1bnRpbWUudW50aWwuYXBwbHkodGhpcy5fcnVudGltZSwgYXJndW1lbnRzKTtcbn07XG5cbkludGVyZmFjZS5wcm90b3R5cGUub25jaGFuZ2UgPSBmdW5jdGlvbihjb250ZXh0LCBub2RlLCBzdGFjaykge1xuICAvLyBXaGVuIGl0J3MgY2hhbmdlZCwgZXZhbHVhdGUgaXQgd2l0aCBhbmFseXplcnMgJiBpbnRlcnByZXRlci5cbiAgcmV0dXJuIHRoaXMuX2V2YWx1YXRvcihjb250ZXh0LCBub2RlLCBzdGFjayk7XG59O1xuXG5JbnRlcmZhY2UucHJvdG90eXBlLl9pbnRlcnByZXQgPSBmdW5jdGlvbihjb250ZXh0LCBub2RlLCBzdGFjaykge1xuICAvLyBXZWxsIGluIHRoaXMgZURTTCB3ZSBkZWxlZ2F0ZSB0aGUgaW50ZXJwcmV0aW9uIHRvIHRoZSBydW50aW1lLlxuICByZXR1cm4gdGhpcy5fcnVudGltZS5vbmNoYW5nZS5hcHBseSh0aGlzLl9ydW50aW1lLCBhcmd1bWVudHMpO1xufTtcblxuLy8gSW4gdGhpcyBlRFNMIHdlIG5vdyBvbmx5IGhhdmUgdGhpcyBhbmFseXplci4gQ291bGQgYWRkIG1vcmUgYW5kIHJlZ2lzdGVyIGl0XG4vLyBpbiB0aGUgY29udHJ1Y3Rpb24gb2YgJ3RoaXMuX2V2YWx1YXRvcicuXG5JbnRlcmZhY2UucHJvdG90eXBlLl9hbmFseXplT3JkZXIgPSBmdW5jdGlvbihjb250ZXh0LCBjaGFuZ2UsIHN0YWNrKSB7XG4gIGlmICgnc3RhcnQnID09PSBjaGFuZ2UudHlwZSkge1xuICAgIGNvbnRleHQuc3RhcnRlZCA9IHRydWU7XG4gIH0gZWxzZSBpZiAoJ3N0b3AnKSB7XG4gICAgY29udGV4dC5zdG9wcGVkID0gdHJ1ZTtcbiAgfVxuICBpZiAoJ3N0YXJ0JyA9PT0gY2hhbmdlLnR5cGUgJiYgY29udGV4dC5zdG9wcGVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdTaG91bGQgbm90IHN0YXJ0IGEgcHJvY2VzcyBhZ2FpbicgK1xuICAgICAgICAnYWZ0ZXIgaXRcXCdzIGFscmVhZHkgc3RvcHBlZCcpO1xuICB9IGVsc2UgaWYgKCduZXh0JyA9PT0gY2hhbmdlLnR5cGUgJiYgIWNvbnRleHQuc3RhcnRlZCkge1xuICAgIHRocm93IG5ldyBFcnJvcignU2hvdWxkIG5vdCBjb25jYXQgc3RlcHMgd2hpbGUgaXRcXCdzIG5vdCBzdGFydGVkJyk7XG4gIH0gZWxzZSBpZiAoJ3N0b3AnID09PSBjaGFuZ2UudHlwZSAmJiAhY29udGV4dC5zdGFydGVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdTaG91bGQgbm90IHN0b3AgYSBwcm9jZXNzIGJlZm9yZSBpdFxcJ3Mgc3RhcnRlZCcpO1xuICB9XG59O1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9idWlsZF9zdGFnZS9zcmMvcHJvY2Vzcy9pbnRlcmZhY2UuanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBSdW50aW1lKCkge1xuICB0aGlzLnN0YXRlcyA9IHtcbiAgICBwaGFzZTogbnVsbCxcbiAgICBjdXJyZW50UHJvbWlzZTogbnVsbCxcbiAgICB1bnRpbDoge1xuICAgICAgcmVzb2x2ZXI6IG51bGwsXG4gICAgICBwaGFzZTogbnVsbFxuICAgIH0sXG4gICAgLy8gQHNlZTogI25leHRcbiAgICBzdGVwUmVzdWx0czogW10sXG4gIH07XG4gIHRoaXMuZGVidWdnaW5nID0ge1xuICAgIC8vIEBzZWU6ICNuZXh0XG4gICAgY3VycmVudFBoYXNlU3RlcHM6IDAsXG4gICAgY29sb3JzOiB0aGlzLmdlbmVyYXRlRGVidWdnaW5nQ29sb3IoKSxcbiAgICB0cnVuY2F0aW5nTGltaXQ6IDY0XG4gIH07XG4gIHRoaXMuY29uZmlncyA9IHtcbiAgICBkZWJ1ZzogZmFsc2VcbiAgfTtcbn1cblxuLyoqXG4gKiBXaGVuIHRoZSBzdGFjayBvZiBEU0wgY2hhbmdlcywgZXZhbHVhdGUgdGhlIExhbmd1YWdlLk5vZGUuXG4gKiBOb3RlOiBzaW5jZSBpbiB0aGlzIERTTCB3ZSBuZWVkbid0ICdleGl0JyBub2RlLCB3ZSBkb24ndCBoYW5kbGUgaXQuXG4gKiBGb3Igc29tZSBvdGhlciBEU0wgdGhhdCBtYXkgcmV0dXJuIHNvbWV0aGluZywgdGhlICdleGl0JyBub2RlIG11c3RcbiAqIGtlZXAgYSBmaW5hbCBzdGFjayB3aXRoIG9ubHkgcmVzdWx0IG5vZGUgaW5zaWRlIGFzIHRoZXIgcmV0dXJuIHZhbHVlLlxuICovXG5SdW50aW1lLnByb3RvdHlwZS5vbmNoYW5nZSA9IGZ1bmN0aW9uKGluc3RhbmNlLCBjaGFuZ2UsIHN0YWNrKSB7XG4gIC8vIFNpbmNlIHdlIGRvbid0IG5lZWQgdG8ga2VlcCB0aGluZ3MgaW4gc3RhY2sgdW50aWwgd2UgaGF2ZVxuICAvLyByZWFsIGFuYWx5emVycywgdGhlICdvbmNoYW5nZScgaGFuZGxlciB3b3VsZCByZXR1cm4gZW1wdHkgc3RhY2tcbiAgLy8gdG8gbGV0IHRoZSBsYW5ndWFnZSBydW50aW1lIGNsZWFyIHRoZSBzdGFjayBldmVyeSBpbnN0cnVjdGlvbi5cbiAgdGhpc1tjaGFuZ2UudHlwZV0uYXBwbHkodGhpcywgY2hhbmdlLmFyZ3MpO1xuICByZXR1cm4gW107XG59O1xuXG5cblJ1bnRpbWUucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuc3RhdGVzLnBoYXNlID0gJ3N0YXJ0JztcbiAgdGhpcy5zdGF0ZXMuY3VycmVudFByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoKTtcbn07XG5cblJ1bnRpbWUucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5zaGlmdCgnc3RhcnQnLCAnc3RvcCcpO1xufTtcblxuUnVudGltZS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnNoaWZ0KCdzdG9wJywgJ2Rlc3Ryb3knKTtcbn07XG5cblJ1bnRpbWUucHJvdG90eXBlLnNoaWZ0ID0gZnVuY3Rpb24ocHJldiwgY3VycmVudCkge1xuICAvLyBBbHJlYWR5IGluLlxuICBpZiAoY3VycmVudCA9PT0gdGhpcy5zdGF0ZXMucGhhc2UpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKHByZXYgIT09IHRoaXMuc3RhdGVzLnBoYXNlKSB7XG4gICAgdmFyIGVycm9yID0gbmV3IEVycm9yKGBNdXN0IGJlICR7cHJldn0gYmVmb3JlIHNoaWZ0IHRvICR7Y3VycmVudH0sXG4gICAgICAgICAgICAgICAgICAgICBidXQgbm93IGl0J3MgJHt0aGlzLnN0YXRlcy5waGFzZX1gKTtcbiAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxuICB0aGlzLnN0YXRlcy5waGFzZSA9IGN1cnJlbnQ7XG4gIGlmICh0aGlzLnVudGlsLnBoYXNlID09PSB0aGlzLnN0YXRlcy5waGFzZSkge1xuICAgIHRoaXMudW50aWwucmVzb2x2ZXIoKTtcbiAgfVxuICAvLyBDb25jYXQgbmV3IHN0ZXAgdG8gc3dpdGNoIHRvIHRoZSAnbmV4dCBwcm9taXNlJy5cbiAgdGhpcy5zdGF0ZXMuY3VycmVudFByb21pc2UgPVxuICB0aGlzLnN0YXRlcy5jdXJyZW50UHJvbWlzZS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgaWYgKCEoZXJyIGluc3RhbmNlb2YgUnVudGltZS5JbnRlcnJ1cHRFcnJvcikpIHtcbiAgICAgIC8vIFdlIG5lZWQgdG8gcmUtdGhyb3cgaXQgYWdhaW4gYW5kIGJ5cGFzcyB0aGUgd2hvbGVcbiAgICAgIC8vIHBoYXNlLCB1bnRpbCB0aGUgbmV4dCBwaGFzZSAoZmluYWwgcGhhc2UpIHRvXG4gICAgICAvLyBoYW5kbGUgaXQuIFNpbmNlIGluIFByb21pc2UsIHN0ZXBzIGFmdGVyIGNhdGNoIHdvdWxkXG4gICAgICAvLyBub3QgYmUgYWZmZWN0ZWQgYnkgdGhlIGNhdGNoZWQgZXJyb3IgYW5kIGtlZXAgZXhlY3V0aW5nLlxuICAgICAgdGhyb3cgZXJyO1xuICAgIH1cbiAgICAvLyBBbmQgaWYgaXQncyBhbiBpbnRlcnJ1cHQgZXJyb3Igd2UgZG8gbm90aGluZywgc28gdGhhdCBpdCB3b3VsZFxuICAgIC8vIG1ha2UgdGhlIGNoYWluIG9taXQgdGhpcyBlcnJvciBhbmQgZXhlY3V0ZSB0aGUgZm9sbG93aW5nIHN0ZXBzLlxuICB9KTtcbiAgLy8gQXQgdGhlIG1vbWVudCBvZiBzaGlmdGluZywgdGhlcmUgYXJlIG5vIHN0ZXBzIGJlbG9uZyB0byB0aGUgbmV3IHBoYXNlLlxuICB0aGlzLmRlYnVnZ2luZy5jdXJyZW50UGhhc2VTdGVwcyA9IDA7XG59O1xuXG4vKipcbiAqIFJldHVybiBhIFByb21pc2UgdGhhdCBvbmx5IGJlIHJlc29sdmVkIHdoZW4gd2UgZ2V0IHNoaWZlZCB0byB0aGVcbiAqIHRhcmdldCBwaGFzZS5cbiAqL1xuUnVudGltZS5wcm90b3R5cGUudW50aWwgPSBmdW5jdGlvbihwaGFzZSkge1xuICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXMpID0+IHtcbiAgICB0aGlzLnN0YXRlcy51bnRpbC5yZXNvbHZlciA9IHJlcztcbiAgfSk7XG4gIHJldHVybiBwcm9taXNlO1xufTtcblxuLyoqXG4gKiBUaGUgJ3N0ZXAnIGNhbiBvbmx5IGJlIGEgZnVuY3Rpb24gcmV0dXJuIFByb21pc2UvUHJvY2Vzcy9wbGFpbiB2YWx1ZS5cbiAqIE5vIG1hdHRlciBhIFByb21pc2Ugb3IgUHJvY2VzcyBpdCB3b3VsZCByZXR1cm4sXG4gKiB0aGUgY2hhaW4gd291bGQgY29uY2F0IGl0IGFzIHRoZSBQcm9taXNlIHJ1bGUuXG4gKiBJZiBpdCdzIHBsYWluIHZhbHVlIHRoZW4gdGhpcyBwcm9jZXNzIHdvdWxkIGlnbm9yZSBpdCwgYXNcbiAqIHdoYXQgYSBQcm9taXNlIGRvZXMuXG4gKlxuICogQWJvdXQgdGhlIHJlc29sdmluZyB2YWx1ZXM6XG4gKlxuICogLm5leHQoIGZuUmVzb2x2ZUEsIGZuUmVzb2x2ZUIgKSAgLS0+ICNzYXZlIFthLCBiXSBpbiB0aGlzIHByb2Nlc3NcbiAqIC5uZXh0KCBmblJlc29sdmVDICkgICAgICAgICAgICAgIC0tPiAjcmVjZWl2ZSBbYSwgYl0gYXMgZmlyc3QgYXJndW1lbnRcbiAqIC5uZXh0KCBmblJlc29sdmVEICkgICAgICAgICAgICAgIC0tPiAjcmVjZWl2ZSBjIGFzIGZpcnN0IGFyZ3VtZW50XG4gKiAubmV4dCggZm5SZXNvbHZlRSwgZm5SZXNvbHZlRikgICAtLT4gI2VhY2ggb2YgdGhlbSByZWNlaXZlIGQgYXMgYXJndW1lbnRcbiAqL1xuUnVudGltZS5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uKC4uLnRhc2tzKSB7XG4gIGlmICghdGhpcy5zdGF0ZXMuY3VycmVudFByb21pc2UpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Byb2Nlc3Mgc2hvdWxkIGluaXRpYWxpemUgd2l0aCB0aGUgYHN0YXJ0YCBtZXRob2QnKTtcbiAgfVxuICAvLyBBdCBkZWZpbml0aW9uIHN0YWdlLCBzZXQgaXQncyBwaGFzZS5cbiAgLy8gQW5kIGNoZWNrIGlmIGl0J3MgYSBmdW5jdGlvbi5cbiAgdGFza3MuZm9yRWFjaCgodGFzaykgPT4ge1xuICAgIGlmICgnZnVuY3Rpb24nICE9PSB0eXBlb2YgdGFzaykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGUgdGFzayBpcyBub3QgYSBmdW5jdGlvbjogJHt0YXNrfWApO1xuICAgIH1cbiAgICB0YXNrLnBoYXNlID0gdGhpcy5zdGF0ZXMucGhhc2U7XG4gICAgaWYgKHRoaXMuY29uZmlncy5kZWJ1Zykge1xuICAgICAgLy8gTXVzdCBhcHBlbmQgc3RhY2sgaW5mb3JtYXRpb24gaGVyZSB0byBsZXQgZGVidWdnZXIgb3V0cHV0XG4gICAgICAvLyBpdCdzIGRlZmluZWQgaW4gd2hlcmUuXG4gICAgICB0YXNrLnRyYWNpbmcgPSB7XG4gICAgICAgIHN0YWNrOiAobmV3IEVycm9yKCkpLnN0YWNrXG4gICAgICB9O1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gRmlyc3QsIGNvbmNhdCBhICd0aGVuJyB0byBjaGVjayBpbnRlcnJ1cHQuXG4gIHRoaXMuc3RhdGVzLmN1cnJlbnRQcm9taXNlID1cbiAgICB0aGlzLnN0YXRlcy5jdXJyZW50UHJvbWlzZS50aGVuKCgpID0+IHtcbiAgICAgIC8vIFdvdWxkIGNoZWNrOiBpZiB0aGUgcGhhc2UgaXQgYmVsb25ncyB0byBpcyBub3Qgd2hhdCB3ZSdyZSBpbixcbiAgICAgIC8vIHRoZSBwcm9jZXNzIG5lZWQgdG8gYmUgaW50ZXJycHV0ZWQuXG4gICAgICBmb3IgKHZhciB0YXNrIG9mIHRhc2tzKSB7XG4gICAgICAgIGlmICh0aGlzLmNoZWNrSW50ZXJydXB0KHRhc2spKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFJ1bnRpbWUuSW50ZXJydXB0RXJyb3IoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gIC8vIFJlYWQgaXQgYXM6XG4gIC8vIDEuIGV4ZWN1dGUgYWxsIHRhc2tzIHRvIGdlbmVyYXRlIHJlc29sdmFibGUtcHJvbWlzZXNcbiAgLy8gMi4gUHJvbWlzZS5hbGwoLi4uKSB0byB3YWl0IHRoZXNlIHJlc29sdmFibGUtcHJvbWlzZXNcbiAgLy8gMy4gYXBwZW5kIGEgZ2VuZXJhbCBlcnJvciBoYW5kbGVyIGFmdGVyIHRoZSBQcm9taXNlLmFsbFxuICAvLyAgICBzbyB0aGF0IGlmIGFueSBlcnJvciBvY2N1cnMgaXQgd291bGQgcHJpbnQgdGhlbSBvdXRcbiAgLy8gU28sIGluY2x1ZGluZyB0aGUgY29kZSBhYm92ZSwgd2Ugd291bGQgaGF2ZTpcbiAgLy9cbiAgLy8gY3VycmVudFByb21pc2Uge1xuICAvLyAgW2NoZWNrSW50ZXJydXB0KHRhc2tzKV1cbiAgLy8gIFtQcm9taXNlLmFsbChbdGFza0ExLCB0YXNrQTIuLi5dKV1cbiAgLy8gIFtlcnJvciBoYW5kbGVyXSArfVxuICAvL1xuICAvLyBUaGUgJ2NoZWNrSW50ZXJydXB0JyBhbmQgJ2Vycm9yIGhhbmRsZXInIHdyYXAgdGhlIGFjdHVhbCBzdGVwc1xuICAvLyB0byBkbyB0aGUgbmVjZXNzYXJ5IGNoZWNrcy5cbiAgdGhpcy5zdGF0ZXMuY3VycmVudFByb21pc2UgPVxuICAgIHRoaXMuc3RhdGVzLmN1cnJlbnRQcm9taXNlLnRoZW4oKCkgPT4gdGhpcy5nZW5lcmF0ZVN0ZXAodGFza3MpKTtcbiAgdGhpcy5zdGF0ZXMuY3VycmVudFByb21pc2UgPVxuICAgIHRoaXMuc3RhdGVzLmN1cnJlbnRQcm9taXNlLmNhdGNoKHRoaXMuZ2VuZXJhdGVFcnJvckxvZ2dlcih7XG4gICAgICAnbnRoLXN0ZXAnOiB0aGlzLmRlYnVnZ2luZy5jdXJyZW50UGhhc2VTdGVwc1xuICAgIH0pKTtcblxuICAvLyBBIHdheSB0byBrbm93IGlmIHRoZXNlIHRhc2tzIGlzIHRoZSBmaXJzdCBzdGVwcyBpbiB0aGUgY3VycmVudCBwaGFzZSxcbiAgLy8gYW5kIGl0J3MgYWxzbyBjb252ZW5pZW50IGZvciBkZWJ1Z2dpbmcuXG4gIHRoaXMuZGVidWdnaW5nLmN1cnJlbnRQaGFzZVN0ZXBzICs9IDE7XG5cbn07XG5cblJ1bnRpbWUucHJvdG90eXBlLnJlc2N1ZSA9IGZ1bmN0aW9uKGhhbmRsZXIpIHtcbiAgdGhpcy5zdGF0ZXMuY3VycmVudFByb21pc2UgPVxuICAgIHRoaXMuc3RhdGVzLmN1cnJlbnRQcm9taXNlLmNhdGNoKChlcnIpID0+IHtcbiAgICBpZiAoZXJyIGluc3RhbmNlb2YgUnVudGltZS5JbnRlcnJ1cHRFcnJvcikge1xuICAgICAgLy8gT25seSBidWlsdC1pbiBwaGFzZSB0cmFuc2ZlcnJpbmcgY2F0Y2ggY2FuIGhhbmRsZSBpbnRlcnJ1cHRzLlxuICAgICAgLy8gUmUtdGhyb3cgaXQgdW50aWwgd2UgcmVhY2ggdGhlIGZpbmFsIGNhdGNoIHdlIHNldC5cbiAgICAgIHRocm93IGVycjtcbiAgICB9IGVsc2Uge1xuICAgICAgaGFuZGxlcihlcnIpO1xuICAgIH1cbiAgfSk7XG59O1xuXG4vKipcbiAqIEFuIGludGVyZmFjZSB0byBleHBsaWNpdGx5IHB1dCBtdWx0aXBsZSB0YXNrcyBleGVjdXRlIGF0IG9uZSB0aW1lLlxuICoqL1xuUnVudGltZS5wcm90b3R5cGUud2FpdCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLm5leHQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG5cbi8qKlxuICogRXhlY3V0ZSB0YXNrIGFuZCBnZXQgUHJvbWlzZXMgb3IgcGxhaW4gdmFsdWVzIHRoZW0gcmV0dXJuLFxuICogYW5kIHRoZW4gcmV0dXJuIHRoZSB3cmFwcGVkIFByb21pc2UgYXMgdGhlIG5leHQgc3RlcCBvZiB0aGlzXG4gKiBwcm9jZXNzLiBUaGUgbmFtZSAnc3RlcCcgaW5kaWNhdGVzIHRoZSBnZW5lcmF0ZWQgUHJvbWlzZSxcbiAqIHdoaWNoIGlzIG9uZSBzdGVwIG9mIHRoZSBtYWluIFByb21pc2Ugb2YgdGhlIGN1cnJlbnQgcGhhc2UuXG4gKi9cblJ1bnRpbWUucHJvdG90eXBlLmdlbmVyYXRlU3RlcCA9IGZ1bmN0aW9uKHRhc2tzKSB7XG4gIC8vICd0YXNrUmVzdWx0cycgbWVhbnMgdGhlIHJlc3VsdHMgb2YgdGhlIHRhc2tzLlxuICB2YXIgdGFza1Jlc3VsdHMgPSBbXTtcbiAgaWYgKHRydWUgPT09IHRoaXMuY29uZmlncy5kZWJ1Zykge1xuICAgIHRoaXMudHJhY2UodGFza3MpO1xuICB9XG5cbiAgLy8gU28gd2UgdW53cmFwIHRoZSB0YXNrIGZpcnN0LCBhbmQgdGhlbiBwdXQgaXQgaW4gdGhlIGFycmF5LlxuICAvLyBTaW5jZSB3ZSBuZWVkIHRvIGdpdmUgdGhlICdjdXJyZW50UHJvbWlzZScgYSBmdW5jdGlvbiBhcyB3aGF0IHRoZVxuICAvLyB0YXNrcyBnZW5lcmF0ZSBoZXJlLlxuICB2YXIgY2hhaW5zID0gdGFza3MubWFwKCh0YXNrKSA9PiB7XG4gICAgLy8gUmVzZXQgdGhlIHJlZ2lzdGVyZWQgcmVzdWx0cy5cbiAgICAvLyAncHJldmlvdXNSZXN1bHRzJyBtZWFucyB0aGUgcmVzdWx0cyBsZWZ0IGJ5IHRoZSBwcmV2aW91cyBzdGVwLlxuICAgIHZhciBwcmV2aW91c1Jlc3VsdHMgPSB0aGlzLnN0YXRlcy5zdGVwUmVzdWx0cztcbiAgICB2YXIgY2hhaW47XG4gICAgLy8gSWYgaXQgaGFzIG11bHRpcGxlIHJlc3VsdHMsIG1lYW5zIGl0J3MgYSB0YXNrIGdyb3VwXG4gICAgLy8gZ2VuZXJhdGVkIHJlc3VsdHMuXG4gICAgaWYgKHByZXZpb3VzUmVzdWx0cy5sZW5ndGggPiAxKSB7XG4gICAgICBjaGFpbiA9IHRhc2socHJldmlvdXNSZXN1bHRzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2hhaW4gPSB0YXNrKHByZXZpb3VzUmVzdWx0c1swXSk7XG4gICAgfVxuICAgIC8vIE9yZGluYXJ5IGZ1bmN0aW9uIHJldHVybnMgJ3VuZGVmaW5lJyBvciBvdGhlciB0aGluZ3MuXG4gICAgaWYgKCFjaGFpbikge1xuICAgICAgLy8gSXQncyBhIHBsYWluIHZhbHVlLlxuICAgICAgLy8gU3RvcmUgaXQgYXMgb25lIG9mIHJlc3VsdHMuXG4gICAgICB0YXNrUmVzdWx0cy5wdXNoKGNoYWluKTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoY2hhaW4pO1xuICAgIH1cblxuICAgIC8vIEl0J3MgYSBQcm9jZXNzLlxuICAgIGlmICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mIGNoYWluLl9ydW50aW1lICYmXG4gICAgICAgIGNoYWluLl9ydW50aW1lIGluc3RhbmNlb2YgUnVudGltZSkge1xuICAgICAgLy8gUHJlbWlzZTogaXQncyBhIHN0YXJ0ZWQgcHJvY2Vzcy5cbiAgICAgIHJldHVybiBjaGFpbi5fcnVudGltZS5zdGF0ZXMuY3VycmVudFByb21pc2UudGhlbigoKSA9PiB7XG4gICAgICAgIHZhciBndWVzdFJlc3VsdHMgPSBjaGFpbi5fcnVudGltZS5zdGF0ZXMuc3RlcFJlc3VsdHM7XG4gICAgICAgIC8vIFNpbmNlIHdlIGltcGxpY2l0bHkgdXNlICdQcm9taXNlLmFsbCcgdG8gcnVuXG4gICAgICAgIC8vIG11bHRpcGxlIHRhc2tzIGluIG9uZSBzdGVwLCB3ZSBuZWVkIHRvIGRldGVybWluYXRlIGlmXG4gICAgICAgIC8vIHRoZXJlIGlzIG9ubHkgb25lIHRhc2sgaW4gdGhlIHRhc2ssIG9yIGl0IGFjdHVhbGx5IGhhcyBtdWx0aXBsZVxuICAgICAgICAvLyByZXR1cm4gdmFsdWVzIGZyb20gbXVsdGlwbGUgdGFza3MuXG4gICAgICAgIGlmIChndWVzdFJlc3VsdHMubGVuZ3RoID4gMSkge1xuICAgICAgICAgIC8vIFdlIG5lZWQgdG8gdHJhbnNmZXIgdGhlIHJlc3VsdHMgZnJvbSB0aGUgZ3Vlc3QgUHJvY2VzcyB0byB0aGVcbiAgICAgICAgICAvLyBob3N0IFByb2Nlc3MuXG4gICAgICAgICAgdGFza1Jlc3VsdHMgPSB0YXNrUmVzdWx0cy5wdXNoKGd1ZXN0UmVzdWx0cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGFza1Jlc3VsdHMucHVzaChjaGFpbi5fcnVudGltZS5zdGF0ZXMuc3RlcFJlc3VsdHNbMF0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKGNoYWluLnRoZW4pIHtcbiAgICAgIC8vIE9yZGluYXJ5IHByb21pc2UgY2FuIGJlIGNvbmNhdGVkIGltbWVkaWF0ZWx5LlxuICAgICAgcmV0dXJuIGNoYWluLnRoZW4oKHJlc29sdmVkVmFsdWUpID0+IHtcbiAgICAgICAgdGFza1Jlc3VsdHMucHVzaChyZXNvbHZlZFZhbHVlKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJdCdzIGEgcGxhaW4gdmFsdWUuXG4gICAgICAvLyBTdG9yZSBpdCBhcyBvbmUgb2YgcmVzdWx0cy5cbiAgICAgIHRhc2tSZXN1bHRzLnB1c2goY2hhaW4pO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShjaGFpbik7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIFByb21pc2UuYWxsKGNoYWlucykudGhlbigoKSA9PiB7XG4gICAgLy8gQmVjYXVzZSBpbiB0aGUgcHJldmlvdXMgJ2FsbCcgd2UgZW5zdXJlIGFsbCB0YXNrcyBhcmUgZXhlY3V0ZWQsXG4gICAgLy8gYW5kIHRoZSByZXN1bHRzIG9mIHRoZXNlIHRhc2tzIGFyZSBjb2xsZWN0ZWQsIHNvIHdlIG5lZWRcbiAgICAvLyB0byByZWdpc3RlciB0aGVtIGFzIHRoZSBsYXN0IHJlc3VsdHMgb2YgdGhlIGxhc3Qgc3RlcC5cbiAgICB0aGlzLnN0YXRlcy5zdGVwUmVzdWx0cyA9IHRhc2tSZXN1bHRzO1xuICB9KTtcbn07XG5cbi8qKiBXZSBuZWVkIHRoaXMgdG8gcHJldmVudCB0aGUgc3RlcCgpIHRocm93IGVycm9ycy5cbiogSW4gdGhpcyBjYXRjaCwgd2UgZGlzdGluZ3Vpc2ggdGhlIGludGVycnVwdCBhbmQgb3RoZXIgZXJyb3JzLFxuKiBhbmQgdGhlbiBieXBhc3MgdGhlIGZvcm1lciBhbmQgcHJpbnQgdGhlIGxhdGVyIG91dC5cbipcbiogVGhlIGZpbmFsIGZhdGUgb2YgdGhlIHJlYWwgZXJyb3JzIGlzIGl0IHdvdWxkIGJlIHJlLXRocm93IGFnYWluXG4qIGFmdGVyIHdlIHByaW50IHRoZSBpbnN0YW5jZSBvdXQuIFdlIG5lZWQgdG8gZG8gdGhhdCBzaW5jZSBhZnRlciBhblxuKiBlcnJvciB0aGUgcHJvbWlzZSBzaG91bGRuJ3Qga2VlcCBleGVjdXRpbmcuIElmIHdlIGRvbid0IHRocm93IGl0XG4qIGFnYWluLCBzaW5jZSB0aGUgZXJyb3IgaGFzIGJlZW4gY2F0Y2hlZCwgdGhlIHJlc3Qgc3RlcHMgaW4gdGhlXG4qIHByb21pc2Ugd291bGQgc3RpbGwgYmUgZXhlY3V0ZWQsIGFuZCB0aGUgdXNlci1zZXQgcmVzY3VlcyB3b3VsZFxuKiBub3QgY2F0Y2ggdGhpcyBlcnJvci5cbipcbiogQXMgYSBjb25jbHVzaW9uLCBubyBtYXR0ZXIgd2hldGhlciB0aGUgZXJyb3IgaXMgYW4gaW50ZXJydXB0LFxuKiB3ZSBhbGwgbmVlZCB0byB0aHJvdyBpdCBhZ2Fpbi4gVGhlIG9ubHkgZGlmZmVyZW5jZSBpcyBpZiBpdCdzXG4qIGFuZCBpbnRlcnJ1cHQgd2UgZG9uJ3QgcHJpbnQgaXQgb3V0LlxuKi9cblJ1bnRpbWUucHJvdG90eXBlLmdlbmVyYXRlRXJyb3JMb2dnZXIgPSBmdW5jdGlvbihkZWJ1Z2luZm8pIHtcbiAgcmV0dXJuIChlcnIpID0+IHtcbiAgICBpZiAoIShlcnIgaW5zdGFuY2VvZiBSdW50aW1lLkludGVycnVwdEVycm9yKSkge1xuICAgICAgY29uc29sZS5lcnJvcihgRVJST1IgZHVyaW5nICMke2RlYnVnaW5mb1snbnRoLXN0ZXAnXX1cbiAgICAgICAgICBzdGVwIGV4ZWN1dGVzOiAke2Vyci5tZXNzYWdlfWAsIGVycik7XG4gICAgfVxuICAgIHRocm93IGVycjtcbiAgfTtcbn07XG5cblJ1bnRpbWUucHJvdG90eXBlLmNoZWNrSW50ZXJydXB0ID0gZnVuY3Rpb24oc3RlcCkge1xuICBpZiAoc3RlcC5waGFzZSAhPT0gdGhpcy5zdGF0ZXMucGhhc2UpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG5SdW50aW1lLnByb3RvdHlwZS5nZW5lcmF0ZURlYnVnZ2luZ0NvbG9yID0gZnVuY3Rpb24oKSB7XG4gIGNvbnN0IGNvbG9yc2V0cyA9IFtcbiAgICB7IGJhY2tncm91bmQ6ICdyZWQnLCBmb3JlZ3JvdW5kOiAnd2hpdGUnIH0sXG4gICAgeyBiYWNrZ3JvdW5kOiAnZ3JlZW4nLCBmb3JlZ3JvdW5kOiAnd2hpdGUnIH0sXG4gICAgeyBiYWNrZ3JvdW5kOiAnYmx1ZScsIGZvcmVncm91bmQ6ICd3aGl0ZScgfSxcbiAgICB7IGJhY2tncm91bmQ6ICdzYWRkbGVCcm93bicsIGZvcmVncm91bmQ6ICd3aGl0ZScgfSxcbiAgICB7IGJhY2tncm91bmQ6ICdjeWFuJywgZm9yZWdyb3VuZDogJ2RhcmtTbGF0ZUdyYXknIH0sXG4gICAgeyBiYWNrZ3JvdW5kOiAnZ29sZCcsIGZvcmVncm91bmQ6ICdkYXJrU2xhdGVHcmF5JyB9LFxuICAgIHsgYmFja2dyb3VuZDogJ3BhbGVHcmVlbicsIGZvcmVncm91bmQ6ICdkYXJrU2xhdGVHcmF5JyB9LFxuICAgIHsgYmFja2dyb3VuZDogJ3BsdW0nLCBmb3JlZ3JvdW5kOiAnZGFya1NsYXRlR3JheScgfVxuICBdO1xuICB2YXIgY29sb3JzZXQgPSBjb2xvcnNldHNbIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGNvbG9yc2V0cy5sZW5ndGgpIF07XG4gIHJldHVybiBjb2xvcnNldDtcbn07XG5cblJ1bnRpbWUucHJvdG90eXBlLnRyYWNlID0gZnVuY3Rpb24odGFza3MpIHtcbiAgaWYgKGZhbHNlID09PSB0aGlzLmNvbmZpZ3MuZGVidWcpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIGxvZyA9IHRhc2tzLnJlZHVjZSgobWVyZ2VkTWVzc2FnZSwgdGFzaykgPT4ge1xuICAgIHZhciBzb3VyY2UgPSBTdHJpbmcuc3Vic3RyaW5nKHRhc2sudG9Tb3VyY2UoKSwgMCxcbiAgICAgIHRoaXMuZGVidWdnaW5nLnRydW5jYXRpbmdMaW1pdCk7XG4gICAgdmFyIG1lc3NhZ2UgPSBgICR7IHNvdXJjZSB9IGA7XG4gICAgcmV0dXJuIG1lcmdlZE1lc3NhZ2UgKyBtZXNzYWdlO1xuICB9LCBgJWMgJHsgdGFza3NbMF0ucGhhc2UgfSMkeyB0aGlzLmRlYnVnZ2luZy5jdXJyZW50UGhhc2VTdGVwcyB9IHwgYCk7XG4gIC8vIERvbid0IHByaW50IHRob3NlIGluaGVyaXRlZCBmdW5jdGlvbnMuXG4gIHZhciBzdGFja0ZpbHRlciA9IG5ldyBSZWdFeHAoJ14oR2xlaXBuaXJCYXNpY3xQcm9jZXNzfFN0cmVhbSknKTtcbiAgdmFyIHN0YWNrID0gdGFza3NbMF0udHJhY2luZy5zdGFjay5zcGxpdCgnXFxuJykuZmlsdGVyKChsaW5lKSA9PiB7XG4gICAgcmV0dXJuICcnICE9PSBsaW5lO1xuICB9KS5maWx0ZXIoKGxpbmUpID0+IHtcbiAgICByZXR1cm4gIWxpbmUubWF0Y2goc3RhY2tGaWx0ZXIpO1xuICB9KS5qb2luKCdcXG4nKTtcblxuICBsb2cgPSBsb2cgKyAnIHwgXFxuXFxyJyArIHN0YWNrO1xuICBjb25zb2xlLmxvZyhsb2csICdiYWNrZ3JvdW5kLWNvbG9yOiAnKyB0aGlzLmRlYnVnZ2luZy5jb2xvcnMuYmFja2dyb3VuZCArXG4gICAgJzsnICsgJ2NvbG9yOiAnICsgdGhpcy5kZWJ1Z2dpbmcuY29sb3JzLmZvcmVncm91bmQpO1xufTtcblxuUnVudGltZS5JbnRlcnJ1cHRFcnJvciA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgdGhpcy5uYW1lID0gJ0ludGVycnVwdEVycm9yJztcbiAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZSB8fCAnJztcbn07XG5cblJ1bnRpbWUuSW50ZXJydXB0RXJyb3IucHJvdG90eXBlID0gbmV3IEVycm9yKCk7XG5cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vYnVpbGRfc3RhZ2Uvc3JjL3Byb2Nlc3MvcnVudGltZS5qc1xuICoqLyJdLCJzb3VyY2VSb290IjoiIn0=