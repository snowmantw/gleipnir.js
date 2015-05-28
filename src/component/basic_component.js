'use strict';

import { Logger as StateLogger } from 'src/logger/state.js';

/**
 * Component provides:
 *
 * 1. Resource keeper: to let all states share the same resources (cache).
 * 2. Reference to the current activate state: so that parent component can
 *    command and wait the sub-components to do things without tracking the
 *    actual active state.
 *
 * Every states of this component would receive the Component instance as
 * a way to access these common resources & properties. And every state
 * transferring would done by the 'transferTo' method in this component,
 * so that the component can update the active state correctly.
 */

/**
 * The argument 'view' is the only thing parent component needs to manage.
 * Please note that the 'view' isn't for UI rendering, although that
 * UI view is the most common of them. User could chose other views like
 * data-view or debugging-view to contruct the program. It would still
 * be "rendered" (perform the effect), but how to synthesize the effects
 * of parent and children now is the user's duty. For example, if we have a
 * 'console-view' to print out things instead of rendering UI, should it
 * print text from children first? Or the parent, since it's a wrapping
 * object, should info the user its status earlier than its children?
 * These behaviors should be encapsulated inside the 'view', and be
 * handled at the underlying level.
 */
export function BasicComponent(view) {
  this._subcomponents = null;
  this._activeState = null;
  // Concrete components should extend these to let States access them.
  // The first state component kick off should take responsibility for
  // initializing these things.
  //
  // Resources is for external resources like settings value or DOM elements.
  this.resources = {
    elements: {}
  };
  this.configs = {
    logger: {
      debug: false    // turn on it when we're debugging this component
    }
  };

  // The default logger.
  // A customized logger is accetable if it's with the 'transfer' method
  // for logging the state transferring.
  this.logger = new StateLogger();
  this.view = view;
  // Should at least appoint these.
  this.type = null;
  this._setupState = null;
}

/**
 * State' phase is the component's phase.
 */
BasicComponent.prototype.phase =
function() {
  return this._activeState.phase();
};

/**
 * Every state of this component should call the method to do transferring,
 * so that the component can update the 'activeState' correctly.
 *
 * The order of transferring is:
 *
 *  [current.stop] -> [next.start] -> (call)[previous.destroy]
 *
 * Note this function may return a nullized process if it's transferring,
 * so the user must detect if the return thing is a valid process
 * could be chained, or pre-check it with the property.
 */
BasicComponent.prototype.transferTo = function(clazz, reason = {}) {
  var nextState = new clazz(this);
  var currentState = this._activeState;
  this._activeState = nextState;
  this.logger.transfer(currentState.configs.type,
      nextState.configs.type, reason);
  return currentState.stop()
    .next(() => nextState.start());
};

/**
 * Would receive resources from parent and *extends* the default one.
 * After that, transfer to the next state, which is usually an initialization
 * state, that would do lots of sync/async things to update the
 * resources & properties.
 *
 * However, since basic component couldn't know what is the
 * initialization state, so that the concrete component should
 * implement the setup function, which would return the state after
 * receive the component instance.
 */
BasicComponent.prototype.start = function(resources) {
  this.logger.start(this.configs.logger);
  if (resources) {
    for (var key in this.resources) {
      if ('undefined' !== typeof resources[key]) {
        this.resources[key] = resources[key];
      }
    }
  }
  // Get the initialization state and let it fetch & set all.
  // 'initializeStateMachine', if Java doomed the world.
  // (and this is ECMAScript, a language (partially) inspired by Scheme!).
  this._activeState = this._setupState;
  return this._activeState.start();
};

BasicComponent.prototype.stop = function() {
  return this._activeState.stop()
    .next(this.waitComponents.bind(this, 'stop'));
};

BasicComponent.prototype.destroy = function() {
  return this._activeState.destroy()
    .next(this.waitComponents.bind(this, 'destroy'))
    .next(() => { this.logger.stop(); });  // Logger need add phase support.
};

BasicComponent.prototype.live = function() {
  return this._activeState.until('stop');
};

BasicComponent.prototype.exist = function() {
  return this._activeState.until('destroy');
};

/**
 * Can command all sub-components with one method and its arguments.
 * For example, to 'start', or 'stop' them.
 * Will return a Promise only be resolved after all sub-components
 * executed the command. For example:
 *
 * subcomponents: {
 *    buttons: [ButtonFoo, ButtonBar]
 *    submit: Submit
 * }
 * var promised = parent.waitComponents(parent.stop.bind(parent));
 *
 * The promised would be resolved only after ButtonFoo, ButtonBar and Submit
 * are all stopped.
 *
 * And since for states the sub-components is delegated to Component,
 * state should only command these sub-components via this method,
 * or access them individually via the component instance set at the
 * setup stage.
 */
BasicComponent.prototype.waitComponents = function(method, args) {
  if (!this._subcomponents) {
    return Promise.resolve();
  }
  var waitPromises =
  Object.keys(this._subcomponents).reduce((steps, name) => {
    var instance = this._subcomponents[name];
    // If the entry of the component actually contains multiple subcomponents.
    // We need to apply the method to each one and concat all the result
    // promises with our main array of applies.
    if (Array.isArray(instance)) {
      var applies = instance.map((subcomponent) => {
        return subcomponent[method].apply(subcomponent, args);
      });
      return steps.concat(applies);
    } else {
      return steps.concat([instance[method].apply(instance, args)]);
    }
  }, []);
  return Promise.all(waitPromises);
};

/**
 * Forward the data to render the view.
 * If it's a real UI view and with tech like virtual DOM in React.js,
 * we could perform a high-efficiency rendering while keep the client code
 * as simple as possible.
 *
 * The target is an optional 'canvas' of the rendering target. It would,
 * if the view is an UI view for example, 'erase' it and render new content
 * each time this function get invoked. However, since we have not only
 * UI view, some targeting 'canvas' could be more tricky, like FileObject,
 * Blob, sound system, etc.
 */
BasicComponent.prototype.render = function(props, target) {
  return this.view.render(props, target);
};

