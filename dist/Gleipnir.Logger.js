/**
 * gleipnir.js - Gleipnir.js - a library for UI programming
 * @version v0.0.1
 * @link 
 * @license Apache 2.0
 */
var Gleipnir = Gleipnir || {}; Gleipnir["Logger"] =
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

	module.exports = __webpack_require__(1);


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

/***/ }
/******/ ]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNjgzYzcyYWJiOGUxNDNhMTM4MGM/N2MyNyIsIndlYnBhY2s6Ly8vLi9idWlsZF9zdGFnZS9zcmMvbG9nZ2VyL3N0YXRlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsdUJBQWU7QUFDZjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7Ozs7QUN0Q0EsYUFBWSxDQUFDOzs7OztTQU1HLEtBQUssR0FBTCxLQUFLOzs7Ozs7QUFBZCxVQUFTLEtBQUssR0FBRyxFQUFFOztBQUUxQixNQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssR0FDckIsU0FBUyxTQUFTLENBQUMsT0FBTyxFQUFFO0FBQzFCLE9BQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO0FBQ3JCLE9BQUksQ0FBQyxPQUFPLEdBQUc7QUFDYixZQUFPLEVBQUUsS0FBSyxJQUFJLE9BQU8sQ0FBQyxPQUFPO0FBQ2pDLFlBQU8sRUFBRSxLQUFLLElBQUksT0FBTyxDQUFDLE9BQU87QUFDakMsVUFBSyxFQUFFLElBQUksSUFBSSxPQUFPLENBQUMsS0FBSztBQUM1QixVQUFLLEVBQUUsS0FBSyxJQUFJLE9BQU8sQ0FBQyxLQUFLO0FBQzdCLFVBQUssRUFBRSxJQUFJLElBQUksT0FBTyxDQUFDLEtBQUs7QUFDNUIsYUFBUSxFQUFFLE9BQU8sQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQzlELENBQUM7QUFDRixVQUFPLElBQUksQ0FBQztFQUNiLENBQUM7O0FBRUYsTUFBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQ3JCLFNBQVMsU0FBUyxHQUFHO0FBQ25CLE9B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QUksRUFBRSxJQUFJLEVBQUs7QUFDNUMsWUFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzNELEVBQUUsRUFBRSxDQUFDLENBQUM7RUFDUixDQUFDOztBQUVGLE1BQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUNuQixTQUFTLE9BQU8sR0FBRztBQUNqQixPQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQztBQUNyQyxXQUFRLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztBQUNoQyxVQUFPLElBQUksQ0FBQztFQUNiLENBQUM7O0FBRUYsTUFBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQ3BCLFNBQVMsUUFBUSxHQUFHO0FBQ2xCLE9BQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUMzQixVQUFPLElBQUksQ0FBQztFQUNiLENBQUM7O0FBRUYsTUFBSyxDQUFDLFNBQVMsQ0FBQyxlQUFlLEdBQy9CLFNBQVMsbUJBQW1CLEdBQUc7QUFDN0IsVUFBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQ3RDLFVBQU8sSUFBSSxDQUFDO0VBQ2IsQyIsImZpbGUiOiJHbGVpcG5pci5Mb2dnZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0ZXhwb3J0czoge30sXG4gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuIFx0XHRcdGxvYWRlZDogZmFsc2VcbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIHdlYnBhY2svYm9vdHN0cmFwIDY4M2M3MmFiYjhlMTQzYTEzODBjXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFRvIGxvZyBzdGF0ZSB0cmFuc2ZlcnJpbmcgaW4gYSBwcm9wZXIgd2F5LCByYXRoZXIgZHVtcCByYXcgY29uc29sZVxuICogbWVzc2FnZXMgYW5kIHRoZW4gb3ZlcndoZWxtIGl0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gU3RhdGUoKSB7fVxuXG5TdGF0ZS5wcm90b3R5cGUuc3RhcnQgPVxuZnVuY3Rpb24gbHNzX3N0YXJ0KGNvbmZpZ3MpIHtcbiAgdGhpcy5zdGF0ZVN0YWNrID0gW107XG4gIHRoaXMuY29uZmlncyA9IHtcbiAgICB2ZXJib3NlOiBmYWxzZSB8fCBjb25maWdzLnZlcmJvc2UsXG4gICAgd2FybmluZzogZmFsc2UgfHwgY29uZmlncy53YXJuaW5nLFxuICAgIGVycm9yOiB0cnVlICYmIGNvbmZpZ3MuZXJyb3IsXG4gICAgZ3JhcGg6IGZhbHNlIHx8IGNvbmZpZ3MuZ3JhcGgsXG4gICAgZGVidWc6IHRydWUgJiYgY29uZmlncy5kZWJ1ZyxcbiAgICByZXBvcnRlcjogY29uZmlncy5yZXBvcnRlciB8fCB0aGlzLmNvbnNvbGVSZXBvcnRlci5iaW5kKHRoaXMpXG4gIH07XG4gIHJldHVybiB0aGlzO1xufTtcblxuU3RhdGUucHJvdG90eXBlLmRlYnVnID1cbmZ1bmN0aW9uIGxzc19kZWJ1ZygpIHtcbiAgaWYgKHRoaXMuY29uZmlncy5kZWJ1Zykge1xuICAgIHRoaXMubG9nLmFwcGx5KHRoaXMsIFsnW0ldICddLmNvbmNhdChBcnJheS5mcm9tKGFyZ3VtZW50cykpKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cblN0YXRlLnByb3RvdHlwZS52ZXJib3NlID1cbmZ1bmN0aW9uIGxzc192ZXJib3NlKCkge1xuICBpZiAodGhpcy5jb25maWdzLnZlcmJvc2UpIHtcbiAgICB0aGlzLmxvZy5hcHBseSh0aGlzLCBbJ1tWXSAnXS5jb25jYXQoQXJyYXkuZnJvbShhcmd1bWVudHMpKSk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5TdGF0ZS5wcm90b3R5cGUud2FybmluZyA9IGZ1bmN0aW9uIGxzc193YXJuaW5nKCkge1xuICBpZiAodGhpcy5jb25maWdzLndhcm5pbmcgfHwgdGhpcy5jb25maWdzLnZlcmJvc2UpIHtcbiAgICB0aGlzLmxvZy5hcHBseSh0aGlzLCBbJ1shXSAnXS5jb25jYXQoQXJyYXkuZnJvbShhcmd1bWVudHMpKSk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5TdGF0ZS5wcm90b3R5cGUuZXJyb3IgPVxuZnVuY3Rpb24gbHNzX2Vycm9yKCkge1xuICBpZiAodGhpcy5jb25maWdzLmVycm9yIHx8IHRoaXMuY29uZmlncy53YXJuaW5nIHx8XG4gICAgICB0aGlzLmNvbmZpZ3MudmVyYm9zZSkge1xuICAgIHRoaXMubG9nLmFwcGx5KHRoaXMsIFsnW0VdICddLmNvbmNhdChBcnJheS5mcm9tKGFyZ3VtZW50cykpKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUHJpbnQgdGhlIHN0YWNrLiBGb3IgZXhhbXBsZTpcbiAqXG4gKiAgbG9nZ2VyLmRlYnVnKCd0aGUgdGhpbmcgYXQgc3RhY2s6ICcpLnN0YWNrKClcbiAqXG4gKiB3b3VsZCBwcmludCBvdXQgdGhlIG1lc3NhZ2UgYW5kIHRoZSBzdGFjay5cbiAqL1xuU3RhdGUucHJvdG90eXBlLnN0YWNrID0gZnVuY3Rpb24gbHNzX3N0YWNrKCkge1xuICB0aGlzLmxvZygobmV3IEVycm9yKCkpLnN0YWNrKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIExvZyB0aGUgdHJhbnNmZXJyaW5nIG1hbmlwdWxhdGlvbi5cbiAqXG4gKiBUbyBsb2cgdGhlIGNvbmRpdGlvbnMsIHRoaXMgZnVuY3Rpb24gd291bGQgc3RyaW5naWZ5IHRoZSBjb25kaXRpb25zXG4gKiBhbmQgdGhlbiBwYXJzZSBpdCB0byBkbyB0aGUgZGVlcCBjb3B5LiBTbyBwbGVhc2UgdHVybiBvZmYgdGhlXG4gKiBgY29uZmlnLmRlYnVnYCBpbiBwcm9kdWN0aW9uIG1vZGUuXG4gKlxuICogQHBhcmFtIGZyb20ge3N0cmluZ30gLSBmcm9tIHN0YXRlIHR5cGVcbiAqIEBwYXJhbSB0byB7c3RyaW5nfSAtIHRvIHN0YXRlIHR5cGVcbiAqIEBwYXJhbSBjb25kaXRpb25zIHtvYmplY3R9IC0gdW5kZXIgd2hhdCBjb25kaXRpb25zIHdlIGRvIHRoZSB0cmFuc2ZlcnJpbmdcbiAqL1xuU3RhdGUucHJvdG90eXBlLnRyYW5zZmVyID1cbmZ1bmN0aW9uIGxzc190cmFuc2Zlcihmcm9tLCB0bywgY29uZGl0aW9ucyA9IHt9KSB7XG4gIGlmICghdGhpcy5jb25maWdzLmRlYnVnKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciB0cmFuc2ZlckRldGFpbHMgPSB7XG4gICAgZnJvbTogZnJvbSxcbiAgICB0bzogdG8sXG4gICAgY29uZGl0aW9uczogSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShjb25kaXRpb25zKSlcbiAgfTtcbiAgaWYgKHRoaXMuY29uZmlncy5ncmFwaCkge1xuICAgIHRoaXMuc3RhdGVTdGFjay5wdXNoKHRyYW5zZmVyRGV0YWlscyk7XG4gIH1cbiAgdGhpcy5kZWJ1ZyhgU3RhdGUgdHJhbnNmZXI6IGZyb20gJHtmcm9tfSB0byAke3RvfSBiZWNhdXNlIG9mOmAsXG4gICAgdHJhbnNmZXJEZXRhaWxzLmNvbmRpdGlvbnMpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogVG8gZ2V0IHRoZSBncmFwaC4gVGhlIGFycmF5IGl0IHJldHVybiB3b3VsZCBiZTpcbiAqXG4gKiAgICAgWyAnZm9vJywge2NvbmRpdGlvbnN9LCAnYmFyJywge2NvbmRpdGlvbnN9LCAnZ2FtbWEnLi4uXVxuICpcbiAqIHdoaWNoIGNhbiBiZSByZW5kZXJlZCBhcyBhIHJlYWwgZ3JhcGguXG4gKi9cblN0YXRlLnByb3RvdHlwZS5ncmFwaCA9XG5mdW5jdGlvbiBsc3NfZ3JhcGgoKSB7XG4gIHJldHVybiB0aGlzLnN0YXRlU3RhY2sucmVkdWNlKChwcmV2LCBpbmZvKSA9PiB7XG4gICAgcmV0dXJuIHByZXYuY29uY2F0KFtpbmZvLmZyb20sIGluZm8uY29uZGl0aW9ucywgaW5mby50b10pO1xuICB9LCBbXSk7XG59O1xuXG5TdGF0ZS5wcm90b3R5cGUubG9nID1cbmZ1bmN0aW9uIGxzc19sb2coKSB7XG4gIHZhciByZXBvcnRlciA9IHRoaXMuY29uZmlncy5yZXBvcnRlcjtcbiAgcmVwb3J0ZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5TdGF0ZS5wcm90b3R5cGUuc3RvcCA9XG5mdW5jdGlvbiBsc3Nfc3RvcCgpIHtcbiAgdGhpcy5zdGF0ZVN0YWNrLmxlbmd0aCA9IDA7XG4gIHJldHVybiB0aGlzO1xufTtcblxuU3RhdGUucHJvdG90eXBlLmNvbnNvbGVSZXBvcnRlciA9XG5mdW5jdGlvbiBsc3NfY29uc29sZVJlcG9ydGVyKCkge1xuICBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBhcmd1bWVudHMpO1xuICByZXR1cm4gdGhpcztcbn07XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL2J1aWxkX3N0YWdlL3NyYy9sb2dnZXIvc3RhdGUuanNcbiAqKi8iXSwic291cmNlUm9vdCI6IiJ9