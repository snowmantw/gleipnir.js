'use strict';

import { Interface } from 'src/stream/process/interface.js';
import { Runtime } from 'src/stream/process/runtime.js';

/**
 * The core component to sequentialize asynchronous steps.
 * Basically it's an 'interruptable promise', but more than be interrupted,
 * it could 'shift' from one to another phase, with the non-preemptive
 * interrupting model.
 *
 * Example:
 *    var process = new Process();
 *    process.start()       // the default phase is 'start'
 *           .next(stepA)
 *           .next(stepB)
 *           ...
 *    // later, some urgent events come
 *    process.stop()       // one of the default three phases
 *           .next(stopStepA)
 *           .next(stopStepB)
 *           ....
 *   // later, some other interrupts come
 *   process.shift('stop', 'dizzy')
 *          .next(dizzyStepA)
 *          .next(dizzyStepB)
 *
 * The phases listed above would immediately interrupt the steps scheduled
 * at the previous phase. However, this is a *non-preemptive* process by
 * default. So, if there is a long-waiting Promise step in the 'start' phase:
 *
 *   process.start()
 *          .next( longlonglongWaitingPromise )   // <--- now it's waiting this
 *          .next( thisStepIsStarving )
 *          .next( andThisOneToo )
 *          .next( poorSteps )
 *          ....
 *   // some urgent event occurs when it goes to the long waiting promise
 *   process.stop()
 *          .next( doThisAsQuickAsPossible )
 *
 * The first step of the 'stop' phase, namely the 'doThisAsQuickAsPossible',
 * would *not* get executed immediately, since the promise is still waiting the
 * last step earlier interruption. So, even the following steps of the 'start'
 * phase would all get dropped, the new phase still need to wait the last one
 * asynchronous step get resolved to get kicked off.
 *
 * ---
 * ## About the non-preemptive model
 *
 * The reason why we can't have a preemptive process is because we couldn't
 * interrupt each single step in the process, so the most basic unit could be
 * interrupted is the step. So, the caveat here is make the step as small as
 * possible, and treat it as some atomic operation that guaranteed to not been
 * interrupted by Process. For example, if we alias 'next' as 'atomic':
 *
 *    process.start()
 *           .atomic(stepA)       // <--- now it's waiting this
 *           .atomic(stepB)
 *
 *   // some urgent event occurs
 *   process.stop()
 *          .atomic( doThisAsQuickAsPossible )
 *
 * It would be better than:
 *
 *    process.start()
 *           .atomic(() => stepA.then(stepB))
 *
 *   // some urgent event occurs
 *   process.stop()
 *          .atomic( doThisAsQuickAsPossible )
 *
 * Since in the second example the first step of the 'stop' phase must wait
 * both the stepA & stepB, while in the first one it only needs to wait stepA.
 * However, this depends on which atomic operations is needed.
 *
 * Nevertheless, user is able to make the steps 'interruptible' via some special
 * methods of the process. That is, to monitor the phase changes to nullify the
 * step:
 *
 *    var process = new Process();
 *    process.start()
 *      .next(() => {
 *        var phaseShifted = false;
 *        process.until('stop')
 *          .next(() => {phaseShifted = true;});
 *        return new Promise((r, rj) => {
 *          setTimeout(() => {
 *            if (phaseShifted) { console.log('do nothing'); }
 *            else              { console.log('do something'); }
 *          }, 1000)
 *        });
 *      })
 *
 *   // some urgent event occurs
 *   process.stop()
 *          .next( doThisAsQuickAsPossible )
 *
 * So that the first step of the 'stop' phase would execute immediately after
 * the phase shifted, since the last step of the previous phase aborted itself.
 * In future the trick to nullify the last step may be included in as a method
 * of Process, but currently the manual detecting is still necessary.
 */

export function Process() {
  this._runtime = new Runtime();
  this._interface = new Interface(this._runtime);
  return this._interface;
}

/**
 * Because DRY.
 */
Process.defer = function() {
  var resolve, reject;
  var promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  var result = {
    'resolve': resolve,
    'reject': reject,
    'promise': promise
  };
  return result;
};

/* Static version for mimicking Promise.all */
Process.wait = function() {
  var process = new Process();
  return process.start().wait.apply(process, arguments);
};

