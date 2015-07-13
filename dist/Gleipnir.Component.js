/**
 * gleipnir.js - Gleipnir.js - a library for UI programming
 * @version v0.0.1
 * @link 
 * @license Apache 2.0
 */
var Gleipnir = Gleipnir || {}; Gleipnir["Component"] =
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
/******/ ({

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(12);


/***/ },

/***/ 1:
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

/***/ 12:
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

/***/ }

/******/ });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNjgzYzcyYWJiOGUxNDNhMTM4MGM/N2MyNyoqKioqIiwid2VicGFjazovLy8uL2J1aWxkX3N0YWdlL3NyYy9sb2dnZXIvc3RhdGUuanM/YzJhMyoiLCJ3ZWJwYWNrOi8vLy4vYnVpbGRfc3RhZ2Uvc3JjL2NvbXBvbmVudC9iYXNpYy5qcz8yOTBmIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsdUJBQWU7QUFDZjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7Ozs7OztBQ3RDQSxhQUFZLENBQUM7Ozs7O1NBTUcsS0FBSyxHQUFMLEtBQUs7Ozs7OztBQUFkLFVBQVMsS0FBSyxHQUFHLEVBQUU7O0FBRTFCLE1BQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUNyQixTQUFTLFNBQVMsQ0FBQyxPQUFPLEVBQUU7QUFDMUIsT0FBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7QUFDckIsT0FBSSxDQUFDLE9BQU8sR0FBRztBQUNiLFlBQU8sRUFBRSxLQUFLLElBQUksT0FBTyxDQUFDLE9BQU87QUFDakMsWUFBTyxFQUFFLEtBQUssSUFBSSxPQUFPLENBQUMsT0FBTztBQUNqQyxVQUFLLEVBQUUsSUFBSSxJQUFJLE9BQU8sQ0FBQyxLQUFLO0FBQzVCLFVBQUssRUFBRSxLQUFLLElBQUksT0FBTyxDQUFDLEtBQUs7QUFDN0IsVUFBSyxFQUFFLElBQUksSUFBSSxPQUFPLENBQUMsS0FBSztBQUM1QixhQUFRLEVBQUUsT0FBTyxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDOUQsQ0FBQztBQUNGLFVBQU8sSUFBSSxDQUFDO0VB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QUFDL0MsVUFBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7RUFDeEMsQyIsImZpbGUiOiJHbGVpcG5pci5Db21wb25lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0ZXhwb3J0czoge30sXG4gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuIFx0XHRcdGxvYWRlZDogZmFsc2VcbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIHdlYnBhY2svYm9vdHN0cmFwIDY4M2M3MmFiYjhlMTQzYTEzODBjXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFRvIGxvZyBzdGF0ZSB0cmFuc2ZlcnJpbmcgaW4gYSBwcm9wZXIgd2F5LCByYXRoZXIgZHVtcCByYXcgY29uc29sZVxuICogbWVzc2FnZXMgYW5kIHRoZW4gb3ZlcndoZWxtIGl0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gU3RhdGUoKSB7fVxuXG5TdGF0ZS5wcm90b3R5cGUuc3RhcnQgPVxuZnVuY3Rpb24gbHNzX3N0YXJ0KGNvbmZpZ3MpIHtcbiAgdGhpcy5zdGF0ZVN0YWNrID0gW107XG4gIHRoaXMuY29uZmlncyA9IHtcbiAgICB2ZXJib3NlOiBmYWxzZSB8fCBjb25maWdzLnZlcmJvc2UsXG4gICAgd2FybmluZzogZmFsc2UgfHwgY29uZmlncy53YXJuaW5nLFxuICAgIGVycm9yOiB0cnVlICYmIGNvbmZpZ3MuZXJyb3IsXG4gICAgZ3JhcGg6IGZhbHNlIHx8IGNvbmZpZ3MuZ3JhcGgsXG4gICAgZGVidWc6IHRydWUgJiYgY29uZmlncy5kZWJ1ZyxcbiAgICByZXBvcnRlcjogY29uZmlncy5yZXBvcnRlciB8fCB0aGlzLmNvbnNvbGVSZXBvcnRlci5iaW5kKHRoaXMpXG4gIH07XG4gIHJldHVybiB0aGlzO1xufTtcblxuU3RhdGUucHJvdG90eXBlLmRlYnVnID1cbmZ1bmN0aW9uIGxzc19kZWJ1ZygpIHtcbiAgaWYgKHRoaXMuY29uZmlncy5kZWJ1Zykge1xuICAgIHRoaXMubG9nLmFwcGx5KHRoaXMsIFsnW0ldICddLmNvbmNhdChBcnJheS5mcm9tKGFyZ3VtZW50cykpKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cblN0YXRlLnByb3RvdHlwZS52ZXJib3NlID1cbmZ1bmN0aW9uIGxzc192ZXJib3NlKCkge1xuICBpZiAodGhpcy5jb25maWdzLnZlcmJvc2UpIHtcbiAgICB0aGlzLmxvZy5hcHBseSh0aGlzLCBbJ1tWXSAnXS5jb25jYXQoQXJyYXkuZnJvbShhcmd1bWVudHMpKSk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5TdGF0ZS5wcm90b3R5cGUud2FybmluZyA9IGZ1bmN0aW9uIGxzc193YXJuaW5nKCkge1xuICBpZiAodGhpcy5jb25maWdzLndhcm5pbmcgfHwgdGhpcy5jb25maWdzLnZlcmJvc2UpIHtcbiAgICB0aGlzLmxvZy5hcHBseSh0aGlzLCBbJ1shXSAnXS5jb25jYXQoQXJyYXkuZnJvbShhcmd1bWVudHMpKSk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5TdGF0ZS5wcm90b3R5cGUuZXJyb3IgPVxuZnVuY3Rpb24gbHNzX2Vycm9yKCkge1xuICBpZiAodGhpcy5jb25maWdzLmVycm9yIHx8IHRoaXMuY29uZmlncy53YXJuaW5nIHx8XG4gICAgICB0aGlzLmNvbmZpZ3MudmVyYm9zZSkge1xuICAgIHRoaXMubG9nLmFwcGx5KHRoaXMsIFsnW0VdICddLmNvbmNhdChBcnJheS5mcm9tKGFyZ3VtZW50cykpKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUHJpbnQgdGhlIHN0YWNrLiBGb3IgZXhhbXBsZTpcbiAqXG4gKiAgbG9nZ2VyLmRlYnVnKCd0aGUgdGhpbmcgYXQgc3RhY2s6ICcpLnN0YWNrKClcbiAqXG4gKiB3b3VsZCBwcmludCBvdXQgdGhlIG1lc3NhZ2UgYW5kIHRoZSBzdGFjay5cbiAqL1xuU3RhdGUucHJvdG90eXBlLnN0YWNrID0gZnVuY3Rpb24gbHNzX3N0YWNrKCkge1xuICB0aGlzLmxvZygobmV3IEVycm9yKCkpLnN0YWNrKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIExvZyB0aGUgdHJhbnNmZXJyaW5nIG1hbmlwdWxhdGlvbi5cbiAqXG4gKiBUbyBsb2cgdGhlIGNvbmRpdGlvbnMsIHRoaXMgZnVuY3Rpb24gd291bGQgc3RyaW5naWZ5IHRoZSBjb25kaXRpb25zXG4gKiBhbmQgdGhlbiBwYXJzZSBpdCB0byBkbyB0aGUgZGVlcCBjb3B5LiBTbyBwbGVhc2UgdHVybiBvZmYgdGhlXG4gKiBgY29uZmlnLmRlYnVnYCBpbiBwcm9kdWN0aW9uIG1vZGUuXG4gKlxuICogQHBhcmFtIGZyb20ge3N0cmluZ30gLSBmcm9tIHN0YXRlIHR5cGVcbiAqIEBwYXJhbSB0byB7c3RyaW5nfSAtIHRvIHN0YXRlIHR5cGVcbiAqIEBwYXJhbSBjb25kaXRpb25zIHtvYmplY3R9IC0gdW5kZXIgd2hhdCBjb25kaXRpb25zIHdlIGRvIHRoZSB0cmFuc2ZlcnJpbmdcbiAqL1xuU3RhdGUucHJvdG90eXBlLnRyYW5zZmVyID1cbmZ1bmN0aW9uIGxzc190cmFuc2Zlcihmcm9tLCB0bywgY29uZGl0aW9ucyA9IHt9KSB7XG4gIGlmICghdGhpcy5jb25maWdzLmRlYnVnKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciB0cmFuc2ZlckRldGFpbHMgPSB7XG4gICAgZnJvbTogZnJvbSxcbiAgICB0bzogdG8sXG4gICAgY29uZGl0aW9uczogSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShjb25kaXRpb25zKSlcbiAgfTtcbiAgaWYgKHRoaXMuY29uZmlncy5ncmFwaCkge1xuICAgIHRoaXMuc3RhdGVTdGFjay5wdXNoKHRyYW5zZmVyRGV0YWlscyk7XG4gIH1cbiAgdGhpcy5kZWJ1ZyhgU3RhdGUgdHJhbnNmZXI6IGZyb20gJHtmcm9tfSB0byAke3RvfSBiZWNhdXNlIG9mOmAsXG4gICAgdHJhbnNmZXJEZXRhaWxzLmNvbmRpdGlvbnMpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogVG8gZ2V0IHRoZSBncmFwaC4gVGhlIGFycmF5IGl0IHJldHVybiB3b3VsZCBiZTpcbiAqXG4gKiAgICAgWyAnZm9vJywge2NvbmRpdGlvbnN9LCAnYmFyJywge2NvbmRpdGlvbnN9LCAnZ2FtbWEnLi4uXVxuICpcbiAqIHdoaWNoIGNhbiBiZSByZW5kZXJlZCBhcyBhIHJlYWwgZ3JhcGguXG4gKi9cblN0YXRlLnByb3RvdHlwZS5ncmFwaCA9XG5mdW5jdGlvbiBsc3NfZ3JhcGgoKSB7XG4gIHJldHVybiB0aGlzLnN0YXRlU3RhY2sucmVkdWNlKChwcmV2LCBpbmZvKSA9PiB7XG4gICAgcmV0dXJuIHByZXYuY29uY2F0KFtpbmZvLmZyb20sIGluZm8uY29uZGl0aW9ucywgaW5mby50b10pO1xuICB9LCBbXSk7XG59O1xuXG5TdGF0ZS5wcm90b3R5cGUubG9nID1cbmZ1bmN0aW9uIGxzc19sb2coKSB7XG4gIHZhciByZXBvcnRlciA9IHRoaXMuY29uZmlncy5yZXBvcnRlcjtcbiAgcmVwb3J0ZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5TdGF0ZS5wcm90b3R5cGUuc3RvcCA9XG5mdW5jdGlvbiBsc3Nfc3RvcCgpIHtcbiAgdGhpcy5zdGF0ZVN0YWNrLmxlbmd0aCA9IDA7XG4gIHJldHVybiB0aGlzO1xufTtcblxuU3RhdGUucHJvdG90eXBlLmNvbnNvbGVSZXBvcnRlciA9XG5mdW5jdGlvbiBsc3NfY29uc29sZVJlcG9ydGVyKCkge1xuICBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBhcmd1bWVudHMpO1xuICByZXR1cm4gdGhpcztcbn07XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL2J1aWxkX3N0YWdlL3NyYy9sb2dnZXIvc3RhdGUuanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7IFN0YXRlIGFzIFN0YXRlTG9nZ2VyIH0gZnJvbSAnc3JjL2xvZ2dlci9zdGF0ZS5qcyc7XG5cbi8qKlxuICogQ29tcG9uZW50IHByb3ZpZGVzOlxuICpcbiAqIDEuIFJlc291cmNlIGtlZXBlcjogdG8gbGV0IGFsbCBzdGF0ZXMgc2hhcmUgdGhlIHNhbWUgcmVzb3VyY2VzIChjYWNoZSkuXG4gKiAyLiBSZWZlcmVuY2UgdG8gdGhlIGN1cnJlbnQgYWN0aXZhdGUgc3RhdGU6IHNvIHRoYXQgcGFyZW50IGNvbXBvbmVudCBjYW5cbiAqICAgIGNvbW1hbmQgYW5kIHdhaXQgdGhlIHN1Yi1jb21wb25lbnRzIHRvIGRvIHRoaW5ncyB3aXRob3V0IHRyYWNraW5nIHRoZVxuICogICAgYWN0dWFsIGFjdGl2ZSBzdGF0ZS5cbiAqXG4gKiBFdmVyeSBzdGF0ZXMgb2YgdGhpcyBjb21wb25lbnQgd291bGQgcmVjZWl2ZSB0aGUgQ29tcG9uZW50IGluc3RhbmNlIGFzXG4gKiBhIHdheSB0byBhY2Nlc3MgdGhlc2UgY29tbW9uIHJlc291cmNlcyAmIHByb3BlcnRpZXMuIEFuZCBldmVyeSBzdGF0ZVxuICogdHJhbnNmZXJyaW5nIHdvdWxkIGRvbmUgYnkgdGhlICd0cmFuc2ZlclRvJyBtZXRob2QgaW4gdGhpcyBjb21wb25lbnQsXG4gKiBzbyB0aGF0IHRoZSBjb21wb25lbnQgY2FuIHVwZGF0ZSB0aGUgYWN0aXZlIHN0YXRlIGNvcnJlY3RseS5cbiAqL1xuXG4vKipcbiAqIFRoZSBhcmd1bWVudCAndmlldycgaXMgdGhlIG9ubHkgdGhpbmcgcGFyZW50IGNvbXBvbmVudCBuZWVkcyB0byBtYW5hZ2UuXG4gKiBQbGVhc2Ugbm90ZSB0aGF0IHRoZSAndmlldycgaXNuJ3QgZm9yIFVJIHJlbmRlcmluZywgYWx0aG91Z2ggdGhhdFxuICogVUkgdmlldyBpcyB0aGUgbW9zdCBjb21tb24gb2YgdGhlbS4gVXNlciBjb3VsZCBjaG9zZSBvdGhlciB2aWV3cyBsaWtlXG4gKiBkYXRhLXZpZXcgb3IgZGVidWdnaW5nLXZpZXcgdG8gY29udHJ1Y3QgdGhlIHByb2dyYW0uIEl0IHdvdWxkIHN0aWxsXG4gKiBiZSBcInJlbmRlcmVkXCIgKHBlcmZvcm0gdGhlIGVmZmVjdCksIGJ1dCBob3cgdG8gc3ludGhlc2l6ZSB0aGUgZWZmZWN0c1xuICogb2YgcGFyZW50IGFuZCBjaGlsZHJlbiBub3cgaXMgdGhlIHVzZXIncyBkdXR5LiBGb3IgZXhhbXBsZSwgaWYgd2UgaGF2ZSBhXG4gKiAnY29uc29sZS12aWV3JyB0byBwcmludCBvdXQgdGhpbmdzIGluc3RlYWQgb2YgcmVuZGVyaW5nIFVJLCBzaG91bGQgaXRcbiAqIHByaW50IHRleHQgZnJvbSBjaGlsZHJlbiBmaXJzdD8gT3IgdGhlIHBhcmVudCwgc2luY2UgaXQncyBhIHdyYXBwaW5nXG4gKiBvYmplY3QsIHNob3VsZCBpbmZvIHRoZSB1c2VyIGl0cyBzdGF0dXMgZWFybGllciB0aGFuIGl0cyBjaGlsZHJlbj9cbiAqIFRoZXNlIGJlaGF2aW9ycyBzaG91bGQgYmUgZW5jYXBzdWxhdGVkIGluc2lkZSB0aGUgJ3ZpZXcnLCBhbmQgYmVcbiAqIGhhbmRsZWQgYXQgdGhlIHVuZGVybHlpbmcgbGV2ZWwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBCYXNpYyh2aWV3KSB7XG4gIHRoaXMuX3N1YmNvbXBvbmVudHMgPSBudWxsO1xuICB0aGlzLl9hY3RpdmVTdGF0ZSA9IG51bGw7XG4gIC8vIENvbmNyZXRlIGNvbXBvbmVudHMgc2hvdWxkIGV4dGVuZCB0aGVzZSB0byBsZXQgU3RhdGVzIGFjY2VzcyB0aGVtLlxuICAvLyBUaGUgZmlyc3Qgc3RhdGUgY29tcG9uZW50IGtpY2sgb2ZmIHNob3VsZCB0YWtlIHJlc3BvbnNpYmlsaXR5IGZvclxuICAvLyBpbml0aWFsaXppbmcgdGhlc2UgdGhpbmdzLlxuICAvL1xuICAvLyBSZXNvdXJjZXMgaXMgZm9yIGV4dGVybmFsIHJlc291cmNlcyBsaWtlIHNldHRpbmdzIHZhbHVlIG9yIERPTSBlbGVtZW50cy5cbiAgdGhpcy5yZXNvdXJjZXMgPSB7XG4gICAgZWxlbWVudHM6IHt9XG4gIH07XG4gIHRoaXMuY29uZmlncyA9IHtcbiAgICBsb2dnZXI6IHtcbiAgICAgIGRlYnVnOiBmYWxzZSAgICAvLyB0dXJuIG9uIGl0IHdoZW4gd2UncmUgZGVidWdnaW5nIHRoaXMgY29tcG9uZW50XG4gICAgfVxuICB9O1xuXG4gIC8vIFRoZSBkZWZhdWx0IGxvZ2dlci5cbiAgLy8gQSBjdXN0b21pemVkIGxvZ2dlciBpcyBhY2NldGFibGUgaWYgaXQncyB3aXRoIHRoZSAndHJhbnNmZXInIG1ldGhvZFxuICAvLyBmb3IgbG9nZ2luZyB0aGUgc3RhdGUgdHJhbnNmZXJyaW5nLlxuICB0aGlzLmxvZ2dlciA9IG5ldyBTdGF0ZUxvZ2dlcigpO1xuICB0aGlzLnZpZXcgPSB2aWV3O1xuICAvLyBTaG91bGQgYXQgbGVhc3QgYXBwb2ludCB0aGVzZS5cbiAgdGhpcy50eXBlID0gbnVsbDtcbiAgdGhpcy5fc2V0dXBTdGF0ZSA9IG51bGw7XG59XG5cbi8qKlxuICogU3RhdGUnIHBoYXNlIGlzIHRoZSBjb21wb25lbnQncyBwaGFzZS5cbiAqL1xuQmFzaWMucHJvdG90eXBlLnBoYXNlID1cbmZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5fYWN0aXZlU3RhdGUucGhhc2UoKTtcbn07XG5cbi8qKlxuICogRXZlcnkgc3RhdGUgb2YgdGhpcyBjb21wb25lbnQgc2hvdWxkIGNhbGwgdGhlIG1ldGhvZCB0byBkbyB0cmFuc2ZlcnJpbmcsXG4gKiBzbyB0aGF0IHRoZSBjb21wb25lbnQgY2FuIHVwZGF0ZSB0aGUgJ2FjdGl2ZVN0YXRlJyBjb3JyZWN0bHkuXG4gKlxuICogVGhlIG9yZGVyIG9mIHRyYW5zZmVycmluZyBpczpcbiAqXG4gKiAgW2N1cnJlbnQuc3RvcF0gLT4gW25leHQuc3RhcnRdIC0+IChjYWxsKVtwcmV2aW91cy5kZXN0cm95XVxuICpcbiAqIE5vdGUgdGhpcyBmdW5jdGlvbiBtYXkgcmV0dXJuIGEgbnVsbGl6ZWQgcHJvY2VzcyBpZiBpdCdzIHRyYW5zZmVycmluZyxcbiAqIHNvIHRoZSB1c2VyIG11c3QgZGV0ZWN0IGlmIHRoZSByZXR1cm4gdGhpbmcgaXMgYSB2YWxpZCBwcm9jZXNzXG4gKiBjb3VsZCBiZSBjaGFpbmVkLCBvciBwcmUtY2hlY2sgaXQgd2l0aCB0aGUgcHJvcGVydHkuXG4gKi9cbkJhc2ljLnByb3RvdHlwZS50cmFuc2ZlclRvID0gZnVuY3Rpb24oY2xhenosIHJlYXNvbiA9IHt9KSB7XG4gIHZhciBuZXh0U3RhdGUgPSBuZXcgY2xhenoodGhpcyk7XG4gIHZhciBjdXJyZW50U3RhdGUgPSB0aGlzLl9hY3RpdmVTdGF0ZTtcbiAgdGhpcy5fYWN0aXZlU3RhdGUgPSBuZXh0U3RhdGU7XG4gIHRoaXMubG9nZ2VyLnRyYW5zZmVyKGN1cnJlbnRTdGF0ZS5jb25maWdzLnR5cGUsXG4gICAgICBuZXh0U3RhdGUuY29uZmlncy50eXBlLCByZWFzb24pO1xuICByZXR1cm4gY3VycmVudFN0YXRlLnN0b3AoKVxuICAgIC5uZXh0KCgpID0+IG5leHRTdGF0ZS5zdGFydCgpKTtcbn07XG5cbi8qKlxuICogV291bGQgcmVjZWl2ZSByZXNvdXJjZXMgZnJvbSBwYXJlbnQgYW5kICpleHRlbmRzKiB0aGUgZGVmYXVsdCBvbmUuXG4gKiBBZnRlciB0aGF0LCB0cmFuc2ZlciB0byB0aGUgbmV4dCBzdGF0ZSwgd2hpY2ggaXMgdXN1YWxseSBhbiBpbml0aWFsaXphdGlvblxuICogc3RhdGUsIHRoYXQgd291bGQgZG8gbG90cyBvZiBzeW5jL2FzeW5jIHRoaW5ncyB0byB1cGRhdGUgdGhlXG4gKiByZXNvdXJjZXMgJiBwcm9wZXJ0aWVzLlxuICpcbiAqIEhvd2V2ZXIsIHNpbmNlIGJhc2ljIGNvbXBvbmVudCBjb3VsZG4ndCBrbm93IHdoYXQgaXMgdGhlXG4gKiBpbml0aWFsaXphdGlvbiBzdGF0ZSwgc28gdGhhdCB0aGUgY29uY3JldGUgY29tcG9uZW50IHNob3VsZFxuICogaW1wbGVtZW50IHRoZSBzZXR1cCBmdW5jdGlvbiwgd2hpY2ggd291bGQgcmV0dXJuIHRoZSBzdGF0ZSBhZnRlclxuICogcmVjZWl2ZSB0aGUgY29tcG9uZW50IGluc3RhbmNlLlxuICovXG5CYXNpYy5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbihyZXNvdXJjZXMpIHtcbiAgdGhpcy5sb2dnZXIuc3RhcnQodGhpcy5jb25maWdzLmxvZ2dlcik7XG4gIGlmIChyZXNvdXJjZXMpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gdGhpcy5yZXNvdXJjZXMpIHtcbiAgICAgIGlmICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mIHJlc291cmNlc1trZXldKSB7XG4gICAgICAgIHRoaXMucmVzb3VyY2VzW2tleV0gPSByZXNvdXJjZXNba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLy8gR2V0IHRoZSBpbml0aWFsaXphdGlvbiBzdGF0ZSBhbmQgbGV0IGl0IGZldGNoICYgc2V0IGFsbC5cbiAgLy8gJ2luaXRpYWxpemVTdGF0ZU1hY2hpbmUnLCBpZiBKYXZhIGRvb21lZCB0aGUgd29ybGQuXG4gIC8vIChhbmQgdGhpcyBpcyBFQ01BU2NyaXB0LCBhIGxhbmd1YWdlIChwYXJ0aWFsbHkpIGluc3BpcmVkIGJ5IFNjaGVtZSEpLlxuICB0aGlzLl9hY3RpdmVTdGF0ZSA9IHRoaXMuX3NldHVwU3RhdGU7XG4gIHJldHVybiB0aGlzLl9hY3RpdmVTdGF0ZS5zdGFydCgpO1xufTtcblxuQmFzaWMucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuX2FjdGl2ZVN0YXRlLnN0b3AoKVxuICAgIC5uZXh0KHRoaXMud2FpdENvbXBvbmVudHMuYmluZCh0aGlzLCAnc3RvcCcpKTtcbn07XG5cbkJhc2ljLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLl9hY3RpdmVTdGF0ZS5kZXN0cm95KClcbiAgICAubmV4dCh0aGlzLndhaXRDb21wb25lbnRzLmJpbmQodGhpcywgJ2Rlc3Ryb3knKSlcbiAgICAubmV4dCgoKSA9PiB7IHRoaXMubG9nZ2VyLnN0b3AoKTsgfSk7ICAvLyBMb2dnZXIgbmVlZCBhZGQgcGhhc2Ugc3VwcG9ydC5cbn07XG5cbkJhc2ljLnByb3RvdHlwZS5saXZlID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLl9hY3RpdmVTdGF0ZS51bnRpbCgnc3RvcCcpO1xufTtcblxuQmFzaWMucHJvdG90eXBlLmV4aXN0ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLl9hY3RpdmVTdGF0ZS51bnRpbCgnZGVzdHJveScpO1xufTtcblxuLyoqXG4gKiBDYW4gY29tbWFuZCBhbGwgc3ViLWNvbXBvbmVudHMgd2l0aCBvbmUgbWV0aG9kIGFuZCBpdHMgYXJndW1lbnRzLlxuICogRm9yIGV4YW1wbGUsIHRvICdzdGFydCcsIG9yICdzdG9wJyB0aGVtLlxuICogV2lsbCByZXR1cm4gYSBQcm9taXNlIG9ubHkgYmUgcmVzb2x2ZWQgYWZ0ZXIgYWxsIHN1Yi1jb21wb25lbnRzXG4gKiBleGVjdXRlZCB0aGUgY29tbWFuZC4gRm9yIGV4YW1wbGU6XG4gKlxuICogc3ViY29tcG9uZW50czoge1xuICogICAgYnV0dG9uczogW0J1dHRvbkZvbywgQnV0dG9uQmFyXVxuICogICAgc3VibWl0OiBTdWJtaXRcbiAqIH1cbiAqIHZhciBwcm9taXNlZCA9IHBhcmVudC53YWl0Q29tcG9uZW50cyhwYXJlbnQuc3RvcC5iaW5kKHBhcmVudCkpO1xuICpcbiAqIFRoZSBwcm9taXNlZCB3b3VsZCBiZSByZXNvbHZlZCBvbmx5IGFmdGVyIEJ1dHRvbkZvbywgQnV0dG9uQmFyIGFuZCBTdWJtaXRcbiAqIGFyZSBhbGwgc3RvcHBlZC5cbiAqXG4gKiBBbmQgc2luY2UgZm9yIHN0YXRlcyB0aGUgc3ViLWNvbXBvbmVudHMgaXMgZGVsZWdhdGVkIHRvIENvbXBvbmVudCxcbiAqIHN0YXRlIHNob3VsZCBvbmx5IGNvbW1hbmQgdGhlc2Ugc3ViLWNvbXBvbmVudHMgdmlhIHRoaXMgbWV0aG9kLFxuICogb3IgYWNjZXNzIHRoZW0gaW5kaXZpZHVhbGx5IHZpYSB0aGUgY29tcG9uZW50IGluc3RhbmNlIHNldCBhdCB0aGVcbiAqIHNldHVwIHN0YWdlLlxuICovXG5CYXNpYy5wcm90b3R5cGUud2FpdENvbXBvbmVudHMgPSBmdW5jdGlvbihtZXRob2QsIGFyZ3MpIHtcbiAgaWYgKCF0aGlzLl9zdWJjb21wb25lbnRzKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9XG4gIHZhciB3YWl0UHJvbWlzZXMgPVxuICBPYmplY3Qua2V5cyh0aGlzLl9zdWJjb21wb25lbnRzKS5yZWR1Y2UoKHN0ZXBzLCBuYW1lKSA9PiB7XG4gICAgdmFyIGluc3RhbmNlID0gdGhpcy5fc3ViY29tcG9uZW50c1tuYW1lXTtcbiAgICAvLyBJZiB0aGUgZW50cnkgb2YgdGhlIGNvbXBvbmVudCBhY3R1YWxseSBjb250YWlucyBtdWx0aXBsZSBzdWJjb21wb25lbnRzLlxuICAgIC8vIFdlIG5lZWQgdG8gYXBwbHkgdGhlIG1ldGhvZCB0byBlYWNoIG9uZSBhbmQgY29uY2F0IGFsbCB0aGUgcmVzdWx0XG4gICAgLy8gcHJvbWlzZXMgd2l0aCBvdXIgbWFpbiBhcnJheSBvZiBhcHBsaWVzLlxuICAgIGlmIChBcnJheS5pc0FycmF5KGluc3RhbmNlKSkge1xuICAgICAgdmFyIGFwcGxpZXMgPSBpbnN0YW5jZS5tYXAoKHN1YmNvbXBvbmVudCkgPT4ge1xuICAgICAgICByZXR1cm4gc3ViY29tcG9uZW50W21ldGhvZF0uYXBwbHkoc3ViY29tcG9uZW50LCBhcmdzKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHN0ZXBzLmNvbmNhdChhcHBsaWVzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHN0ZXBzLmNvbmNhdChbaW5zdGFuY2VbbWV0aG9kXS5hcHBseShpbnN0YW5jZSwgYXJncyldKTtcbiAgICB9XG4gIH0sIFtdKTtcbiAgcmV0dXJuIFByb21pc2UuYWxsKHdhaXRQcm9taXNlcyk7XG59O1xuXG4vKipcbiAqIEZvcndhcmQgdGhlIGRhdGEgdG8gcmVuZGVyIHRoZSB2aWV3LlxuICogSWYgaXQncyBhIHJlYWwgVUkgdmlldyBhbmQgd2l0aCB0ZWNoIGxpa2UgdmlydHVhbCBET00gaW4gUmVhY3QuanMsXG4gKiB3ZSBjb3VsZCBwZXJmb3JtIGEgaGlnaC1lZmZpY2llbmN5IHJlbmRlcmluZyB3aGlsZSBrZWVwIHRoZSBjbGllbnQgY29kZVxuICogYXMgc2ltcGxlIGFzIHBvc3NpYmxlLlxuICpcbiAqIFRoZSB0YXJnZXQgaXMgYW4gb3B0aW9uYWwgJ2NhbnZhcycgb2YgdGhlIHJlbmRlcmluZyB0YXJnZXQuIEl0IHdvdWxkLFxuICogaWYgdGhlIHZpZXcgaXMgYW4gVUkgdmlldyBmb3IgZXhhbXBsZSwgJ2VyYXNlJyBpdCBhbmQgcmVuZGVyIG5ldyBjb250ZW50XG4gKiBlYWNoIHRpbWUgdGhpcyBmdW5jdGlvbiBnZXQgaW52b2tlZC4gSG93ZXZlciwgc2luY2Ugd2UgaGF2ZSBub3Qgb25seVxuICogVUkgdmlldywgc29tZSB0YXJnZXRpbmcgJ2NhbnZhcycgY291bGQgYmUgbW9yZSB0cmlja3ksIGxpa2UgRmlsZU9iamVjdCxcbiAqIEJsb2IsIHNvdW5kIHN5c3RlbSwgZXRjLlxuICovXG5CYXNpYy5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24ocHJvcHMsIHRhcmdldCkge1xuICByZXR1cm4gdGhpcy52aWV3LnJlbmRlcihwcm9wcywgdGFyZ2V0KTtcbn07XG5cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vYnVpbGRfc3RhZ2Uvc3JjL2NvbXBvbmVudC9iYXNpYy5qc1xuICoqLyJdLCJzb3VyY2VSb290IjoiIn0=