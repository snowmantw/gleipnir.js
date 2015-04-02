'use strict';

export function Runtime() {
  this.states = {
    phase: null,
    currentPromise: null,
    until: {
      resolver: null,
      phase: null
    },
    // @see: #next
    stepResults: [],
  };
  this.debugging = {
    // @see: #next
    currentPhaseSteps: 0,
    colors: this.generateDebuggingColor(),
    truncatingLimit: 64
  };
  this.configs = {
    debug: false
  };
}

/**
 * When the stack of DSL changes, evaluate the Language.Node.
 */
Runtime.prototype.onchange = function(instance, change, stack) {
  if ('exit' !== change.type) {
    // Since we don't need to keep things in stack until we have
    // real analyzers, the 'onchange' handler would return empty stack
    // to let the language runtime clear the stack every instruction.
    this[change.type].apply(this, change.args);
    return [];
  } else {
    // If it's 'exit' step we need to return the result.
    var result = this[change.type].apply(this, change.args);
    return [result];
  }
};


Runtime.prototype.start = function() {
  this.states.phase = 'start';
  this.states.currentPromise = Promise.resolve();
};

Runtime.prototype.stop = function() {
  this.shift('start', 'stop');
};

Runtime.prototype.destroy = function() {
  this.shift('stop', 'destroy');
};

Runtime.prototype.shift = function(prev, current) {
  // Already in.
  if (current === this.states.phase) {
    return;
  }
  if (prev !== this.states.phase) {
    var error = new Error(`Must be ${prev} before shift to ${current},
                     but now it's ${this.states.phase}`);
    console.error(error);
    throw error;
  }
  this.states.phase = current;
  if (this.until.phase === this.states.phase) {
    this.until.resolver();
  }
  // Concat new step to switch to the 'next promise'.
  this.states.currentPromise =
  this.states.currentPromise.catch((err) => {
    if (!(err instanceof Runtime.InterruptError)) {
      // We need to re-throw it again and bypass the whole
      // phase, until the next phase (final phase) to
      // handle it. Since in Promise, steps after catch would
      // not be affected by the catched error and keep executing.
      throw err;
    }
    // And if it's an interrupt error we do nothing, so that it would
    // make the chain omit this error and execute the following steps.
  });
  // At the moment of shifting, there are no steps belong to the new phase.
  this.debugging.currentPhaseSteps = 0;
};

/**
 * Return a Promise that only be resolved when we get shifed to the
 * target phase.
 */
Runtime.prototype.until = function(phase) {
  var promise = new Promise((res) => {
    this.states.until.resolver = res;
  });
  return promise;
};

/**
 * The 'step' can only be a function return Promise/Process/plain value.
 * No matter a Promise or Process it would return,
 * the chain would concat it as the Promise rule.
 * If it's plain value then this process would ignore it, as
 * what a Promise does.
 *
 * About the resolving values:
 *
 * .next( fnResolveA, fnResolveB )  --> #save [a, b] in this process
 * .next( fnResolveC )              --> #receive [a, b] as first argument
 * .next( fnResolveD )              --> #receive c as first argument
 * .next( fnResolveE, fnResolveF)   --> #each of them receive d as argument
 */
Runtime.prototype.next = function(...tasks) {
  if (!this.states.currentPromise) {
    throw new Error('Process should initialize with the `start` method');
  }
  // At definition stage, set it's phase.
  // And check if it's a function.
  tasks.forEach((task) => {
    if ('function' !== typeof task) {
      throw new Error(`The task is not a function: ${task}`);
    }
    task.phase = this.states.phase;
    if (this.configs.debug) {
      // Must append stack information here to let debugger output
      // it's defined in where.
      task.tracing = {
        stack: (new Error()).stack
      };
    }
  });

  // First, concat a 'then' to check interrupt.
  this.states.currentPromise =
    this.states.currentPromise.then(() => {
      // Would check: if the phase it belongs to is not what we're in,
      // the process need to be interrputed.
      for (var task of tasks) {
        if (this.checkInterrupt(task)) {
          throw new Runtime.InterruptError();
        }
      }
    });

  // Read it as:
  // 1. execute all tasks to generate resolvable-promises
  // 2. Promise.all(...) to wait these resolvable-promises
  // 3. append a general error handler after the Promise.all
  //    so that if any error occurs it would print them out
  // So, including the code above, we would have:
  //
  // currentPromise {
  //  [checkInterrupt(tasks)]
  //  [Promise.all([taskA1, taskA2...])]
  //  [error handler] +}
  //
  // The 'checkInterrupt' and 'error handler' wrap the actual steps
  // to do the necessary checks.
  this.states.currentPromise =
    this.states.currentPromise.then(() => this.generateStep(tasks));
  this.states.currentPromise =
    this.states.currentPromise.catch(this.generateErrorLogger({
      'nth-step': this.debugging.currentPhaseSteps
    }));

  // A way to know if these tasks is the first steps in the current phase,
  // and it's also convenient for debugging.
  this.debugging.currentPhaseSteps += 1;

};

Runtime.prototype.rescue = function(handler) {
  this.states.currentPromise =
    this.states.currentPromise.catch((err) => {
    if (err instanceof Runtime.InterruptError) {
      // Only built-in phase transferring catch can handle interrupts.
      // Re-throw it until we reach the final catch we set.
      throw err;
    } else {
      handler(err);
    }
  });
};

/**
 * An interface to explicitly put multiple tasks execute at one time.
 **/
Runtime.prototype.wait = function() {
  this.next.apply(this, arguments);
};

/**
 * Execute task and get Promises or plain values them return,
 * and then return the wrapped Promise as the next step of this
 * process. The name 'step' indicates the generated Promise,
 * which is one step of the main Promise of the current phase.
 */
Runtime.prototype.generateStep = function(tasks) {
  // 'taskResults' means the results of the tasks.
  var taskResults = [];
  if (true === this.configs.debug) {
    this.trace(tasks);
  }

  // So we unwrap the task first, and then put it in the array.
  // Since we need to give the 'currentPromise' a function as what the
  // tasks generate here.
  var chains = tasks.map((task) => {
    // Reset the registered results.
    // 'previousResults' means the results left by the previous step.
    var previousResults = this.states.stepResults;
    var chain;
    // If it has multiple results, means it's a task group
    // generated results.
    if (previousResults.length > 1) {
      chain = task(previousResults);
    } else {
      chain = task(previousResults[0]);
    }
    // Ordinary function returns 'undefine' or other things.
    if (!chain) {
      // It's a plain value.
      // Store it as one of results.
      taskResults.push(chain);
      return Promise.resolve(chain);
    }

    // It's a Process.
    if ('undefined' !== typeof chain._runtime &&
        chain._runtime instanceof Runtime) {
      // Premise: it's a started process.
      return chain._runtime.states.currentPromise.then(() => {
        var guestResults = chain._runtime.states.stepResults;
        // Since we implicitly use 'Promise.all' to run
        // multiple tasks in one step, we need to determinate if
        // there is only one task in the task, or it actually has multiple
        // return values from multiple tasks.
        if (guestResults.length > 1) {
          // We need to transfer the results from the guest Process to the
          // host Process.
          taskResults = taskResults.push(guestResults);
        } else {
          taskResults.push(chain._runtime.states.stepResults[0]);
        }
      });
    } else if (chain.then) {
      // Ordinary promise can be concated immediately.
      return chain.then((resolvedValue) => {
        taskResults.push(resolvedValue);
      });
    } else {
      // It's a plain value.
      // Store it as one of results.
      taskResults.push(chain);
      return Promise.resolve(chain);
    }
  });
  return Promise.all(chains).then(() => {
    // Because in the previous 'all' we ensure all tasks are executed,
    // and the results of these tasks are collected, so we need
    // to register them as the last results of the last step.
    this.states.stepResults = taskResults;
  });
};

/** We need this to prevent the step() throw errors.
* In this catch, we distinguish the interrupt and other errors,
* and then bypass the former and print the later out.
*
* The final fate of the real errors is it would be re-throw again
* after we print the instance out. We need to do that since after an
* error the promise shouldn't keep executing. If we don't throw it
* again, since the error has been catched, the rest steps in the
* promise would still be executed, and the user-set rescues would
* not catch this error.
*
* As a conclusion, no matter whether the error is an interrupt,
* we all need to throw it again. The only difference is if it's
* and interrupt we don't print it out.
*/
Runtime.prototype.generateErrorLogger = function(debuginfo) {
  return (err) => {
    if (!(err instanceof Runtime.InterruptError)) {
      console.error(`ERROR during #${debuginfo['nth-step']}
          step executes: ${err.message}`, err);
    }
    throw err;
  };
};

Runtime.prototype.checkInterrupt = function(step) {
  if (step.phase !== this.states.phase) {
    return true;
  }
  return false;
};

Runtime.prototype.generateDebuggingColor = function() {
  const colorsets = [
    { background: 'red', foreground: 'white' },
    { background: 'green', foreground: 'white' },
    { background: 'blue', foreground: 'white' },
    { background: 'saddleBrown', foreground: 'white' },
    { background: 'cyan', foreground: 'darkSlateGray' },
    { background: 'gold', foreground: 'darkSlateGray' },
    { background: 'paleGreen', foreground: 'darkSlateGray' },
    { background: 'plum', foreground: 'darkSlateGray' }
  ];
  var colorset = colorsets[ Math.floor(Math.random() * colorsets.length) ];
  return colorset;
};

Runtime.prototype.trace = function(tasks) {
  if (false === this.configs.debug) {
    return;
  }
  var log = tasks.reduce((mergedMessage, task) => {
    var source = String.substring(task.toSource(), 0,
      this.debugging.truncatingLimit);
    var message = ` ${ source } `;
    return mergedMessage + message;
  }, `%c ${ tasks[0].phase }#${ this.debugging.currentPhaseSteps } | `);
  // Don't print those inherited functions.
  var stackFilter = new RegExp('^(GleipnirBasic|Process|Stream)');
  var stack = tasks[0].tracing.stack.split('\n').filter((line) => {
    return '' !== line;
  }).filter((line) => {
    return !line.match(stackFilter);
  }).join('\n');

  log = log + ' | \n\r' + stack;
  console.log(log, 'background-color: '+ this.debugging.colors.background +
    ';' + 'color: ' + this.debugging.colors.foreground);
};

Runtime.InterruptError = function(message) {
  this.name = 'InterruptError';
  this.message = message || '';
};

Runtime.InterruptError.prototype = new Error();

