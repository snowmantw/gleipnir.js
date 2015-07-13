 'use strict';

/**
 * A datum that every source would fire.
 **/
(function(exports) {
  var EventDatum = function(type, detail, original) {
    this.type = type;
    this.detail = detail;
    this.original = original; // original event, if any.
  };
  exports.EventDatum = EventDatum;
})(window);

