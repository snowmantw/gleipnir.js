/**
 * gleipnir.js - Gleipnir.js - a library for UI programming
 * @version v0.0.1
 * @link 
 * @license Apache 2.0
 */
var Gleipnir = Gleipnir || {}; Gleipnir["Source"] =
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

	__webpack_require__(14);
	__webpack_require__(15);
	__webpack_require__(16);
	module.exports = __webpack_require__(17);


/***/ },
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */,
/* 12 */,
/* 13 */,
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports.DOMEvent = DOMEvent;
	
	var _srcSourceEvent_datumJs = __webpack_require__(15);
	
	/**
	 * DOM event source for Stream. One Stream can collect events from multiple
	 * sources, which pass different native events (not only DOM events)
	 * to Stream.
	 **/
	
	function DOMEvent(configs) {
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
	
	DOMEvent.prototype.start = function (forwardTo) {
	  var _this = this;
	
	  this.configs.events.forEach(function (ename) {
	    _this._collector(ename, _this.onchange);
	  });
	  this._forwardTo = forwardTo;
	  return this;
	};
	
	DOMEvent.prototype.stop = function () {
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
	DOMEvent.prototype.onchange = function (domevt) {
	  if (this._forwardTo) {
	    var sourceEvent = new _srcSourceEvent_datumJs.EventDatum(domevt.type, domevt.detail, domevt);
	    this._forwardTo(sourceEvent);
	  }
	};

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	/**
	 * A datum that every source would fire.
	 **/
	(function (exports) {
	  var EventDatum = function EventDatum(type, detail, original) {
	    this.type = type;
	    this.detail = detail;
	    this.original = original; // original event, if any.
	  };
	  exports.EventDatum = EventDatum;
	})(window);

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports.MinuteClock = MinuteClock;
	
	var _srcSourceEvent_datumJs = __webpack_require__(15);
	
	/**
	 * A source fire events every clock minutes.
	 **/
	
	function MinuteClock(configs) {
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
	
	MinuteClock.prototype.start = function (forwardTo) {
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
	
	MinuteClock.prototype.tick = function () {
	  var _this2 = this;
	
	  this.onchange();
	  // For the first tick we must set timeout for it.
	  this._tickId = window.setTimeout(function () {
	    _this2.tick();
	  }, this.calcLeftMilliseconds());
	};
	
	MinuteClock.prototype.stop = function () {
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
	MinuteClock.prototype.onchange = function () {
	  if (this._forwardTo) {
	    this._forwardTo(new _srcSourceEvent_datumJs.EventDatum(this.configs.type));
	  }
	};
	
	MinuteClock.prototype.calcLeftMilliseconds = function () {
	  var seconds = new Date().getSeconds();
	  // If it's at the second 0th of the minute, immediate start to tick.
	  var leftMilliseconds = (60 - seconds) * 1000;
	  return leftMilliseconds;
	};

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports.Setting = Setting;
	
	var _srcSourceEvent_datumJs = __webpack_require__(15);
	
	/**
	 * Event source for Stream. One Stream can collect events from multiple
	 * sources, which pass different native events (not only DOM events)
	 * to Stream.
	 **/
	
	function Setting(configs) {
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
	
	Setting.prototype.start = function (forwardTo) {
	  var _this = this;
	
	  this.configs.settings.forEach(function (key) {
	    _this._collector(key, _this.onchange);
	  });
	  this._forwardTo = forwardTo;
	  return this;
	};
	
	Setting.prototype.stop = function () {
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
	Setting.prototype.onchange = function (change) {
	  if (this._forwardTo) {
	    this._forwardTo(new SourceEvent(change.settingName, change.settingValue));
	  }
	};

/***/ }
/******/ ]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNjgzYzcyYWJiOGUxNDNhMTM4MGM/N2MyNyoqKioqKioiLCJ3ZWJwYWNrOi8vLy4vYnVpbGRfc3RhZ2Uvc3JjL3NvdXJjZS9kb21fZXZlbnQuanMiLCJ3ZWJwYWNrOi8vLy4vYnVpbGRfc3RhZ2Uvc3JjL3NvdXJjZS9ldmVudF9kYXR1bS5qcyIsIndlYnBhY2s6Ly8vLi9idWlsZF9zdGFnZS9zcmMvc291cmNlL21pbnV0ZV9jbG9jay5qcyIsIndlYnBhY2s6Ly8vLi9idWlsZF9zdGFnZS9zcmMvc291cmNlL3NldHRpbmcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx1QkFBZTtBQUNmO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN0Q0EsYUFBWSxDQUFDOzs7OztTQVNHLFFBQVEsR0FBUixRQUFROzttREFQRyxFQUEyQjs7Ozs7Ozs7QUFPL0MsVUFBUyxRQUFRLENBQUMsT0FBTyxFQUFFO0FBQ2hDLE9BQUksQ0FBQyxPQUFPLEdBQUc7QUFDYixXQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU0sSUFBSSxFQUFFO0lBQzdCLENBQUM7QUFDRixPQUFJLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDdkQsT0FBSSxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzVELE9BQUksQ0FBQyxVQUFVLENBQUM7Ozs7QUFJaEIsT0FBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUks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VyxFQUFFLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO0lBQzdEO0VBQ0YsQyIsImZpbGUiOiJHbGVpcG5pci5Tb3VyY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0ZXhwb3J0czoge30sXG4gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuIFx0XHRcdGxvYWRlZDogZmFsc2VcbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIHdlYnBhY2svYm9vdHN0cmFwIDY4M2M3MmFiYjhlMTQzYTEzODBjXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgeyBFdmVudERhdHVtIH0gZnJvbSAnc3JjL3NvdXJjZS9ldmVudF9kYXR1bS5qcyc7XG5cbi8qKlxuICogRE9NIGV2ZW50IHNvdXJjZSBmb3IgU3RyZWFtLiBPbmUgU3RyZWFtIGNhbiBjb2xsZWN0IGV2ZW50cyBmcm9tIG11bHRpcGxlXG4gKiBzb3VyY2VzLCB3aGljaCBwYXNzIGRpZmZlcmVudCBuYXRpdmUgZXZlbnRzIChub3Qgb25seSBET00gZXZlbnRzKVxuICogdG8gU3RyZWFtLlxuICoqL1xuZXhwb3J0IGZ1bmN0aW9uIERPTUV2ZW50KGNvbmZpZ3MpIHtcbiAgdGhpcy5jb25maWdzID0ge1xuICAgIGV2ZW50czogY29uZmlncy5ldmVudHMgfHwgW10sXG4gIH07XG4gIHRoaXMuX2NvbGxlY3RvciA9IHdpbmRvdy5hZGRFdmVudExpc3RlbmVyLmJpbmQod2luZG93KTtcbiAgdGhpcy5fZGVjb2xsZWN0b3IgPSB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lci5iaW5kKHdpbmRvdyk7XG4gIHRoaXMuX2ZvcndhcmRUbzsgLy8gVGhlIGZvcndhcmRpbmcgdGFyZ2V0LlxuXG4gIC8vIFNvbWUgQVBJIHlvdSBqdXN0IGNhbid0IGJpbmQgaXQgd2l0aCB0aGUgb2JqZWN0LFxuICAvLyBidXQgYSBmdW5jdGlvbi5cbiAgdGhpcy5vbmNoYW5nZSA9IHRoaXMub25jaGFuZ2UuYmluZCh0aGlzKTtcbn1cblxuRE9NRXZlbnQucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oZm9yd2FyZFRvKSB7XG4gIHRoaXMuY29uZmlncy5ldmVudHMuZm9yRWFjaCgoZW5hbWUpID0+IHtcbiAgICB0aGlzLl9jb2xsZWN0b3IoZW5hbWUsIHRoaXMub25jaGFuZ2UpO1xuICB9KTtcbiAgdGhpcy5fZm9yd2FyZFRvID0gZm9yd2FyZFRvO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkRPTUV2ZW50LnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuX2ZvcndhcmRUbyA9IG51bGw7XG4gIHRoaXMuY29uZmlncy5ldmVudHMuZm9yRWFjaCgoZW5hbWUpID0+IHtcbiAgICB0aGlzLl9kZWNvbGxlY3RvcihlbmFtZSwgdGhpcy5vbmNoYW5nZSk7XG4gIH0pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRm9yIGZvcndhcmRpbmcgdG8gdGhlIHRhcmdldC5cbiAqL1xuRE9NRXZlbnQucHJvdG90eXBlLm9uY2hhbmdlID0gZnVuY3Rpb24oZG9tZXZ0KSB7XG4gIGlmICh0aGlzLl9mb3J3YXJkVG8pIHtcbiAgICB2YXIgc291cmNlRXZlbnQgPSBuZXcgRXZlbnREYXR1bShcbiAgICAgIGRvbWV2dC50eXBlLCBkb21ldnQuZGV0YWlsLCBkb21ldnQpO1xuICAgIHRoaXMuX2ZvcndhcmRUbyhzb3VyY2VFdmVudCk7XG4gIH1cbn07XG5cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vYnVpbGRfc3RhZ2Uvc3JjL3NvdXJjZS9kb21fZXZlbnQuanNcbiAqKi8iLCIgJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEEgZGF0dW0gdGhhdCBldmVyeSBzb3VyY2Ugd291bGQgZmlyZS5cbiAqKi9cbihmdW5jdGlvbihleHBvcnRzKSB7XG4gIHZhciBFdmVudERhdHVtID0gZnVuY3Rpb24odHlwZSwgZGV0YWlsLCBvcmlnaW5hbCkge1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgdGhpcy5kZXRhaWwgPSBkZXRhaWw7XG4gICAgdGhpcy5vcmlnaW5hbCA9IG9yaWdpbmFsOyAvLyBvcmlnaW5hbCBldmVudCwgaWYgYW55LlxuICB9O1xuICBleHBvcnRzLkV2ZW50RGF0dW0gPSBFdmVudERhdHVtO1xufSkod2luZG93KTtcblxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9idWlsZF9zdGFnZS9zcmMvc291cmNlL2V2ZW50X2RhdHVtLmpzXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgeyBFdmVudERhdHVtIH0gZnJvbSAnc3JjL3NvdXJjZS9ldmVudF9kYXR1bS5qcyc7XG5cbi8qKlxuICogQSBzb3VyY2UgZmlyZSBldmVudHMgZXZlcnkgY2xvY2sgbWludXRlcy5cbiAqKi9cbmV4cG9ydCBmdW5jdGlvbiBNaW51dGVDbG9jayhjb25maWdzKSB7XG4gIHRoaXMuY29uZmlncyA9IHtcbiAgICB0eXBlOiBjb25maWdzLnR5cGUsXG4gICAgaW50ZXJ2YWw6IDYwMDAwICAgICAgIC8vIG9uZSBtaW51dGUuXG4gIH07XG4gIHRoaXMuX3RpY2tJZCA9IG51bGw7XG4gIHRoaXMuX2ZvcndhcmRUbyA9IG51bGw7XG4gIC8vIFNvbWUgQVBJIHlvdSBqdXN0IGNhbid0IGJpbmQgaXQgd2l0aCB0aGUgb2JqZWN0LFxuICAvLyBidXQgYSBmdW5jdGlvbi5cbiAgdGhpcy5vbmNoYW5nZSA9IHRoaXMub25jaGFuZ2UuYmluZCh0aGlzKTtcbn1cblxuTWludXRlQ2xvY2sucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oZm9yd2FyZFRvKSB7XG4gIHRoaXMuX2ZvcndhcmRUbyA9IGZvcndhcmRUbztcbiAgdmFyIHNlY29uZHMgPSAobmV3IERhdGUoKSkuZ2V0U2Vjb25kcygpO1xuICAvLyBJZiBpdCdzIHRoZSAjMCBzZWNvbmQgb2YgdGhhdCBtaW51dGUsXG4gIC8vIGltbWVkaWF0ZWx5IHRpY2sgb3Igd2Ugd291bGQgbG9zdCB0aGlzIG1pbnV0ZS5cbiAgaWYgKDAgPT09IHNlY29uZHMpIHtcbiAgICB0aGlzLm9uY2hhbmdlKCk7XG4gIH1cbiAgLy8gRm9yIHRoZSBmaXJzdCB0aWNrIHdlIG11c3Qgc2V0IHRpbWVvdXQgZm9yIGl0LlxuICB0aGlzLl90aWNrSWQgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgdGhpcy50aWNrKCk7XG4gIH0sIHRoaXMuY2FsY0xlZnRNaWxsaXNlY29uZHMoKSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuTWludXRlQ2xvY2sucHJvdG90eXBlLnRpY2sgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5vbmNoYW5nZSgpO1xuICAvLyBGb3IgdGhlIGZpcnN0IHRpY2sgd2UgbXVzdCBzZXQgdGltZW91dCBmb3IgaXQuXG4gIHRoaXMuX3RpY2tJZCA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICB0aGlzLnRpY2soKTtcbiAgfSwgdGhpcy5jYWxjTGVmdE1pbGxpc2Vjb25kcygpKTtcbn07XG5cbk1pbnV0ZUNsb2NrLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuX2ZvcndhcmRUbyA9IG51bGw7XG4gIGlmICh0aGlzLl90aWNrSWQpIHtcbiAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRoaXMuX3RpY2tJZCk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEZvciBmb3J3YXJkaW5nIHRvIHRoZSB0YXJnZXQuXG4gKiBXaGVuIHRoZSB0aW1lIGlzIHVwLCBmaXJlIGFuIGV2ZW50IGJ5IGdlbmVyYXRvci5cbiAqIFNvIHRoYXQgdGhlIG9uY2hhbmdlIG1ldGhvZCB3b3VsZCBmb3J3YXJkIGl0IHRvIHRoZSB0YXJnZXQuXG4gKi9cbk1pbnV0ZUNsb2NrLnByb3RvdHlwZS5vbmNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICBpZiAodGhpcy5fZm9yd2FyZFRvKSB7XG4gICAgdGhpcy5fZm9yd2FyZFRvKG5ldyBFdmVudERhdHVtKHRoaXMuY29uZmlncy50eXBlKSk7XG4gIH1cbn07XG5cbk1pbnV0ZUNsb2NrLnByb3RvdHlwZS5jYWxjTGVmdE1pbGxpc2Vjb25kcyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc2Vjb25kcyA9IChuZXcgRGF0ZSgpKS5nZXRTZWNvbmRzKCk7XG4gIC8vIElmIGl0J3MgYXQgdGhlIHNlY29uZCAwdGggb2YgdGhlIG1pbnV0ZSwgaW1tZWRpYXRlIHN0YXJ0IHRvIHRpY2suXG4gIHZhciBsZWZ0TWlsbGlzZWNvbmRzID0gKDYwIC0gc2Vjb25kcykgKiAxMDAwO1xuICByZXR1cm4gbGVmdE1pbGxpc2Vjb25kcztcbn07XG5cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vYnVpbGRfc3RhZ2Uvc3JjL3NvdXJjZS9taW51dGVfY2xvY2suanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7IEV2ZW50RGF0dW0gfSBmcm9tICdzcmMvc291cmNlL2V2ZW50X2RhdHVtLmpzJztcblxuLyoqXG4gKiBFdmVudCBzb3VyY2UgZm9yIFN0cmVhbS4gT25lIFN0cmVhbSBjYW4gY29sbGVjdCBldmVudHMgZnJvbSBtdWx0aXBsZVxuICogc291cmNlcywgd2hpY2ggcGFzcyBkaWZmZXJlbnQgbmF0aXZlIGV2ZW50cyAobm90IG9ubHkgRE9NIGV2ZW50cylcbiAqIHRvIFN0cmVhbS5cbiAqKi9cbmV4cG9ydCBmdW5jdGlvbiBTZXR0aW5nKGNvbmZpZ3MpIHtcbiAgdGhpcy5jb25maWdzID0ge1xuICAgIHNldHRpbmdzOiBjb25maWdzLnNldHRpbmdzIHx8IFtdXG4gIH07XG4gIHRoaXMuX2NvbGxlY3RvciA9IG5hdmlnYXRvci5tb3pTZXR0aW5ncy5hZGRPYnNlcnZlclxuICAgIC5iaW5kKG5hdmlnYXRvci5tb3pTZXR0aW5ncyk7XG4gIHRoaXMuX2RlY29sbGVjdG9yID0gbmF2aWdhdG9yLm1velNldHRpbmdzLnJlbW92ZU9ic2VydmVyXG4gICAgLmJpbmQobmF2aWdhdG9yLm1velNldHRpbmdzKTtcbiAgdGhpcy5fZm9yd2FyZFRvID0gbnVsbDtcbiAgLy8gU29tZSBBUEkgeW91IGp1c3QgY2FuJ3QgYmluZCBpdCB3aXRoIHRoZSBvYmplY3QsXG4gIC8vIGJ1dCBhIGZ1bmN0aW9uLlxuICB0aGlzLm9uY2hhbmdlID0gdGhpcy5vbmNoYW5nZS5iaW5kKHRoaXMpO1xufVxuXG5TZXR0aW5nLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKGZvcndhcmRUbykge1xuICB0aGlzLmNvbmZpZ3Muc2V0dGluZ3MuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgdGhpcy5fY29sbGVjdG9yKGtleSwgdGhpcy5vbmNoYW5nZSk7XG4gIH0pO1xuICB0aGlzLl9mb3J3YXJkVG8gPSBmb3J3YXJkVG87XG4gIHJldHVybiB0aGlzO1xufTtcblxuU2V0dGluZy5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLl9mb3J3YXJkVG8gPSBudWxsO1xuICB0aGlzLmNvbmZpZ3Muc2V0dGluZ3MuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgdGhpcy5fZGVjb2xsZWN0b3Ioa2V5LCB0aGlzLm9uY2hhbmdlKTtcbiAgfSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBGb3IgZm9yd2FyZGluZyB0byB0aGUgdGFyZ2V0LlxuICogV291bGQgdHJhbnNmb3JtIHRoZSBvcmlnaW5hbCAnc2V0dGluZ05hbWUnIGFuZCAnc2V0dGluZ1ZhbHVlJyBwYWlyIGFzXG4gKiAndHlwZScgYW5kICdkZXRhaWwnLCBhcyB0aGUgZXZlbnQgZm9ybWFudC5cbiAqL1xuU2V0dGluZy5wcm90b3R5cGUub25jaGFuZ2UgPSBmdW5jdGlvbihjaGFuZ2UpIHtcbiAgaWYgKHRoaXMuX2ZvcndhcmRUbykge1xuICAgIHRoaXMuX2ZvcndhcmRUbyhcbiAgICAgIG5ldyBTb3VyY2VFdmVudChjaGFuZ2Uuc2V0dGluZ05hbWUsIGNoYW5nZS5zZXR0aW5nVmFsdWUpKTtcbiAgfVxufTtcblxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9idWlsZF9zdGFnZS9zcmMvc291cmNlL3NldHRpbmcuanNcbiAqKi8iXSwic291cmNlUm9vdCI6IiJ9