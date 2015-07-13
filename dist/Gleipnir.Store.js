/**
 * gleipnir.js - Gleipnir.js - a library for UI programming
 * @version v0.0.1
 * @link 
 * @license Apache 2.0
 */
var Gleipnir = Gleipnir || {}; Gleipnir["Store"] =
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

	module.exports = __webpack_require__(4);


/***/ },
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports.Basic = Basic;
	/**
	 * Component should control its resources only via methods
	 * defined here. This is just a empty interface that required
	 * by BasicComponent. In this way, we could see how to implement
	 * the same architecture for real components.
	 **/
	
	function Basic() {
	  // Resources include DOM elements and other stuff that component
	  // need to require them from the 'outside'. So even it's only a string,
	  // if the one comes from System settings or XHR, it should be a resource
	  // item and to be managed here.
	  this.resources = {};
	}

/***/ }
/******/ ]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNjgzYzcyYWJiOGUxNDNhMTM4MGM/N2MyNyoqKiIsIndlYnBhY2s6Ly8vLi9idWlsZF9zdGFnZS9zcmMvc3RvcmUvYmFzaWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx1QkFBZTtBQUNmO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7OztBQ3RDQyxhQUFZLENBQUM7Ozs7O1NBU0UsS0FBSyxHQUFMLEtBQUs7Ozs7Ozs7O0FBQWQsVUFBUyxLQUFLLEdBQUc7Ozs7O0FBS3RCLE9BQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDIiwiZmlsZSI6IkdsZWlwbmlyLlN0b3JlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGV4cG9ydHM6IHt9LFxuIFx0XHRcdGlkOiBtb2R1bGVJZCxcbiBcdFx0XHRsb2FkZWQ6IGZhbHNlXG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oMCk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiB3ZWJwYWNrL2Jvb3RzdHJhcCA2ODNjNzJhYmI4ZTE0M2ExMzgwY1xuICoqLyIsIiAndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQ29tcG9uZW50IHNob3VsZCBjb250cm9sIGl0cyByZXNvdXJjZXMgb25seSB2aWEgbWV0aG9kc1xuICogZGVmaW5lZCBoZXJlLiBUaGlzIGlzIGp1c3QgYSBlbXB0eSBpbnRlcmZhY2UgdGhhdCByZXF1aXJlZFxuICogYnkgQmFzaWNDb21wb25lbnQuIEluIHRoaXMgd2F5LCB3ZSBjb3VsZCBzZWUgaG93IHRvIGltcGxlbWVudFxuICogdGhlIHNhbWUgYXJjaGl0ZWN0dXJlIGZvciByZWFsIGNvbXBvbmVudHMuXG4gKiovXG5cbmV4cG9ydCBmdW5jdGlvbiBCYXNpYygpIHtcbiAgLy8gUmVzb3VyY2VzIGluY2x1ZGUgRE9NIGVsZW1lbnRzIGFuZCBvdGhlciBzdHVmZiB0aGF0IGNvbXBvbmVudFxuICAvLyBuZWVkIHRvIHJlcXVpcmUgdGhlbSBmcm9tIHRoZSAnb3V0c2lkZScuIFNvIGV2ZW4gaXQncyBvbmx5IGEgc3RyaW5nLFxuICAvLyBpZiB0aGUgb25lIGNvbWVzIGZyb20gU3lzdGVtIHNldHRpbmdzIG9yIFhIUiwgaXQgc2hvdWxkIGJlIGEgcmVzb3VyY2VcbiAgLy8gaXRlbSBhbmQgdG8gYmUgbWFuYWdlZCBoZXJlLlxuICB0aGlzLnJlc291cmNlcyA9IHt9O1xufVxuXG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL2J1aWxkX3N0YWdlL3NyYy9zdG9yZS9iYXNpYy5qc1xuICoqLyJdLCJzb3VyY2VSb290IjoiIn0=