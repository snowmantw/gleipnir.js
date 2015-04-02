'use strict';

import { Language } from 'src/rune/language.js';

/**
 * Interface: manage the stack and provides analyzers if it's necessary.
 * Runtime: evaluate every change (node) of the stack.
 *
 * Interface would forward the stack change to the runtime.
 */
export function Interface(runtime) {
  this._runtime = runtime;
}

Interface.prototype.start = Language.define('start', 'begin');
Interface.prototype.stop = Language.define('stop', 'push');
Interface.prototype.destroy = Language.define('destroy', 'push');
Interface.prototype.next = Language.define('next', 'push');
Interface.prototype.shift = Language.define('shift', 'push');
Interface.prototype.rescue = Language.define('rescue', 'push');
Interface.prototype.wait = Language.define('wait', 'push');

// It's not a method owns semantics meaning of the eDSL, but a method
// interacts with the metalangauge, so define it in this way.
Interface.prototype.until =
function() {
  return this._handleUntil.apply(this._runtime, arguments);
};

Interface.prototype._handler = function() {
  return this._runtime.onchange.apply(this._runtime, arguments);
};

Interface.prototype._handleUntil = function() {
  return this._runtime.until.apply(this._runtime, arguments);
};

