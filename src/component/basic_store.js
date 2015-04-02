 'use strict';

/**
 * Component should control its resources only via methods
 * defined here. This is just a empty interface that required
 * by BasicComponent. In this way, we could see how to implement
 * the same architecture for real components.
 **/

export function BasicStore() {
  // Resources include DOM elements and other stuff that component
  // need to require them from the 'outside'. So even it's only a string,
  // if the one comes from System settings or XHR, it should be a resource
  // item and to be managed here.
  this.resources = {};
}

