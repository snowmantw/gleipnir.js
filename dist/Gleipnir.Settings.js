/**
 * gleipnir.js - Gleipnir.js - a library for UI programming
 * @version v0.0.1
 * @link 
 * @license Apache 2.0
 */
var Gleipnir = Gleipnir || {}; Gleipnir["Settings"] =
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

	module.exports = __webpack_require__(3);


/***/ },
/* 1 */,
/* 2 */,
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports.Cache = Cache;
	/**
	 * A settings getter/setter cache.
	 * Provide as few as possible APIs like the native APIs do.
	 **/
	
	function Cache() {
	  this.cache = {};
	  this.handleSettings = this.handleSettings.bind(this);
	}
	
	Cache.prototype.get = function (entry) {
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
	Cache.prototype.set = function (entry, value) {
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
	Cache.prototype.handleSettings = function (evt) {
	  var settingsName = evt.settingsName;
	  var settingsValue = evt.settingsValue;
	
	  this.cache[settingsName] = settingsValue;
	};
	Cache.prototype.stop = function () {
	  var _this3 = this;
	
	  Object.keys(this.cache).forEach(function (entry) {
	    navigator.mozSettings.removeObserver(entry, _this3.handleSettings);
	  });
	};

/***/ }
/******/ ]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNjgzYzcyYWJiOGUxNDNhMTM4MGM/N2MyNyoqIiwid2VicGFjazovLy8uL2J1aWxkX3N0YWdlL3NyYy9zZXR0aW5ncy9jYWNoZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHVCQUFlO0FBQ2Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7QUN0Q0MsYUFBWSxDQUFDOzs7OztTQU1FLEtBQUssR0FBTCxLQUFLOzs7Ozs7QUFBZCxVQUFTLEtBQUssR0FBRztBQUN0QixPQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztBQUNoQixPQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0VBQ3REOztBQUVELE1BQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFHLFVBQVMsS0FBSyxFQUFFOzs7QUFDcEMsT0FBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQ3JCLFlBQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDM0M7O0FBRUQsT0FBSSxPQUFPLEVBQUUsTUFBTSxDQUFDO0FBQ3BCLE9BQUksT0FBTyxHQUFHLElBQUksT0FBTyxDQUFDLFVBQUMsR0FBRyxFQUFFLEdBQUcsRUFBSztBQUN0QyxZQUFPLEdBQUcsR0FBRyxDQUFDO0FBQ2QsV0FBTSxHQUFHLEdBQUcsQ0FBQztJQUNkLENBQUMsQ0FBQztBQUNILE9BQUksSUFBSSxHQUFHLFNBQVMsQ0FBQyxXQUFXLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDOUMsT0FBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMxQixNQUFHLENBQUMsSUFBSSxDQUFDLFlBQU07QUFDYixXQUFLLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUV0QyxjQUFTLENBQUMsV0FBVyxDQUNsQixXQUFXLENBQUMsS0FBSyxFQUFFLE1BQUssY0FBYyxDQUFDLENBQUM7QUFDM0MsWUFBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUM1QixDQUFDLFNBQU0sQ0FBQyxZQUFNO0FBQ2IsV0FBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNuQixDQUFDLENBQUM7QUFDSCxVQUFPLE9BQU8sQ0FBQztFQUNoQixDQUFDO0FBQ0YsTUFBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUcsVUFBUyxLQUFLLEVBQUUsS0FBSyxFQUFFOzs7QUFDM0MsT0FBSSxPQUFPLEVBQUUsTUFBTSxDQUFDO0FBQ3BCLE9BQUksT0FBTyxHQUFHLElBQUksT0FBTyxDQUFDLFVBQUMsR0FBRyxFQUFFLEdBQUcsRUFBSztBQUN0QyxZQUFPLEdBQUcsR0FBRyxDQUFDO0FBQ2QsV0FBTSxHQUFHLEdBQUcsQ0FBQztJQUNkLENBQUMsQ0FBQztBQUNILE9BQUksSUFBSSxHQUFHLFNBQVMsQ0FBQyxXQUFXLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDOUMsT0FBSSxVQUFVLEdBQUcsRUFBRSxDQUFDO0FBQ3BCLGFBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUM7QUFDMUIsT0FBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUMvQixNQUFHLENBQUMsSUFBSSxDQUFDLFlBQU07QUFDYixZQUFLLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUM7QUFDMUIsWUFBTyxFQUFFLENBQUM7SUFDWCxDQUFDLFNBQU0sQ0FBQyxZQUFNO0FBQ2IsV0FBTSxFQUFFLENBQUM7SUFDVixDQUFDLENBQUM7QUFDSCxVQUFPLE9BQU8sQ0FBQztFQUNoQixDQUFDO0FBQ0YsTUFBSyxDQUFDLFNBQVMsQ0FBQyxjQUFjLEdBQUcsVUFBUyxHQUFHLEVBQUU7T0FDdkMsWUFBWSxHQUFvQixHQUFHLENBQW5DLFlBQVk7T0FBRSxhQUFhLEdBQUssR0FBRyxDQUFyQixhQUFhOztBQUNqQyxPQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxHQUFHLGFBQWEsQ0FBQztFQUMxQyxDQUFDO0FBQ0YsTUFBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsWUFBVzs7O0FBQ2hDLFNBQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFDLEtBQUssRUFBSztBQUN6QyxjQUFTLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsT0FBSyxjQUFjLENBQUMsQ0FBQztJQUNsRSxDQUFDLENBQUM7RUFDSixDIiwiZmlsZSI6IkdsZWlwbmlyLlNldHRpbmdzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGV4cG9ydHM6IHt9LFxuIFx0XHRcdGlkOiBtb2R1bGVJZCxcbiBcdFx0XHRsb2FkZWQ6IGZhbHNlXG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oMCk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiB3ZWJwYWNrL2Jvb3RzdHJhcCA2ODNjNzJhYmI4ZTE0M2ExMzgwY1xuICoqLyIsIiAndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQSBzZXR0aW5ncyBnZXR0ZXIvc2V0dGVyIGNhY2hlLlxuICogUHJvdmlkZSBhcyBmZXcgYXMgcG9zc2libGUgQVBJcyBsaWtlIHRoZSBuYXRpdmUgQVBJcyBkby5cbiAqKi9cbmV4cG9ydCBmdW5jdGlvbiBDYWNoZSgpIHtcbiAgdGhpcy5jYWNoZSA9IHt9O1xuICB0aGlzLmhhbmRsZVNldHRpbmdzID0gdGhpcy5oYW5kbGVTZXR0aW5ncy5iaW5kKHRoaXMpO1xufVxuXG5DYWNoZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oZW50cnkpIHtcbiAgaWYgKHRoaXMuY2FjaGVbZW50cnldKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLmNhY2hlW2VudHJ5XSk7XG4gIH1cblxuICB2YXIgcmVzb2x2ZSwgcmVqZWN0O1xuICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXYsIHJlaikgPT4ge1xuICAgIHJlc29sdmUgPSByZXY7XG4gICAgcmVqZWN0ID0gcmVqO1xuICB9KTtcbiAgdmFyIGxvY2sgPSBuYXZpZ2F0b3IubW96U2V0dGluZ3MuY3JlYXRlTG9jaygpO1xuICB2YXIgcmVxID0gbG9jay5nZXQoZW50cnkpO1xuICByZXEudGhlbigoKSA9PiB7XG4gICAgdGhpcy5jYWNoZVtlbnRyeV0gPSByZXEucmVzdWx0W2VudHJ5XTtcbiAgICAvLyBPbmNlIGl0IGdldHRlZCwgbW9uaXRvciBpdCB0byB1cGRhdGUgY2FjaGUuXG4gICAgbmF2aWdhdG9yLm1velNldHRpbmdzXG4gICAgICAuYWRkT2JzZXJ2ZXIoZW50cnksIHRoaXMuaGFuZGxlU2V0dGluZ3MpO1xuICAgIHJlc29sdmUocmVxLnJlc3VsdFtlbnRyeV0pO1xuICB9KS5jYXRjaCgoKSA9PiB7XG4gICAgcmVqZWN0KHJlcS5lcnJvcik7XG4gIH0pO1xuICByZXR1cm4gcHJvbWlzZTtcbn07XG5DYWNoZS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24oZW50cnksIHZhbHVlKSB7XG4gIHZhciByZXNvbHZlLCByZWplY3Q7XG4gIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoKHJldiwgcmVqKSA9PiB7XG4gICAgcmVzb2x2ZSA9IHJldjtcbiAgICByZWplY3QgPSByZWo7XG4gIH0pO1xuICB2YXIgbG9jayA9IG5hdmlnYXRvci5tb3pTZXR0aW5ncy5jcmVhdGVMb2NrKCk7XG4gIHZhciByZXFjb250ZW50ID0ge307XG4gIHJlcWNvbnRlbnRbZW50cnldID0gdmFsdWU7XG4gIHZhciByZXEgPSBsb2NrLnNldChyZXFjb250ZW50KTtcbiAgcmVxLnRoZW4oKCkgPT4ge1xuICAgIHRoaXMuY2FjaGVbZW50cnldID0gdmFsdWU7XG4gICAgcmVzb2x2ZSgpO1xuICB9KS5jYXRjaCgoKSA9PiB7XG4gICAgcmVqZWN0KCk7XG4gIH0pO1xuICByZXR1cm4gcHJvbWlzZTtcbn07XG5DYWNoZS5wcm90b3R5cGUuaGFuZGxlU2V0dGluZ3MgPSBmdW5jdGlvbihldnQpIHtcbiAgdmFyIHsgc2V0dGluZ3NOYW1lLCBzZXR0aW5nc1ZhbHVlIH0gPSBldnQ7XG4gIHRoaXMuY2FjaGVbc2V0dGluZ3NOYW1lXSA9IHNldHRpbmdzVmFsdWU7XG59O1xuQ2FjaGUucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpIHtcbiAgT2JqZWN0LmtleXModGhpcy5jYWNoZSkuZm9yRWFjaCgoZW50cnkpID0+IHtcbiAgICBuYXZpZ2F0b3IubW96U2V0dGluZ3MucmVtb3ZlT2JzZXJ2ZXIoZW50cnksIHRoaXMuaGFuZGxlU2V0dGluZ3MpO1xuICB9KTtcbn07XG5cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vYnVpbGRfc3RhZ2Uvc3JjL3NldHRpbmdzL2NhY2hlLmpzXG4gKiovIl0sInNvdXJjZVJvb3QiOiIifQ==