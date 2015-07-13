'use strict';

import { EventDatum } from 'src/source/event_datum.js';

/**
 * DOM event source for Stream. One Stream can collect events from multiple
 * sources, which pass different native events (not only DOM events)
 * to Stream.
 **/
export function DOMEvent(configs) {
  this.configs = {
    events: configs.events || [],
  };
  this._collector = window.addEventListener.bind(window);
  this._decollector = window.removeEventListener.bind(window);
  this._forwardTo; // The forwarding target.

  // Some API you just can't bind it with the object,
  // but a function.
  this.onchange = this.onchange.bind(this);
}

DOMEvent.prototype.start = function(forwardTo) {
  this.configs.events.forEach((ename) => {
    this._collector(ename, this.onchange);
  });
  this._forwardTo = forwardTo;
  return this;
};

DOMEvent.prototype.stop = function() {
  this._forwardTo = null;
  this.configs.events.forEach((ename) => {
    this._decollector(ename, this.onchange);
  });
  return this;
};

/**
 * For forwarding to the target.
 */
DOMEvent.prototype.onchange = function(domevt) {
  if (this._forwardTo) {
    var sourceEvent = new EventDatum(
      domevt.type, domevt.detail, domevt);
    this._forwardTo(sourceEvent);
  }
};

