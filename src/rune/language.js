'use strict';
/**
 * Generic builder that would push nodes into the eDSL stack.
 * User could inherit this to define the new eDSL.
 * ---
 * The default semantics only contain these operations:
 *
 * 1. [push] : push to the current stack
 * 2. [begin]: create a new stack and switch to it,
 *             and then push the node into the stack.
 * 3. [end]  : after push the node into the stack,
 *             change the current stack to the previous one.
 * 4. [exit] : exit the context of this eDSL; the last result
 *             of it would be passed to the return value of
 *             this chain.
 *
 * Stack could be nested: when [begin] a new stack in fact it would
 * push the stack into the previous one. So the stack comprise
 * [node] and [stack].
 * ---
 * Although the eDSL instance should wrap these basic operations
 * to manipulate the stack, but they all need to convert the method
 * call to nodes, so Language provide a way to simplify the work: if
 * the instance call the [define] method the name of the method,
 * it could associate the operand of the eDSL with the stack manipulation.
 * For example:
 *
 *    var builder = new Language();
 *    builder.define('transaction', 'begin');
 *    builder.define('pre', 'push');
 *    builder.define('perform', 'push');
 *    builder.define('post', 'end');
 *
 * Then the eDSL could be used as:
 *
 *    (new eDSL)
 *      .transaction()
 *      .pre(cb)
 *      .perform(cb)
 *      .post(cb)
 *
 * And the stack would be:
 *
 *    [
 *      node<'transaction',>
 *      node<'pre', cb>
 *      node<'preform', cb>
 *      node<'post', cb>
 *    ]
 *
 * However, this simple approach the semantics rules and analyzers to
 * guarantee the stack is valid. For example, if we have a malformed
 * stack because of the following eDSL program:
 *
 *    (new eDSL)
 *      .post(cb)
 *      .pre(cb)
 *      .perform(cb)
 *      .transaction()
 *
 * The builder would report errot because when '.post(cb)' there is no stack
 * created by the beginning step, namely the '.pre(cb)' in our case.
 * Nevertheless, the error message is too low-level for the language user,
 * since they should care no stack things and should only care about the eDSL
 * itself.
 *
 * The solution is to provide a basic stack ordering analyzer and let the
 * language decide how to describe the error. And since we don't have
 * any context information about variables, scope and other elements
 * as a fully functional langauge, we only need to guarantee the order is
 * correct, and make incorrect cases meaningful. Moreover, since the analyzer
 * needs to analyze the states whenever the incoming node comes, it is in fact
 * an evaluation process, so user could combine the analyzing and intepreting
 * phase into the same function. For example:
 *
 *    builder.onchange((context, node, stack) => {
 *        // If the change is to switch to a new stack,
 *        // the 'stack' here would be the new stack.
 *        var {type, args} = node;
 *        if ('pre' === type) {
 *          context.init = true;
 *        } else if ('post' === type && !context.init) {
 *          throw new Error('There must be one "pre" node before the "post".');
 *        }
 *    });
 *
 * If the incoming node or the stack is malformed, it should throw the error.
 * This error would be captured by the builder and we could have a 'compilation
 * error'.
 *
 * The callback of the 'onchange' is actually a reducer, so user could treat
 * the process of this evalution & analyzing as a reducing process on an
 * infinite stream. And since we have a stack machine, if the reducer return
 * nothing, the stack would be empty. Otherwise, if the reducer return a node,
 * the stack would contain it.
 *
 * And please note the example is much simplified. For the
 * real eDSL it should be used only as an entry to dispatch the change to
 * the real handlers, which may comprise several states and components.
 */
export function Language() {}

/**
 * Helper method to build interface of a specific DSL. It would return a method
 * of the DSL and then the interfance could attach it.
 *
 * The returning function would assume that the 'this' inside it is the runtime
 * of the language, and would have members as '_stack', '_handler', etc.
 *
 * If it's 'exit' node, means the session is ended and the intepreter should
 * return a stack contains only one node as the result of the session, or the
 * session returns nothing.
 */
Language.define = function(method, as) {
  return function(...args) {
    var node, resultstack;
    switch (as) {
      case 'push':
        node = new Language.Node(method, args, this._stack);
        this._stack.push(node);
        resultstack =
          this._handler(this.context, node, this._stack);
        break;
      case 'begin':
        this._prevstack = this._stack;
        this._stack = [];
        node = new Language.Node(method, args, this._stack);
        this._stack.push(node);  // as the first node of the new stack.
        resultstack =
          this._handler(this.context, node, this._stack);
        break;
      case 'end':
        node = new Language.Node(method, args, this._stack);
        this._stack.push(node);  // the last node of the stack.
        this._stack =
          this._prevstack; // switch back to the previous stack.
        resultstack =
          this._handler(this.context, node, this._stack);
        break;
      case 'exit':
        node = new Language.Node(method, args, this._stack);
        this._stack.push(node);  // the last node of the stack.
        resultstack =
          this._handler(this.context, node, this._stack);
        return resultstack[0];
    }
    // If the handler updates the stack, it would replace the existing one.
    if (resultstack) {
      this._stack = resultstack;
    }
    return this;
  };
};

Language.Node = function(type, args, stack) {
  this.type = type;
  this.args = args;
  this._stack = stack;
};

Language.Evaluate = function() {
  this._analyzers = [];
  this._interpreter = null;
  this._context = {};
};

/**
 * Analyzer could receive the stack change from 'Language#evaluate',
 * and it would be called with the arguments as the function describes:
 *
 *     Language.prototype.evaluate((context, change, stack) => {
 *        // ...
 *     });
 *
 * So the analyzer could be:
 *
 *    function(context, change, stack) {
 *      // Do some check and maybe changed the context.
 *      // The next analyzer to the intepreter would accept the alternated
 *      // context as the argument 'context'.
 *      context.someFlag = true;
 *      // When there is wrong, throw it.
 *      throw new Error('Some analyzing error');
 *      // Return the context as the result.
 *      return context;
 *    };
 *
 * Note that the analyzer ('a') would be invoked with empty 'this' object,
 * so the function relys on 'this' should bind itself first.
 */
Language.Evaluate.prototype.analyzer = function(a) {
  this._analyzers.push(a);
};

/**
 * One Evaluate can only have one intepreter, and it would return
 * the function could consume every stack change from 'Language#evaluate'.
 *
 * The code is a little complicated: we have two kinds of 'reducing':
 * one is to reduce all analyzers with the sinlge incoming change,
 * another is to reduce all incoming changes with this analyzers + intepreter.
 *
 * The analyzer and intepreter should change the context, to memorize the
 * states of the evaluation. The difference is intepreter should return one
 * new stack if it needs to update the existing one. The stack it returns would
 * replace the existing one, so anything still in the old one would be wiped
 * out. The intepreter could return nothing ('undefined') to keep the stack
 * untouched.
 *
 * The analyzers and intepreter could change the 'context' pass to them.
 * And since we may update the stack as above, the context should memorize
 * those information not to be overwritten while the stack get wiped out.
 *
 * And if the intepreting node is the exit node of the session, intepreter
 * should return a new stack contains only one final result node. If there
 * is no such node, the result of this session is 'undefined'.
 */
Language.Evaluate.prototype.intepreter = function(i) {
  this._interpreter = i;
  // The Language would give the default context.
  return (context, change, stack) => {
    try {
      // Analyzer could change the context.
      this._analyzers.reduce((ctx, analyzer) => {
        analyzer.call({}, context, change, stack);
      }, context);
    } catch(e) {
      this._handleError(e, context, change, stack);
    }
    // After analyze it, intepret the node and return the new stack (if any).
    var newStack = this._intepreter(context, change, stack);
    return newStack;
  };
};

Language.Evaluate.prototype._handleError =
function(err, context, change, stack) {
  // TODO: expand it to provide more sophistic debugging message.
  throw new Error(`When change ${change.type} comes the error ${err} happened`);
};
