/**
 * gleipnir.js - Gleipnir.js - a library for UI programming
 * @version v0.0.1
 * @link 
 * @license Apache 2.0
 */
var Gleipnir = Gleipnir || {}; Gleipnir["View"] =
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

	module.exports = __webpack_require__(5);


/***/ },

/***/ 5:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports.Basic = Basic;
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
	
	function Basic() {}
	
	/**
	 * If it's a UI view but without virtual DOM,
	 * the views must handle detailed DOM manipulations
	 * manually. So UI view could be complicated.
	 *
	 * With virtual DOM it could be very simple, but this depends on the
	 * facilities of the project.
	 */
	Basic.prototype.render = function (data) {};

/***/ }

/******/ });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNjgzYzcyYWJiOGUxNDNhMTM4MGM/N2MyNyoqKioiLCJ3ZWJwYWNrOi8vLy4vYnVpbGRfc3RhZ2Uvc3JjL3ZpZXcvYmFzaWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx1QkFBZTtBQUNmO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7O0FDdENDLGFBQVksQ0FBQzs7Ozs7U0FpQkUsS0FBSyxHQUFMLEtBQUs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQWQsVUFBUyxLQUFLLEdBQUcsRUFBRTs7Ozs7Ozs7OztBQVUxQixNQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxVQUFTLElBQUksRUFBRSxFQUFFLEMiLCJmaWxlIjoiR2xlaXBuaXIuVmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKVxuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuXG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRleHBvcnRzOiB7fSxcbiBcdFx0XHRpZDogbW9kdWxlSWQsXG4gXHRcdFx0bG9hZGVkOiBmYWxzZVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sb2FkZWQgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogd2VicGFjay9ib290c3RyYXAgNjgzYzcyYWJiOGUxNDNhMTM4MGNcbiAqKi8iLCIgJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFRoZSBiYXNpYyBpbnRlcmZhY2Ugb2Ygdmlldy5cbiAqIFZpZXcgb25seSBuZWVkIHRvIGtub3cgaG93IHRvIHRyYW5zZm9ybSBkYXRhIHRvIHRoZVxuICogc3ludGhldGljICdlZmZlY3RzJy5cbiAqXG4gKiBGb3IgVUksIGl0IG1lYW5zIHRvIGRyYXcgc29tZXRoaW5nIG9uIHRoZSBzY3JlZW4uXG4gKiBGb3Igb3RoZXIgdmlld3MsIGl0IG1lYW5zIHRvIHBlcmZvcm0gcmVtb3RlIHF1ZXJpZXMsXG4gKiBwbGF5IHNvdW5kcywgc2VuZCBjb21tYW5kcyB2aWEgbmV0d29yaywgZXRjLlxuICpcbiAqIEFuZCBob3cgdG8gY29tcG9zZSB0aGUgJ2VmZmVjdHMnIGlzIGRlY2lkZWQgYnkgdGhlIGNvbXBvbmVudC5cbiAqIElmIG9uZSBwYXJlbnQgbmVlZCB0byB3YWl0IGl0cyBjaGlsZHJlbiwgb3IgdG8gY29sbGVjdCByZXN1bHRzXG4gKiBmcm9tIHRoZW0sIHRoZSBjb21wb25lbnQgbXVzdCBkZXJpdmUgdGhpcyB2aWV3IHRvIHByb3ZpZGVcbiAqICd0aGVuLWFibGUnIGFiaWxpdHkgdG8gdGhlICdyZW5kZXInIG1ldGhvZC5cbiAqIFdlIGRvbid0IG1ha2UgYW55IGFzc3VtcHRpb25zIGluIHRoaXMgYmFzaWMgaW50ZXJmYWNlLlxuICoqL1xuZXhwb3J0IGZ1bmN0aW9uIEJhc2ljKCkge31cblxuLyoqXG4gKiBJZiBpdCdzIGEgVUkgdmlldyBidXQgd2l0aG91dCB2aXJ0dWFsIERPTSxcbiAqIHRoZSB2aWV3cyBtdXN0IGhhbmRsZSBkZXRhaWxlZCBET00gbWFuaXB1bGF0aW9uc1xuICogbWFudWFsbHkuIFNvIFVJIHZpZXcgY291bGQgYmUgY29tcGxpY2F0ZWQuXG4gKlxuICogV2l0aCB2aXJ0dWFsIERPTSBpdCBjb3VsZCBiZSB2ZXJ5IHNpbXBsZSwgYnV0IHRoaXMgZGVwZW5kcyBvbiB0aGVcbiAqIGZhY2lsaXRpZXMgb2YgdGhlIHByb2plY3QuXG4gKi9cbkJhc2ljLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbihkYXRhKSB7fTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vYnVpbGRfc3RhZ2Uvc3JjL3ZpZXcvYmFzaWMuanNcbiAqKi8iXSwic291cmNlUm9vdCI6IiJ9