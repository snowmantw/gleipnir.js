 'use strict';

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
(function(exports) {
  var GleipnirBasicView = function() {};

  /**
   * If it's a UI view but without virtual DOM,
   * the views must handle detailed DOM manipulations
   * manually. So UI view could be complicated.
   *
   * With virtual DOM it could be very simple, but this depends on the
   * facilities of the project.
   */
  GleipnirBasicView.prototype.render = function(data) {};
  exports.GleipnirBasicView = GleipnirBasicView;
})(window);

