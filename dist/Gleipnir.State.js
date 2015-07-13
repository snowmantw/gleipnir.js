/**
 * gleipnir.js - Gleipnir.js - a library for UI programming
 * @version v0.0.1
 * @link 
 * @license Apache 2.0
 */
var Gleipnir = Gleipnir || {}; Gleipnir["State"] =
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

	module.exports = __webpack_require__(7);


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

/***/ }
/******/ ]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNjgzYzcyYWJiOGUxNDNhMTM4MGM/N2MyNyoqKioqKioqIiwid2VicGFjazovLy8uL2J1aWxkX3N0YWdlL3NyYy9ydW5lL2xhbmd1YWdlLmpzPzFmMGMqKiIsIndlYnBhY2s6Ly8vLi9idWlsZF9zdGFnZS9zcmMvc3RhdGUvYmFzaWMuanM/MTA2MiIsIndlYnBhY2s6Ly8vLi9idWlsZF9zdGFnZS9zcmMvc3RyZWFtL3N0cmVhbS5qcz84ZDM3Iiwid2VicGFjazovLy8uL2J1aWxkX3N0YWdlL3NyYy9wcm9jZXNzL3Byb2Nlc3MuanM/NjY3NCoiLCJ3ZWJwYWNrOi8vLy4vYnVpbGRfc3RhZ2Uvc3JjL3Byb2Nlc3MvaW50ZXJmYWNlLmpzP2FjMDcqIiwid2VicGFjazovLy8uL2J1aWxkX3N0YWdlL3NyYy9wcm9jZXNzL3J1bnRpbWUuanM/MmNmMCoiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx1QkFBZTtBQUNmO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7QUN0Q0EsYUFBWSxDQUFDOzs7OztTQXFHRyxRQUFRLEdBQVIsUUFBUTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBakIsVUFBUyxRQUFRLEdBQUcsRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBa0I3QixTQUFRLENBQUMsTUFBTSxHQUFHLFVBQVMsTUFBTSxFQUFFLEVBQUUsRUFBRTtBQUNyQyxVQUFPLFlBQWtCO0FBQ3ZCLFNBQUksSUFBSSxFQUFFLFdBQVcsQ0FBQzs7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RyxLQUFLLENBQUM7QUFDOUIsVUFBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsb0JBQW9CLEdBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVSxHQUNyRSxHQUFHLEdBQUcsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0VBQ3ZELENBQUM7O0FBRUYsUUFBTyxDQUFDLGNBQWMsR0FBRyxVQUFTLE9BQU8sRUFBRTtBQUN6QyxPQUFJLENBQUMsSUFBSSxHQUFHLGdCQUFnQixDQUFDO0FBQzdCLE9BQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxJQUFJLEVBQUUsQ0FBQztFQUM5QixDQUFDOztBQUVGLFFBQU8sQ0FBQyxjQUFjLENBQUMsU0FBUyxHQUFHLElBQUksS0FBSyxFQUFFLEMiLCJmaWxlIjoiR2xlaXBuaXIuU3RhdGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0ZXhwb3J0czoge30sXG4gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuIFx0XHRcdGxvYWRlZDogZmFsc2VcbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIHdlYnBhY2svYm9vdHN0cmFwIDY4M2M3MmFiYjhlMTQzYTEzODBjXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEdlbmVyaWMgYnVpbGRlciB0aGF0IHdvdWxkIHB1c2ggbm9kZXMgaW50byB0aGUgZURTTCBzdGFjay5cbiAqIFVzZXIgY291bGQgaW5oZXJpdCB0aGlzIHRvIGRlZmluZSB0aGUgbmV3IGVEU0wuXG4gKiAtLS1cbiAqIFRoZSBkZWZhdWx0IHNlbWFudGljcyBvbmx5IGNvbnRhaW4gdGhlc2Ugb3BlcmF0aW9uczpcbiAqXG4gKiAxLiBbcHVzaF0gOiBwdXNoIHRvIHRoZSBjdXJyZW50IHN0YWNrXG4gKiAyLiBbYmVnaW5dOiBjcmVhdGUgYSBuZXcgc3RhY2sgYW5kIHN3aXRjaCB0byBpdCxcbiAqICAgICAgICAgICAgIGFuZCB0aGVuIHB1c2ggdGhlIG5vZGUgaW50byB0aGUgc3RhY2suXG4gKiAzLiBbZW5kXSAgOiBhZnRlciBwdXNoIHRoZSBub2RlIGludG8gdGhlIHN0YWNrLFxuICogICAgICAgICAgICAgY2hhbmdlIHRoZSBjdXJyZW50IHN0YWNrIHRvIHRoZSBwcmV2aW91cyBvbmUuXG4gKiA0LiBbZXhpdF0gOiBleGl0IHRoZSBjb250ZXh0IG9mIHRoaXMgZURTTDsgdGhlIGxhc3QgcmVzdWx0XG4gKiAgICAgICAgICAgICBvZiBpdCB3b3VsZCBiZSBwYXNzZWQgdG8gdGhlIHJldHVybiB2YWx1ZSBvZlxuICogICAgICAgICAgICAgdGhpcyBjaGFpbi5cbiAqXG4gKiBTdGFjayBjb3VsZCBiZSBuZXN0ZWQ6IHdoZW4gW2JlZ2luXSBhIG5ldyBzdGFjayBpbiBmYWN0IGl0IHdvdWxkXG4gKiBwdXNoIHRoZSBzdGFjayBpbnRvIHRoZSBwcmV2aW91cyBvbmUuIFNvIHRoZSBzdGFjayBjb21wcmlzZVxuICogW25vZGVdIGFuZCBbc3RhY2tdLlxuICogLS0tXG4gKiBBbHRob3VnaCB0aGUgZURTTCBpbnN0YW5jZSBzaG91bGQgd3JhcCB0aGVzZSBiYXNpYyBvcGVyYXRpb25zXG4gKiB0byBtYW5pcHVsYXRlIHRoZSBzdGFjaywgdGhleSBhbGwgbmVlZCB0byBjb252ZXJ0IHRoZSBtZXRob2RcbiAqIGNhbGwgdG8gbm9kZXMuIFNvICdMYW5ndWFnZScgcHJvdmlkZSBhIHdheSB0byBzaW1wbGlmeSB0aGUgd29yazogaWZcbiAqIHRoZSBpbnN0YW5jZSBjYWxsIHRoZSBbZGVmaW5lXSBtZXRob2QgdGhlIG5hbWUgb2YgdGhlIG1ldGhvZCxcbiAqIGl0IGNvdWxkIGFzc29jaWF0ZSB0aGUgb3BlcmFuZCBvZiB0aGUgZURTTCB3aXRoIHRoZSBzdGFjayBtYW5pcHVsYXRpb24uXG4gKiBGb3IgZXhhbXBsZTpcbiAqXG4gKiAgICB2YXIgZURTTCA9IGZ1bmN0aW9uKCkge307XG4gKiAgICBlRFNMLnByb3RvdHlwZS50cmFuc2FjdGlvbiA9IExhbmd1YWdlLmRlZmluZSgndHJhbnNhY3Rpb24nLCAnYmVnaW4nKTtcbiAqICAgIGVEU0wucHJvdG90eXBlLnByZSA9IExhbmd1YWdlLmRlZmluZSgncHJlJywgJ3B1c2gnKTtcbiAqICAgIGVEU0wucHJvdG90eXBlLnBlcmZvcm0gPSBMYW5ndWFnZS5kZWZpbmUoJ3BlcmZvcm0nLCAncHVzaCcpO1xuICogICAgZURTTC5wcm90b3R5cGUucG9zdCA9IExhbmd1YWdlLmRlZmluZSgncG9zdCcsICdlbmQnKTtcbiAqXG4gKiBUaGVuIHRoZSBlRFNMIGNvdWxkIGJlIHVzZWQgYXM6XG4gKlxuICogICAgKG5ldyBlRFNMKVxuICogICAgICAudHJhbnNhY3Rpb24oKVxuICogICAgICAucHJlKGNiKVxuICogICAgICAucGVyZm9ybShjYilcbiAqICAgICAgLnBvc3QoY2IpXG4gKlxuICogQW5kIHRoZSBzdGFjayB3b3VsZCBiZTpcbiAqXG4gKiAgICBbXG4gKiAgICAgIG5vZGU8J3RyYW5zYWN0aW9uJyw+XG4gKiAgICAgIG5vZGU8J3ByZScsIGNiPlxuICogICAgICBub2RlPCdwcmVmb3JtJywgY2I+XG4gKiAgICAgIG5vZGU8J3Bvc3QnLCBjYj5cbiAqICAgIF1cbiAqXG4gKiBIb3dldmVyLCB0aGlzIHNpbXBsZSBhcHByb2FjaCB0aGUgc2VtYW50aWNzIHJ1bGVzIGFuZCBhbmFseXplcnMgdG9cbiAqIGd1YXJhbnRlZSB0aGUgc3RhY2sgaXMgdmFsaWQuIEZvciBleGFtcGxlLCBpZiB3ZSBoYXZlIGEgbWFsZm9ybWVkXG4gKiBzdGFjayBiZWNhdXNlIG9mIHRoZSBmb2xsb3dpbmcgZURTTCBwcm9ncmFtOlxuICpcbiAqICAgIChuZXcgZURTTClcbiAqICAgICAgLnBvc3QoY2IpXG4gKiAgICAgIC5wcmUoY2IpXG4gKiAgICAgIC5wZXJmb3JtKGNiKVxuICogICAgICAudHJhbnNhY3Rpb24oKVxuICpcbiAqIFRoZSBydW50aW1lIG1heSByZXBvcnQgZXJyb3QgYmVjYXVzZSB3aGVuICcucG9zdChjYiknIHRoZXJlIGlzIG5vIHN0YWNrXG4gKiBjcmVhdGVkIGJ5IHRoZSBiZWdpbm5pbmcgc3RlcCwgbmFtZWx5IHRoZSAnLnByZShjYiknIGluIG91ciBjYXNlLlxuICogTmV2ZXJ0aGVsZXNzLCB0aGUgZXJyb3IgbWVzc2FnZSBpcyB0b28gbG93LWxldmVsIGZvciB0aGUgbGFuZ3VhZ2UgdXNlcixcbiAqIHNpbmNlIHRoZXkgc2hvdWxkIGNhcmUgbm8gc3RhY2sgdGhpbmdzIGFuZCBzaG91bGQgb25seSBjYXJlIGFib3V0IHRoZSBlRFNMXG4gKiBpdHNlbGYuXG4gKlxuICogVGhlIHNvbHV0aW9uIGlzIHRvIHByb3ZpZGUgYSBiYXNpYyBzdGFjayBvcmRlcmluZyBhbmFseXplciBhbmQgbGV0IHRoZVxuICogbGFuZ3VhZ2UgZGVjaWRlIGhvdyB0byBkZXNjcmliZSB0aGUgZXJyb3IuIEFuZCBzaW5jZSB3ZSBkb24ndCBoYXZlXG4gKiBhbnkgY29udGV4dCBpbmZvcm1hdGlvbiBhYm91dCB2YXJpYWJsZXMsIHNjb3BlIGFuZCBvdGhlciBlbGVtZW50c1xuICogYXMgYSBjb21wbGV0ZSBwcm9ncmFtbWluZyBsYW5ndWFnZSwgd2Ugb25seSBuZWVkIHRvIGd1YXJhbnRlZSB0aGUgb3JkZXIgaXNcbiAqIGNvcnJlY3QsIGFuZCBtYWtlIGluY29ycmVjdCBjYXNlcyBtZWFuaW5nZnVsLiBNb3Jlb3Zlciwgc2luY2UgdGhlIGFuYWx5emVyXG4gKiBuZWVkcyB0byBhbmFseXplIHRoZSBzdGF0ZXMgd2hlbmV2ZXIgdGhlIGluY29taW5nIG5vZGUgY29tZXMsIGl0IGlzIGluIGZhY3RcbiAqIGFuIGV2YWx1YXRpb24gcHJvY2Vzcywgc28gdXNlciBjb3VsZCBjb21iaW5lIHRoZSBhbmFseXppbmcgYW5kIGludGVycHJldGluZ1xuICogcGhhc2UgaW50byB0aGUgc2FtZSBmdW5jdGlvbi4gRm9yIGV4YW1wbGU6XG4gKlxuICogICAgcnVudGltZS5vbmNoYW5nZSgoY29udGV4dCwgbm9kZSwgc3RhY2spID0+IHtcbiAqICAgICAgICAvLyBJZiB0aGUgY2hhbmdlIGlzIHRvIHN3aXRjaCB0byBhIG5ldyBzdGFjayxcbiAqICAgICAgICAvLyB0aGUgJ3N0YWNrJyBoZXJlIHdvdWxkIGJlIHRoZSBuZXcgc3RhY2suXG4gKiAgICAgICAgdmFyIHt0eXBlLCBhcmdzfSA9IG5vZGU7XG4gKiAgICAgICAgaWYgKCdwcmUnID09PSB0eXBlKSB7XG4gKiAgICAgICAgICBjb250ZXh0LmluaXQgPSB0cnVlO1xuICogICAgICAgIH0gZWxzZSBpZiAoJ3Bvc3QnID09PSB0eXBlICYmICFjb250ZXh0LmluaXQpIHtcbiAqICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGhlcmUgbXVzdCBiZSBvbmUgXCJwcmVcIiBub2RlIGJlZm9yZSB0aGUgXCJwb3N0XCIuJyk7XG4gKiAgICAgICAgfVxuICogICAgfSk7XG4gKlxuICogV2l0aCBzdWNoIGZlYXR1cmUsIGlmIHRoZSBpbmNvbWluZyBub2RlIG9yIHRoZSBzdGFjayBpcyBtYWxmb3JtZWQsXG4gKiBpdCBzaG91bGQgdGhyb3cgdGhlIGVycm9yLiBUaGUgZXJyb3IgY2FwdHVyZWQgYnkgdGhlIGluc3RhbmNlIGxpa2UgdGhpc1xuICogY291bGQgYmUgYSAnY29tcGlsYXRpb24gZXJyb3InLlxuICpcbiAqIFRoZSBub3RpY2VhYmxlIGZhY3QgaXMgVGhlIGNhbGxiYWNrIG9mIHRoZSAnb25jaGFuZ2UnIGlzIGFjdHVhbGx5IGEgcmVkdWNlcixcbiAqIHNvIHVzZXIgY291bGQgdHJlYXQgdGhlIHByb2Nlc3Mgb2YgdGhpcyBldmFsdWF0aW9uICYgYW5hbHl6aW5nIGFzIGEgcmVkdWNpbmdcbiAqIHByb2Nlc3Mgb24gYW4gaW5maW5pdGUgc3RyZWFtLiBBbmQgc2luY2Ugd2UgaGF2ZSBhIHN0YWNrIG1hY2hpbmUsIGlmIHRoZVxuICogcmVkdWNlciByZXR1cm4gbm90aGluZywgdGhlIHN0YWNrIHdvdWxkIGJlIGVtcHR5LiBPdGhlcndpc2UsIGlmIHRoZSByZWR1Y2VyXG4gKiByZXR1cm4gYSBuZXcgc3RhY2ssIGl0IHdvdWxkIHJlcGxhY2UgdGhlIG9sZCBvbmUuXG4gKlxuICogQW5kIHBsZWFzZSBub3RlIHRoZSBleGFtcGxlIGlzIG11Y2ggc2ltcGxpZmllZC4gRm9yIHRoZVxuICogcmVhbCBlRFNMIGl0IHNob3VsZCBiZSB1c2VkIG9ubHkgYXMgYW4gZW50cnkgdG8gZGlzcGF0Y2ggdGhlIGNoYW5nZSB0b1xuICogdGhlIHJlYWwgaGFuZGxlcnMsIHdoaWNoIG1heSBjb21wcmlzZSBzZXZlcmFsIHN0YXRlcyBhbmQgY29tcG9uZW50cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIExhbmd1YWdlKCkge31cblxuLyoqXG4gKiBIZWxwZXIgbWV0aG9kIHRvIGJ1aWxkIGludGVyZmFjZSBvZiBhIHNwZWNpZmljIERTTC4gSXQgd291bGQgcmV0dXJuIGEgbWV0aG9kXG4gKiBvZiB0aGUgRFNMIGFuZCB0aGVuIHRoZSBpbnRlcmZhY2UgY291bGQgYXR0YWNoIGl0LlxuICpcbiAqIFRoZSByZXR1cm5pbmcgZnVuY3Rpb24gd291bGQgYXNzdW1lIHRoYXQgdGhlICd0aGlzJyBpbnNpZGUgaXQgaXMgdGhlIHJ1bnRpbWVcbiAqIG9mIHRoZSBsYW5ndWFnZS4gQW5kIHNpbmNlIHRoZSBtZXRob2QgaXQgcmV0dXJucyB3b3VsZCByZXF1aXJlIHRvIGFjY2VzcyBzb21lXG4gKiBtZW1iZXJzIG9mIHRoZSAndGhpcycsIHRoZSAndGhpcycgc2hvdWxkIGhhdmUgJ3RoaXMuc3RhY2snIGFuZCAndGhpcy5jb250ZXh0J1xuICogYXMgdGhlIG1ldGhvZCByZXF1aXJlcy5cbiAqXG4gKiBJZiBpdCdzIGFuICdleGl0JyBub2RlLCBtZWFucyB0aGUgc2Vzc2lvbiBpcyBlbmRlZCBhbmQgdGhlIGludGVycHJldGVyIHNob3VsZFxuICogcmV0dXJuIGEgc3RhY2sgY29udGFpbnMgb25seSBvbmUgbm9kZSBhcyB0aGUgcmVzdWx0IG9mIHRoZSBzZXNzaW9uLCBvciB0aGVcbiAqIHNlc3Npb24gcmV0dXJucyBub3RoaW5nLlxuICpcbiAqIFBsZWFzZSBub3RlIHRoYXQgZnJvbSB0aGUgZGVzY3JpcHRpb24gYWJvdmUsICdlbmQnIG1lYW5zIHN0YWNrIChzdWJzdGFjaylcbiAqIGVuZHMuIEl0J3MgdG90YWxseSBpcnJlbGV2YW50IHRvICdleGl0Jy5cbiAqL1xuTGFuZ3VhZ2UuZGVmaW5lID0gZnVuY3Rpb24obWV0aG9kLCBhcykge1xuICByZXR1cm4gZnVuY3Rpb24oLi4uYXJncykge1xuICAgIHZhciBub2RlLCByZXN1bHRzdGFjaztcbiAgICBzd2l0Y2ggKGFzKSB7XG4gICAgICBjYXNlICdwdXNoJzpcbiAgICAgICAgbm9kZSA9IG5ldyBMYW5ndWFnZS5Ob2RlKG1ldGhvZCwgYXJncywgdGhpcy5zdGFjayk7XG4gICAgICAgIHRoaXMuc3RhY2sucHVzaChub2RlKTtcbiAgICAgICAgcmVzdWx0c3RhY2sgPVxuICAgICAgICAgIHRoaXMub25jaGFuZ2UodGhpcy5jb250ZXh0LCBub2RlLCB0aGlzLnN0YWNrKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdiZWdpbic6XG4gICAgICAgIHRoaXMuX3ByZXZzdGFjayA9IHRoaXMuc3RhY2s7XG4gICAgICAgIHRoaXMuc3RhY2sgPSBbXTtcbiAgICAgICAgbm9kZSA9IG5ldyBMYW5ndWFnZS5Ob2RlKG1ldGhvZCwgYXJncywgdGhpcy5zdGFjayk7XG4gICAgICAgIHRoaXMuc3RhY2sucHVzaChub2RlKTsgIC8vIGFzIHRoZSBmaXJzdCBub2RlIG9mIHRoZSBuZXcgc3RhY2suXG4gICAgICAgIHJlc3VsdHN0YWNrID1cbiAgICAgICAgICB0aGlzLm9uY2hhbmdlKHRoaXMuY29udGV4dCwgbm9kZSwgdGhpcy5zdGFjayk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZW5kJzpcbiAgICAgICAgbm9kZSA9IG5ldyBMYW5ndWFnZS5Ob2RlKG1ldGhvZCwgYXJncywgdGhpcy5zdGFjayk7XG4gICAgICAgIHRoaXMuc3RhY2sucHVzaChub2RlKTsgIC8vIHRoZSBsYXN0IG5vZGUgb2YgdGhlIHN0YWNrLlxuICAgICAgICB0aGlzLnN0YWNrID1cbiAgICAgICAgICB0aGlzLl9wcmV2c3RhY2s7IC8vIHN3aXRjaCBiYWNrIHRvIHRoZSBwcmV2aW91cyBzdGFjay5cbiAgICAgICAgcmVzdWx0c3RhY2sgPVxuICAgICAgICAgIHRoaXMub25jaGFuZ2UodGhpcy5jb250ZXh0LCBub2RlLCB0aGlzLnN0YWNrKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdleGl0JzpcbiAgICAgICAgbm9kZSA9IG5ldyBMYW5ndWFnZS5Ob2RlKG1ldGhvZCwgYXJncywgdGhpcy5zdGFjayk7XG4gICAgICAgIHRoaXMuc3RhY2sucHVzaChub2RlKTsgIC8vIHRoZSBsYXN0IG5vZGUgb2YgdGhlIHN0YWNrLlxuICAgICAgICByZXN1bHRzdGFjayA9XG4gICAgICAgICAgdGhpcy5vbmNoYW5nZSh0aGlzLmNvbnRleHQsIG5vZGUsIHRoaXMuc3RhY2spO1xuICAgICAgICBpZiAoIXJlc3VsdHN0YWNrKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAnZXhpdCcgbm9kZSAnJHtub2RlLnR5cGV9JyBzaG91bGRcbiAgICAgICAgICAgIHJldHVybiBhIHJlc3VsdHN0YWNrLmApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHRzdGFja1swXTtcbiAgICB9XG4gICAgLy8gSWYgdGhlIGhhbmRsZXIgdXBkYXRlcyB0aGUgc3RhY2ssIGl0IHdvdWxkIHJlcGxhY2UgdGhlIGV4aXN0aW5nIG9uZS5cbiAgICBpZiAocmVzdWx0c3RhY2spIHtcbiAgICAgIHRoaXMuc3RhY2sgPSByZXN1bHRzdGFjaztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG59O1xuXG5MYW5ndWFnZS5Ob2RlID0gZnVuY3Rpb24odHlwZSwgYXJncywgc3RhY2spIHtcbiAgdGhpcy50eXBlID0gdHlwZTtcbiAgdGhpcy5hcmdzID0gYXJncztcbiAgdGhpcy5zdGFjayA9IHN0YWNrO1xufTtcblxuTGFuZ3VhZ2UuRXZhbHVhdGUgPSBmdW5jdGlvbihjb250ZXh0ID0ge30pIHtcbiAgdGhpcy5fYW5hbHl6ZXJzID0gW107XG4gIHRoaXMuX2ludGVycHJldGVyID0gbnVsbDtcbiAgdGhpcy5fY29udGV4dCA9IGNvbnRleHQ7XG59O1xuXG4vKipcbiAqIEFuYWx5emVyIGNvdWxkIHJlY2VpdmUgdGhlIHN0YWNrIGNoYW5nZSBmcm9tICdMYW5ndWFnZSNldmFsdWF0ZScsXG4gKiBhbmQgaXQgd291bGQgYmUgY2FsbGVkIHdpdGggdGhlIGFyZ3VtZW50cyBhcyB0aGUgZnVuY3Rpb24gZGVzY3JpYmVzOlxuICpcbiAqICAgICBMYW5ndWFnZS5wcm90b3R5cGUuZXZhbHVhdGUoKGNvbnRleHQsIGNoYW5nZSwgc3RhY2spID0+IHtcbiAqICAgICAgICAvLyAuLi5cbiAqICAgICB9KTtcbiAqXG4gKiBTbyB0aGUgYW5hbHl6ZXIgY291bGQgYmU6XG4gKlxuICogICAgZnVuY3Rpb24oY29udGV4dCwgY2hhbmdlLCBzdGFjaykge1xuICogICAgICAvLyBEbyBzb21lIGNoZWNrIGFuZCBtYXliZSBjaGFuZ2VkIHRoZSBjb250ZXh0LlxuICogICAgICAvLyBUaGUgbmV4dCBhbmFseXplciB0byB0aGUgaW50ZXJwcmV0ZXIgd291bGQgYWNjZXB0IHRoZSBhbHRlcm5hdGVkXG4gKiAgICAgIC8vIGNvbnRleHQgYXMgdGhlIGFyZ3VtZW50ICdjb250ZXh0Jy5cbiAqICAgICAgY29udGV4dC5zb21lRmxhZyA9IHRydWU7XG4gKiAgICAgIC8vIFdoZW4gdGhlcmUgaXMgd3JvbmcsIHRocm93IGl0LlxuICogICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NvbWUgYW5hbHl6aW5nIGVycm9yJyk7XG4gKiAgICB9O1xuICpcbiAqIE5vdGUgdGhhdCB0aGUgYW5hbHl6ZXIgKCdhJykgd291bGQgYmUgaW52b2tlZCB3aXRoIGVtcHR5ICd0aGlzJyBvYmplY3QsXG4gKiBzbyB0aGUgZnVuY3Rpb24gcmVsaWVzIG9uICd0aGlzJyBzaG91bGQgYmluZCBpdHNlbGYgZmlyc3QuXG4gKi9cbkxhbmd1YWdlLkV2YWx1YXRlLnByb3RvdHlwZS5hbmFseXplciA9IGZ1bmN0aW9uKGEpIHtcbiAgdGhpcy5fYW5hbHl6ZXJzLnB1c2goYSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBPbmUgRXZhbHVhdGUgY2FuIG9ubHkgaGF2ZSBvbmUgaW50ZXJwcmV0ZXIsIGFuZCBpdCB3b3VsZCByZXR1cm5cbiAqIHRoZSBmdW5jdGlvbiBjb3VsZCBjb25zdW1lIGV2ZXJ5IHN0YWNrIGNoYW5nZSBmcm9tICdMYW5ndWFnZSNldmFsdWF0ZScuXG4gKlxuICogVGhlIGNvZGUgaXMgYSBsaXR0bGUgY29tcGxpY2F0ZWQ6IHdlIGhhdmUgdHdvIGtpbmRzIG9mICdyZWR1Y2luZyc6XG4gKiBvbmUgaXMgdG8gcmVkdWNlIGFsbCBhbmFseXplcnMgd2l0aCB0aGUgc2luZ2xlIGluY29taW5nIGNoYW5nZSxcbiAqIGFub3RoZXIgaXMgdG8gcmVkdWNlIGFsbCBpbmNvbWluZyBjaGFuZ2VzIHdpdGggdGhpcyBhbmFseXplcnMgKyBpbnRlcnByZXRlci5cbiAqXG4gKiBUaGUgYW5hbHl6ZXIgYW5kIGludGVycHJldGVyIHNob3VsZCBjaGFuZ2UgdGhlIGNvbnRleHQsIHRvIG1lbW9yaXplIHRoZVxuICogc3RhdGVzIG9mIHRoZSBldmFsdWF0aW9uLiBUaGUgZGlmZmVyZW5jZSBpcyBpbnRlcnByZXRlciBzaG91bGQgcmV0dXJuIG9uZVxuICogbmV3IHN0YWNrIGlmIGl0IG5lZWRzIHRvIHVwZGF0ZSB0aGUgZXhpc3Rpbmcgb25lLiBUaGUgc3RhY2sgaXQgcmV0dXJucyB3b3VsZFxuICogcmVwbGFjZSB0aGUgZXhpc3Rpbmcgb25lLCBzbyBhbnl0aGluZyBzdGlsbCBpbiB0aGUgb2xkIG9uZSB3b3VsZCBiZSB3aXBlZFxuICogb3V0LiBUaGUgaW50ZXJwcmV0ZXIgY291bGQgcmV0dXJuIG5vdGhpbmcgKCd1bmRlZmluZWQnKSB0byBrZWVwIHRoZSBzdGFja1xuICogdW50b3VjaGVkLlxuICpcbiAqIFRoZSBhbmFseXplcnMgYW5kIGludGVycHJldGVyIGNvdWxkIGNoYW5nZSB0aGUgJ2NvbnRleHQnIHBhc3MgdG8gdGhlbS5cbiAqIEFuZCBzaW5jZSB3ZSBtYXkgdXBkYXRlIHRoZSBzdGFjayBhcyBhYm92ZSwgdGhlIGNvbnRleHQgc2hvdWxkIG1lbW9yaXplXG4gKiB0aG9zZSBpbmZvcm1hdGlvbiBub3QgdG8gYmUgb3ZlcndyaXR0ZW4gd2hpbGUgdGhlIHN0YWNrIGdldCB3aXBlZCBvdXQuXG4gKlxuICogQW5kIGlmIHRoZSBpbnRlcnByZXRpbmcgbm9kZSBpcyB0aGUgZXhpdCBub2RlIG9mIHRoZSBzZXNzaW9uLCBpbnRlcnByZXRlclxuICogc2hvdWxkIHJldHVybiBhIG5ldyBzdGFjayBjb250YWlucyBvbmx5IG9uZSBmaW5hbCByZXN1bHQgbm9kZS4gSWYgdGhlcmVcbiAqIGlzIG5vIHN1Y2ggbm9kZSwgdGhlIHJlc3VsdCBvZiB0aGlzIHNlc3Npb24gaXMgJ3VuZGVmaW5lZCcuXG4gKi9cbkxhbmd1YWdlLkV2YWx1YXRlLnByb3RvdHlwZS5pbnRlcnByZXRlciA9IGZ1bmN0aW9uKGlucHQpIHtcbiAgLy8gVGhlIGN1c3RvbWl6ZWQgbGFuZ3VhZ2Ugc2hvdWxkIGdpdmUgdGhlIGRlZmF1bHQgY29udGV4dC5cbiAgcmV0dXJuIChjb250ZXh0LCBjaGFuZ2UsIHN0YWNrKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIC8vIEFuYWx5emVycyBjb3VsZCBjaGFuZ2UgdGhlIGNvbnRleHQuXG4gICAgICB0aGlzLl9hbmFseXplcnMucmVkdWNlKChjdHgsIGFuYWx5emVyKSA9PiB7XG4gICAgICAgIGFuYWx5emVyLmNhbGwoe30sIGNvbnRleHQsIGNoYW5nZSwgc3RhY2spO1xuICAgICAgfSwgY29udGV4dCk7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICB0aGlzLl9oYW5kbGVFcnJvcihlLCBjb250ZXh0LCBjaGFuZ2UsIHN0YWNrKTtcbiAgICB9XG4gICAgLy8gQWZ0ZXIgYW5hbHl6ZSBpdCwgaW50ZXJwcmV0IHRoZSBub2RlIGFuZCByZXR1cm4gdGhlIG5ldyBzdGFjayAoaWYgYW55KS5cbiAgICB2YXIgbmV3U3RhY2sgPSBpbnB0KGNvbnRleHQsIGNoYW5nZSwgc3RhY2spO1xuICAgIHJldHVybiBuZXdTdGFjaztcbiAgfTtcbn07XG5cbkxhbmd1YWdlLkV2YWx1YXRlLnByb3RvdHlwZS5faGFuZGxlRXJyb3IgPVxuZnVuY3Rpb24oZXJyLCBjb250ZXh0LCBjaGFuZ2UsIHN0YWNrKSB7XG4gIC8vIFRPRE86IGV4cGFuZCBpdCB0byBwcm92aWRlIG1vcmUgc29waGlzdGljIGRlYnVnZ2luZyBtZXNzYWdlLlxuICB0aHJvdyBuZXcgRXJyb3IoYFdoZW4gY2hhbmdlICR7Y2hhbmdlLnR5cGV9IGNvbWVzIGVycm9yICcke2Vycn0nIGhhcHBlbmVkYCk7XG59O1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9idWlsZF9zdGFnZS9zcmMvcnVuZS9sYW5ndWFnZS5qc1xuICoqLyIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHsgU3RyZWFtIH0gZnJvbSAnc3JjL3N0cmVhbS9zdHJlYW0uanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gQmFzaWMoY29tcG9uZW50KSB7XG4gIC8vIEEgbG9jayB0byBwcmV2ZW50IHRyYW5zZmVycmluZyByYWNpbmcuIFRoaXMgaXMgYmVjYXVzZSBtb3N0IG9mIHNvdXJjZVxuICAvLyBldmVudHMgYXJlIG1hcHBlZCBpbnRvIGludGVycnVwdHMgdG8gdHJpZ2dlciB0cmFuc2ZlcnJpbmdzLiBUbyBwcmV2ZW50XG4gIC8vIGNsaWVudCBuZWVkIHRvIGltcGxlbWVudCB0aGlzIGFnYWluIGFuZCBhZ2FpbiB3ZSBwdXQgdGhlIGxvY2sgaGVyZS5cbiAgdGhpcy5fdHJhbnNmZXJyZWQgPSBmYWxzZTtcbiAgLy8gUmVwbGFjZSB3aXRoIHRoZSBuYW1lIG9mIGNvbmNyZXRlIHN0YXRlLlxuICB0aGlzLmNvbmZpZ3MgPSB7XG4gICAgdHlwZTogJ0Jhc2ljJyxcbiAgICAvLyBOb3RlIHRoZSBldmVudCBtZWFucyBldmVudHMgZm9yd2FyZGVkIGZyb20gc291cmNlcywgbm90IERPTSBldmVudHMuXG4gICAgc3RyZWFtOiB7XG4gICAgICBldmVudHM6IFtdLFxuICAgICAgaW50ZXJydXB0czogW10sXG4gICAgICBzb3VyY2VzOiBbXVxuICAgIH1cbiAgfTtcbiAgLy8gQ29tcG9uZW50IHJlZmVyZW5jZSBwcm9pdmRlcyBldmVyeSByZXNvdXJjZSAmIHByb3BlcnR5XG4gIC8vIG5lZWQgYnkgYWxsIHN0YXRlcy5cbiAgdGhpcy5jb21wb25lbnQgPSBjb21wb25lbnQ7XG59XG5cbi8qKlxuICogU3RyZWFtJyBwaGFzZSBpcyB0aGUgc3RhdGUncyBwaGFzZS5cbiAqL1xuQmFzaWMucHJvdG90eXBlLnBoYXNlID1cbmZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5zdHJlYW0ucGhhc2UoKTtcbn07XG5cbi8qKlxuICogRGVyaXZlZCBzdGF0ZXMgc2hvdWxkIGV4dGVuZCB0aGVzZSBiYXNpYyBtZXRob2RzLlxuICovXG5CYXNpYy5wcm90b3R5cGUuc3RhcnQgPVxuZnVuY3Rpb24oKSB7XG4gIHRoaXMuc3RyZWFtID0gbmV3IFN0cmVhbSh0aGlzLmNvbmZpZ3Muc3RyZWFtKTtcbiAgcmV0dXJuIHRoaXMuc3RyZWFtLnN0YXJ0KHRoaXMuaGFuZGxlU291cmNlRXZlbnQuYmluZCh0aGlzKSlcbiAgICAubmV4dCh0aGlzLnN0cmVhbS5yZWFkeS5iaW5kKHRoaXMuc3RyZWFtKSk7XG59O1xuXG5CYXNpYy5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5zdHJlYW0uc3RvcCgpO1xufTtcblxuQmFzaWMucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuc3RyZWFtLmRlc3Ryb3koKTtcbn07XG5cbkJhc2ljLnByb3RvdHlwZS5saXZlID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnN0cmVhbS51bnRpbCgnc3RvcCcpO1xufTtcblxuQmFzaWMucHJvdG90eXBlLmV4aXN0ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnN0cmVhbS51bnRpbCgnZGVzdHJveScpO1xufTtcblxuLyoqXG4gKiBNdXN0IHRyYW5zZmVyIHRvIG5leHQgc3RhdGUgdmlhIGNvbXBvbmVudCdzIG1ldGhvZC5cbiAqIE9yIHRoZSBjb21wb25lbnQgY2Fubm90IHRyYWNrIHRoZSBsYXN0IGFjdGl2ZSBzdGF0ZS5cbiAqL1xuQmFzaWMucHJvdG90eXBlLnRyYW5zZmVyVG8gPSBmdW5jdGlvbigpIHtcbiAgaWYgKHRoaXMuX3RyYW5zZmVycmVkKSB7XG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ1ByZXZlbnQgdHJhbnNmZXJyaW5nIHJhY2luZycpO1xuICAgIHZhciBudWxsaWZpemVkID0gbmV3IFN0cmVhbSgpO1xuICAgIC8vIFRoaXMgd291bGQgcmV0dXJuIGEgcHJvY2VzcyBjb3VsZCBiZSBjb25jYXRlZCBidXQgd291bGQgZG8gbm90aGluZy5cbiAgICAvLyBJdCdzIGJldHRlciB0byBmb3JtYWxseSBwcm92aWRlIGEgQVBJIGZyb20gUHJvY2VzcywgbGlrZVxuICAgIC8vIFByb2Nlc3MubWF5YmUoKSBvciBQcm9jZXNzI251bGxpemUoKSwgYnV0IHRoaXMgaXMgYSBzaW1wbGllciBzb2x1dGlvbi5cbiAgICByZXR1cm4gbnVsbGlmaXplZC5zdGFydCgpLm5leHQoKCkgPT4gbnVsbGlmaXplZC5zdG9wKCkpO1xuICB9XG4gIC8vIE5vIG5lZWQgdG8gcmVzZXQgaXQgYWdhaW4gc2luY2UgYSBzdGF0ZSBpbnN0YW5jZSBzaG91bGQgbm90IGJlXG4gIC8vIHRyYW5zZmVycmVkIHRvIHR3aWNlLlxuICB0aGlzLl90cmFuc2ZlcnJlZCA9IHRydWU7XG4gIHJldHVybiB0aGlzLmNvbXBvbmVudC50cmFuc2ZlclRvLmFwcGx5KHRoaXMuY29tcG9uZW50LCBhcmd1bWVudHMpO1xufTtcblxuLyoqXG4gKiBJZiB0aGlzIGhhbmRsZXIgcmV0dXJuIGEgUHJvbWlzZSwgb3IgUHJvY2VzcywgdGhlIHVuZGVybHlpbmcgU3RyZWFtXG4gKiBjYW4gbWFrZSBzdXJlIHRoZSBzdGVwcyBhcmUgcXVldWVkIGV2ZW4gd2l0aCBhc3luY2hyb25vdXMgc3RlcHMuXG4gKi9cbkJhc2ljLnByb3RvdHlwZS5oYW5kbGVTb3VyY2VFdmVudCA9IGZ1bmN0aW9uKCkge307XG5cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vYnVpbGRfc3RhZ2Uvc3JjL3N0YXRlL2Jhc2ljLmpzXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgeyBQcm9jZXNzIH0gZnJvbSAnc3JjL3Byb2Nlc3MvcHJvY2Vzcy5qcyc7XG5cbi8qKlxuICogQ29tYmluZSB0aGUgYWJpbGl0aWVzIG9mIHRoZSBldmVudCBoYW5kbGluZyBhbmQgYXN5bmNocm9ub3VzIG9wZXJhdGlvbnNcbiAqIHNlcXVlbnRpYWxpemluZyB0b2dldGhlci4gU28gdGhhdCBldmVyeSBTdHJlYW0gY291bGQ6XG4gKlxuICogMS4gRm9yIHRoZSBvcmRpbmFyeSBldmVudHMsIGFwcGVuZCBzdGVwcyB0byB0aGUgbWFpbiBQcm9jZXNzIHRvIHF1ZXVlXG4gKiAgICB0aGUgZXZlbnQgaGFuZGxlcnMuXG4gKiAyLiBGb3Igb3RoZXIgdXJnZW50IGV2ZW50cyAoaW50ZXJydXB0cyksIGltbWVkaWF0ZWx5IGV4ZWN1dGUgdGhlIGV2ZW50XG4gKiAgICBoYW5kbGVyIHdpdGhvdXQgcXVldWluZyBpdC5cbiAqIDMuIE9ubHkgcmVjZWl2ZSBldmVudHMgd2hlbiBpdCdzICdyZWFkeScuIEJlZm9yZSB0aGF0LCBubyBzb3VyY2UgZXZlbnRzXG4gKiAgICB3b3VsZCBiZSBmb3J3YXJkZWQgYW5kIGhhbmRsZWQuXG4gKiA0LiBPbmNlIHBoYXNlIGJlY29tZXMgJ3N0b3AnLCBubyBldmVudHMgd291bGQgYmUgcmVjZWl2ZWQgYWdhaW4uXG4gKlxuICogU3RyZWFtIHNob3VsZCBjcmVhdGUgd2l0aCBhIGNvbmZpZ3Mgb2JqZWN0IGlmIHVzZXIgd2FudCB0byBzZXQgdXAgc291cmNlcyxcbiAqIGV2ZW50cyBhbmQgaW50ZXJydXB0cy4gSWYgdGhlcmUgaXMgbm8gc3VjaCBvYmplY3QsIGl0IHdvdWxkIGFjdCBsaWtlIGFcbiAqIFByb2Nlc3MsIGFuZCB3aXRob3V0IGFueSBmdW5jdGlvbiBoYW5kbGVzIGV2ZW50cy5cbiAqKi9cbmV4cG9ydCBmdW5jdGlvbiBTdHJlYW0oY29uZmlncyA9IHt9KSB7XG4gIHRoaXMuY29uZmlncyA9IHtcbiAgICBldmVudHM6IGNvbmZpZ3MuZXZlbnRzIHx8IFtdLFxuICAgIGludGVycnVwdHM6IGNvbmZpZ3MuaW50ZXJydXB0cyB8fCBbXVxuICB9O1xuICBpZiAoY29uZmlncy5zb3VyY2VzICYmIDAgIT09IGNvbmZpZ3Muc291cmNlcy5sZW5ndGgpIHtcbiAgICB0aGlzLmNvbmZpZ3Muc291cmNlcyA9IGNvbmZpZ3Muc291cmNlcztcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmNvbmZpZ3Muc291cmNlcyA9IFtdO1xuICB9XG4gIHRoaXMuX2ZvcndhcmRUbyA9IG51bGw7XG4gIC8vIE5lZWQgdG8gZGVsZWdhdGUgdG8gU291cmNlLlxuICB0aGlzLm9uY2hhbmdlID0gdGhpcy5vbmNoYW5nZS5iaW5kKHRoaXMpO1xufVxuXG5TdHJlYW0ucHJvdG90eXBlLnBoYXNlID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnByb2Nlc3MuX3J1bnRpbWUuc3RhdGVzLnBoYXNlO1xufTtcblxuU3RyZWFtLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKGZvcndhcmRUbykge1xuICB0aGlzLl9mb3J3YXJkVG8gPSBmb3J3YXJkVG87XG4gIHRoaXMucHJvY2VzcyA9IG5ldyBQcm9jZXNzKCk7XG4gIHRoaXMucHJvY2Vzcy5zdGFydCgpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogS2ljayBvZmYgU291cmNlIGFuZCBzdGFydCBkbyB0aGluZ3MuXG4gKi9cblN0cmVhbS5wcm90b3R5cGUucmVhZHkgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5jb25maWdzLnNvdXJjZXMuZm9yRWFjaCgoc291cmNlKSA9PiB7XG4gICAgc291cmNlLnN0YXJ0KHRoaXMub25jaGFuZ2UpO1xuICB9KTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5TdHJlYW0ucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5wcm9jZXNzLnN0b3AoKTtcbiAgdGhpcy5jb25maWdzLnNvdXJjZXMuZm9yRWFjaCgoc291cmNlKSA9PiB7XG4gICAgc291cmNlLnN0b3AoKTtcbiAgfSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuU3RyZWFtLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMucHJvY2Vzcy5kZXN0cm95KCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuU3RyZWFtLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24oc3RlcCkge1xuICB0aGlzLnByb2Nlc3MubmV4dChzdGVwKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5TdHJlYW0ucHJvdG90eXBlLnJlc2N1ZSA9IGZ1bmN0aW9uKHJlc2N1ZXIpIHtcbiAgdGhpcy5wcm9jZXNzLnJlc2N1ZShyZXNjdWVyKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJldHVybiBhIFByb21pc2UgZ2V0IHJlc29sdmVkIHdoZW4gdGhlIHN0cmVhbSB0dXJuIHRvXG4gKiB0aGUgc3BlY2lmaWMgcGhhc2UuIEZvciBleGFtcGxlOlxuICpcbiAqICAgIHN0cmVhbS51bnRpbCgnc3RvcCcpXG4gKiAgICAgICAgICAudGhlbigoKSA9PiB7IGNvbnNvbGUubG9nKCdzdHJlYW0gc3RvcHBlZCcpIH0pO1xuICogICAgc3RyZWFtLnN0YXJ0KCk7XG4gKi9cblN0cmVhbS5wcm90b3R5cGUudW50aWwgPSBmdW5jdGlvbihwaGFzZSkge1xuICByZXR1cm4gdGhpcy5wcm9jZXNzLnVudGlsKHBoYXNlKTtcbn07XG5cbi8qKlxuICogT25seSB3aGVuIGFsbCB0YXNrcyBwYXNzZWQgaW4gZ2V0IHJlc29sdmVkLFxuICogdGhlIHByb2Nlc3Mgd291bGQgZ28gdG8gdGhlIG5leHQuXG4gKi9cblN0cmVhbS5wcm90b3R5cGUud2FpdCA9IGZ1bmN0aW9uKHRhc2tzKSB7XG4gIHRoaXMucHJvY2Vzcy53YWl0KHRhc2tzKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEl0IHdvdWxkIHJlY2VpdmUgZXZlbnRzIGZyb20gU291cmNlLCBhbmQgdGhhbiBxdWV1ZSBvciBub3QgcXVldWVcbiAqIGl0LCBkZXBlbmRzIG9uIHdoZXRoZXIgdGhlIGV2ZW50IGlzIGFuIGludGVycnVwdC5cbiAqL1xuU3RyZWFtLnByb3RvdHlwZS5vbmNoYW5nZSA9IGZ1bmN0aW9uKGV2dCkge1xuICBpZiAoJ3N0YXJ0JyAhPT0gdGhpcy5wcm9jZXNzLl9ydW50aW1lLnN0YXRlcy5waGFzZSkge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIGlmICgtMSAhPT0gdGhpcy5jb25maWdzLmludGVycnVwdHMuaW5kZXhPZihldnQudHlwZSkpIHtcbiAgICAvLyBJbnRlcnJ1cHQgd291bGQgYmUgaGFuZGxlZCBpbW1lZGlhdGVseS5cbiAgICB0aGlzLl9mb3J3YXJkVG8oZXZ0KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSBlbHNlIHtcbiAgICAvLyBFdmVudCB3b3VsZCBiZSBoYW5kbGVkIGFmdGVyIHF1ZXVpbmcuXG4gICAgLy8gVGhpcyBpcywgaWYgdGhlIGV2ZW50IGhhbmRsZSByZXR1cm4gYSBQcm9taXNlIG9yIFByb2Nlc3MsXG4gICAgLy8gdGhhdCBjYW4gYmUgZnVsZmlsbGVkIGxhdGVyLlxuICAgIHRoaXMucHJvY2Vzcy5uZXh0KCgpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLl9mb3J3YXJkVG8oZXZ0KTtcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxufTtcblxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9idWlsZF9zdGFnZS9zcmMvc3RyZWFtL3N0cmVhbS5qc1xuICoqLyIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHsgSW50ZXJmYWNlIH0gZnJvbSAnc3JjL3Byb2Nlc3MvaW50ZXJmYWNlLmpzJztcbmltcG9ydCB7IFJ1bnRpbWUgfSBmcm9tICdzcmMvcHJvY2Vzcy9ydW50aW1lLmpzJztcblxuLyoqXG4gKiBUaGUgY29yZSBjb21wb25lbnQgdG8gc2VxdWVudGlhbGl6ZSBhc3luY2hyb25vdXMgc3RlcHMuXG4gKiBCYXNpY2FsbHkgaXQncyBhbiAnaW50ZXJydXB0YWJsZSBwcm9taXNlJywgYnV0IG1vcmUgdGhhbiBiZSBpbnRlcnJ1cHRlZCxcbiAqIGl0IGNvdWxkICdzaGlmdCcgZnJvbSBvbmUgdG8gYW5vdGhlciBwaGFzZSwgd2l0aCB0aGUgbm9uLXByZWVtcHRpdmVcbiAqIGludGVycnVwdGluZyBtb2RlbC5cbiAqXG4gKiBFeGFtcGxlOlxuICogICAgdmFyIHByb2Nlc3MgPSBuZXcgUHJvY2VzcygpO1xuICogICAgcHJvY2Vzcy5zdGFydCgpICAgICAgIC8vIHRoZSBkZWZhdWx0IHBoYXNlIGlzICdzdGFydCdcbiAqICAgICAgICAgICAubmV4dChzdGVwQSlcbiAqICAgICAgICAgICAubmV4dChzdGVwQilcbiAqICAgICAgICAgICAuLi5cbiAqICAgIC8vIGxhdGVyLCBzb21lIHVyZ2VudCBldmVudHMgY29tZVxuICogICAgcHJvY2Vzcy5zdG9wKCkgICAgICAgLy8gb25lIG9mIHRoZSBkZWZhdWx0IHRocmVlIHBoYXNlc1xuICogICAgICAgICAgIC5uZXh0KHN0b3BTdGVwQSlcbiAqICAgICAgICAgICAubmV4dChzdG9wU3RlcEIpXG4gKiAgICAgICAgICAgLi4uLlxuICogICAvLyBsYXRlciwgc29tZSBvdGhlciBpbnRlcnJ1cHRzIGNvbWVcbiAqICAgcHJvY2Vzcy5zaGlmdCgnc3RvcCcsICdkaXp6eScpXG4gKiAgICAgICAgICAubmV4dChkaXp6eVN0ZXBBKVxuICogICAgICAgICAgLm5leHQoZGl6enlTdGVwQilcbiAqXG4gKiBUaGUgcGhhc2VzIGxpc3RlZCBhYm92ZSB3b3VsZCBpbW1lZGlhdGVseSBpbnRlcnJ1cHQgdGhlIHN0ZXBzIHNjaGVkdWxlZFxuICogYXQgdGhlIHByZXZpb3VzIHBoYXNlLiBIb3dldmVyLCB0aGlzIGlzIGEgKm5vbi1wcmVlbXB0aXZlKiBwcm9jZXNzIGJ5XG4gKiBkZWZhdWx0LiBTbywgaWYgdGhlcmUgaXMgYSBsb25nLXdhaXRpbmcgUHJvbWlzZSBzdGVwIGluIHRoZSAnc3RhcnQnIHBoYXNlOlxuICpcbiAqICAgcHJvY2Vzcy5zdGFydCgpXG4gKiAgICAgICAgICAubmV4dCggbG9uZ2xvbmdsb25nV2FpdGluZ1Byb21pc2UgKSAgIC8vIDwtLS0gbm93IGl0J3Mgd2FpdGluZyB0aGlzXG4gKiAgICAgICAgICAubmV4dCggdGhpc1N0ZXBJc1N0YXJ2aW5nIClcbiAqICAgICAgICAgIC5uZXh0KCBhbmRUaGlzT25lVG9vIClcbiAqICAgICAgICAgIC5uZXh0KCBwb29yU3RlcHMgKVxuICogICAgICAgICAgLi4uLlxuICogICAvLyBzb21lIHVyZ2VudCBldmVudCBvY2N1cnMgd2hlbiBpdCBnb2VzIHRvIHRoZSBsb25nIHdhaXRpbmcgcHJvbWlzZVxuICogICBwcm9jZXNzLnN0b3AoKVxuICogICAgICAgICAgLm5leHQoIGRvVGhpc0FzUXVpY2tBc1Bvc3NpYmxlIClcbiAqXG4gKiBUaGUgZmlyc3Qgc3RlcCBvZiB0aGUgJ3N0b3AnIHBoYXNlLCBuYW1lbHkgdGhlICdkb1RoaXNBc1F1aWNrQXNQb3NzaWJsZScsXG4gKiB3b3VsZCAqbm90KiBnZXQgZXhlY3V0ZWQgaW1tZWRpYXRlbHksIHNpbmNlIHRoZSBwcm9taXNlIGlzIHN0aWxsIHdhaXRpbmcgdGhlXG4gKiBsYXN0IHN0ZXAgZWFybGllciBpbnRlcnJ1cHRpb24uIFNvLCBldmVuIHRoZSBmb2xsb3dpbmcgc3RlcHMgb2YgdGhlICdzdGFydCdcbiAqIHBoYXNlIHdvdWxkIGFsbCBnZXQgZHJvcHBlZCwgdGhlIG5ldyBwaGFzZSBzdGlsbCBuZWVkIHRvIHdhaXQgdGhlIGxhc3Qgb25lXG4gKiBhc3luY2hyb25vdXMgc3RlcCBnZXQgcmVzb2x2ZWQgdG8gZ2V0IGtpY2tlZCBvZmYuXG4gKlxuICogLS0tXG4gKiAjIyBBYm91dCB0aGUgbm9uLXByZWVtcHRpdmUgbW9kZWxcbiAqXG4gKiBUaGUgcmVhc29uIHdoeSB3ZSBjYW4ndCBoYXZlIGEgcHJlZW1wdGl2ZSBwcm9jZXNzIGlzIGJlY2F1c2Ugd2UgY291bGRuJ3RcbiAqIGludGVycnVwdCBlYWNoIHNpbmdsZSBzdGVwIGluIHRoZSBwcm9jZXNzLCBzbyB0aGUgbW9zdCBiYXNpYyB1bml0IGNvdWxkIGJlXG4gKiBpbnRlcnJ1cHRlZCBpcyB0aGUgc3RlcC4gU28sIHRoZSBjYXZlYXQgaGVyZSBpcyBtYWtlIHRoZSBzdGVwIGFzIHNtYWxsIGFzXG4gKiBwb3NzaWJsZSwgYW5kIHRyZWF0IGl0IGFzIHNvbWUgYXRvbWljIG9wZXJhdGlvbiB0aGF0IGd1YXJhbnRlZWQgdG8gbm90IGJlZW5cbiAqIGludGVycnVwdGVkIGJ5IFByb2Nlc3MuIEZvciBleGFtcGxlLCBpZiB3ZSBhbGlhcyAnbmV4dCcgYXMgJ2F0b21pYyc6XG4gKlxuICogICAgcHJvY2Vzcy5zdGFydCgpXG4gKiAgICAgICAgICAgLmF0b21pYyhzdGVwQSkgICAgICAgLy8gPC0tLSBub3cgaXQncyB3YWl0aW5nIHRoaXNcbiAqICAgICAgICAgICAuYXRvbWljKHN0ZXBCKVxuICpcbiAqICAgLy8gc29tZSB1cmdlbnQgZXZlbnQgb2NjdXJzXG4gKiAgIHByb2Nlc3Muc3RvcCgpXG4gKiAgICAgICAgICAuYXRvbWljKCBkb1RoaXNBc1F1aWNrQXNQb3NzaWJsZSApXG4gKlxuICogSXQgd291bGQgYmUgYmV0dGVyIHRoYW46XG4gKlxuICogICAgcHJvY2Vzcy5zdGFydCgpXG4gKiAgICAgICAgICAgLmF0b21pYygoKSA9PiBzdGVwQS50aGVuKHN0ZXBCKSlcbiAqXG4gKiAgIC8vIHNvbWUgdXJnZW50IGV2ZW50IG9jY3Vyc1xuICogICBwcm9jZXNzLnN0b3AoKVxuICogICAgICAgICAgLmF0b21pYyggZG9UaGlzQXNRdWlja0FzUG9zc2libGUgKVxuICpcbiAqIFNpbmNlIGluIHRoZSBzZWNvbmQgZXhhbXBsZSB0aGUgZmlyc3Qgc3RlcCBvZiB0aGUgJ3N0b3AnIHBoYXNlIG11c3Qgd2FpdFxuICogYm90aCB0aGUgc3RlcEEgJiBzdGVwQiwgd2hpbGUgaW4gdGhlIGZpcnN0IG9uZSBpdCBvbmx5IG5lZWRzIHRvIHdhaXQgc3RlcEEuXG4gKiBIb3dldmVyLCB0aGlzIGRlcGVuZHMgb24gd2hpY2ggYXRvbWljIG9wZXJhdGlvbnMgaXMgbmVlZGVkLlxuICpcbiAqIE5ldmVydGhlbGVzcywgdXNlciBpcyBhYmxlIHRvIG1ha2UgdGhlIHN0ZXBzICdpbnRlcnJ1cHRpYmxlJyB2aWEgc29tZSBzcGVjaWFsXG4gKiBtZXRob2RzIG9mIHRoZSBwcm9jZXNzLiBUaGF0IGlzLCB0byBtb25pdG9yIHRoZSBwaGFzZSBjaGFuZ2VzIHRvIG51bGxpZnkgdGhlXG4gKiBzdGVwOlxuICpcbiAqICAgIHZhciBwcm9jZXNzID0gbmV3IFByb2Nlc3MoKTtcbiAqICAgIHByb2Nlc3Muc3RhcnQoKVxuICogICAgICAubmV4dCgoKSA9PiB7XG4gKiAgICAgICAgdmFyIHBoYXNlU2hpZnRlZCA9IGZhbHNlO1xuICogICAgICAgIHByb2Nlc3MudW50aWwoJ3N0b3AnKVxuICogICAgICAgICAgLm5leHQoKCkgPT4ge3BoYXNlU2hpZnRlZCA9IHRydWU7fSk7XG4gKiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyLCByaikgPT4ge1xuICogICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gKiAgICAgICAgICAgIGlmIChwaGFzZVNoaWZ0ZWQpIHsgY29uc29sZS5sb2coJ2RvIG5vdGhpbmcnKTsgfVxuICogICAgICAgICAgICBlbHNlICAgICAgICAgICAgICB7IGNvbnNvbGUubG9nKCdkbyBzb21ldGhpbmcnKTsgfVxuICogICAgICAgICAgfSwgMTAwMClcbiAqICAgICAgICB9KTtcbiAqICAgICAgfSlcbiAqXG4gKiAgIC8vIHNvbWUgdXJnZW50IGV2ZW50IG9jY3Vyc1xuICogICBwcm9jZXNzLnN0b3AoKVxuICogICAgICAgICAgLm5leHQoIGRvVGhpc0FzUXVpY2tBc1Bvc3NpYmxlIClcbiAqXG4gKiBTbyB0aGF0IHRoZSBmaXJzdCBzdGVwIG9mIHRoZSAnc3RvcCcgcGhhc2Ugd291bGQgZXhlY3V0ZSBpbW1lZGlhdGVseSBhZnRlclxuICogdGhlIHBoYXNlIHNoaWZ0ZWQsIHNpbmNlIHRoZSBsYXN0IHN0ZXAgb2YgdGhlIHByZXZpb3VzIHBoYXNlIGFib3J0ZWQgaXRzZWxmLlxuICogSW4gZnV0dXJlIHRoZSB0cmljayB0byBudWxsaWZ5IHRoZSBsYXN0IHN0ZXAgbWF5IGJlIGluY2x1ZGVkIGluIGFzIGEgbWV0aG9kXG4gKiBvZiBQcm9jZXNzLCBidXQgY3VycmVudGx5IHRoZSBtYW51YWwgZGV0ZWN0aW5nIGlzIHN0aWxsIG5lY2Vzc2FyeS5cbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gUHJvY2VzcygpIHtcbiAgdGhpcy5fcnVudGltZSA9IG5ldyBSdW50aW1lKCk7XG4gIHRoaXMuX2ludGVyZmFjZSA9IG5ldyBJbnRlcmZhY2UodGhpcy5fcnVudGltZSk7XG4gIHJldHVybiB0aGlzLl9pbnRlcmZhY2U7XG59XG5cbi8qKlxuICogQmVjYXVzZSBEUlkuXG4gKi9cblByb2Nlc3MuZGVmZXIgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHJlc29sdmUsIHJlamVjdDtcbiAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IHtcbiAgICByZXNvbHZlID0gcmVzO1xuICAgIHJlamVjdCA9IHJlajtcbiAgfSk7XG4gIHZhciByZXN1bHQgPSB7XG4gICAgJ3Jlc29sdmUnOiByZXNvbHZlLFxuICAgICdyZWplY3QnOiByZWplY3QsXG4gICAgJ3Byb21pc2UnOiBwcm9taXNlXG4gIH07XG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKiBTdGF0aWMgdmVyc2lvbiBmb3IgbWltaWNraW5nIFByb21pc2UuYWxsICovXG5Qcm9jZXNzLndhaXQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHByb2Nlc3MgPSBuZXcgUHJvY2VzcygpO1xuICByZXR1cm4gcHJvY2Vzcy5zdGFydCgpLndhaXQuYXBwbHkocHJvY2VzcywgYXJndW1lbnRzKTtcbn07XG5cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vYnVpbGRfc3RhZ2Uvc3JjL3Byb2Nlc3MvcHJvY2Vzcy5qc1xuICoqLyIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHsgTGFuZ3VhZ2UgfSBmcm9tICdzcmMvcnVuZS9sYW5ndWFnZS5qcyc7XG5cbi8qKlxuICogVGhpcyBsYW5ndWFnZSBpbnRlcmZhY2Ugd291bGQgcHJvdmlkZSBjYWxsYWJsZSBtZXRob2RzIG9mIHRoZSBQcm9jZXNzIGVEU0wuXG4gKlxuICogVGhlIGRpZmZlcmVuY2UgYmV0d2VlbiBpbnRlcmZhbmNlICYgcnVudGltZSBpczpcbiAqXG4gKiAgSW50ZXJmYWNlOiBtYW5hZ2UgdGhlIHN0YWNrIGFuZCBwcm92aWRlcyBhbmFseXplcnMgaWYgaXQncyBuZWNlc3NhcnkuXG4gKiAgUnVudGltZTogZXZhbHVhdGUgZXZlcnkgY2hhbmdlIChub2RlKSBvZiB0aGUgc3RhY2suXG4gKlxuICogU28gdGhpcyBpbnRlcmZhY2Ugd291bGQgY2hlY2sgaWYgdGhlcmUgYXJlIGFueSAnc3ludGF4JyBlcnJvciBkdXJpbmcgY29tcG9zZVxuICogdGhlIGVEU0wgaW5zdGFuY2UuIEZvciBleGFtcGxlLCB0aGUgYW5hbHl6ZXIgb2YgdGhlIGludGVyZmFjZSBjb3VsZCByZXBvcnRcbiAqIHRoaXMga2luZCBvZiBlcnJvcjpcbiAqXG4gKiAgcHJvY2Vzcy5zdG9wKCkuc3RhcnQoKS5uZXh0KCk7ICAgIC8vIEVSUk9SOiAnc3RvcCcgYmVmb3JlICdzdGFydCdcbiAqXG4gKiBBbmQgc2luY2UgdGhlIGludGVyZmFjZSB3b3VsZCBub3QgZXZhbHVhdGUgbm9kZXMsIGl0IHdvdWxkIGZvcndhcmQgc3RhY2tcbiAqIGNoYW5nZXMgdG8gdGhlIHJ1bnRpbWUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJbnRlcmZhY2UocnVudGltZSkge1xuICAvLyBSZXF1aXJlZCBieSB0aGUgJ0xhbmd1YWdlJyBtb2R1bGUuXG4gIHRoaXMuY29udGV4dCA9IHtcbiAgICBzdGFydGVkOiBmYWxzZSxcbiAgICBzdG9wcGVkOiBmYWxzZVxuICB9O1xuICB0aGlzLnN0YWNrID0gW107XG4gIHRoaXMuX3J1bnRpbWUgPSBydW50aW1lO1xuICB0aGlzLl9ldmFsdWF0b3IgPSAobmV3IExhbmd1YWdlLkV2YWx1YXRlKCkpXG4gICAgLmFuYWx5emVyKHRoaXMuX2FuYWx5emVPcmRlci5iaW5kKHRoaXMpKVxuICAgIC5pbnRlcnByZXRlcih0aGlzLl9pbnRlcnByZXQuYmluZCh0aGlzKSk7XG59XG5cbkludGVyZmFjZS5wcm90b3R5cGUuc3RhcnQgPSBMYW5ndWFnZS5kZWZpbmUoJ3N0YXJ0JywgJ2JlZ2luJyk7XG5JbnRlcmZhY2UucHJvdG90eXBlLnN0b3AgPSBMYW5ndWFnZS5kZWZpbmUoJ3N0b3AnLCAncHVzaCcpO1xuSW50ZXJmYWNlLnByb3RvdHlwZS5kZXN0cm95ID0gTGFuZ3VhZ2UuZGVmaW5lKCdkZXN0cm95JywgJ3B1c2gnKTtcbkludGVyZmFjZS5wcm90b3R5cGUubmV4dCA9IExhbmd1YWdlLmRlZmluZSgnbmV4dCcsICdwdXNoJyk7XG5JbnRlcmZhY2UucHJvdG90eXBlLnNoaWZ0ID0gTGFuZ3VhZ2UuZGVmaW5lKCdzaGlmdCcsICdwdXNoJyk7XG5JbnRlcmZhY2UucHJvdG90eXBlLnJlc2N1ZSA9IExhbmd1YWdlLmRlZmluZSgncmVzY3VlJywgJ3B1c2gnKTtcbkludGVyZmFjZS5wcm90b3R5cGUud2FpdCA9IExhbmd1YWdlLmRlZmluZSgnd2FpdCcsICdwdXNoJyk7XG5cbi8vIEl0J3Mgbm90IGEgbWV0aG9kIG93bnMgc2VtYW50aWNzIG1lYW5pbmcgb2YgdGhlIGVEU0wsIGJ1dCBhIG1ldGhvZFxuLy8gaW50ZXJhY3RzIHdpdGggdGhlIG1ldGFsYW5nYXVnZSwgc28gZGVmaW5lIGl0IGluIHRoaXMgd2F5LlxuSW50ZXJmYWNlLnByb3RvdHlwZS51bnRpbCA9XG5mdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuX3J1bnRpbWUudW50aWwuYXBwbHkodGhpcy5fcnVudGltZSwgYXJndW1lbnRzKTtcbn07XG5cbkludGVyZmFjZS5wcm90b3R5cGUub25jaGFuZ2UgPSBmdW5jdGlvbihjb250ZXh0LCBub2RlLCBzdGFjaykge1xuICAvLyBXaGVuIGl0J3MgY2hhbmdlZCwgZXZhbHVhdGUgaXQgd2l0aCBhbmFseXplcnMgJiBpbnRlcnByZXRlci5cbiAgcmV0dXJuIHRoaXMuX2V2YWx1YXRvcihjb250ZXh0LCBub2RlLCBzdGFjayk7XG59O1xuXG5JbnRlcmZhY2UucHJvdG90eXBlLl9pbnRlcnByZXQgPSBmdW5jdGlvbihjb250ZXh0LCBub2RlLCBzdGFjaykge1xuICAvLyBXZWxsIGluIHRoaXMgZURTTCB3ZSBkZWxlZ2F0ZSB0aGUgaW50ZXJwcmV0aW9uIHRvIHRoZSBydW50aW1lLlxuICByZXR1cm4gdGhpcy5fcnVudGltZS5vbmNoYW5nZS5hcHBseSh0aGlzLl9ydW50aW1lLCBhcmd1bWVudHMpO1xufTtcblxuLy8gSW4gdGhpcyBlRFNMIHdlIG5vdyBvbmx5IGhhdmUgdGhpcyBhbmFseXplci4gQ291bGQgYWRkIG1vcmUgYW5kIHJlZ2lzdGVyIGl0XG4vLyBpbiB0aGUgY29udHJ1Y3Rpb24gb2YgJ3RoaXMuX2V2YWx1YXRvcicuXG5JbnRlcmZhY2UucHJvdG90eXBlLl9hbmFseXplT3JkZXIgPSBmdW5jdGlvbihjb250ZXh0LCBjaGFuZ2UsIHN0YWNrKSB7XG4gIGlmICgnc3RhcnQnID09PSBjaGFuZ2UudHlwZSkge1xuICAgIGNvbnRleHQuc3RhcnRlZCA9IHRydWU7XG4gIH0gZWxzZSBpZiAoJ3N0b3AnKSB7XG4gICAgY29udGV4dC5zdG9wcGVkID0gdHJ1ZTtcbiAgfVxuICBpZiAoJ3N0YXJ0JyA9PT0gY2hhbmdlLnR5cGUgJiYgY29udGV4dC5zdG9wcGVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdTaG91bGQgbm90IHN0YXJ0IGEgcHJvY2VzcyBhZ2FpbicgK1xuICAgICAgICAnYWZ0ZXIgaXRcXCdzIGFscmVhZHkgc3RvcHBlZCcpO1xuICB9IGVsc2UgaWYgKCduZXh0JyA9PT0gY2hhbmdlLnR5cGUgJiYgIWNvbnRleHQuc3RhcnRlZCkge1xuICAgIHRocm93IG5ldyBFcnJvcignU2hvdWxkIG5vdCBjb25jYXQgc3RlcHMgd2hpbGUgaXRcXCdzIG5vdCBzdGFydGVkJyk7XG4gIH0gZWxzZSBpZiAoJ3N0b3AnID09PSBjaGFuZ2UudHlwZSAmJiAhY29udGV4dC5zdGFydGVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdTaG91bGQgbm90IHN0b3AgYSBwcm9jZXNzIGJlZm9yZSBpdFxcJ3Mgc3RhcnRlZCcpO1xuICB9XG59O1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9idWlsZF9zdGFnZS9zcmMvcHJvY2Vzcy9pbnRlcmZhY2UuanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBSdW50aW1lKCkge1xuICB0aGlzLnN0YXRlcyA9IHtcbiAgICBwaGFzZTogbnVsbCxcbiAgICBjdXJyZW50UHJvbWlzZTogbnVsbCxcbiAgICB1bnRpbDoge1xuICAgICAgcmVzb2x2ZXI6IG51bGwsXG4gICAgICBwaGFzZTogbnVsbFxuICAgIH0sXG4gICAgLy8gQHNlZTogI25leHRcbiAgICBzdGVwUmVzdWx0czogW10sXG4gIH07XG4gIHRoaXMuZGVidWdnaW5nID0ge1xuICAgIC8vIEBzZWU6ICNuZXh0XG4gICAgY3VycmVudFBoYXNlU3RlcHM6IDAsXG4gICAgY29sb3JzOiB0aGlzLmdlbmVyYXRlRGVidWdnaW5nQ29sb3IoKSxcbiAgICB0cnVuY2F0aW5nTGltaXQ6IDY0XG4gIH07XG4gIHRoaXMuY29uZmlncyA9IHtcbiAgICBkZWJ1ZzogZmFsc2VcbiAgfTtcbn1cblxuLyoqXG4gKiBXaGVuIHRoZSBzdGFjayBvZiBEU0wgY2hhbmdlcywgZXZhbHVhdGUgdGhlIExhbmd1YWdlLk5vZGUuXG4gKiBOb3RlOiBzaW5jZSBpbiB0aGlzIERTTCB3ZSBuZWVkbid0ICdleGl0JyBub2RlLCB3ZSBkb24ndCBoYW5kbGUgaXQuXG4gKiBGb3Igc29tZSBvdGhlciBEU0wgdGhhdCBtYXkgcmV0dXJuIHNvbWV0aGluZywgdGhlICdleGl0JyBub2RlIG11c3RcbiAqIGtlZXAgYSBmaW5hbCBzdGFjayB3aXRoIG9ubHkgcmVzdWx0IG5vZGUgaW5zaWRlIGFzIHRoZXIgcmV0dXJuIHZhbHVlLlxuICovXG5SdW50aW1lLnByb3RvdHlwZS5vbmNoYW5nZSA9IGZ1bmN0aW9uKGluc3RhbmNlLCBjaGFuZ2UsIHN0YWNrKSB7XG4gIC8vIFNpbmNlIHdlIGRvbid0IG5lZWQgdG8ga2VlcCB0aGluZ3MgaW4gc3RhY2sgdW50aWwgd2UgaGF2ZVxuICAvLyByZWFsIGFuYWx5emVycywgdGhlICdvbmNoYW5nZScgaGFuZGxlciB3b3VsZCByZXR1cm4gZW1wdHkgc3RhY2tcbiAgLy8gdG8gbGV0IHRoZSBsYW5ndWFnZSBydW50aW1lIGNsZWFyIHRoZSBzdGFjayBldmVyeSBpbnN0cnVjdGlvbi5cbiAgdGhpc1tjaGFuZ2UudHlwZV0uYXBwbHkodGhpcywgY2hhbmdlLmFyZ3MpO1xuICByZXR1cm4gW107XG59O1xuXG5cblJ1bnRpbWUucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuc3RhdGVzLnBoYXNlID0gJ3N0YXJ0JztcbiAgdGhpcy5zdGF0ZXMuY3VycmVudFByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoKTtcbn07XG5cblJ1bnRpbWUucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5zaGlmdCgnc3RhcnQnLCAnc3RvcCcpO1xufTtcblxuUnVudGltZS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnNoaWZ0KCdzdG9wJywgJ2Rlc3Ryb3knKTtcbn07XG5cblJ1bnRpbWUucHJvdG90eXBlLnNoaWZ0ID0gZnVuY3Rpb24ocHJldiwgY3VycmVudCkge1xuICAvLyBBbHJlYWR5IGluLlxuICBpZiAoY3VycmVudCA9PT0gdGhpcy5zdGF0ZXMucGhhc2UpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKHByZXYgIT09IHRoaXMuc3RhdGVzLnBoYXNlKSB7XG4gICAgdmFyIGVycm9yID0gbmV3IEVycm9yKGBNdXN0IGJlICR7cHJldn0gYmVmb3JlIHNoaWZ0IHRvICR7Y3VycmVudH0sXG4gICAgICAgICAgICAgICAgICAgICBidXQgbm93IGl0J3MgJHt0aGlzLnN0YXRlcy5waGFzZX1gKTtcbiAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxuICB0aGlzLnN0YXRlcy5waGFzZSA9IGN1cnJlbnQ7XG4gIGlmICh0aGlzLnVudGlsLnBoYXNlID09PSB0aGlzLnN0YXRlcy5waGFzZSkge1xuICAgIHRoaXMudW50aWwucmVzb2x2ZXIoKTtcbiAgfVxuICAvLyBDb25jYXQgbmV3IHN0ZXAgdG8gc3dpdGNoIHRvIHRoZSAnbmV4dCBwcm9taXNlJy5cbiAgdGhpcy5zdGF0ZXMuY3VycmVudFByb21pc2UgPVxuICB0aGlzLnN0YXRlcy5jdXJyZW50UHJvbWlzZS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgaWYgKCEoZXJyIGluc3RhbmNlb2YgUnVudGltZS5JbnRlcnJ1cHRFcnJvcikpIHtcbiAgICAgIC8vIFdlIG5lZWQgdG8gcmUtdGhyb3cgaXQgYWdhaW4gYW5kIGJ5cGFzcyB0aGUgd2hvbGVcbiAgICAgIC8vIHBoYXNlLCB1bnRpbCB0aGUgbmV4dCBwaGFzZSAoZmluYWwgcGhhc2UpIHRvXG4gICAgICAvLyBoYW5kbGUgaXQuIFNpbmNlIGluIFByb21pc2UsIHN0ZXBzIGFmdGVyIGNhdGNoIHdvdWxkXG4gICAgICAvLyBub3QgYmUgYWZmZWN0ZWQgYnkgdGhlIGNhdGNoZWQgZXJyb3IgYW5kIGtlZXAgZXhlY3V0aW5nLlxuICAgICAgdGhyb3cgZXJyO1xuICAgIH1cbiAgICAvLyBBbmQgaWYgaXQncyBhbiBpbnRlcnJ1cHQgZXJyb3Igd2UgZG8gbm90aGluZywgc28gdGhhdCBpdCB3b3VsZFxuICAgIC8vIG1ha2UgdGhlIGNoYWluIG9taXQgdGhpcyBlcnJvciBhbmQgZXhlY3V0ZSB0aGUgZm9sbG93aW5nIHN0ZXBzLlxuICB9KTtcbiAgLy8gQXQgdGhlIG1vbWVudCBvZiBzaGlmdGluZywgdGhlcmUgYXJlIG5vIHN0ZXBzIGJlbG9uZyB0byB0aGUgbmV3IHBoYXNlLlxuICB0aGlzLmRlYnVnZ2luZy5jdXJyZW50UGhhc2VTdGVwcyA9IDA7XG59O1xuXG4vKipcbiAqIFJldHVybiBhIFByb21pc2UgdGhhdCBvbmx5IGJlIHJlc29sdmVkIHdoZW4gd2UgZ2V0IHNoaWZlZCB0byB0aGVcbiAqIHRhcmdldCBwaGFzZS5cbiAqL1xuUnVudGltZS5wcm90b3R5cGUudW50aWwgPSBmdW5jdGlvbihwaGFzZSkge1xuICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXMpID0+IHtcbiAgICB0aGlzLnN0YXRlcy51bnRpbC5yZXNvbHZlciA9IHJlcztcbiAgfSk7XG4gIHJldHVybiBwcm9taXNlO1xufTtcblxuLyoqXG4gKiBUaGUgJ3N0ZXAnIGNhbiBvbmx5IGJlIGEgZnVuY3Rpb24gcmV0dXJuIFByb21pc2UvUHJvY2Vzcy9wbGFpbiB2YWx1ZS5cbiAqIE5vIG1hdHRlciBhIFByb21pc2Ugb3IgUHJvY2VzcyBpdCB3b3VsZCByZXR1cm4sXG4gKiB0aGUgY2hhaW4gd291bGQgY29uY2F0IGl0IGFzIHRoZSBQcm9taXNlIHJ1bGUuXG4gKiBJZiBpdCdzIHBsYWluIHZhbHVlIHRoZW4gdGhpcyBwcm9jZXNzIHdvdWxkIGlnbm9yZSBpdCwgYXNcbiAqIHdoYXQgYSBQcm9taXNlIGRvZXMuXG4gKlxuICogQWJvdXQgdGhlIHJlc29sdmluZyB2YWx1ZXM6XG4gKlxuICogLm5leHQoIGZuUmVzb2x2ZUEsIGZuUmVzb2x2ZUIgKSAgLS0+ICNzYXZlIFthLCBiXSBpbiB0aGlzIHByb2Nlc3NcbiAqIC5uZXh0KCBmblJlc29sdmVDICkgICAgICAgICAgICAgIC0tPiAjcmVjZWl2ZSBbYSwgYl0gYXMgZmlyc3QgYXJndW1lbnRcbiAqIC5uZXh0KCBmblJlc29sdmVEICkgICAgICAgICAgICAgIC0tPiAjcmVjZWl2ZSBjIGFzIGZpcnN0IGFyZ3VtZW50XG4gKiAubmV4dCggZm5SZXNvbHZlRSwgZm5SZXNvbHZlRikgICAtLT4gI2VhY2ggb2YgdGhlbSByZWNlaXZlIGQgYXMgYXJndW1lbnRcbiAqL1xuUnVudGltZS5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uKC4uLnRhc2tzKSB7XG4gIGlmICghdGhpcy5zdGF0ZXMuY3VycmVudFByb21pc2UpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Byb2Nlc3Mgc2hvdWxkIGluaXRpYWxpemUgd2l0aCB0aGUgYHN0YXJ0YCBtZXRob2QnKTtcbiAgfVxuICAvLyBBdCBkZWZpbml0aW9uIHN0YWdlLCBzZXQgaXQncyBwaGFzZS5cbiAgLy8gQW5kIGNoZWNrIGlmIGl0J3MgYSBmdW5jdGlvbi5cbiAgdGFza3MuZm9yRWFjaCgodGFzaykgPT4ge1xuICAgIGlmICgnZnVuY3Rpb24nICE9PSB0eXBlb2YgdGFzaykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGUgdGFzayBpcyBub3QgYSBmdW5jdGlvbjogJHt0YXNrfWApO1xuICAgIH1cbiAgICB0YXNrLnBoYXNlID0gdGhpcy5zdGF0ZXMucGhhc2U7XG4gICAgaWYgKHRoaXMuY29uZmlncy5kZWJ1Zykge1xuICAgICAgLy8gTXVzdCBhcHBlbmQgc3RhY2sgaW5mb3JtYXRpb24gaGVyZSB0byBsZXQgZGVidWdnZXIgb3V0cHV0XG4gICAgICAvLyBpdCdzIGRlZmluZWQgaW4gd2hlcmUuXG4gICAgICB0YXNrLnRyYWNpbmcgPSB7XG4gICAgICAgIHN0YWNrOiAobmV3IEVycm9yKCkpLnN0YWNrXG4gICAgICB9O1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gRmlyc3QsIGNvbmNhdCBhICd0aGVuJyB0byBjaGVjayBpbnRlcnJ1cHQuXG4gIHRoaXMuc3RhdGVzLmN1cnJlbnRQcm9taXNlID1cbiAgICB0aGlzLnN0YXRlcy5jdXJyZW50UHJvbWlzZS50aGVuKCgpID0+IHtcbiAgICAgIC8vIFdvdWxkIGNoZWNrOiBpZiB0aGUgcGhhc2UgaXQgYmVsb25ncyB0byBpcyBub3Qgd2hhdCB3ZSdyZSBpbixcbiAgICAgIC8vIHRoZSBwcm9jZXNzIG5lZWQgdG8gYmUgaW50ZXJycHV0ZWQuXG4gICAgICBmb3IgKHZhciB0YXNrIG9mIHRhc2tzKSB7XG4gICAgICAgIGlmICh0aGlzLmNoZWNrSW50ZXJydXB0KHRhc2spKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFJ1bnRpbWUuSW50ZXJydXB0RXJyb3IoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gIC8vIFJlYWQgaXQgYXM6XG4gIC8vIDEuIGV4ZWN1dGUgYWxsIHRhc2tzIHRvIGdlbmVyYXRlIHJlc29sdmFibGUtcHJvbWlzZXNcbiAgLy8gMi4gUHJvbWlzZS5hbGwoLi4uKSB0byB3YWl0IHRoZXNlIHJlc29sdmFibGUtcHJvbWlzZXNcbiAgLy8gMy4gYXBwZW5kIGEgZ2VuZXJhbCBlcnJvciBoYW5kbGVyIGFmdGVyIHRoZSBQcm9taXNlLmFsbFxuICAvLyAgICBzbyB0aGF0IGlmIGFueSBlcnJvciBvY2N1cnMgaXQgd291bGQgcHJpbnQgdGhlbSBvdXRcbiAgLy8gU28sIGluY2x1ZGluZyB0aGUgY29kZSBhYm92ZSwgd2Ugd291bGQgaGF2ZTpcbiAgLy9cbiAgLy8gY3VycmVudFByb21pc2Uge1xuICAvLyAgW2NoZWNrSW50ZXJydXB0KHRhc2tzKV1cbiAgLy8gIFtQcm9taXNlLmFsbChbdGFza0ExLCB0YXNrQTIuLi5dKV1cbiAgLy8gIFtlcnJvciBoYW5kbGVyXSArfVxuICAvL1xuICAvLyBUaGUgJ2NoZWNrSW50ZXJydXB0JyBhbmQgJ2Vycm9yIGhhbmRsZXInIHdyYXAgdGhlIGFjdHVhbCBzdGVwc1xuICAvLyB0byBkbyB0aGUgbmVjZXNzYXJ5IGNoZWNrcy5cbiAgdGhpcy5zdGF0ZXMuY3VycmVudFByb21pc2UgPVxuICAgIHRoaXMuc3RhdGVzLmN1cnJlbnRQcm9taXNlLnRoZW4oKCkgPT4gdGhpcy5nZW5lcmF0ZVN0ZXAodGFza3MpKTtcbiAgdGhpcy5zdGF0ZXMuY3VycmVudFByb21pc2UgPVxuICAgIHRoaXMuc3RhdGVzLmN1cnJlbnRQcm9taXNlLmNhdGNoKHRoaXMuZ2VuZXJhdGVFcnJvckxvZ2dlcih7XG4gICAgICAnbnRoLXN0ZXAnOiB0aGlzLmRlYnVnZ2luZy5jdXJyZW50UGhhc2VTdGVwc1xuICAgIH0pKTtcblxuICAvLyBBIHdheSB0byBrbm93IGlmIHRoZXNlIHRhc2tzIGlzIHRoZSBmaXJzdCBzdGVwcyBpbiB0aGUgY3VycmVudCBwaGFzZSxcbiAgLy8gYW5kIGl0J3MgYWxzbyBjb252ZW5pZW50IGZvciBkZWJ1Z2dpbmcuXG4gIHRoaXMuZGVidWdnaW5nLmN1cnJlbnRQaGFzZVN0ZXBzICs9IDE7XG5cbn07XG5cblJ1bnRpbWUucHJvdG90eXBlLnJlc2N1ZSA9IGZ1bmN0aW9uKGhhbmRsZXIpIHtcbiAgdGhpcy5zdGF0ZXMuY3VycmVudFByb21pc2UgPVxuICAgIHRoaXMuc3RhdGVzLmN1cnJlbnRQcm9taXNlLmNhdGNoKChlcnIpID0+IHtcbiAgICBpZiAoZXJyIGluc3RhbmNlb2YgUnVudGltZS5JbnRlcnJ1cHRFcnJvcikge1xuICAgICAgLy8gT25seSBidWlsdC1pbiBwaGFzZSB0cmFuc2ZlcnJpbmcgY2F0Y2ggY2FuIGhhbmRsZSBpbnRlcnJ1cHRzLlxuICAgICAgLy8gUmUtdGhyb3cgaXQgdW50aWwgd2UgcmVhY2ggdGhlIGZpbmFsIGNhdGNoIHdlIHNldC5cbiAgICAgIHRocm93IGVycjtcbiAgICB9IGVsc2Uge1xuICAgICAgaGFuZGxlcihlcnIpO1xuICAgIH1cbiAgfSk7XG59O1xuXG4vKipcbiAqIEFuIGludGVyZmFjZSB0byBleHBsaWNpdGx5IHB1dCBtdWx0aXBsZSB0YXNrcyBleGVjdXRlIGF0IG9uZSB0aW1lLlxuICoqL1xuUnVudGltZS5wcm90b3R5cGUud2FpdCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLm5leHQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG5cbi8qKlxuICogRXhlY3V0ZSB0YXNrIGFuZCBnZXQgUHJvbWlzZXMgb3IgcGxhaW4gdmFsdWVzIHRoZW0gcmV0dXJuLFxuICogYW5kIHRoZW4gcmV0dXJuIHRoZSB3cmFwcGVkIFByb21pc2UgYXMgdGhlIG5leHQgc3RlcCBvZiB0aGlzXG4gKiBwcm9jZXNzLiBUaGUgbmFtZSAnc3RlcCcgaW5kaWNhdGVzIHRoZSBnZW5lcmF0ZWQgUHJvbWlzZSxcbiAqIHdoaWNoIGlzIG9uZSBzdGVwIG9mIHRoZSBtYWluIFByb21pc2Ugb2YgdGhlIGN1cnJlbnQgcGhhc2UuXG4gKi9cblJ1bnRpbWUucHJvdG90eXBlLmdlbmVyYXRlU3RlcCA9IGZ1bmN0aW9uKHRhc2tzKSB7XG4gIC8vICd0YXNrUmVzdWx0cycgbWVhbnMgdGhlIHJlc3VsdHMgb2YgdGhlIHRhc2tzLlxuICB2YXIgdGFza1Jlc3VsdHMgPSBbXTtcbiAgaWYgKHRydWUgPT09IHRoaXMuY29uZmlncy5kZWJ1Zykge1xuICAgIHRoaXMudHJhY2UodGFza3MpO1xuICB9XG5cbiAgLy8gU28gd2UgdW53cmFwIHRoZSB0YXNrIGZpcnN0LCBhbmQgdGhlbiBwdXQgaXQgaW4gdGhlIGFycmF5LlxuICAvLyBTaW5jZSB3ZSBuZWVkIHRvIGdpdmUgdGhlICdjdXJyZW50UHJvbWlzZScgYSBmdW5jdGlvbiBhcyB3aGF0IHRoZVxuICAvLyB0YXNrcyBnZW5lcmF0ZSBoZXJlLlxuICB2YXIgY2hhaW5zID0gdGFza3MubWFwKCh0YXNrKSA9PiB7XG4gICAgLy8gUmVzZXQgdGhlIHJlZ2lzdGVyZWQgcmVzdWx0cy5cbiAgICAvLyAncHJldmlvdXNSZXN1bHRzJyBtZWFucyB0aGUgcmVzdWx0cyBsZWZ0IGJ5IHRoZSBwcmV2aW91cyBzdGVwLlxuICAgIHZhciBwcmV2aW91c1Jlc3VsdHMgPSB0aGlzLnN0YXRlcy5zdGVwUmVzdWx0cztcbiAgICB2YXIgY2hhaW47XG4gICAgLy8gSWYgaXQgaGFzIG11bHRpcGxlIHJlc3VsdHMsIG1lYW5zIGl0J3MgYSB0YXNrIGdyb3VwXG4gICAgLy8gZ2VuZXJhdGVkIHJlc3VsdHMuXG4gICAgaWYgKHByZXZpb3VzUmVzdWx0cy5sZW5ndGggPiAxKSB7XG4gICAgICBjaGFpbiA9IHRhc2socHJldmlvdXNSZXN1bHRzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2hhaW4gPSB0YXNrKHByZXZpb3VzUmVzdWx0c1swXSk7XG4gICAgfVxuICAgIC8vIE9yZGluYXJ5IGZ1bmN0aW9uIHJldHVybnMgJ3VuZGVmaW5lJyBvciBvdGhlciB0aGluZ3MuXG4gICAgaWYgKCFjaGFpbikge1xuICAgICAgLy8gSXQncyBhIHBsYWluIHZhbHVlLlxuICAgICAgLy8gU3RvcmUgaXQgYXMgb25lIG9mIHJlc3VsdHMuXG4gICAgICB0YXNrUmVzdWx0cy5wdXNoKGNoYWluKTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoY2hhaW4pO1xuICAgIH1cblxuICAgIC8vIEl0J3MgYSBQcm9jZXNzLlxuICAgIGlmICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mIGNoYWluLl9ydW50aW1lICYmXG4gICAgICAgIGNoYWluLl9ydW50aW1lIGluc3RhbmNlb2YgUnVudGltZSkge1xuICAgICAgLy8gUHJlbWlzZTogaXQncyBhIHN0YXJ0ZWQgcHJvY2Vzcy5cbiAgICAgIHJldHVybiBjaGFpbi5fcnVudGltZS5zdGF0ZXMuY3VycmVudFByb21pc2UudGhlbigoKSA9PiB7XG4gICAgICAgIHZhciBndWVzdFJlc3VsdHMgPSBjaGFpbi5fcnVudGltZS5zdGF0ZXMuc3RlcFJlc3VsdHM7XG4gICAgICAgIC8vIFNpbmNlIHdlIGltcGxpY2l0bHkgdXNlICdQcm9taXNlLmFsbCcgdG8gcnVuXG4gICAgICAgIC8vIG11bHRpcGxlIHRhc2tzIGluIG9uZSBzdGVwLCB3ZSBuZWVkIHRvIGRldGVybWluYXRlIGlmXG4gICAgICAgIC8vIHRoZXJlIGlzIG9ubHkgb25lIHRhc2sgaW4gdGhlIHRhc2ssIG9yIGl0IGFjdHVhbGx5IGhhcyBtdWx0aXBsZVxuICAgICAgICAvLyByZXR1cm4gdmFsdWVzIGZyb20gbXVsdGlwbGUgdGFza3MuXG4gICAgICAgIGlmIChndWVzdFJlc3VsdHMubGVuZ3RoID4gMSkge1xuICAgICAgICAgIC8vIFdlIG5lZWQgdG8gdHJhbnNmZXIgdGhlIHJlc3VsdHMgZnJvbSB0aGUgZ3Vlc3QgUHJvY2VzcyB0byB0aGVcbiAgICAgICAgICAvLyBob3N0IFByb2Nlc3MuXG4gICAgICAgICAgdGFza1Jlc3VsdHMgPSB0YXNrUmVzdWx0cy5wdXNoKGd1ZXN0UmVzdWx0cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGFza1Jlc3VsdHMucHVzaChjaGFpbi5fcnVudGltZS5zdGF0ZXMuc3RlcFJlc3VsdHNbMF0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKGNoYWluLnRoZW4pIHtcbiAgICAgIC8vIE9yZGluYXJ5IHByb21pc2UgY2FuIGJlIGNvbmNhdGVkIGltbWVkaWF0ZWx5LlxuICAgICAgcmV0dXJuIGNoYWluLnRoZW4oKHJlc29sdmVkVmFsdWUpID0+IHtcbiAgICAgICAgdGFza1Jlc3VsdHMucHVzaChyZXNvbHZlZFZhbHVlKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJdCdzIGEgcGxhaW4gdmFsdWUuXG4gICAgICAvLyBTdG9yZSBpdCBhcyBvbmUgb2YgcmVzdWx0cy5cbiAgICAgIHRhc2tSZXN1bHRzLnB1c2goY2hhaW4pO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShjaGFpbik7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIFByb21pc2UuYWxsKGNoYWlucykudGhlbigoKSA9PiB7XG4gICAgLy8gQmVjYXVzZSBpbiB0aGUgcHJldmlvdXMgJ2FsbCcgd2UgZW5zdXJlIGFsbCB0YXNrcyBhcmUgZXhlY3V0ZWQsXG4gICAgLy8gYW5kIHRoZSByZXN1bHRzIG9mIHRoZXNlIHRhc2tzIGFyZSBjb2xsZWN0ZWQsIHNvIHdlIG5lZWRcbiAgICAvLyB0byByZWdpc3RlciB0aGVtIGFzIHRoZSBsYXN0IHJlc3VsdHMgb2YgdGhlIGxhc3Qgc3RlcC5cbiAgICB0aGlzLnN0YXRlcy5zdGVwUmVzdWx0cyA9IHRhc2tSZXN1bHRzO1xuICB9KTtcbn07XG5cbi8qKiBXZSBuZWVkIHRoaXMgdG8gcHJldmVudCB0aGUgc3RlcCgpIHRocm93IGVycm9ycy5cbiogSW4gdGhpcyBjYXRjaCwgd2UgZGlzdGluZ3Vpc2ggdGhlIGludGVycnVwdCBhbmQgb3RoZXIgZXJyb3JzLFxuKiBhbmQgdGhlbiBieXBhc3MgdGhlIGZvcm1lciBhbmQgcHJpbnQgdGhlIGxhdGVyIG91dC5cbipcbiogVGhlIGZpbmFsIGZhdGUgb2YgdGhlIHJlYWwgZXJyb3JzIGlzIGl0IHdvdWxkIGJlIHJlLXRocm93IGFnYWluXG4qIGFmdGVyIHdlIHByaW50IHRoZSBpbnN0YW5jZSBvdXQuIFdlIG5lZWQgdG8gZG8gdGhhdCBzaW5jZSBhZnRlciBhblxuKiBlcnJvciB0aGUgcHJvbWlzZSBzaG91bGRuJ3Qga2VlcCBleGVjdXRpbmcuIElmIHdlIGRvbid0IHRocm93IGl0XG4qIGFnYWluLCBzaW5jZSB0aGUgZXJyb3IgaGFzIGJlZW4gY2F0Y2hlZCwgdGhlIHJlc3Qgc3RlcHMgaW4gdGhlXG4qIHByb21pc2Ugd291bGQgc3RpbGwgYmUgZXhlY3V0ZWQsIGFuZCB0aGUgdXNlci1zZXQgcmVzY3VlcyB3b3VsZFxuKiBub3QgY2F0Y2ggdGhpcyBlcnJvci5cbipcbiogQXMgYSBjb25jbHVzaW9uLCBubyBtYXR0ZXIgd2hldGhlciB0aGUgZXJyb3IgaXMgYW4gaW50ZXJydXB0LFxuKiB3ZSBhbGwgbmVlZCB0byB0aHJvdyBpdCBhZ2Fpbi4gVGhlIG9ubHkgZGlmZmVyZW5jZSBpcyBpZiBpdCdzXG4qIGFuZCBpbnRlcnJ1cHQgd2UgZG9uJ3QgcHJpbnQgaXQgb3V0LlxuKi9cblJ1bnRpbWUucHJvdG90eXBlLmdlbmVyYXRlRXJyb3JMb2dnZXIgPSBmdW5jdGlvbihkZWJ1Z2luZm8pIHtcbiAgcmV0dXJuIChlcnIpID0+IHtcbiAgICBpZiAoIShlcnIgaW5zdGFuY2VvZiBSdW50aW1lLkludGVycnVwdEVycm9yKSkge1xuICAgICAgY29uc29sZS5lcnJvcihgRVJST1IgZHVyaW5nICMke2RlYnVnaW5mb1snbnRoLXN0ZXAnXX1cbiAgICAgICAgICBzdGVwIGV4ZWN1dGVzOiAke2Vyci5tZXNzYWdlfWAsIGVycik7XG4gICAgfVxuICAgIHRocm93IGVycjtcbiAgfTtcbn07XG5cblJ1bnRpbWUucHJvdG90eXBlLmNoZWNrSW50ZXJydXB0ID0gZnVuY3Rpb24oc3RlcCkge1xuICBpZiAoc3RlcC5waGFzZSAhPT0gdGhpcy5zdGF0ZXMucGhhc2UpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG5SdW50aW1lLnByb3RvdHlwZS5nZW5lcmF0ZURlYnVnZ2luZ0NvbG9yID0gZnVuY3Rpb24oKSB7XG4gIGNvbnN0IGNvbG9yc2V0cyA9IFtcbiAgICB7IGJhY2tncm91bmQ6ICdyZWQnLCBmb3JlZ3JvdW5kOiAnd2hpdGUnIH0sXG4gICAgeyBiYWNrZ3JvdW5kOiAnZ3JlZW4nLCBmb3JlZ3JvdW5kOiAnd2hpdGUnIH0sXG4gICAgeyBiYWNrZ3JvdW5kOiAnYmx1ZScsIGZvcmVncm91bmQ6ICd3aGl0ZScgfSxcbiAgICB7IGJhY2tncm91bmQ6ICdzYWRkbGVCcm93bicsIGZvcmVncm91bmQ6ICd3aGl0ZScgfSxcbiAgICB7IGJhY2tncm91bmQ6ICdjeWFuJywgZm9yZWdyb3VuZDogJ2RhcmtTbGF0ZUdyYXknIH0sXG4gICAgeyBiYWNrZ3JvdW5kOiAnZ29sZCcsIGZvcmVncm91bmQ6ICdkYXJrU2xhdGVHcmF5JyB9LFxuICAgIHsgYmFja2dyb3VuZDogJ3BhbGVHcmVlbicsIGZvcmVncm91bmQ6ICdkYXJrU2xhdGVHcmF5JyB9LFxuICAgIHsgYmFja2dyb3VuZDogJ3BsdW0nLCBmb3JlZ3JvdW5kOiAnZGFya1NsYXRlR3JheScgfVxuICBdO1xuICB2YXIgY29sb3JzZXQgPSBjb2xvcnNldHNbIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGNvbG9yc2V0cy5sZW5ndGgpIF07XG4gIHJldHVybiBjb2xvcnNldDtcbn07XG5cblJ1bnRpbWUucHJvdG90eXBlLnRyYWNlID0gZnVuY3Rpb24odGFza3MpIHtcbiAgaWYgKGZhbHNlID09PSB0aGlzLmNvbmZpZ3MuZGVidWcpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIGxvZyA9IHRhc2tzLnJlZHVjZSgobWVyZ2VkTWVzc2FnZSwgdGFzaykgPT4ge1xuICAgIHZhciBzb3VyY2UgPSBTdHJpbmcuc3Vic3RyaW5nKHRhc2sudG9Tb3VyY2UoKSwgMCxcbiAgICAgIHRoaXMuZGVidWdnaW5nLnRydW5jYXRpbmdMaW1pdCk7XG4gICAgdmFyIG1lc3NhZ2UgPSBgICR7IHNvdXJjZSB9IGA7XG4gICAgcmV0dXJuIG1lcmdlZE1lc3NhZ2UgKyBtZXNzYWdlO1xuICB9LCBgJWMgJHsgdGFza3NbMF0ucGhhc2UgfSMkeyB0aGlzLmRlYnVnZ2luZy5jdXJyZW50UGhhc2VTdGVwcyB9IHwgYCk7XG4gIC8vIERvbid0IHByaW50IHRob3NlIGluaGVyaXRlZCBmdW5jdGlvbnMuXG4gIHZhciBzdGFja0ZpbHRlciA9IG5ldyBSZWdFeHAoJ14oR2xlaXBuaXJCYXNpY3xQcm9jZXNzfFN0cmVhbSknKTtcbiAgdmFyIHN0YWNrID0gdGFza3NbMF0udHJhY2luZy5zdGFjay5zcGxpdCgnXFxuJykuZmlsdGVyKChsaW5lKSA9PiB7XG4gICAgcmV0dXJuICcnICE9PSBsaW5lO1xuICB9KS5maWx0ZXIoKGxpbmUpID0+IHtcbiAgICByZXR1cm4gIWxpbmUubWF0Y2goc3RhY2tGaWx0ZXIpO1xuICB9KS5qb2luKCdcXG4nKTtcblxuICBsb2cgPSBsb2cgKyAnIHwgXFxuXFxyJyArIHN0YWNrO1xuICBjb25zb2xlLmxvZyhsb2csICdiYWNrZ3JvdW5kLWNvbG9yOiAnKyB0aGlzLmRlYnVnZ2luZy5jb2xvcnMuYmFja2dyb3VuZCArXG4gICAgJzsnICsgJ2NvbG9yOiAnICsgdGhpcy5kZWJ1Z2dpbmcuY29sb3JzLmZvcmVncm91bmQpO1xufTtcblxuUnVudGltZS5JbnRlcnJ1cHRFcnJvciA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgdGhpcy5uYW1lID0gJ0ludGVycnVwdEVycm9yJztcbiAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZSB8fCAnJztcbn07XG5cblJ1bnRpbWUuSW50ZXJydXB0RXJyb3IucHJvdG90eXBlID0gbmV3IEVycm9yKCk7XG5cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vYnVpbGRfc3RhZ2Uvc3JjL3Byb2Nlc3MvcnVudGltZS5qc1xuICoqLyJdLCJzb3VyY2VSb290IjoiIn0=