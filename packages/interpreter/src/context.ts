import * as acorn from 'acorn';
import {
  legalArrayLength,
  legalArrayIndex,
} from './utils/array';
import {
  assignProperty,
  isa,
  bindClassPrototype,
  placeholderGet_,
  placeholderSet_,
} from './utils/object';
import {
  cloneASTNode,
  stripLocations_,
  traverseAstDeclar,
  getStepFunctions,
  isStrict,
  parse_,
  createNode,
} from './utils/node';
import { Constants } from './constants';
import { AcornProgram, InterpreterOtionFun } from './typings';
import ObjectConstructor from './constructor/Object';
import ScopeConstructor from './constructor/Scope';
import StateConstructor from './constructor/State';
import TaskConstructor from './constructor/Task';
import { throwException } from './utils/error';
import initFunction from './JSValue/Function';
import { createScope } from './utils/scope';
import GlobalObject from './JSValue/globalObject';

globalThis.acorn = acorn;
class Context {
  static Completion = Constants.Completion;
  static PARSE_OPTIONS = Constants.PARSE_OPTIONS;
  static READONLY_DESCRIPTOR = Constants.READONLY_DESCRIPTOR;
  static NONENUMERABLE_DESCRIPTOR = Constants.NONENUMERABLE_DESCRIPTOR;
  static READONLY_NONENUMERABLE_DESCRIPTOR = Constants.READONLY_NONENUMERABLE_DESCRIPTOR;
  static NONCONFIGURABLE_READONLY_NONENUMERABLE_DESCRIPTOR = Constants.NONCONFIGURABLE_READONLY_NONENUMERABLE_DESCRIPTOR;
  static VALUE_IN_DESCRIPTOR = Constants.VALUE_IN_DESCRIPTOR;
  static REGEXP_TIMEOUT = Constants.REGEXP_TIMEOUT;
  static vm = Constants.vm;
  static nativeGlobal = Object.assign((typeof globalThis === 'undefined') ? this || window : globalThis, { acorn });
  static WORKER_CODE = Constants.WORKER_CODE;
  static Object = ObjectConstructor;
  static Scope = ScopeConstructor;
  static Task = TaskConstructor;
  static State = StateConstructor;

  globalScope?: ScopeConstructor<GlobalObject>;
  OBJECT_PROTO?: ObjectConstructor;
  REGEXP_MODE = 2;
  REGEXP_THREAD_TIMEOUT = 1000;
  initFunc: Function;
  FUNCTION?: ObjectConstructor;
  stateStack: StateConstructor[]; // 调用栈
  tasks: TaskConstructor[]; // 任务队列
  taskCodeNumber_ = 0;
  constructor(initFunc) {
    this.initFunc = initFunc;
    this.stateStack = [];
    this.tasks = [];
    bindClassPrototype(Context, this);
    this.initGlobal();
  }

  setStateStack(newStack) {
    this.stateStack = newStack;
  }

  getStateStack() {
    return this.stateStack;
  }

  getState() {
    const state = this.stateStack && this.stateStack[this.stateStack.length - 1];
    return state;
  }

  getScope() {
    const state = this.getState();
    const scope = state?.scope;
    // if (!scope) {
    //   throw Error('No scope found');
    // }
    return scope;
  }

  // 添加任务
  scheduleTask_(task, delay) {
    task.time = Date.now() + delay;
    // For optimum efficiency we could do a binary search and inject the task
    // at the right spot.  But 'push' & 'sort' is just two lines of code.
    this.tasks.push(task);
    this.tasks.sort(function (a, b) { return a.time - b.time; });
  }

  // 删除任务
  deleteTask_(pid) {
    for (let i = 0; i < this.tasks.length; i++) {
      if (this.tasks[i].pid == pid) {
        this.tasks.splice(i, 1);
        break;
      }
    }
  };

  // 下一个任务
  nextTask_() {
    const globalScope = this.globalScope;
    const task = this.tasks[0];
    if (!task || task.time > Date.now()) {
      return null;
    }
    // Found a task that's due to run.
    this.tasks.shift();
    if (task.interval >= 0) {
      this.scheduleTask_(task, task.interval);
    }
    const state = new Context.State(task.node, task.scope);
    if (task.functionRef) {
      // setTimeout/setInterval with a function reference.
      state.doneCallee_ = 2;
      state.funcThis_ = globalScope?.object;
      state.func_ = task.functionRef;
      state.doneArgs_ = true;
      state.arguments_ = task.argsArray;
    }
    return state;
  }

  // 创建任务
  createTask_(isInterval: boolean, args: IArguments) {
    const globalScope = this.globalScope;
    const parentState = this.getState();
    const argsArray = Array.from(args);
    const exec = argsArray.shift();
    const delay = Math.max(Number(argsArray.shift() || 0), 0);
    const node = createNode(Context.PARSE_OPTIONS);
    let scope, functionRef, ast;

    if ((exec instanceof Context.Object) && exec.class === 'Function') {
      // setTimeout/setInterval with a function reference.
      functionRef = exec;
      node.type = 'CallExpression';
      scope = parentState?.scope;
    } else {
      // setTimeout/setInterval with code string.
      try {
        ast = parse_(String(exec), 'taskCode' + (this.taskCodeNumber_++), Context.PARSE_OPTIONS);
      } catch (e) {
        // Acorn threw a SyntaxError.  Rethrow as a trappable error.
        throwException(Constants.ERROR_KEYS.SyntaxError, 'Invalid code: ' + e?.message);
      }
      node.type = 'EvalProgram_';
      node.body = ast.body;
      // Change highlighting to encompass the string.
      const execNode = parentState?.node?.arguments[0];
      const execStart = execNode ? execNode.start : undefined;
      const execEnd = execNode ? execNode.end : undefined;
      stripLocations_(node, execStart, execEnd);
      scope = globalScope;
      argsArray.length = 0;
    }

    const task = new Context.Task(functionRef, argsArray, scope, node, isInterval ? delay : -1);
    this.scheduleTask_(task, delay);
    return task.pid;
  };

  initGlobal() {
    this.globalScope = createScope();
    const globalObject = new GlobalObject(null);
    this.globalScope.object = globalObject;
    this.OBJECT_PROTO = globalObject.proto;
    // this.OBJECT_PROTO = new Context.Object(null);
    // globalObject.proto = this.OBJECT_PROTO;
    const thisInterpreter = this;
    // Initialize uneditable global properties.
    globalObject.setProperty('NaN', NaN, Context.NONCONFIGURABLE_READONLY_NONENUMERABLE_DESCRIPTOR);
    globalObject.setProperty('Infinity', Infinity, Context.NONCONFIGURABLE_READONLY_NONENUMERABLE_DESCRIPTOR);
    globalObject.setProperty('undefined', undefined, Context.NONCONFIGURABLE_READONLY_NONENUMERABLE_DESCRIPTOR);
    globalObject.setProperty('window', globalObject, Context.READONLY_DESCRIPTOR);
    globalObject.setProperty('this', globalObject, Context.NONCONFIGURABLE_READONLY_NONENUMERABLE_DESCRIPTOR);
    globalObject.setProperty('self', globalObject, undefined);

    // Initialize global objects.
    this.FUNCTION = initFunction(globalObject, this);
    this.initObject(globalObject);
    this.initArray(globalObject);
    this.initString(globalObject);
    this.initBoolean(globalObject);
    this.initNumber(globalObject);
    this.initDate(globalObject);
    this.initRegExp(globalObject);
    this.initError(globalObject);
    this.initMath(globalObject);
    this.initJSON(globalObject);

    // Initialize global functions.
    // eval函数
    const func = globalObject.createNativeFunction(
      function (_x) { throw EvalError("Can't happen"); }, false);
    func.eval = true;
    globalObject.setProperty('eval', func, Context.NONENUMERABLE_DESCRIPTOR);

    // 转换判断
    [
      ['parseInt', parseInt],
      ['parseFloat', parseFloat],
      ['isNaN', isNaN],
      ['isFinite', isFinite]
    ].forEach(([name, val]) => {
      globalObject.setProperty(name, globalObject.createNativeFunction(val, false), Context.NONENUMERABLE_DESCRIPTOR);
    });

    // 编码转码
    [
      ['escape', escape,], ['unescape', unescape,],
      ['decodeURI', decodeURI,], ['decodeURIComponent', decodeURIComponent,],
      ['encodeURI', encodeURI,], ['encodeURIComponent', encodeURIComponent,]
    ].forEach(([name, func]) => {
      globalObject.setProperty(name,
        globalObject.createNativeFunction((function (nativeFunc: Function) {
          return function (str) {
            try {
              return nativeFunc(str);
            } catch (e) {
              // decodeURI('%xy') will throw an error.  Catch and rethrow.
              throwException(Constants.ERROR_KEYS.URIError, e?.message);
            }
          };
        })(func as Function), false),
        Context.NONENUMERABLE_DESCRIPTOR);
    });

    // 异步函数
    globalObject.setProperty('setTimeout',
      globalObject.createNativeFunction(function setTimeout(var_args) {
        return thisInterpreter?.createTask_(false, arguments);
      }, false),
      Context.NONENUMERABLE_DESCRIPTOR);
    globalObject.setProperty('setInterval',
      globalObject.createNativeFunction(function setInterval(var_args) {
        return thisInterpreter?.createTask_(true, arguments);
      }, false),
      Context.NONENUMERABLE_DESCRIPTOR);
    globalObject.setProperty('clearTimeout',
      globalObject.createNativeFunction(function clearTimeout(pid) {
        thisInterpreter?.deleteTask_(pid);
      }, false),
      Context.NONENUMERABLE_DESCRIPTOR);
    globalObject.setProperty('clearInterval',
      globalObject.createNativeFunction(function clearInterval(pid) {
        thisInterpreter?.deleteTask_(pid);
      }, false),
      Context.NONENUMERABLE_DESCRIPTOR);
    if (this.initFunc) {
      this.initFunc(this, this.globalScope.object);
    }
  };
};

/**
 * Initialize the Object class.
 * @param {!Context.Object} globalObject Global object.
 */
Context.prototype.initObject = function (globalObject) {
  var thisInterpreter = this;
  var wrapper;
  // Object constructor.
  wrapper = function Object(value) {
    if (value === undefined || value === null) {
      // Create a new object.
      if (thisInterpreter.calledWithNew()) {
        // Called as `new Object()`.
        return this;
      } else {
        // Called as `Object()`.
        return new Context.Object(thisInterpreter.OBJECT_PROTO);
      }
    }
    if (!(value instanceof Context.Object)) {
      // Wrap the value as an object.
      var box = new Context.Object(
        thisInterpreter.getPrototype(value));
      box.data = value;
      return box;
    }
    // Return the provided object.
    return value;
  };
  this.OBJECT = globalObject.createNativeFunction(wrapper, true);
  // Throw away the created prototype and use the root prototype.
  this.setProperty(this.OBJECT, 'prototype', this.OBJECT_PROTO,
    Context.NONENUMERABLE_DESCRIPTOR);
  this.setProperty(this.OBJECT_PROTO, 'constructor', this.OBJECT,
    Context.NONENUMERABLE_DESCRIPTOR);
  this.setProperty(globalObject, 'Object', this.OBJECT,
    Context.NONENUMERABLE_DESCRIPTOR);

  /**
   * Checks if the provided value is null or undefined.
   * If so, then throw an error in the call stack.
   * @param {Context.Value} value Value to check.
   */
  var throwIfNullUndefined = function (value) {
    if (value === undefined || value === null) {
      thisInterpreter.throwException(thisInterpreter.TYPE_ERROR,
        "Cannot convert '" + value + "' to object");
    }
  };

  // Static methods on Object.
  wrapper = function getOwnPropertyNames(obj) {
    throwIfNullUndefined(obj);
    var props = (obj instanceof Context.Object) ? obj.properties : obj;
    return thisInterpreter.nativeToPseudo(Object.getOwnPropertyNames(props));
  };
  this.setProperty(this.OBJECT, 'getOwnPropertyNames',
    globalObject.createNativeFunction(wrapper, false),
    Context.NONENUMERABLE_DESCRIPTOR);

  wrapper = function keys(obj) {
    throwIfNullUndefined(obj);
    if (obj instanceof Context.Object) {
      obj = obj.properties;
    }
    return thisInterpreter.nativeToPseudo(Object.keys(obj));
  };
  this.setProperty(this.OBJECT, 'keys',
    globalObject.createNativeFunction(wrapper, false),
    Context.NONENUMERABLE_DESCRIPTOR);

  wrapper = function create_(proto) {
    // Support for the second argument is the responsibility of a polyfill.
    if (proto === null) {
      return new Context.Object(null);
    }
    if (!(proto instanceof Context.Object)) {
      thisInterpreter.throwException(thisInterpreter.TYPE_ERROR,
        'Object prototype may only be an Object or null, not ' + proto);
    }
    return new Context.Object(proto);
  };
  this.setProperty(this.OBJECT, 'create',
    globalObject.createNativeFunction(wrapper, false),
    Context.NONENUMERABLE_DESCRIPTOR);

  wrapper = function defineProperty(obj, prop, descriptor) {
    prop = String(prop);
    if (!(obj instanceof Context.Object)) {
      thisInterpreter.throwException(thisInterpreter.TYPE_ERROR,
        'Object.defineProperty called on non-object: ' + obj);
    }
    if (!(descriptor instanceof Context.Object)) {
      thisInterpreter.throwException(thisInterpreter.TYPE_ERROR,
        'Property description must be an object');
    }
    if (obj.preventExtensions && !(prop in obj.properties)) {
      thisInterpreter.throwException(thisInterpreter.TYPE_ERROR,
        "Can't define property '" + prop + "', object is not extensible");
    }
    // The polyfill guarantees no inheritance and no getter functions.
    // Therefore the descriptor properties map is the native object needed.
    thisInterpreter.setProperty(obj, prop, Context.VALUE_IN_DESCRIPTOR,
      descriptor.properties);
    return obj;
  };
  this.setProperty(this.OBJECT, 'defineProperty',
    globalObject.createNativeFunction(wrapper, false),
    Context.NONENUMERABLE_DESCRIPTOR);

  wrapper = function getOwnPropertyDescriptor(obj, prop) {
    if (!(obj instanceof Context.Object)) {
      thisInterpreter.throwException(thisInterpreter.TYPE_ERROR,
        'Object.getOwnPropertyDescriptor called on non-object: ' + obj);
    }
    prop = String(prop);
    if (!(prop in obj.properties)) {
      return undefined;
    }
    var descriptor = Object.getOwnPropertyDescriptor(obj.properties, prop);
    var getter = obj.getter[prop];
    var setter = obj.setter[prop];

    var pseudoDescriptor =
      new Context.Object(thisInterpreter.OBJECT_PROTO);
    if (getter || setter) {
      thisInterpreter.setProperty(pseudoDescriptor, 'get', getter);
      thisInterpreter.setProperty(pseudoDescriptor, 'set', setter);
    } else {
      thisInterpreter.setProperty(pseudoDescriptor, 'value',
        /** @type {!Context.Value} */(descriptor['value']));
      thisInterpreter.setProperty(pseudoDescriptor, 'writable',
        descriptor['writable']);
    }
    thisInterpreter.setProperty(pseudoDescriptor, 'configurable',
      descriptor['configurable']);
    thisInterpreter.setProperty(pseudoDescriptor, 'enumerable',
      descriptor['enumerable']);
    return pseudoDescriptor;
  };
  this.setProperty(this.OBJECT, 'getOwnPropertyDescriptor',
    globalObject.createNativeFunction(wrapper, false),
    Context.NONENUMERABLE_DESCRIPTOR);

  wrapper = function getPrototypeOf(obj) {
    throwIfNullUndefined(obj);
    return thisInterpreter.getPrototype(obj);
  };
  this.setProperty(this.OBJECT, 'getPrototypeOf',
    globalObject.createNativeFunction(wrapper, false),
    Context.NONENUMERABLE_DESCRIPTOR);

  wrapper = function isExtensible(obj) {
    return Boolean(obj) && !obj.preventExtensions;
  };
  this.setProperty(this.OBJECT, 'isExtensible',
    globalObject.createNativeFunction(wrapper, false),
    Context.NONENUMERABLE_DESCRIPTOR);

  wrapper = function preventExtensions(obj) {
    if (obj instanceof Context.Object) {
      obj.preventExtensions = true;
    }
    return obj;
  };
  this.setProperty(this.OBJECT, 'preventExtensions',
    globalObject.createNativeFunction(wrapper, false),
    Context.NONENUMERABLE_DESCRIPTOR);

  // Instance methods on Object.
  globalObject.setNativeFunctionPrototype(this.OBJECT, 'toString',
    Context.Object.prototype.toString);
  globalObject.setNativeFunctionPrototype(this.OBJECT, 'toLocaleString',
    Context.Object.prototype.toString);
  globalObject.setNativeFunctionPrototype(this.OBJECT, 'valueOf',
    Context.Object.prototype.valueOf);

  wrapper = function hasOwnProperty(prop) {
    throwIfNullUndefined(this);
    if (this instanceof Context.Object) {
      return String(prop) in this.properties;
    }
    // Primitive.
    return this.hasOwnProperty(prop);
  };
  globalObject.setNativeFunctionPrototype(this.OBJECT, 'hasOwnProperty', wrapper);

  wrapper = function propertyIsEnumerable(prop) {
    throwIfNullUndefined(this);
    if (this instanceof Context.Object) {
      return Object.prototype.propertyIsEnumerable.call(this.properties, prop);
    }
    // Primitive.
    return this.propertyIsEnumerable(prop);
  };
  globalObject.setNativeFunctionPrototype(this.OBJECT, 'propertyIsEnumerable', wrapper);

  wrapper = function isPrototypeOf(obj) {
    while (true) {
      // Note, circular loops shouldn't be possible.
      obj = thisInterpreter.getPrototype(obj);
      if (!obj) {
        // No parent; reached the top.
        return false;
      }
      if (obj === this) {
        return true;
      }
    }
  };
  globalObject.setNativeFunctionPrototype(this.OBJECT, 'isPrototypeOf', wrapper);
  this.setProperty(globalObject, 'constructor', this.OBJECT,
    Context.NONENUMERABLE_DESCRIPTOR);
};

/**
 * Initialize the Array class.
 * @param {!Context.Object} globalObject Global object.
 */
Context.prototype.initArray = function (globalObject) {
  var thisInterpreter = this;
  var wrapper;
  // Array constructor.
  wrapper = function Array(var_args) {
    if (thisInterpreter.calledWithNew()) {
      // Called as `new Array()`.
      var newArray = this;
    } else {
      // Called as `Array()`.
      var newArray = thisInterpreter.createArray();
    }
    var first = arguments[0];
    if (arguments.length === 1 && typeof first === 'number') {
      if (isNaN(legalArrayLength(first))) {
        thisInterpreter.throwException(thisInterpreter.RANGE_ERROR,
          'Invalid array length: ' + first);
      }
      newArray.properties.length = first;
    } else {
      for (var i = 0; i < arguments.length; i++) {
        newArray.properties[i] = arguments[i];
      }
      newArray.properties.length = i;
    }
    return newArray;
  };
  this.ARRAY = globalObject.createNativeFunction(wrapper, true);
  this.ARRAY_PROTO = this.ARRAY.properties['prototype'];
  this.setProperty(globalObject, 'Array', this.ARRAY,
    Context.NONENUMERABLE_DESCRIPTOR);

  // Static methods on Array.
  wrapper = function isArray(obj) {
    return obj && obj.class === 'Array';
  };
  this.setProperty(this.ARRAY, 'isArray',
    globalObject.createNativeFunction(wrapper, false),
    Context.NONENUMERABLE_DESCRIPTOR);

  // Instance methods on Array.
  this.setProperty(this.ARRAY_PROTO, 'length', 0,
    { 'configurable': false, 'enumerable': false, 'writable': true });
  this.ARRAY_PROTO.class = 'Array';
};

/**
 * Initialize the String class.
 * @param {!Context.Object} globalObject Global object.
 */
Context.prototype.initString = function (globalObject) {
  var thisInterpreter = this;
  var wrapper;
  // String constructor.
  wrapper = function String(value) {
    value = arguments.length ? Context.nativeGlobal.String(value) : '';
    if (thisInterpreter.calledWithNew()) {
      // Called as `new String()`.
      this.data = value;
      return this;
    } else {
      // Called as `String()`.
      return value;
    }
  };
  this.STRING = globalObject.createNativeFunction(wrapper, true);
  this.setProperty(globalObject, 'String', this.STRING,
    Context.NONENUMERABLE_DESCRIPTOR);

  // Static methods on String.
  this.setProperty(this.STRING, 'fromCharCode',
    globalObject.createNativeFunction(String.fromCharCode, false),
    Context.NONENUMERABLE_DESCRIPTOR);

  // Instance methods on String.
  // Methods with exclusively primitive arguments.
  var functions = ['charAt', 'charCodeAt', 'concat', 'indexOf', 'lastIndexOf',
    'slice', 'substr', 'substring', 'toLocaleLowerCase', 'toLocaleUpperCase',
    'toLowerCase', 'toUpperCase', 'trim'];
  for (var i = 0; i < functions.length; i++) {
    globalObject.setNativeFunctionPrototype(this.STRING, functions[i],
      String.prototype[functions[i]]);
  }

  wrapper = function localeCompare(compareString, locales, options) {
    locales = thisInterpreter.pseudoToNative(locales);
    options = thisInterpreter.pseudoToNative(options);
    try {
      return String(this).localeCompare(compareString,
        /** @type {?} */(locales), /** @type {?} */(options));
    } catch (e) {
      thisInterpreter.throwException(thisInterpreter.ERROR,
        'localeCompare: ' + e.message);
    }
  };
  globalObject.setNativeFunctionPrototype(this.STRING, 'localeCompare', wrapper);

  wrapper = function split(separator, limit, callback) {
    var string = String(this);
    limit = limit ? Number(limit) : undefined;
    // Example of catastrophic split RegExp:
    // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaac'.split(/^(a+)+b/)
    if (isa(separator, thisInterpreter.REGEXP)) {
      separator = separator.data;
      thisInterpreter.maybeThrowRegExp(separator, callback);
      if (thisInterpreter['REGEXP_MODE'] === 2) {
        if (Context.vm) {
          // Run split in vm.
          var sandbox = {
            'string': string,
            'separator': separator,
            'limit': limit,
          };
          var code = 'string.split(separator, limit)';
          var jsList =
            thisInterpreter.vmCall(code, sandbox, separator, callback);
          if (jsList !== Context.REGEXP_TIMEOUT) {
            callback(thisInterpreter.nativeToPseudo(jsList));
          }
        } else {
          // Run split in separate thread.
          var splitWorker = thisInterpreter.createWorker();
          var pid = thisInterpreter.regExpTimeout(separator, splitWorker,
            callback);
          splitWorker.onmessage = function (e) {
            clearTimeout(pid);
            callback(thisInterpreter.nativeToPseudo(e.data));
          };
          splitWorker.postMessage(['split', string, separator, limit]);
        }
        return;
      }
    }
    // Run split natively.
    var jsList = string.split(separator, limit);
    callback(thisInterpreter.nativeToPseudo(jsList));
  };
  globalObject.setAsyncFunctionPrototype(this.STRING, 'split', wrapper);

  wrapper = function match(regexp, callback) {
    var string = String(this);
    regexp = isa(regexp, thisInterpreter.REGEXP) ?
      regexp.data : new RegExp(regexp);
    // Example of catastrophic match RegExp:
    // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaac'.match(/^(a+)+b/)
    thisInterpreter.maybeThrowRegExp(regexp, callback);
    if (thisInterpreter['REGEXP_MODE'] === 2) {
      if (Context.vm) {
        // Run match in vm.
        var sandbox = {
          'string': string,
          'regexp': regexp,
        };
        var code = 'string.match(regexp)';
        var m = thisInterpreter.vmCall(code, sandbox, regexp, callback);
        if (m !== Context.REGEXP_TIMEOUT) {
          callback(m && thisInterpreter.matchToPseudo_(m));
        }
      } else {
        // Run match in separate thread.
        var matchWorker = thisInterpreter.createWorker();
        var pid = thisInterpreter.regExpTimeout(regexp, matchWorker, callback);
        matchWorker.onmessage = function (e) {
          clearTimeout(pid);
          callback(e.data && thisInterpreter.matchToPseudo_(e.data));
        };
        matchWorker.postMessage(['match', string, regexp]);
      }
      return;
    }
    // Run match natively.
    var m = string.match(regexp);
    callback(m && thisInterpreter.matchToPseudo_(m));
  };
  globalObject.setAsyncFunctionPrototype(this.STRING, 'match', wrapper);

  wrapper = function search(regexp, callback) {
    var string = String(this);
    if (isa(regexp, thisInterpreter.REGEXP)) {
      regexp = regexp.data;
    } else {
      regexp = new RegExp(regexp);
    }
    // Example of catastrophic search RegExp:
    // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaac'.search(/^(a+)+b/)
    thisInterpreter.maybeThrowRegExp(regexp, callback);
    if (thisInterpreter['REGEXP_MODE'] === 2) {
      if (Context.vm) {
        // Run search in vm.
        var sandbox = {
          'string': string,
          'regexp': regexp
        };
        var code = 'string.search(regexp)';
        var n = thisInterpreter.vmCall(code, sandbox, regexp, callback);
        if (n !== Context.REGEXP_TIMEOUT) {
          callback(n);
        }
      } else {
        // Run search in separate thread.
        var searchWorker = thisInterpreter.createWorker();
        var pid = thisInterpreter.regExpTimeout(regexp, searchWorker, callback);
        searchWorker.onmessage = function (e) {
          clearTimeout(pid);
          callback(e.data);
        };
        searchWorker.postMessage(['search', string, regexp]);
      }
      return;
    }
    // Run search natively.
    callback(string.search(regexp));
  };
  globalObject.setAsyncFunctionPrototype(this.STRING, 'search', wrapper);

  wrapper = function replace_(substr, newSubstr, callback) {
    // Support for function replacements is the responsibility of a polyfill.
    var string = String(this);
    newSubstr = String(newSubstr);
    // Example of catastrophic replace RegExp:
    // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaac'.replace(/^(a+)+b/, '')
    if (isa(substr, thisInterpreter.REGEXP)) {
      substr = substr.data;
      thisInterpreter.maybeThrowRegExp(substr, callback);
      if (thisInterpreter['REGEXP_MODE'] === 2) {
        if (Context.vm) {
          // Run replace in vm.
          var sandbox = {
            'string': string,
            'substr': substr,
            'newSubstr': newSubstr,
          };
          var code = 'string.replace(substr, newSubstr)';
          var str = thisInterpreter.vmCall(code, sandbox, substr, callback);
          if (str !== Context.REGEXP_TIMEOUT) {
            callback(str);
          }
        } else {
          // Run replace in separate thread.
          var replaceWorker = thisInterpreter.createWorker();
          var pid = thisInterpreter.regExpTimeout(substr, replaceWorker,
            callback);
          replaceWorker.onmessage = function (e) {
            clearTimeout(pid);
            callback(e.data);
          };
          replaceWorker.postMessage(['replace', string, substr, newSubstr]);
        }
        return;
      }
    }
    // Run replace natively.
    callback(string.replace(substr, newSubstr));
  };
  globalObject.setAsyncFunctionPrototype(this.STRING, 'replace', wrapper);
};

/**
 * Initialize the Boolean class.
 * @param {!Context.Object} globalObject Global object.
 */
Context.prototype.initBoolean = function (globalObject) {
  var thisInterpreter = this;
  var wrapper;
  // Boolean constructor.
  wrapper = function Boolean(value) {
    value = Context.nativeGlobal.Boolean(value);
    if (thisInterpreter.calledWithNew()) {
      // Called as `new Boolean()`.
      this.data = value;
      return this;
    } else {
      // Called as `Boolean()`.
      return value;
    }
  };
  this.BOOLEAN = globalObject.createNativeFunction(wrapper, true);
  this.setProperty(globalObject, 'Boolean', this.BOOLEAN,
    Context.NONENUMERABLE_DESCRIPTOR);
};

/**
 * Initialize the Number class.
 * @param {!Context.Object} globalObject Global object.
 */
Context.prototype.initNumber = function (globalObject) {
  var thisInterpreter = this;
  var wrapper;
  // Number constructor.
  wrapper = function Number(value) {
    value = arguments.length ? Context.nativeGlobal.Number(value) : 0;
    if (thisInterpreter.calledWithNew()) {
      // Called as `new Number()`.
      this.data = value;
      return this;
    } else {
      // Called as `Number()`.
      return value;
    }
  };
  this.NUMBER = globalObject.createNativeFunction(wrapper, true);
  this.setProperty(globalObject, 'Number', this.NUMBER,
    Context.NONENUMERABLE_DESCRIPTOR);

  var numConsts = ['MAX_VALUE', 'MIN_VALUE', 'NaN', 'NEGATIVE_INFINITY',
    'POSITIVE_INFINITY'];
  for (var i = 0; i < numConsts.length; i++) {
    this.setProperty(this.NUMBER, numConsts[i], Number[numConsts[i]],
      Context.NONCONFIGURABLE_READONLY_NONENUMERABLE_DESCRIPTOR);
  }

  // Instance methods on Number.
  wrapper = function toExponential(fractionDigits) {
    try {
      return Number(this).toExponential(fractionDigits);
    } catch (e) {
      // Throws if fractionDigits isn't within 0-20.
      thisInterpreter.throwException(thisInterpreter.ERROR, e.message);
    }
  };
  globalObject.setNativeFunctionPrototype(this.NUMBER, 'toExponential', wrapper);

  wrapper = function toFixed(digits) {
    try {
      return Number(this).toFixed(digits);
    } catch (e) {
      // Throws if digits isn't within 0-20.
      thisInterpreter.throwException(thisInterpreter.ERROR, e.message);
    }
  };
  globalObject.setNativeFunctionPrototype(this.NUMBER, 'toFixed', wrapper);

  wrapper = function toPrecision(precision) {
    try {
      return Number(this).toPrecision(precision);
    } catch (e) {
      // Throws if precision isn't within range (depends on implementation).
      thisInterpreter.throwException(thisInterpreter.ERROR, e.message);
    }
  };
  globalObject.setNativeFunctionPrototype(this.NUMBER, 'toPrecision', wrapper);

  wrapper = function toString(radix) {
    try {
      return Number(this).toString(radix);
    } catch (e) {
      // Throws if radix isn't within 2-36.
      thisInterpreter.throwException(thisInterpreter.ERROR, e.message);
    }
  };
  globalObject.setNativeFunctionPrototype(this.NUMBER, 'toString', wrapper);

  wrapper = function toLocaleString(locales, options) {
    locales = locales ? thisInterpreter.pseudoToNative(locales) : undefined;
    options = options ? thisInterpreter.pseudoToNative(options) : undefined;
    try {
      return Number(this).toLocaleString(
        /** @type {?} */(locales), /** @type {?} */(options));
    } catch (e) {
      thisInterpreter.throwException(thisInterpreter.ERROR,
        'toLocaleString: ' + e.message);
    }
  };
  globalObject.setNativeFunctionPrototype(this.NUMBER, 'toLocaleString', wrapper);
};

/**
 * Initialize the Date class.
 * @param {!Context.Object} globalObject Global object.
 */
Context.prototype.initDate = function (globalObject) {
  var thisInterpreter = this;
  var wrapper;
  // Date constructor.
  wrapper = function Date(_value, var_args) {
    if (!thisInterpreter.calledWithNew()) {
      // Called as `Date()`.
      // Calling Date() as a function returns a string, no arguments are heeded.
      return Context.nativeGlobal.Date();
    }
    // Called as `new Date(...)`.
    var args = [null].concat(Array.from(arguments));
    this.data = new (Function.prototype.bind.apply(
      Context.nativeGlobal.Date, args));
    return this;
  };
  this.DATE = globalObject.createNativeFunction(wrapper, true);
  this.DATE_PROTO = this.DATE.properties['prototype'];
  this.setProperty(globalObject, 'Date', this.DATE,
    Context.NONENUMERABLE_DESCRIPTOR);

  // Static methods on Date.
  this.setProperty(this.DATE, 'now', globalObject.createNativeFunction(Date.now, false),
    Context.NONENUMERABLE_DESCRIPTOR);
  this.setProperty(this.DATE, 'parse',
    globalObject.createNativeFunction(Date.parse, false),
    Context.NONENUMERABLE_DESCRIPTOR);

  this.setProperty(this.DATE, 'UTC', globalObject.createNativeFunction(Date.UTC, false),
    Context.NONENUMERABLE_DESCRIPTOR);

  // Instance methods on Date.
  var functions = ['getDate', 'getDay', 'getFullYear', 'getHours',
    'getMilliseconds', 'getMinutes', 'getMonth', 'getSeconds', 'getTime',
    'getTimezoneOffset', 'getUTCDate', 'getUTCDay', 'getUTCFullYear',
    'getUTCHours', 'getUTCMilliseconds', 'getUTCMinutes', 'getUTCMonth',
    'getUTCSeconds', 'getYear',
    'setDate', 'setFullYear', 'setHours', 'setMilliseconds',
    'setMinutes', 'setMonth', 'setSeconds', 'setTime', 'setUTCDate',
    'setUTCFullYear', 'setUTCHours', 'setUTCMilliseconds', 'setUTCMinutes',
    'setUTCMonth', 'setUTCSeconds', 'setYear',
    'toDateString', 'toJSON', 'toGMTString', 'toLocaleDateString',
    'toLocaleString', 'toLocaleTimeString', 'toTimeString', 'toUTCString'];
  for (var i = 0; i < functions.length; i++) {
    wrapper = (function (nativeFunc) {
      return function (var_args) {
        var date = this.data;
        if (!(date instanceof Date)) {
          thisInterpreter.throwException(thisInterpreter.TYPE_ERROR,
            nativeFunc + ' not called on a Date');
        }
        var args = [];
        for (var i = 0; i < arguments.length; i++) {
          args[i] = thisInterpreter.pseudoToNative(arguments[i]);
        }
        return date[nativeFunc].apply(date, args);
      };
    })(functions[i]);
    globalObject.setNativeFunctionPrototype(this.DATE, functions[i], wrapper);
  }

  // Unlike the previous instance methods, toISOString may throw.
  wrapper = function toISOString() {
    try {
      return this.data.toISOString();
    } catch (e) {
      thisInterpreter.throwException(thisInterpreter.RANGE_ERROR,
        'toISOString: ' + e.message);
    }
  };
  globalObject.setNativeFunctionPrototype(this.DATE, 'toISOString', wrapper);
};

/**
 * Initialize Regular Expression object.
 * @param {!Context.Object} globalObject Global object.
 */
Context.prototype.initRegExp = function (globalObject) {
  var thisInterpreter = this;
  var wrapper;
  // RegExp constructor.
  wrapper = function RegExp(pattern, flags) {
    if (thisInterpreter.calledWithNew()) {
      // Called as `new RegExp()`.
      var rgx = this;
    } else {
      // Called as `RegExp()`.
      if (flags === undefined &&
        isa(pattern, thisInterpreter.REGEXP)) {
        // Regexp(/foo/) returns the same obj.
        return pattern;
      }
      var rgx = new Context.Object(thisInterpreter.REGEXP_PROTO);
    }
    pattern = pattern === undefined ? '' : String(pattern);
    flags = flags ? String(flags) : '';
    if (!/^[gmi]*$/.test(flags)) {
      // Don't allow ES6 flags 'y' and 's' to pass through.
      thisInterpreter.throwException(thisInterpreter.SYNTAX_ERROR,
        'Invalid regexp flag: ' + flags);
    }
    try {
      var nativeRegExp = new Context.nativeGlobal.RegExp(pattern, flags);
    } catch (e) {
      // Throws if flags are repeated.
      thisInterpreter.throwException(thisInterpreter.SYNTAX_ERROR, e.message);
    }
    thisInterpreter.populateRegExp(rgx, nativeRegExp);
    return rgx;
  };
  this.REGEXP = globalObject.createNativeFunction(wrapper, true);
  this.REGEXP_PROTO = this.REGEXP.properties['prototype'];
  this.setProperty(globalObject, 'RegExp', this.REGEXP,
    Context.NONENUMERABLE_DESCRIPTOR);

  this.setProperty(this.REGEXP.properties['prototype'], 'global', undefined,
    Context.READONLY_NONENUMERABLE_DESCRIPTOR);
  this.setProperty(this.REGEXP.properties['prototype'], 'ignoreCase', undefined,
    Context.READONLY_NONENUMERABLE_DESCRIPTOR);
  this.setProperty(this.REGEXP.properties['prototype'], 'multiline', undefined,
    Context.READONLY_NONENUMERABLE_DESCRIPTOR);
  this.setProperty(this.REGEXP.properties['prototype'], 'source', '(?:)',
    Context.READONLY_NONENUMERABLE_DESCRIPTOR);

  wrapper = function exec(string, callback) {
    var regexp = this.data;
    string = String(string);
    // Get lastIndex from wrapped regexp, since this is settable.
    regexp.lastIndex = Number(thisInterpreter.getProperty(this, 'lastIndex'));
    // Example of catastrophic exec RegExp:
    // /^(a+)+b/.exec('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaac')
    thisInterpreter.maybeThrowRegExp(regexp, callback);
    if (thisInterpreter['REGEXP_MODE'] === 2) {
      if (Context.vm) {
        // Run exec in vm.
        var sandbox = {
          'string': string,
          'regexp': regexp,
        };
        var code = 'regexp.exec(string)';
        var match = thisInterpreter.vmCall(code, sandbox, regexp, callback);
        if (match !== Context.REGEXP_TIMEOUT) {
          thisInterpreter.setProperty(this, 'lastIndex', regexp.lastIndex);
          callback(thisInterpreter.matchToPseudo_(match));
        }
      } else {
        // Run exec in separate thread.
        // Note that lastIndex is not preserved when a RegExp is passed to a
        // Web Worker.  Thus it needs to be passed back and forth separately.
        var execWorker = thisInterpreter.createWorker();
        var pid = thisInterpreter.regExpTimeout(regexp, execWorker, callback);
        var thisPseudoRegExp = this;
        execWorker.onmessage = function (e) {
          clearTimeout(pid);
          // Return tuple: [result, lastIndex]
          thisInterpreter.setProperty(thisPseudoRegExp, 'lastIndex', e.data[1]);
          callback(thisInterpreter.matchToPseudo_(e.data[0]));
        };
        execWorker.postMessage(['exec', regexp, regexp.lastIndex, string]);
      }
      return;
    }
    // Run exec natively.
    var match = regexp.exec(string);
    thisInterpreter.setProperty(this, 'lastIndex', regexp.lastIndex);
    callback(thisInterpreter.matchToPseudo_(match));
  };
  globalObject.setAsyncFunctionPrototype(this.REGEXP, 'exec', wrapper);
};

/**
 * Regexp.prototype.exec and String.prototype.match both return an array
 * of matches.  This array has two extra properties, 'input' and 'index'.
 * Convert this native JavaScript data structure into an JS-Context object.
 * @param {!Array} match The native JavaScript match array to be converted.
 * @returns {Context.Value} The equivalent JS-Context array or null.
 * @private
 */
Context.prototype.matchToPseudo_ = function (match) {
  if (match) {
    // ES9 adds a 'groups' property.  This isn't part of ES5.  Delete it.
    // ES13 adds an 'indices' property though Acorn should forbid the
    // regex 'd' flag that creates it.
    // Future ES versions may add more properties.
    // Delete all properties not compatible with ES5.
    var props = /** @type {!Array<?>} */(Object.getOwnPropertyNames(match));
    for (var i = 0; i < props.length; i++) {
      var prop = props[i];
      if (isNaN(Number(prop)) && prop !== 'length' &&
        prop !== 'input' && prop !== 'index') {
        delete match[prop];
      }
    }
    // Convert from a native data structure to JS-Iterpreter objects.
    return this.nativeToPseudo(match);
  }
  return null;
};

/**
 * Initialize the Error class.
 * @param {!Context.Object} globalObject Global object.
 */
Context.prototype.initError = function (globalObject) {
  var thisInterpreter = this;
  // Error constructor.
  this.ERROR = globalObject.createNativeFunction(function Error(opt_message) {
    if (thisInterpreter.calledWithNew()) {
      // Called as `new Error()`.
      var newError = this;
    } else {
      // Called as `Error()`.
      var newError = new Context.Object(thisInterpreter.ERROR.properties['prototype']);
      newError.class = 'Error';
    }
    thisInterpreter.populateError(newError, opt_message);
    return newError;
  }, true);
  this.setProperty(globalObject, 'Error', this.ERROR,
    Context.NONENUMERABLE_DESCRIPTOR);
  this.setProperty(this.ERROR.properties['prototype'], 'message', '',
    Context.NONENUMERABLE_DESCRIPTOR);
  this.setProperty(this.ERROR.properties['prototype'], 'name', 'Error',
    Context.NONENUMERABLE_DESCRIPTOR);

  var createErrorSubclass = function (name) {
    var constructor = globalObject.createNativeFunction(
      function (opt_message) {
        if (thisInterpreter.calledWithNew()) {
          // Called as `new XyzError()`.
          var newError = this;
        } else {
          // Called as `XyzError()`.
          var newError = new Context.Object(constructor.properties['prototype']);
          newError.class = 'Error';
        }
        thisInterpreter.populateError(newError, opt_message);
        return newError;
      }, true);
    var newError = new Context.Object(thisInterpreter.ERROR.properties['prototype']);
    newError.class = 'Error';
    thisInterpreter.setProperty(constructor, 'prototype',
      newError,
      Context.NONENUMERABLE_DESCRIPTOR);
    thisInterpreter.setProperty(constructor.properties['prototype'], 'name',
      name, Context.NONENUMERABLE_DESCRIPTOR);
    thisInterpreter.setProperty(globalObject, name, constructor,
      Context.NONENUMERABLE_DESCRIPTOR);

    return constructor;
  };

  this.EVAL_ERROR = createErrorSubclass('EvalError');
  this.RANGE_ERROR = createErrorSubclass('RangeError');
  this.REFERENCE_ERROR = createErrorSubclass('ReferenceError');
  this.SYNTAX_ERROR = createErrorSubclass('SyntaxError');
  this.TYPE_ERROR = createErrorSubclass('TypeError');
  this.URI_ERROR = createErrorSubclass('URIError');
};

/**
 * Initialize Math object.
 * @param {!Context.Object} globalObject Global object.
 */
Context.prototype.initMath = function (globalObject) {
  var myMath = new Context.Object(this.OBJECT_PROTO);
  this.setProperty(globalObject, 'Math', myMath,
    Context.NONENUMERABLE_DESCRIPTOR);
  var mathConsts = ['E', 'LN2', 'LN10', 'LOG2E', 'LOG10E', 'PI',
    'SQRT1_2', 'SQRT2'];
  for (var i = 0; i < mathConsts.length; i++) {
    this.setProperty(myMath, mathConsts[i], Math[mathConsts[i]],
      Context.READONLY_NONENUMERABLE_DESCRIPTOR);
  }
  var numFunctions = ['abs', 'acos', 'asin', 'atan', 'atan2', 'ceil', 'cos',
    'exp', 'floor', 'log', 'max', 'min', 'pow', 'random',
    'round', 'sin', 'sqrt', 'tan'];
  for (var i = 0; i < numFunctions.length; i++) {
    this.setProperty(myMath, numFunctions[i],
      globalObject.createNativeFunction(Math[numFunctions[i]], false),
      Context.NONENUMERABLE_DESCRIPTOR);
  }
};

/**
 * Initialize JSON object.
 * @param {!Context.Object} globalObject Global object.
 */
Context.prototype.initJSON = function (globalObject) {
  var wrapper;
  var thisInterpreter = this;
  var myJSON = new Context.Object(this.OBJECT_PROTO);
  this.setProperty(globalObject, 'JSON', myJSON,
    Context.NONENUMERABLE_DESCRIPTOR);

  wrapper = function parse(text) {
    try {
      var nativeObj = JSON.parse(String(text));
    } catch (e) {
      thisInterpreter.throwException(thisInterpreter.SYNTAX_ERROR, e.message);
    }
    return thisInterpreter.nativeToPseudo(nativeObj);
  };
  this.setProperty(myJSON, 'parse', globalObject.createNativeFunction(wrapper, false));

  wrapper = function stringify(value, replacer, space) {
    if (replacer && replacer.class === 'Function') {
      thisInterpreter.throwException(thisInterpreter.TYPE_ERROR,
        'Function replacer on JSON.stringify not supported');
    } else if (replacer && replacer.class === 'Array') {
      replacer = thisInterpreter.pseudoToNative(replacer);
      replacer = replacer.filter(function (word) {
        // Spec says we should also support boxed primitives here.
        return typeof word === 'string' || typeof word === 'number';
      });
    } else {
      replacer = null;
    }
    // Spec says we should also support boxed primitives here.
    if (typeof space !== 'string' && typeof space !== 'number') {
      space = undefined;
    }

    var nativeObj = thisInterpreter.pseudoToNative(value);
    try {
      var str = JSON.stringify(nativeObj, replacer, space);
    } catch (e) {
      thisInterpreter.throwException(thisInterpreter.TYPE_ERROR, e.message);
    }
    return str;
  };
  this.setProperty(myJSON, 'stringify',
    globalObject.createNativeFunction(wrapper, false));
};

/**
 * Initialize a pseudo regular expression object based on a native regular
 * expression object.
 * @param {!Context.Object} pseudoRegexp The existing object to set.
 * @param {!RegExp} nativeRegexp The native regular expression.
 */
Context.prototype.populateRegExp = function (pseudoRegexp, nativeRegexp) {
  pseudoRegexp.data = new RegExp(nativeRegexp.source, nativeRegexp.flags);
  // lastIndex is settable, all others are read-only attributes
  this.setProperty(pseudoRegexp, 'lastIndex', nativeRegexp.lastIndex,
    Context.NONENUMERABLE_DESCRIPTOR);
  this.setProperty(pseudoRegexp, 'source', nativeRegexp.source,
    Context.READONLY_NONENUMERABLE_DESCRIPTOR);
  this.setProperty(pseudoRegexp, 'global', nativeRegexp.global,
    Context.READONLY_NONENUMERABLE_DESCRIPTOR);
  this.setProperty(pseudoRegexp, 'ignoreCase', nativeRegexp.ignoreCase,
    Context.READONLY_NONENUMERABLE_DESCRIPTOR);
  this.setProperty(pseudoRegexp, 'multiline', nativeRegexp.multiline,
    Context.READONLY_NONENUMERABLE_DESCRIPTOR);
};

/**
 * Initialize a pseudo error object.
 * @param {!Context.Object} pseudoError The existing object to set.
 * @param {string=} opt_message Error's message.
 */
Context.prototype.populateError = function (pseudoError, opt_message) {
  if (opt_message) {
    this.setProperty(pseudoError, 'message', String(opt_message),
      Context.NONENUMERABLE_DESCRIPTOR);
  }
  var tracebackData = [];
  const stack = this.getStateStack();
  for (var i = stack.length - 1; i >= 0; i--) {
    var state = stack[i];
    var node = state.node;
    if (node.type === 'CallExpression') {
      var func = state.func_;
      if (func && tracebackData.length) {
        tracebackData[tracebackData.length - 1].datumName =
          this.getProperty(func, 'name');
      }
    }
    if (node.loc &&
      (!tracebackData.length || node.type === 'CallExpression')) {
      tracebackData.push({ datumLoc: node.loc });
    }
  }
  var errorName = String(this.getProperty(pseudoError, 'name'));
  var errorMessage = String(this.getProperty(pseudoError, 'message'));
  var stackString = errorName + ': ' + errorMessage + '\n';
  for (var i = 0; i < tracebackData.length; i++) {
    var loc = tracebackData[i].datumLoc;
    var name = tracebackData[i].datumName;
    var locString = loc.source + ':' +
      loc.start.line + ':' + loc.start.column;
    if (name) {
      stackString += '  at ' + name + ' (' + locString + ')\n';
    } else {
      stackString += '  at ' + locString + '\n';
    }
  }
  this.setProperty(pseudoError, 'stack', stackString.trim(),
    Context.NONENUMERABLE_DESCRIPTOR);
};

/**
 * Create a Web Worker to execute regular expressions.
 * Using a separate file fails in Chrome when run locally on a file:// URI.
 * Using a data encoded URI fails in IE and Edge.
 * Using a blob works in IE11 and all other browsers.
 * @returns {!Worker} Web Worker with regexp execution code loaded.
 */
Context.prototype.createWorker = function () {
  var blob = this.createWorker.blob_;
  if (!blob) {
    blob = new Blob([Context.WORKER_CODE.join('\n')],
      { type: 'application/javascript' });
    // Cache the blob, so it doesn't need to be created next time.
    this.createWorker.blob_ = blob;
  }
  return new Worker(URL.createObjectURL(blob));
};

/**
 * Execute regular expressions in a node vm.
 * @param {string} code Code to execute.
 * @param {!Object} sandbox Global variables for new vm.
 * @param {!RegExp} nativeRegExp Regular expression.
 * @param {!Function} callback Asynchronous callback function.
 */
Context.prototype.vmCall = function (code, sandbox, nativeRegExp, callback) {
  var options = { 'timeout': this['REGEXP_THREAD_TIMEOUT'] };
  try {
    return Context.vm['runInNewContext'](code, sandbox, options);
  } catch (_e) {
    callback(null);
    this.throwException(this.ERROR, 'RegExp Timeout: ' + nativeRegExp);
  }
  return Context.REGEXP_TIMEOUT;
};

/**
 * If REGEXP_MODE is 0, then throw an error.
 * Also throw if REGEXP_MODE is 2 and JS doesn't support Web Workers or vm.
 * @param {!RegExp} nativeRegExp Regular expression.
 * @param {!Function} callback Asynchronous callback function.
 */
Context.prototype.maybeThrowRegExp = function (nativeRegExp, callback) {
  var ok;
  if (this['REGEXP_MODE'] === 0) {
    // Fail: No RegExp support.
    ok = false;
  } else if (this['REGEXP_MODE'] === 1) {
    // Ok: Native RegExp support.
    ok = true;
  } else {
    // Sandboxed RegExp handling.
    if (Context.vm) {
      // Ok: Node's vm module already loaded.
      ok = true;
    } else if (typeof Worker === 'function' && typeof URL === 'function') {
      // Ok: Web Workers available.
      ok = true;
    } else if (typeof require === 'function') {
      // Try to load Node's vm module.
      try {
        Context.vm = require('vm');
      } catch (_e) { }
      ok = !!Context.vm;
    } else {
      // Fail: Neither Web Workers nor vm available.
      ok = false;
    }
  }
  if (!ok) {
    callback(null);
    this.throwException(this.ERROR, 'Regular expressions not supported: ' +
      nativeRegExp);
  }
};

/**
 * Set a timeout for regular expression threads.  Unless cancelled, this will
 * terminate the thread and throw an error.
 * @param {!RegExp} nativeRegExp Regular expression (used for error message).
 * @param {!Worker} worker Thread to terminate.
 * @param {!Function} callback Async callback function to continue execution.
 * @returns {number} PID of timeout.  Used to cancel if thread completes.
 */
Context.prototype.regExpTimeout = function (nativeRegExp, worker, callback) {
  var thisInterpreter = this;
  return setTimeout(function () {
    worker.terminate();
    callback(null);
    try {
      thisInterpreter.throwException(thisInterpreter.ERROR,
        'RegExp Timeout: ' + nativeRegExp);
    } catch (_e) {
    }
  }, this['REGEXP_THREAD_TIMEOUT']);
};

/**
 * Create a new array.
 * @returns {!Context.Object} New array.
 */
Context.prototype.createArray = function () {
  var array = new Context.Object(this.ARRAY_PROTO);
  // Arrays have length.
  this.setProperty(array, 'length', 0,
    { 'configurable': false, 'enumerable': false, 'writable': true });
  array.class = 'Array';
  return array;
};

/**
 * Converts from a native JavaScript object or value to a JS-Context object.
 * Can handle JSON-style values, regular expressions, dates and functions.
 * Does handle cycles.
 * @param {*} nativeObj The native JavaScript object to be converted.
 * @param {Object=} opt_cycles Cycle detection object (used by recursive calls).
 * @returns {Context.Value} The equivalent JS-Context object.
 */
Context.prototype.nativeToPseudo = function (nativeObj, opt_cycles) {
  const globalObject = this.globalScope?.object;
  if (nativeObj === null || nativeObj === undefined ||
    nativeObj === true || nativeObj === false ||
    typeof nativeObj === 'string' || typeof nativeObj === 'number') {
    // Primitive value.
    return nativeObj;
  }
  if (nativeObj instanceof Context.Object) {
    throw Error('Object is already pseudo');
  }

  // Look up if this object has already been converted.
  var cycles = opt_cycles || {
    pseudo: [],
    native: [],
  };
  var index = cycles.native.indexOf(nativeObj);
  if (index !== -1) {
    return cycles.pseudo[index];
  }
  cycles.native.push(nativeObj);

  if (nativeObj instanceof RegExp) {
    var pseudoRegexp = new Context.Object(this.REGEXP_PROTO);
    this.populateRegExp(pseudoRegexp, nativeObj);
    cycles.pseudo.push(pseudoRegexp);
    return pseudoRegexp;
  }

  if (nativeObj instanceof Date) {
    var pseudoDate = new Context.Object(this.DATE_PROTO);
    pseudoDate.data = new Date(nativeObj.valueOf());
    cycles.pseudo.push(pseudoDate);
    return pseudoDate;
  }

  // Boxed primitives.
  var pseudoBox;
  if (nativeObj instanceof Number) {
    pseudoBox = new Context.Object(this.NUMBER.properties['prototype']);
  } else if (nativeObj instanceof String) {
    pseudoBox = new Context.Object(this.STRING.properties['prototype']);
  } else if (nativeObj instanceof Boolean) {
    pseudoBox = new Context.Object(this.BOOLEAN.properties['prototype']);
  }
  if (pseudoBox) {
    pseudoBox.data = nativeObj.valueOf();
    cycles.pseudo.push(pseudoBox);
    return pseudoBox;
  }

  if (typeof nativeObj === 'function') {
    var thisInterpreter = this;
    var wrapper = function () {
      var args = Array.prototype.slice.call(arguments).map(function (i) {
        return thisInterpreter.pseudoToNative(i);
      });
      var value = nativeObj.apply(thisInterpreter, args);
      return thisInterpreter.nativeToPseudo(value);
    };
    var prototype = Object.getOwnPropertyDescriptor(nativeObj, 'prototype');
    var pseudoFunction = globalObject?.createNativeFunction(wrapper, !!prototype);
    cycles.pseudo.push(pseudoFunction);
    return pseudoFunction;
  }

  var pseudoObj;
  if (Array.isArray(nativeObj)) { // Array.
    pseudoObj = this.createArray();
  } else { // Object.
    pseudoObj = new Context.Object(this.OBJECT_PROTO);
  }
  cycles.pseudo.push(pseudoObj);
  for (var key in nativeObj) {
    this.setProperty(pseudoObj, key,
      this.nativeToPseudo(nativeObj[key], cycles));
  }
  return pseudoObj;
};

/**
 * Converts from a JS-Context object to native JavaScript object.
 * Can handle JSON-style values, regular expressions, and dates.
 * Does not handle functions (for security reasons).
 * Does handle cycles.
 * @param {Context.Value} pseudoObj The JS-Context object to be
 * converted.
 * @param {Object=} opt_cycles Cycle detection object (used by recursive calls).
 * @returns {*} The equivalent native JavaScript object or value.
 */
Context.prototype.pseudoToNative = function (pseudoObj, opt_cycles) {
  if (pseudoObj === null || pseudoObj === undefined ||
    pseudoObj === true || pseudoObj === false ||
    typeof pseudoObj === 'string' || typeof pseudoObj === 'number') {
    // Primitive value.
    return pseudoObj;
  }
  if (!(pseudoObj instanceof Context.Object)) {
    throw Error('Object is not pseudo');
  }

  // Look up if this object has already been converted.
  var cycles = opt_cycles || {
    pseudo: [],
    native: [],
  };
  var index = cycles.pseudo.indexOf(pseudoObj);
  if (index !== -1) {
    return cycles.native[index];
  }
  cycles.pseudo.push(pseudoObj);

  if (isa(pseudoObj, this.REGEXP)) { // Regular expression.
    var nativeRegExp = new RegExp(pseudoObj.data.source, pseudoObj.data.flags);
    nativeRegExp.lastIndex = pseudoObj.data.lastIndex;
    cycles.native.push(nativeRegExp);
    return nativeRegExp;
  }

  if (isa(pseudoObj, this.DATE)) { // Date.
    var nativeDate = new Date(pseudoObj.data.valueOf());
    cycles.native.push(nativeDate);
    return nativeDate;
  }

  // Boxed primitives.
  if (isa(pseudoObj, this.NUMBER) ||
    isa(pseudoObj, this.STRING) ||
    isa(pseudoObj, this.BOOLEAN)) {
    var nativeBox = Object(pseudoObj.data);
    cycles.native.push(nativeBox);
    return nativeBox;
  }

  // Functions are not supported for security reasons.  Probably not a great
  // idea for the JS-Context to be able to create native JS functions.
  // Still, if that floats your boat, this is where you'd add it.  Good luck.

  var nativeObj = isa(pseudoObj, this.ARRAY) ? [] : {};
  cycles.native.push(nativeObj);
  var val;
  for (var key in pseudoObj.properties) {
    val = this.pseudoToNative(pseudoObj.properties[key], cycles);
    // Use defineProperty to avoid side effects if setting '__proto__'.
    Object.defineProperty(nativeObj, key,
      {
        'value': val, 'writable': true, 'enumerable': true,
        'configurable': true
      });
  }
  return nativeObj;
};

/**
 * Look up the prototype for this value.
 * @param {Context.Value} value Data object.
 * @returns {Context.Object} Prototype object, null if none.
 */
Context.prototype.getPrototype = function (value) {
  switch (typeof value) {
    case 'number':
      return this.NUMBER.properties['prototype'];
    case 'boolean':
      return this.BOOLEAN.properties['prototype'];
    case 'string':
      return this.STRING.properties['prototype'];
  }
  if (value) {
    return value.proto;
  }
  return null;
};

/**
 * Fetch a property value from a data object.
 * @param {Context.Value} obj Data object.
 * @param {Context.Value} name Name of property.
 * @returns {Context.Value} Property value (may be undefined).
 */
Context.prototype.getProperty = function (obj, name, emitGetter?) {
  name = String(name);
  if (obj === undefined || obj === null) {
    this.throwException(this.TYPE_ERROR,
      "Cannot read property '" + name + "' of " + obj);
  }
  if (typeof obj === 'object' && !(obj instanceof Context.Object)) {
    throw TypeError('Expecting native value or pseudo object');
  }
  if (name === 'length') {
    // Special cases for magic length property.
    if (isa(obj, this.STRING)) {
      return String(obj).length;
    }
  } else if (name.charCodeAt(0) < 0x40) {
    // Might have numbers in there?
    // Special cases for string array indexing
    if (isa(obj, this.STRING)) {
      var n = legalArrayIndex(name);
      if (!isNaN(n) && n < String(obj).length) {
        return String(obj)[n];
      }
    }
  }
  do {
    if (obj.properties && name in obj.properties) {
      var getter = obj.getter[name];
      if (getter) {
        emitGetter?.(true);
        return getter;
      }
      return obj.properties[name];
    }
  } while ((obj = this.getPrototype(obj)));
  return undefined;
};

/**
 * Does the named property exist on a data object.
 * @param {Context.Object} obj Data object.
 * @param {Context.Value} name Name of property.
 * @returns {boolean} True if property exists.
 */
Context.prototype.hasProperty = function (obj, name) {
  if (!(obj instanceof Context.Object)) {
    throw TypeError('Primitive data type has no properties');
  }
  name = String(name);
  if (name === 'length' && isa(obj, this.STRING)) {
    return true;
  }
  if (isa(obj, this.STRING)) {
    var n = legalArrayIndex(name);
    if (!isNaN(n) && n < String(obj).length) {
      return true;
    }
  }
  do {
    if (obj.properties && name in obj.properties) {
      return true;
    }
  } while ((obj = this.getPrototype(obj)));
  return false;
};

/**
 * Set a property value on a data object.
 * @param {Context.Value} obj Data object.
 * @param {Context.Value} name Name of property.
 * @param {Context.Value} value New property value.
 *     Use Context.VALUE_IN_DESCRIPTOR if value is handled by
 *     descriptor instead.
 * @param {Object=} opt_descriptor Optional descriptor object.
 * @returns {!Context.Object|undefined} Returns a setter function if one
 *     needs to be called, otherwise undefined.
 */
Context.prototype.setProperty = function (obj, name, value, opt_descriptor, emitSetter?) {
  name = String(name);
  const stack = this.getStateStack();
  const strict = !stack || stack[stack.length - 1]?.scope?.strict;
  if (obj === undefined || obj === null) {
    this.throwException(this.TYPE_ERROR,
      "Cannot set property '" + name + "' of " + obj);
  }
  if (!(obj instanceof Context.Object)) {
    if (typeof obj === 'object') {
      throw TypeError('Expecting native value or pseudo object');
    }
    if (strict) {
      this.throwException(this.TYPE_ERROR, "Can't create property '" + name +
        "' on '" + obj + "'");
    }
    return;
  }
  if (isa(obj, this.STRING)) {
    const n = legalArrayIndex(name);
    if (name === 'length' || (!isNaN(n) && n < String(obj).length)) {
      // Can't set length or letters on String objects.
      if (strict) {
        this.throwException(this.TYPE_ERROR, "Cannot assign to read only " +
          "property '" + name + "' of String '" + obj.data + "'");
      }
      return;
    }
  }
  if (obj.class === 'Array') {
    // Arrays have a magic length variable that is bound to the elements.
    const len = obj.properties.length;
    if (name === 'length') {
      if (opt_descriptor && !('value' in opt_descriptor)) {
        return;
      }
      const maxLen = legalArrayLength(opt_descriptor && 'value' in opt_descriptor ? opt_descriptor['value'] : value);
      if (isNaN(maxLen)) {
        this.throwException(this.RANGE_ERROR, 'Invalid array length');
      }
      if (maxLen < len) {
        for (let key in obj.properties) {
          const index = legalArrayIndex(key);
          if (!isNaN(index) && index >= maxLen) {
            delete obj.properties[index];
          }
        }
      }
    } else {
      // Increase length if this index is larger.
      const index = legalArrayIndex(name);
      if (!isNaN(index)) {
        obj.properties.length = Math.max(len, index + 1);
      }
    }
  }
  if (obj.preventExtensions && !(name in obj.properties)) {
    if (strict) {
      this.throwException(this.TYPE_ERROR, "Can't add property '" + name +
        "', object is not extensible");
    }
    return;
  }
  if (opt_descriptor) {
    if (opt_descriptor && ('get' in opt_descriptor || 'set' in opt_descriptor) &&
      ('value' in opt_descriptor || 'writable' in opt_descriptor)) {
      this.throwException(this.TYPE_ERROR, 'Invalid property descriptor. ' +
        'Cannot both specify accessors and a value or writable attribute');
    }
    // Define the property.
    var descriptor = {};
    if ('get' in opt_descriptor && opt_descriptor['get']) {
      obj.getter[name] = opt_descriptor['get'];
      descriptor['get'] = placeholderGet_;
    }
    if ('set' in opt_descriptor && opt_descriptor['set']) {
      obj.setter[name] = opt_descriptor['set'];
      descriptor['set'] = placeholderSet_;
    }
    if ('configurable' in opt_descriptor) {
      descriptor['configurable'] = opt_descriptor['configurable'];
    }
    if ('enumerable' in opt_descriptor) {
      descriptor['enumerable'] = opt_descriptor['enumerable'];
    }
    if ('writable' in opt_descriptor) {
      descriptor['writable'] = opt_descriptor['writable'];
      delete obj.getter[name];
      delete obj.setter[name];
    }
    if ('value' in opt_descriptor) {
      descriptor['value'] = opt_descriptor['value'];
      delete obj.getter[name];
      delete obj.setter[name];
    } else if (value !== Context.VALUE_IN_DESCRIPTOR) {
      descriptor['value'] = value;
      delete obj.getter[name];
      delete obj.setter[name];
    }
    try {
      Object.defineProperty(obj.properties, name, descriptor);
    } catch (e) {
      this.throwException(this.TYPE_ERROR, 'Cannot redefine property: ' + name);
    }
    // Now that the definition has suceeded, clean up any obsolete get/set funcs.
    if ('get' in opt_descriptor && !opt_descriptor['get']) {
      delete obj.getter[name];
    }
    if ('set' in opt_descriptor && !opt_descriptor['set']) {
      delete obj.setter[name];
    }
  } else {
    // Set the property.
    if (value === Context.VALUE_IN_DESCRIPTOR) {
      throw ReferenceError('Value not specified');
    }
    // Determine the parent (possibly self) where the property is defined.
    var defObj = obj;
    while (!(name in defObj.properties)) {
      defObj = this.getPrototype(defObj);
      if (!defObj) {
        // This is a new property.
        defObj = obj;
        break;
      }
    }
    if (defObj.setter && defObj.setter[name]) {
      emitSetter?.(true);
      return defObj.setter[name];
    }
    if (defObj.getter && defObj.getter[name]) {
      if (strict) {
        this.throwException(this.TYPE_ERROR, "Cannot set property '" + name +
          "' of object '" + obj + "' which only has a getter");
      }
    } else {
      // No setter, simple assignment.
      try {
        obj.properties[name] = value;
      } catch (_e) {
        if (strict) {
          this.throwException(this.TYPE_ERROR, "Cannot assign to read only " +
            "property '" + name + "' of object '" + obj + "'");
        }
      }
    }
  }
};

/**
 * Is the current state directly being called with as a construction with 'new'.
 * @returns {boolean} True if 'new foo()', false if 'foo()'.
 */
Context.prototype.calledWithNew = function () {
  const state = this.getState();
  return state?.isConstructor;
};

/**
 * Throw an exception in the interpreter that can be handled by an
 * interpreter try/catch statement.  If unhandled, a real exception will
 * be thrown.  Can be called with either an error class and a message, or
 * with an actual object to be thrown.
 * @param {!Context.Object|Context.Value} errorClass Type of error
 *   (if message is provided) or the value to throw (if no message).
 * @param {string=} opt_message Message being thrown.
 */
Context.prototype.throwException = function (errorClass, opt_message) {
  if (!this.globalScope) {
    // This is an error being thrown in the initialization, throw a real error.
    throw (opt_message === undefined) ? errorClass : opt_message;
  }
  let error;
  if (opt_message === undefined ||
    !(errorClass instanceof Context.Object)) {
    error = errorClass; // This is a value to throw, not an error class.
  } else {
    error = new Context.Object(errorClass.properties['prototype']);
    error.class = 'Error';
    this.populateError(error, opt_message);
  }
  this.unwind(Context.Completion.THROW, error, undefined);
};

/**
 * Unwind the stack to the innermost relevant enclosing TryStatement,
 * For/ForIn/WhileStatement or Call/NewExpression.  If this results in
 * the stack being completely unwound the thread will be terminated
 * and the appropriate error being thrown.
 * @param {Context.Completion} type Completion type.
 * @param {Context.Value} value Value computed, returned or thrown.
 * @param {string|undefined} label Target label for break or return.
 */
Context.prototype.unwind = function (type, value, label) {
  if (type === Context.Completion.NORMAL) {
    throw TypeError('Should not unwind for NORMAL completions');
  }

  loop: for (var stack = this.getStateStack(); stack.length > 0; stack.pop()) {
    var state = stack[stack.length - 1];
    switch (state.node.type) {
      case 'TryStatement':
        state.cv = { type: type, value: value, label: label };
        return;
      case 'CallExpression':
      case 'NewExpression':
        if (type === Context.Completion.RETURN) {
          state.value = value;
          return;
        } else if (type === Context.Completion.BREAK ||
          type === Context.Completion.CONTINUE) {
          throw Error('Unsyntactic break/continue not rejected by Acorn');
        }
        break;
      case 'Program':
        if (type === Context.Completion.RETURN) {
          // While a return outside of a function call isn't normally possible,
          // this can happen if a setTimeout/setInterval task returns.
          return;
        }
        // Leave the root scope on the tree in case the program is appended to.
        state.done = true;
        break loop;
    }
    if (type === Context.Completion.BREAK) {
      if (label ? (state.labels && state.labels.indexOf(label) !== -1) :
        (state.isLoop || state.isSwitch)) {
        stack.pop();
        return;
      }
    } else if (type === Context.Completion.CONTINUE) {
      if (label ? (state.labels && state.labels.indexOf(label) !== -1) :
        state.isLoop) {
        return;
      }
    }
  }

  // Unhandled completion.  Throw a real error.
  var realError;
  if (isa(value, this.ERROR)) {
    var errorTable = {
      'EvalError': EvalError,
      'RangeError': RangeError,
      'ReferenceError': ReferenceError,
      'SyntaxError': SyntaxError,
      'TypeError': TypeError,
      'URIError': URIError,
    };
    var name = String(this.getProperty(value, 'name'));
    var message = this.getProperty(value, 'message').valueOf();
    var errorConstructor = errorTable[name] || Error;
    realError = errorConstructor(message);
    realError.stack = String(this.getProperty(value, 'stack'));
  } else {
    realError = String(value);
  }
  // Overwrite the previous (more or less random) interpreter return value.
  // Replace it with the error.
  this.value = realError;
  throw realError;
};

/**
 * Return the global scope object.
 */
Context.prototype.getGlobalScope = function () {
  return this.globalScope;
};

/**
 * Sets the global scope object.
 */
Context.prototype.setGlobalScope = function (newScope) {
  this.globalScope = newScope;
  const stack = this.getStateStack();
  stack[0].scope = newScope;
};

export default Context;
