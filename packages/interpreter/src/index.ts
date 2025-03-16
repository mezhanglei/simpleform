import * as acorn from 'acorn';
import {
  stripLocations_,
  traverseAstDeclar,
  getStepFunctions,
  isStrict,
} from './utils/node';
import {
  isa,
  bindClassPrototype,
} from './utils/object';
import { Constants } from './constants';
import {
  StateConstructor,
} from './constructor';
import Context from './context';
import polyfills from './polyfills';

export * from './context';

globalThis.acorn = acorn;
/**
 * @license
 * Copyright 2013 Neil Fraser
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Interpreting JavaScript in JavaScript.
 * @author interpreter@neil.fraser.name (Neil Fraser)
 */
'use strict';

/**
 * Create a new interpreter.
 * @param {string|!Object} code Raw JavaScript text or AST.
 * @param {Function=} opt_initFunc Optional initialization function.  Used to
 *     define APIs.  When called it is passed the interpreter object and the
 *     global scope object.
 * @constructor
 */
class Interpreter {
  static Status = Constants.Status;
  static STEP_ERROR = Constants.STEP_ERROR;
  static SCOPE_REFERENCE = Constants.SCOPE_REFERENCE;
  static Context = Context;
  static Object = Context.Object;
  static State = StateConstructor;

  context: Context;
  POLYFILL_TIMEOUT = 1000;
  appendCodeNumber_ = 0;
  evalCodeNumber_ = 0;
  getterStep_ = false;
  setterStep_ = false;
  constructor(...args) {
    this.stepFunctions_ = getStepFunctions(Interpreter, this);
    bindClassPrototype(Interpreter, this);
    if (typeof args?.[0] === 'string' || args?.[0]?.type === 'Program') {
      // 默认js-interpreter
      this.context = new Interpreter.Context(args[1], this);
      this.initPolyfill();
      this.initCode(args[0]);
    } else {
      // 对象入参
      this.context = new Interpreter.Context(args[0]?.initFunc, this);
      this.initPolyfill();
      this.initCode(args[0]?.code);
    }
  }
};

/**
 * set polyfill after initGlobal
 * @param {string|!Object} code Raw JavaScript text or AST.
 */
Interpreter.prototype.initPolyfill = function () {
  const ast = this.context.parse_(polyfills.join('\n'), 'polyfills');
  stripLocations_(ast, undefined, undefined);
  const state = new Interpreter.State(ast, this.context.globalScope);
  state.done = false;
  this.setStateStack(state.node ? [state] : []);
  this.run();
};

/**
 * init code to the interpreter.
 * @param {string|!Object} code Raw JavaScript text or AST.
 */
Interpreter.prototype.initCode = function (code) {
  if (!code) return;
  this.paused_ = false;
  this.value = undefined;
  const ast = this.context.parse_(code, 'code');
  this.ast = ast;
  this.context.globalScope.isStrict = isStrict(ast);
  this.populateScope_(ast, this.context.globalScope);
  const state = new Interpreter.State(ast, this.context.globalScope);
  state.done = false;
  // 执行栈
  this.setStateStack(state.node ? [state] : []);
};

/**
 * Add more code to the interpreter.
 * @param {string|!Object} code Raw JavaScript text or AST.
 */
Interpreter.prototype.appendCode = function (code) {
  const state = this.stateStack?.[0];
  if (!state || state.node.type !== 'Program') {
    throw Error('Expecting original AST to start with a Program node');
  }
  const ast = typeof code === 'string' ? this.context.parse_(code, 'appendCode' + (this.appendCodeNumber_++)) : code;
  if (!ast || ast.type !== 'Program') {
    throw Error('Expecting new AST to start with a Program node');
  }
  this.populateScope_(ast, state.scope);
  // Append the new program to the old one.
  Array.prototype.push.apply(state.node.body, ast.body);
  // state.node.body.variableCache_ = null;
  state.done = false;
};

/**
 * Execute one step of the interpreter.
 * @returns {boolean} True if a step was executed, false if no more instructions.
 */
Interpreter.prototype.step = function () {
  var stack = this.stateStack;
  var endTime;
  do {
    var state = stack[stack.length - 1];
    if (this.paused_) {
      // Blocked by an asynchronous function.
      return true;
    } else if (!state || (state.node.type === 'Program' && state.done)) {
      if (!this.context.tasks.length) {
        // Main program complete and no queued tasks.  We're done!
        return false;
      }
      state = this.context.nextTask_((task) => {
        var state = new Interpreter.State(task.node, task.scope);
        if (task.functionRef) {
          // setTimeout/setInterval with a function reference.
          state.doneCallee_ = 2;
          state.funcThis_ = this.context.globalScope.object;
          state.func_ = task.functionRef;
          state.doneArgs_ = true;
          state.arguments_ = task.argsArray;
        }
        return state;
      });
      if (!state) {
        // Main program complete, queued tasks, but nothing to run right now.
        return true;
      }
      // Found a queued task, execute it.
    }
    var node = state.node;
    // Record the interpreter in a global property so calls to toString/valueOf
    // can execute in the proper context.
    var oldInterpreterValue = Interpreter.Object.currentInterpreter_;
    Interpreter.Object.currentInterpreter_ = this;
    try {
      var nextState = this.stepFunctions_[node.type](stack, state);
    } catch (e) {
      // Eat any step errors.  They have been thrown on the stack.
      if (e !== Interpreter.STEP_ERROR) {
        // This is a real error, either in the JS-Interpreter, or an uncaught
        // error in the interpreted code.  Rethrow.
        if (this.value !== e) {
          // Uh oh.  Internal error in the JS-Interpreter.
          this.value = undefined;
        }
        throw e;
      }
    } finally {
      // Restore to previous value (probably null, maybe nested toString calls).
      Interpreter.Object.currentInterpreter_ = oldInterpreterValue;
    }
    if (nextState) {
      stack.push(nextState);
    }
    if (this.getterStep_) {
      // Getter from this step was not handled.
      this.value = undefined;
      throw Error('Getter not supported in this context');
    }
    if (this.setterStep_) {
      // Setter from this step was not handled.
      this.value = undefined;
      throw Error('Setter not supported in this context');
    }
    // This may be polyfill code.  Keep executing until we arrive at user code.
    if (!endTime && !node.end) {
      // Ideally this would be defined at the top of the function, but that
      // wastes time if the step isn't a polyfill.
      endTime = Date.now() + this['POLYFILL_TIMEOUT'];
    }
  } while (!node.end && endTime > Date.now());
  return true;
};

/**
 * Execute the interpreter to program completion.  Vulnerable to infinite loops.
 * @returns {boolean} True if a execution is asynchronously blocked,
 *     false if no more instructions.
 */
Interpreter.prototype.run = function () {
  while (!this.paused_ && this.step()) { }
  return this.paused_;
};

/**
 * Create a call to a getter function.
 * @param {!Interpreter.Object} func Function to execute.
 * @param {!Interpreter.Object|!Array} left
 *     Name of variable or object/propname tuple.
 * @private
 */
Interpreter.prototype.createGetter_ = function (func, left) {
  if (!this.getterStep_) {
    throw Error('Unexpected call to createGetter');
  }
  // Clear the getter flag.
  this.getterStep_ = false;
  // Normally `this` will be specified as the object component (o.x).
  // Sometimes `this` is explicitly provided (o).
  var funcThis = Array.isArray(left) ? left[0] : left;
  var node = this.context.createNode();
  node.type = 'CallExpression';
  var state = new Interpreter.State(node,
    this.stateStack[this.stateStack.length - 1].scope);
  state.doneCallee_ = 2;
  state.funcThis_ = funcThis;
  state.func_ = func;
  state.doneArgs_ = true;
  state.arguments_ = [];
  return state;
};

/**
 * Create a call to a setter function.
 * @param {!Interpreter.Object} func Function to execute.
 * @param {!Interpreter.Object|!Array} left
 *     Name of variable or object/propname tuple.
 * @param {Interpreter.Value} value Value to set.
 * @private
 */
Interpreter.prototype.createSetter_ = function (func, left, value) {
  if (!this.setterStep_) {
    throw Error('Unexpected call to createSetter');
  }
  // Clear the setter flag.
  this.setterStep_ = false;
  // Normally `this` will be specified as the object component (o.x).
  // Sometimes `this` is implicitly the global object (x).
  var funcThis = Array.isArray(left) ? left[0] : this.context.globalObject;
  var node = this.context.createNode();
  node.type = 'CallExpression';
  var state = new Interpreter.State(node,
    this.stateStack[this.stateStack.length - 1].scope);
  state.doneCallee_ = 2;
  state.funcThis_ = funcThis;
  state.func_ = func;
  state.doneArgs_ = true;
  state.arguments_ = [value];
  return state;
};

Interpreter.prototype.getProperty = function (obj, name) {
  if (this.getterStep_) {
    throw Error('Getter not supported in that context');
  }
  return this.context.getProperty(obj, name, () => {
    // 触发getter设置true，防止递归调用getter
    this.getterStep_ = true;
  });
};

Interpreter.prototype.setProperty = function (obj, name, value, opt_descriptor,) {
  if (this.setterStep_) {
    throw Error('Setter not supported in that context');
  }
  return this.context.setProperty(obj, name, value, opt_descriptor, () => {
    // 触发setter设置true，防止递归调用setter
    this.setterStep_ = true;
  });
};

/**
 * Current status of the interpreter.
 * @returns {Interpreter.Status} One of DONE, STEP, TASK, or ASYNC.
 */
Interpreter.prototype.getStatus = function () {
  if (this.paused_) {
    return Interpreter.Status['ASYNC'];
  }
  var stack = this.stateStack;
  var state = stack[stack.length - 1];
  if (state && (state.node.type !== 'Program' || !state.done)) {
    // There's a step ready to execute.
    return Interpreter.Status['STEP'];
  }
  var task = this.context.tasks[0];
  if (task) {
    if (task.time > Date.now()) {
      // There's a pending task, but it's not ready.
      return Interpreter.Status['TASK'];
    }
    // There's a task ready to execute.
    return Interpreter.Status['STEP'];
  }
  return Interpreter.Status['DONE'];
};

Interpreter.prototype.getState = function () {
  var state = this.stateStack && this.stateStack[this.stateStack.length - 1];
  return state;
};

/**
 * Returns the current scope from the stateStack.
 */
Interpreter.prototype.getScope = function () {
  var scope = this.stateStack[this.stateStack.length - 1].scope;
  if (!scope) {
    throw Error('No scope found');
  }
  return scope;
};

/**
 * Retrieves a value from the scope chain.
 * @param {string} name Name of variable.
 * @returns {Interpreter.Value} Any value.
 *   May be flagged as being a getter and thus needing immediate execution
 *   (rather than being the value of the property).
 */
Interpreter.prototype.getValueFromScope = function (name) {
  var scope = this.getScope();
  while (scope && scope !== this.context.globalScope) {
    if (name in scope.object.properties) {
      return scope.object.properties[name];
    }
    scope = scope.parentScope;
  }
  // The root scope is also an object which has inherited properties and
  // could also have getters.
  if (scope === this.context.globalScope && this.context.hasProperty(scope.object, name)) {
    return this.getProperty(scope.object, name);
  }
  // Typeof operator is unique: it can safely look at non-defined variables.
  var prevNode = this.stateStack[this.stateStack.length - 1].node;
  if (prevNode.type === 'UnaryExpression' &&
    prevNode.operator === 'typeof') {
    return undefined;
  }
  this.context.throwException(this.context.REFERENCE_ERROR, name + ' is not defined');
};

/**
 * Sets a value to the current scope.
 * @param {string} name Name of variable.
 * @param {Interpreter.Value} value Value.
 * @returns {!Interpreter.Object|undefined} Returns a setter function if one
 *     needs to be called, otherwise undefined.
 */
Interpreter.prototype.setValueToScope = function (name, value) {
  var scope = this.getScope();
  var strict = scope.strict;
  while (scope && scope !== this.context.globalScope) {
    if (name in scope.object.properties) {
      try {
        scope.object.properties[name] = value;
      } catch (_e) {
        if (strict) {
          this.context.throwException(this.context.TYPE_ERROR,
            "Cannot assign to read only variable '" + name + "'");
        }
      }
      return undefined;
    }
    scope = scope.parentScope;
  }
  // The root scope is also an object which has readonly properties and
  // could also have setters.
  if (scope === this.context.globalScope &&
    (!strict || this.context.hasProperty(scope.object, name))) {
    return this.setProperty(scope.object, name, value);
  }
  this.context.throwException(this.context.REFERENCE_ERROR, name + ' is not defined');
};

/**
 * 递归节点并为作用域填充节点内所有的变量声明或函数声明
 * @param {*} node 节点
 * @param {*} scope 
 * @returns 
 */
Interpreter.prototype.populateScope_ = function (node, scope) {
  if (!node) return;
  const variableCache = traverseAstDeclar(node, (currentCache) => {
    for (const name in currentCache) {
      // 给作用域填充变量或者函数
      const val = currentCache[name] === true ? undefined : this.context.createFunction(currentCache[name], scope);
      this.setProperty(scope.object, name, val, Interpreter.Context.VARIABLE_DESCRIPTOR);
    }
  });
  return variableCache;
};

/**
 * Gets a value from the scope chain or from an object property.
 * @param {!Array} ref Name of variable or object/propname tuple.
 * @returns {Interpreter.Value} Any value.
 *   May be flagged as being a getter and thus needing immediate execution
 *   (rather than being the value of the property).
 */
Interpreter.prototype.getValue = function (ref) {
  if (ref[0] === Interpreter.SCOPE_REFERENCE) {
    // A null/varname variable lookup.
    return this.getValueFromScope(ref[1]);
  } else {
    // An obj/prop components tuple (foo.bar).
    return this.getProperty(ref[0], ref[1]);
  }
};

/**
 * Sets a value to the scope chain or to an object property.
 * @param {!Array} ref Name of variable or object/propname tuple.
 * @param {Interpreter.Value} value Value.
 * @returns {!Interpreter.Object|undefined} Returns a setter function if one
 *     needs to be called, otherwise undefined.
 */
Interpreter.prototype.setValue = function (ref, value) {
  if (ref[0] === Interpreter.SCOPE_REFERENCE) {
    // A null/varname variable lookup.
    return this.setValueToScope(ref[1], value);
  }
  // An obj/prop components tuple (foo.bar).
  return this.setProperty(ref[0], ref[1], value);
};

/**
 * AST to code.  Summarizes the expression at the given node.  Currently
 * not guaranteed to be correct or complete.  Used for error messages.
 * E.g. `escape('hello') + 42` -> 'escape(...) + 42'
 * @param {!Object} node AST node.
 * @returns {string} Code string.
 */
Interpreter.prototype.nodeSummary = function (node) {
  switch (node.type) {
    case 'ArrayExpression':
      return '[...]';
    case 'BinaryExpression':
    case 'LogicalExpression':
      return this.nodeSummary(node.left) + ' ' + node.operator + ' ' +
        this.nodeSummary(node.right);
    case 'CallExpression':
      return this.nodeSummary(node.callee) + '(...)';
    case 'ConditionalExpression':
      return this.nodeSummary(node.test) + ' ? ' +
        this.nodeSummary(node.consequent) + ' : ' +
        this.nodeSummary(node.alternate);
    case 'Identifier':
      return node.name;
    case 'Literal':
      return node.raw;
    case 'MemberExpression':
      var obj = this.nodeSummary(node.object);
      var prop = this.nodeSummary(node.property);
      return node.computed ? (obj + '[' + prop + ']') : (obj + '.' + prop);
    case 'NewExpression':
      return 'new ' + this.nodeSummary(node.callee) + '(...)';
    case 'ObjectExpression':
      return '{...}';
    case 'ThisExpression':
      return 'this';
    case 'UnaryExpression':
      return node.operator + ' ' + this.nodeSummary(node.argument);
    case 'UpdateExpression':
      var argument = this.nodeSummary(node.argument);
      return node.prefix ? node.operator + argument : argument + node.operator;
  }
  return '???';
};

/**
 * In non-strict mode `this` must be an object.
 * Must not be called in strict mode.
 * @param {Interpreter.Value} value Proposed value for `this`.
 * @returns {!Interpreter.Object} Final value for `this`.
 * @private
 */
Interpreter.prototype.boxThis_ = function (value) {
  if (value === undefined || value === null) {
    // `Undefined` and `null` are changed to the global object.
    return this.context.globalScope.object;
  }
  if (!(value instanceof Interpreter.Object)) {
    // Primitives must be boxed.
    var box = new Interpreter.Object(this.context.getPrototype(value));
    box.data = value;
    return box;
  }
  return value;
};

/**
 * Return the state stack.
 * @returns {!Array<!Interpreter.State>} State stack.
 */
Interpreter.prototype.getStateStack = function () {
  return this.stateStack;
};

/**
 * Replace the state stack with a new one.
 * @param {!Array<!Interpreter.State>} newStack New state stack.
 */
Interpreter.prototype.setStateStack = function (newStack) {
  this.stateStack = newStack;
  this.context.stateStack = newStack;
};

///////////////////////////////////////////////////////////////////////////////
// Functions to handle each node type.
///////////////////////////////////////////////////////////////////////////////

// 数组字面量: [1, 2]
Interpreter.prototype['stepArrayExpression'] = function (stack, state) {
  const node = state.node;
  var elements = node.elements;
  var n = state.n_ || 0;
  if (!state.array_) {
    state.array_ = this.context.createArray();
    state.array_.properties.length = elements.length;
  } else {
    this.setProperty(state.array_, n, state.value);
    n++;
  }
  while (n < elements.length) {
    // Skip missing elements - they're not defined, not undefined.
    if (elements[n]) {
      state.n_ = n;
      return new Interpreter.State(elements[n], state.scope);
    }
    n++;
  }
  stack.pop();
  stack[stack.length - 1].value = state.array_;
};

// 赋值表达式
Interpreter.prototype['stepAssignmentExpression'] =
  function (stack, state) {
    const node = state.node;
    if (!state.doneLeft_) {
      state.doneLeft_ = true;
      var nextState = new Interpreter.State(node.left, state.scope);
      nextState.components = true;
      return nextState;
    }
    if (!state.doneRight_) {
      if (!state.leftReference_) {
        state.leftReference_ = state.value;
      }
      if (state.doneGetter_) {
        state.leftValue_ = state.value;
      }
      if (!state.doneGetter_ && node.operator !== '=') {
        var leftValue = this.getValue(state.leftReference_);
        state.leftValue_ = leftValue;
        if (this.getterStep_) {
          // Call the getter function.
          state.doneGetter_ = true;
          var func = /** @type {!Interpreter.Object} */ (leftValue);
          return this.createGetter_(func, state.leftReference_);
        }
      }
      state.doneRight_ = true;
      // When assigning an unnamed function to a variable, the function's name
      // is set to the variable name.  Record the variable name in case the
      // right side is a functionExpression.
      // E.g. foo = function() {};
      if (node.operator === '=' && node.left.type === 'Identifier') {
        state.destinationName = node.left.name;
      }
      return new Interpreter.State(node.right, state.scope);
    }
    if (state.doneSetter_) {
      // Return if setter function.
      // Setter method on property has completed.
      // Ignore its return value, and use the original set value instead.
      stack.pop();
      stack[stack.length - 1].value = state.setterValue_;
      return;
    }
    var value = state.leftValue_;
    var rightValue = state.value;
    switch (node.operator) {
      case '=': value = rightValue; break;
      case '+=': value += rightValue; break;
      case '-=': value -= rightValue; break;
      case '*=': value *= rightValue; break;
      case '/=': value /= rightValue; break;
      case '%=': value %= rightValue; break;
      case '<<=': value <<= rightValue; break;
      case '>>=': value >>= rightValue; break;
      case '>>>=': value >>>= rightValue; break;
      case '&=': value &= rightValue; break;
      case '^=': value ^= rightValue; break;
      case '|=': value |= rightValue; break;
      default:
        throw SyntaxError('Unknown assignment expression: ' + node.operator);
    }
    var setter = this.setValue(state.leftReference_, value);
    if (setter) {
      state.doneSetter_ = true;
      state.setterValue_ = value;
      return this.createSetter_(setter, state.leftReference_, value);
    }
    // Return if no setter function.
    stack.pop();
    stack[stack.length - 1].value = value;
  };

// 二元运算表达式
Interpreter.prototype['stepBinaryExpression'] = function (stack, state) {
  const node = state.node;
  if (!state.doneLeft_) {
    state.doneLeft_ = true;
    return new Interpreter.State(node.left, state.scope);
  }
  if (!state.doneRight_) {
    state.doneRight_ = true;
    state.leftValue_ = state.value;
    return new Interpreter.State(node.right, state.scope);
  }
  stack.pop();
  var leftValue = state.leftValue_;
  var rightValue = state.value;
  var value;
  switch (node.operator) {
    case '==': value = leftValue == rightValue; break;
    case '!=': value = leftValue != rightValue; break;
    case '===': value = leftValue === rightValue; break;
    case '!==': value = leftValue !== rightValue; break;
    case '>': value = leftValue > rightValue; break;
    case '>=': value = leftValue >= rightValue; break;
    case '<': value = leftValue < rightValue; break;
    case '<=': value = leftValue <= rightValue; break;
    case '+': value = leftValue + rightValue; break;
    case '-': value = leftValue - rightValue; break;
    case '*': value = leftValue * rightValue; break;
    case '/': value = leftValue / rightValue; break;
    case '%': value = leftValue % rightValue; break;
    case '&': value = leftValue & rightValue; break;
    case '|': value = leftValue | rightValue; break;
    case '^': value = leftValue ^ rightValue; break;
    case '<<': value = leftValue << rightValue; break;
    case '>>': value = leftValue >> rightValue; break;
    case '>>>': value = leftValue >>> rightValue; break;
    case 'in':
      if (!(rightValue instanceof Interpreter.Object)) {
        this.context.throwException(this.context.TYPE_ERROR,
          "'in' expects an object, not '" + rightValue + "'");
      }
      value = this.context.hasProperty(rightValue, leftValue);
      break;
    case 'instanceof':
      if (!isa(rightValue, this.context.FUNCTION)) {
        this.context.throwException(this.context.TYPE_ERROR,
          "'instanceof' expects an object, not '" + rightValue + "'");
      }
      value = (leftValue instanceof Interpreter.Object) ?
        isa(leftValue, rightValue) : false;
      break;
    default:
      throw SyntaxError('Unknown binary operator: ' + node.operator);
  }
  stack[stack.length - 1].value = value;
};

// 块语句节点: 比如函数体、循环体、条件分支等
Interpreter.prototype['stepBlockStatement'] = function (stack, state) {
  const node = state.node;
  var n = state.n_ || 0;
  var expression = node.body[n];
  if (expression) {
    state.n_ = n + 1;
    return new Interpreter.State(expression, state.scope);
  }
  stack.pop();
};

// break语句
Interpreter.prototype['stepBreakStatement'] = function (stack, state) {
  const node = state.node;
  var label = node.label && node.label.name;
  this.context.unwind(Interpreter.Context.Completion.BREAK, undefined, label);
};

// 调用表达式：对函数或构造函数的调用
Interpreter.prototype['stepCallExpression'] = function (stack, state) {
  const node = state.node;
  // Handles both CallExpression and NewExpression.
  if (!state.doneCallee_) {
    state.doneCallee_ = 1;
    // Components needed to determine value of `this`.
    var nextState = new Interpreter.State(node.callee, state.scope);
    nextState.components = true;
    return nextState;
  }
  if (state.doneCallee_ === 1) {
    // Determine value of the function.
    state.doneCallee_ = 2;
    var func = state.value;
    if (Array.isArray(func)) {
      state.func_ = this.getValue(func);
      if (func[0] === Interpreter.SCOPE_REFERENCE) {
        // (Globally or locally) named function.  Is it named 'eval'?
        state.directEval_ = (func[1] === 'eval');
      } else {
        // Method function, `this` is object (ignored if invoked as `new`).
        state.funcThis_ = func[0];
      }
      func = state.func_;
      if (this.getterStep_) {
        // Call the getter function.
        state.doneCallee_ = 1;
        return this.createGetter_(/** @type {!Interpreter.Object} */(func),
          state.value);
      }
    } else {
      // Already evaluated function: (function(){...})();
      state.func_ = func;
    }
    state.arguments_ = [];
    state.n_ = 0;
  }
  var func = state.func_;
  if (!state.doneArgs_) {
    if (state.n_ !== 0) {
      state.arguments_.push(state.value);
    }
    if (node.arguments[state.n_]) {
      return new Interpreter.State(node.arguments[state.n_++], state.scope);
    }
    // Determine value of `this` in function.
    if (node.type === 'NewExpression') {
      if (!(func instanceof Interpreter.Object) || func.illegalConstructor) {
        // Illegal: new escape();
        this.context.throwException(this.context.TYPE_ERROR,
          this.nodeSummary(node.callee) + ' is not a constructor');
      }
      // Constructor, `this` is new object.
      if (func === this.context.ARRAY) {
        state.funcThis_ = this.context.createArray();
      } else {
        var proto = func.properties['prototype'];
        if (typeof proto !== 'object' || proto === null) {
          // Non-object prototypes default to `Object.prototype`.
          proto = this.context.OBJECT_PROTO;
        }
        state.funcThis_ = new Interpreter.Object(proto);
      }
      state.isConstructor = true;
    }
    state.doneArgs_ = true;
  }
  if (!state.doneExec_) {
    state.doneExec_ = true;
    if (!(func instanceof Interpreter.Object)) {
      this.context.throwException(this.context.TYPE_ERROR,
        this.nodeSummary(node.callee) + ' is not a function');
    }
    var funcNode = func.node;
    if (funcNode) {
      var scope = this.context.createScope(funcNode.body, func.parentScope);
      this.populateScope_(funcNode.body, scope);
      // Build arguments variable.
      var argsList = this.context.createArray();
      for (var i = 0; i < state.arguments_.length; i++) {
        this.setProperty(argsList, i, state.arguments_[i]);
      }
      this.setProperty(scope.object, 'arguments', argsList);
      // Add all arguments (may clobber 'arguments' if a param is named such).
      for (var i = 0; i < funcNode.params.length; i++) {
        var paramName = funcNode.params[i].name;
        var paramValue = state.arguments_.length > i ? state.arguments_[i] :
          undefined;
        this.setProperty(scope.object, paramName, paramValue);
      }
      if (!scope.strict) {
        state.funcThis_ = this.boxThis_(state.funcThis_);
      }
      this.setProperty(scope.object, 'this', state.funcThis_,
        Interpreter.Context.READONLY_DESCRIPTOR);
      state.value = undefined; // Default value if no explicit return.
      return new Interpreter.State(funcNode.body, scope);
    } else if (func.eval) {
      var code = state.arguments_[0];
      if (typeof code !== 'string') {
        // JS does not parse String objects:
        // eval(new String('1 + 1')) -> '1 + 1'
        state.value = code;
      } else {
        try {
          var ast = this.context.parse_(String(code),
            'eval' + (this.evalCodeNumber_++));
        } catch (e) {
          // Acorn threw a SyntaxError.  Rethrow as a trappable error.
          this.context.throwException(this.context.SYNTAX_ERROR, 'Invalid code: ' + e.message);
        }
        var evalNode = this.context.createNode();
        evalNode.type = 'EvalProgram_';
        evalNode.body = ast.body;
        stripLocations_(evalNode, node.start, node.end);
        // Create new scope and update it with definitions in eval().
        var scope = state.directEval_ ? state.scope : this.context.globalScope;
        if (scope.strict) {
          // Strict mode get its own scope in eval.
          scope = this.context.createScope(ast, scope);
        }
        this.populateScope_(ast, scope);
        this.value = undefined; // Default value if no code.
        return new Interpreter.State(evalNode, scope);
      }
    } else if (func.nativeFunc) {
      if (!state.scope.strict) {
        state.funcThis_ = this.boxThis_(state.funcThis_);
      }
      state.value = func.nativeFunc.apply(state.funcThis_, state.arguments_);
    } else if (func.asyncFunc) {
      var thisInterpreter = this;
      var callback = function (value) {
        state.value = value;
        thisInterpreter.paused_ = false;
      };
      // Force the argument lengths to match, then append the callback.
      var argLength = func.asyncFunc.length - 1;
      var argsWithCallback = state.arguments_.concat(
        new Array(argLength)).slice(0, argLength);
      argsWithCallback.push(callback);
      this.paused_ = true;
      if (!state.scope.strict) {
        state.funcThis_ = this.boxThis_(state.funcThis_);
      }
      func.asyncFunc.apply(state.funcThis_, argsWithCallback);
      return;
    } else {
      /* A child of a function is a function but is not callable.  For example:
      var F = function() {};
      F.prototype = escape;
      var f = new F();
      f();
      */
      this.context.throwException(this.context.TYPE_ERROR,
        this.nodeSummary(node.callee) + ' is not callable');
    }
  } else {
    // Execution complete.  Put the return value on the stack.
    stack.pop();
    if (state.isConstructor && typeof state.value !== 'object') {
      // Normal case for a constructor is to use the `this` value.
      stack[stack.length - 1].value = state.funcThis_;
    } else {
      // Non-constructors or constructions explicitly returning objects use
      // the return value.
      stack[stack.length - 1].value = state.value;
    }
  }
};

// new表达式
Interpreter.prototype['stepNewExpression'] =
  Interpreter.prototype['stepCallExpression'];

// 三元运算符
Interpreter.prototype['stepConditionalExpression'] =
  function (stack, state) {
    const node = state.node;
    // Handles both ConditionalExpression and IfStatement.
    var mode = state.mode_ || 0;
    if (mode === 0) {
      state.mode_ = 1;
      return new Interpreter.State(node.test, state.scope);
    }
    if (mode === 1) {
      state.mode_ = 2;
      var value = Boolean(state.value);
      if (value && node.consequent) {
        // Execute `if` block.
        return new Interpreter.State(node.consequent, state.scope);
      } else if (!value && node.alternate) {
        // Execute `else` block.
        return new Interpreter.State(node.alternate, state.scope);
      }
      // eval('1;if(false){2}') -> undefined
      this.value = undefined;
    }
    stack.pop();
    if (node.type === 'ConditionalExpression') {
      stack[stack.length - 1].value = state.value;
    }
  };

// if...else 条件语句
Interpreter.prototype['stepIfStatement'] =
  Interpreter.prototype['stepConditionalExpression'];

// continue语句
Interpreter.prototype['stepContinueStatement'] = function (stack, state) {
  const node = state.node;
  var label = node.label && node.label.name;
  this.context.unwind(Interpreter.Context.Completion.CONTINUE, undefined, label);
};

// Debugger
Interpreter.prototype['stepDebuggerStatement'] = function (stack, state) {
  // Do nothing.  May be overridden by developers.
  stack.pop();
};

// do...while 循环语句
Interpreter.prototype['stepDoWhileStatement'] = function (stack, state) {
  const node = state.node;
  // Handles both DoWhileStatement and WhileStatement.
  if (node.type === 'DoWhileStatement' && state.test_ === undefined) {
    // First iteration of do/while executes without checking test.
    state.value = true;
    state.test_ = true;
  }
  if (!state.test_) {
    state.test_ = true;
    return new Interpreter.State(node.test, state.scope);
  }
  if (!state.value) { // Done, exit loop.
    stack.pop();
  } else if (node.body) { // Execute the body.
    state.test_ = false;
    state.isLoop = true;
    return new Interpreter.State(node.body, state.scope);
  }
};

// while 循环语句
Interpreter.prototype['stepWhileStatement'] =
  Interpreter.prototype['stepDoWhileStatement'];

// 空语句
Interpreter.prototype['stepEmptyStatement'] = function (stack, state) {
  stack.pop();
};

// eval语句
Interpreter.prototype['stepEvalProgram_'] = function (stack, state) {
  const node = state.node;
  var n = state.n_ || 0;
  var expression = node.body[n];
  if (expression) {
    state.n_ = n + 1;
    return new Interpreter.State(expression, state.scope);
  }
  stack.pop();
  stack[stack.length - 1].value = this.value;
};

// 表达式语句节点：独立作为一条语句的表达式
Interpreter.prototype['stepExpressionStatement'] = function (stack, state) {
  const node = state.node;
  if (!state.done_) {
    this.value = undefined;
    state.done_ = true;
    return new Interpreter.State(node.expression, state.scope);
  }
  stack.pop();
  this.value = state.node.directive ? undefined : state.value;
};

// for...in 循环语句
Interpreter.prototype['stepForInStatement'] = function (stack, state) {
  const node = state.node;
  // First, initialize a variable if exists.  Only do so once, ever.
  if (!state.doneInit_) {
    state.doneInit_ = true;
    if (node.left.declarations &&
      node.left.declarations[0].init) {
      if (state.scope.strict) {
        this.context.throwException(this.context.SYNTAX_ERROR,
          'for-in loop variable declaration may not have an initializer');
      }
      // Variable initialization: for (var x = 4 in y)
      return new Interpreter.State(node.left, state.scope);
    }
  }
  // Second, look up the object.  Only do so once, ever.
  if (!state.doneObject_) {
    state.doneObject_ = true;
    if (!state.variable_) {
      state.variable_ = state.value;
    }
    return new Interpreter.State(node.right, state.scope);
  }
  if (!state.isLoop) {
    // First iteration.
    state.isLoop = true;
    state.object_ = state.value;
    state.visited_ = Object.create(null);
  }
  // Third, find the property name for this iteration.
  if (state.name_ === undefined) {
    gotPropName: while (true) {
      if (state.object_ instanceof Interpreter.Object) {
        if (!state.props_) {
          state.props_ = Object.getOwnPropertyNames(state.object_.properties);
        }
        while (true) {
          var prop = state.props_.shift();
          if (prop === undefined) {
            break; // Reached end of this object's properties.
          }
          if (!Object.prototype.hasOwnProperty.call(state.object_.properties,
            prop)) {
            continue; // Property has been deleted in the loop.
          }
          if (state.visited_[prop]) {
            continue; // Already seen this property on a child.
          }
          state.visited_[prop] = true;
          if (!Object.prototype.propertyIsEnumerable.call(
            state.object_.properties, prop)) {
            continue; // Skip non-enumerable property.
          }
          state.name_ = prop;
          break gotPropName;
        }
      } else if (state.object_ !== null && state.object_ !== undefined) {
        // Primitive value (other than null or undefined).
        if (!state.props_) {
          state.props_ = Object.getOwnPropertyNames(state.object_);
        }
        while (true) {
          var prop = state.props_.shift();
          if (prop === undefined) {
            break; // Reached end of this value's properties.
          }
          state.visited_[prop] = true;
          if (!Object.prototype.propertyIsEnumerable.call(
            state.object_, prop)) {
            continue; // Skip non-enumerable property.
          }
          state.name_ = prop;
          break gotPropName;
        }
      }
      state.object_ = this.context.getPrototype(state.object_);
      state.props_ = null;
      if (state.object_ === null) {
        // Done, exit loop.
        stack.pop();
        return;
      }
    }
  }
  // Fourth, find the variable
  if (!state.doneVariable_) {
    state.doneVariable_ = true;
    var left = node.left;
    if (left.type === 'VariableDeclaration') {
      // Inline variable declaration: for (var x in y)
      state.variable_ =
        [Interpreter.SCOPE_REFERENCE, left.declarations[0].id.name];
    } else {
      // Arbitrary left side: for (foo().bar in y)
      state.variable_ = null;
      var nextState = new Interpreter.State(left, state.scope);
      nextState.components = true;
      return nextState;
    }
  }
  if (!state.variable_) {
    state.variable_ = state.value;
  }
  // Fifth, set the variable.
  if (!state.doneSetter_) {
    state.doneSetter_ = true;
    var value = state.name_;
    var setter = this.setValue(state.variable_, value);
    if (setter) {
      return this.createSetter_(setter, state.variable_, value);
    }
  }
  // Next step will be step three.
  state.name_ = undefined;
  // Reevaluate the variable since it could be a setter on the global object.
  state.doneVariable_ = false;
  state.doneSetter_ = false;
  // Sixth and finally, execute the body if there was one.
  if (node.body) {
    return new Interpreter.State(node.body, state.scope);
  }
};

// for循环语句
Interpreter.prototype['stepForStatement'] = function (stack, state) {
  const node = state.node;
  switch (state.mode_) {
    default:
      state.mode_ = 1;
      if (node.init) {
        return new Interpreter.State(node.init, state.scope);
      }
      break;
    case 1:
      state.mode_ = 2;
      if (node.test) {
        return new Interpreter.State(node.test, state.scope);
      }
      break;
    case 2:
      state.mode_ = 3;
      if (node.test && !state.value) {
        // Done, exit loop.
        stack.pop();
      } else { // Execute the body.
        state.isLoop = true;
        return new Interpreter.State(node.body, state.scope);
      }
      break;
    case 3:
      state.mode_ = 1;
      if (node.update) {
        return new Interpreter.State(node.update, state.scope);
      }
      break;
  }
};

// 函数声明
Interpreter.prototype['stepFunctionDeclaration'] =
  function (stack, state) {
    // This was found and handled when the scope was populated.
    stack.pop();
  };

// 函数表达式 E.g. var x = function foo(){};
Interpreter.prototype['stepFunctionExpression'] = function (stack, state) {
  const node = state.node;
  stack.pop();
  state = stack[stack.length - 1];
  var parentScope = state.scope;
  if (node.id) {
    // Create a tiny scope to store the function name.
    // E.g. var x = function foo(){};
    parentScope = this.context.createSpecialScope(parentScope);
  }
  state.value = this.context.createFunction(node, parentScope, state.destinationName);
  if (node.id) {
    // Record the function name, read-only.
    this.setProperty(parentScope.object, node.id.name, state.value,
      Interpreter.Context.READONLY_DESCRIPTOR);
  }
};

// 标识符节点：命名变量、函数、属性以及其他实体的符号名
Interpreter.prototype['stepIdentifier'] = function (stack, state) {
  const node = state.node;
  stack.pop();
  if (state.components) {
    stack[stack.length - 1].value = [Interpreter.SCOPE_REFERENCE, node.name];
    return;
  }
  var value = this.getValueFromScope(node.name);
  // An identifier could be a getter if it's a property on the global object.
  if (this.getterStep_) {
    // Call the getter function.
    var func = /** @type {!Interpreter.Object} */ (value);
    return this.createGetter_(func, this.context.globalScope.object);
  }
  stack[stack.length - 1].value = value;
};

// 标签语句
Interpreter.prototype['stepLabeledStatement'] = function (stack, state) {
  const node = state.node;
  // No need to hit this node again on the way back up the stack.
  stack.pop();
  // Note that a statement might have multiple labels.
  var labels = state.labels || [];
  labels.push(node.label.name);
  var nextState = new Interpreter.State(node.body, state.scope);
  nextState.labels = labels;
  return nextState;
};

// 不可变的数据值
Interpreter.prototype['stepLiteral'] = function (stack, state) {
  const node = state.node;
  stack.pop();
  var value = node.value;
  if (value instanceof RegExp) {
    var pseudoRegexp = new Interpreter.Object(this.context.REGEXP_PROTO);
    this.context.populateRegExp(pseudoRegexp, value);
    value = pseudoRegexp;
  }
  stack[stack.length - 1].value = value;
};

// 逻辑运算符表达式 a || b 或 a && b 或 a ?? b
Interpreter.prototype['stepLogicalExpression'] = function (stack, state) {
  const node = state.node;
  if (node.operator !== '&&' && node.operator !== '||') {
    throw SyntaxError('Unknown logical operator: ' + node.operator);
  }
  if (!state.doneLeft_) {
    state.doneLeft_ = true;
    return new Interpreter.State(node.left, state.scope);
  }
  if (!state.doneRight_) {
    if ((node.operator === '&&' && !state.value) ||
      (node.operator === '||' && state.value)) {
      // Shortcut evaluation.
      stack.pop();
      stack[stack.length - 1].value = state.value;
    } else {
      state.doneRight_ = true;
      return new Interpreter.State(node.right, state.scope);
    }
  } else {
    stack.pop();
    stack[stack.length - 1].value = state.value;
  }
};

// 成员访问表达式
Interpreter.prototype['stepMemberExpression'] = function (stack, state) {
  const node = state.node;
  if (!state.doneObject_) {
    state.doneObject_ = true;
    return new Interpreter.State(node.object, state.scope);
  }
  var propName;
  if (!node.computed) {
    state.object_ = state.value;
    // obj.foo -- Just access `foo` directly.
    propName = node.property.name;
  } else if (!state.doneProperty_) {
    state.object_ = state.value;
    // obj[foo] -- Compute value of `foo`.
    state.doneProperty_ = true;
    return new Interpreter.State(node.property, state.scope);
  } else {
    propName = state.value;
  }
  stack.pop();
  if (state.components) {
    stack[stack.length - 1].value = [state.object_, propName];
  } else {
    var value = this.getProperty(state.object_, propName);
    if (this.getterStep_) {
      // Call the getter function.
      var func = /** @type {!Interpreter.Object} */ (value);
      return this.createGetter_(func, state.object_);
    }
    stack[stack.length - 1].value = value;
  }
};

// 对象字面量
Interpreter.prototype['stepObjectExpression'] = function (stack, state) {
  const node = state.node;
  var n = state.n_ || 0;
  var property = node.properties[n];
  if (!state.object_) {
    // First execution.
    state.object_ = new Interpreter.Object(this.context.OBJECT_PROTO);
    state.properties_ = Object.create(null);
  } else {
    // Set the property computed in the previous execution.
    var propName = state.destinationName;
    if (!state.properties_[propName]) {
      // Create temp object to collect value, getter, and/or setter.
      state.properties_[propName] = {};
    }
    state.properties_[propName][property.kind] = state.value;
    state.n_ = ++n;
    property = node.properties[n];
  }
  if (property) {
    // Determine property name.
    var key = property.key;
    if (key.type === 'Identifier') {
      var propName = key.name;
    } else if (key.type === 'Literal') {
      var propName = key.value;
    } else {
      throw SyntaxError('Unknown object structure: ' + key.type);
    }
    // When assigning an unnamed function to a property, the function's name
    // is set to the property name.  Record the property name in case the
    // value is a functionExpression.
    // E.g. {foo: function() {}}
    state.destinationName = propName;
    return new Interpreter.State(property.value, state.scope);
  }
  for (var key in state.properties_) {
    var kinds = state.properties_[key];
    if ('get' in kinds || 'set' in kinds) {
      // Set a property with a getter or setter.
      var descriptor = {
        'configurable': true,
        'enumerable': true,
        'get': kinds['get'],
        'set': kinds['set'],
      };
      this.setProperty(state.object_, key, Interpreter.Context.VALUE_IN_DESCRIPTOR,
        descriptor);
    } else {
      // Set a normal property with a value.
      this.setProperty(state.object_, key, kinds['init']);
    }
  }
  stack.pop();
  stack[stack.length - 1].value = state.object_;
};

// 根节点
Interpreter.prototype['stepProgram'] = function (stack, state) {
  const node = state.node;
  var expression = node.body.shift();
  if (expression) {
    state.done = false;
    return new Interpreter.State(expression, state.scope);
  }
  state.done = true;
  // Don't pop the stateStack.
  // Leave the root scope on the tree in case the program is appended to.
};

// return语句
Interpreter.prototype['stepReturnStatement'] = function (stack, state) {
  const node = state.node;
  if (node.argument && !state.done_) {
    state.done_ = true;
    return new Interpreter.State(node.argument, state.scope);
  }
  this.context.unwind(Interpreter.Context.Completion.RETURN, state.value, undefined);
};

// 逗号操作符表达式
Interpreter.prototype['stepSequenceExpression'] = function (stack, state) {
  const node = state.node;
  var n = state.n_ || 0;
  var expression = node.expressions[n];
  if (expression) {
    state.n_ = n + 1;
    return new Interpreter.State(expression, state.scope);
  }
  stack.pop();
  stack[stack.length - 1].value = state.value;
};

// Switch语句
Interpreter.prototype['stepSwitchStatement'] = function (stack, state) {
  const node = state.node;
  if (!state.test_) {
    state.test_ = 1;
    return new Interpreter.State(node.discriminant, state.scope);
  }
  if (state.test_ === 1) {
    state.test_ = 2;
    // Preserve switch value between case tests.
    state.switchValue_ = state.value;
    state.defaultCase_ = -1;
  }

  while (true) {
    var index = state.index_ || 0;
    var switchCase = node.cases[index];
    if (!state.matched_ && switchCase && !switchCase.test) {
      // Test on the default case is null.
      // Bypass (but store) the default case, and get back to it later.
      state.defaultCase_ = index;
      state.index_ = index + 1;
      continue;
    }
    if (!switchCase && !state.matched_ && state.defaultCase_ !== -1) {
      // Ran through all cases, no match.  Jump to the default.
      state.matched_ = true;
      state.index_ = state.defaultCase_;
      continue;
    }
    if (switchCase) {
      if (!state.matched_ && !state.tested_ && switchCase.test) {
        state.tested_ = true;
        return new Interpreter.State(switchCase.test, state.scope);
      }
      if (state.matched_ || state.value === state.switchValue_) {
        state.matched_ = true;
        var n = state.n_ || 0;
        if (switchCase.consequent[n]) {
          state.isSwitch = true;
          state.n_ = n + 1;
          return new Interpreter.State(switchCase.consequent[n], state.scope);
        }
      }
      // Move on to next case.
      state.tested_ = false;
      state.n_ = 0;
      state.index_ = index + 1;
    } else {
      stack.pop();
      return;
    }
  }
};

// this关键字
Interpreter.prototype['stepThisExpression'] = function (stack, state) {
  stack.pop();
  stack[stack.length - 1].value = this.getValueFromScope('this');
};

// throw 语句
Interpreter.prototype['stepThrowStatement'] = function (stack, state) {
  const node = state.node;
  if (!state.done_) {
    state.done_ = true;
    return new Interpreter.State(node.argument, state.scope);
  } else {
    this.context.throwException(state.value);
  }
};

// try...catch...finally 语句
Interpreter.prototype['stepTryStatement'] = function (stack, state) {
  const node = state.node;
  // This step also handles all CatchClause nodes, since these nodes can
  // only appear inside the `handler` property of a TryStatement node.
  if (!state.doneBlock_) {
    state.doneBlock_ = true;
    return new Interpreter.State(node.block, state.scope);
  }
  if (state.cv && state.cv.type === Interpreter.Context.Completion.THROW &&
    !state.doneHandler_ && node.handler) {
    state.doneHandler_ = true;
    // Create an new scope and add the error variable.
    var scope = this.context.createSpecialScope(state.scope);
    this.setProperty(scope.object, node.handler.param.name, state.cv.value);
    state.cv = undefined; // This error has been handled, don't rethrow.
    // Execute catch clause.
    return new Interpreter.State(node.handler.body, scope);
  }
  if (!state.doneFinalizer_ && node.finalizer) {
    state.doneFinalizer_ = true;
    return new Interpreter.State(node.finalizer, state.scope);
  }
  stack.pop();
  if (state.cv) {
    // There was no catch handler, or the catch/finally threw an error.
    // Throw the error up to a higher try.
    this.context.unwind(state.cv.type, state.cv.value, state.cv.label);
  }
};

// 一元运算表达式
Interpreter.prototype['stepUnaryExpression'] = function (stack, state) {
  const node = state.node;
  if (!state.done_) {
    state.done_ = true;
    var nextState = new Interpreter.State(node.argument, state.scope);
    nextState.components = node.operator === 'delete';
    return nextState;
  }
  stack.pop();
  var value = state.value;
  switch (node.operator) {
    case '-':
      value = -value;
      break;
    case '+':
      value = +value;
      break;
    case '!':
      value = !value;
      break;
    case '~':
      value = ~value;
      break;
    case 'delete':
      var result = true;
      // If value is not an array, then it is a primitive, or some other value.
      // If so, skip the delete and return true.
      if (Array.isArray(value)) {
        var obj = value[0];
        if (obj === Interpreter.SCOPE_REFERENCE) {
          // `delete foo;` is the same as `delete window.foo;`.
          obj = state.scope;
        }
        var name = String(value[1]);
        try {
          delete obj.properties[name];
        } catch (_e) {
          if (state.scope.strict) {
            this.context.throwException(this.context.TYPE_ERROR, "Cannot delete property '" +
              name + "' of '" + obj + "'");
          } else {
            result = false;
          }
        }
      }
      value = result;
      break;
    case 'typeof':
      value = (value && value.class === 'Function') ? 'function' : typeof value;
      break;
    case 'void':
      value = undefined;
      break;
    default:
      throw SyntaxError('Unknown unary operator: ' + node.operator);
  }
  stack[stack.length - 1].value = value;
};

// 前置/后置更新表达式: --a 或 ++a
Interpreter.prototype['stepUpdateExpression'] = function (stack, state) {
  const node = state.node;
  if (!state.doneLeft_) {
    state.doneLeft_ = true;
    var nextState = new Interpreter.State(node.argument, state.scope);
    nextState.components = true;
    return nextState;
  }
  if (!state.leftSide_) {
    state.leftSide_ = state.value;
  }
  if (state.doneGetter_) {
    state.leftValue_ = state.value;
  }
  if (!state.doneGetter_) {
    var leftValue = this.getValue(state.leftSide_);
    state.leftValue_ = leftValue;
    if (this.getterStep_) {
      // Call the getter function.
      state.doneGetter_ = true;
      var func = /** @type {!Interpreter.Object} */ (leftValue);
      return this.createGetter_(func, state.leftSide_);
    }
  }
  if (state.doneSetter_) {
    // Return if setter function.
    // Setter method on property has completed.
    // Ignore its return value, and use the original set value instead.
    stack.pop();
    stack[stack.length - 1].value = state.setterValue_;
    return;
  }
  var leftValue = Number(state.leftValue_);
  var changeValue;
  if (node.operator === '++') {
    changeValue = leftValue + 1;
  } else if (node.operator === '--') {
    changeValue = leftValue - 1;
  } else {
    throw SyntaxError('Unknown update expression: ' + node.operator);
  }
  var returnValue = node.prefix ? changeValue : leftValue;
  var setter = this.setValue(state.leftSide_, changeValue);
  if (setter) {
    state.doneSetter_ = true;
    state.setterValue_ = returnValue;
    return this.createSetter_(setter, state.leftSide_, changeValue);
  }
  // Return if no setter function.
  stack.pop();
  stack[stack.length - 1].value = returnValue;
};

// 变量声明
Interpreter.prototype['stepVariableDeclaration'] = function (stack, state) {
  const node = state.node;
  // This step also handles all VariableDeclarator nodes, since these nodes can
  // only appear inside the `declarations` array of a VariableDeclaration node.
  var declarations = node.declarations;
  var n = state.n_ || 0;
  var declarationNode = declarations[n];
  if (state.init_ && declarationNode) {
    // This setValue call never needs to deal with calling a setter function.
    // Note that this is setting the init value, not defining the variable.
    // Variable definition is done when scope is populated.
    this.setValueToScope(declarationNode.id.name, state.value);
    state.init_ = false;
    declarationNode = declarations[++n];
  }
  while (declarationNode) {
    // Skip any declarations that are not initialized.  They have already
    // been defined as undefined in populateScope_.
    if (declarationNode.init) {
      state.n_ = n;
      state.init_ = true;
      // When assigning an unnamed function to a variable, the function's name
      // is set to the variable name.  Record the variable name in case the
      // right side is a functionExpression.
      // E.g. var foo = function() {};
      state.destinationName = declarationNode.id.name;
      return new Interpreter.State(declarationNode.init, state.scope);
    }
    declarationNode = declarations[++n];
  }
  stack.pop();
};

// with语句
Interpreter.prototype['stepWithStatement'] = function (stack, state) {
  const node = state.node;
  if (!state.doneObject_) {
    state.doneObject_ = true;
    return new Interpreter.State(node.object, state.scope);
  }
  stack.pop();
  var scope = this.context.createSpecialScope(state.scope, state.value);
  return new Interpreter.State(node.body, scope);
};

export default Interpreter;
