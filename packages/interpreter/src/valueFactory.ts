import { Constants } from "./constants";
import { AcornSourceLocation } from "./typings";
import { bindClassPrototype, getPropInPrototypeChain, isInherit, legalArrayIndex, legalArrayLength } from "./utils";

// 对象构造函数
class ObjectConstructor {
  static currentInterpreter_: unknown = null;
  static toStringCycles_: ObjectConstructor[] = [];

  getter: { [key: string]: () => any };
  setter: { [key: string]: (value: any) => void };
  properties: { length: number; name?: string; message?: string };
  proto: object | null;
  class: string = 'Object';
  data: Date | RegExp | boolean | number | string | null = null; // 值
  preventExtensions?: boolean;

  constructor(proto) {
    this.getter = Object.create(null);
    this.setter = Object.create(null);
    this.properties = Object.create(null);
    this.proto = proto;
  }

  toString() {
    if (!ObjectConstructor.currentInterpreter_) {
      // Called from outside an interpreter.
      return '[object Interpreter.Object]';
    }
    if (!(this instanceof ObjectConstructor)) {
      // 基础类型
      return String(this);
    }
    if (this.class === 'Array') {
      // 数组中不能有循环
      const cycles = ObjectConstructor.toStringCycles_;
      cycles.push(this);
      const strs: string[] = [];
      try {
        // 限制数组长度
        const len = this.properties.length;
        const maxLength = 1024;
        const truncated = len > maxLength ? true : false;
        const nowLen = truncated ? 1000 : len;
        for (let i = 0; i < nowLen; i++) {
          const prop = this.properties[i];
          strs[i] = ((prop instanceof ObjectConstructor) &&
            cycles.indexOf(prop) !== -1) ? '...' : prop;
        }
        if (truncated) {
          strs.push('...');
        }
      } finally {
        cycles.pop();
      }
      return strs.join(',');
    }
    if (this.class === 'Error') {
      // name和message不能有循环
      const cycles = ObjectConstructor.toStringCycles_;
      if (cycles.indexOf(this) !== -1) {
        return '[object Error]';
      }
      let name = getPropInPrototypeChain(this, 'name');
      let message = getPropInPrototypeChain(this, 'message');
      cycles.push(this);
      try {
        name = name && String(name);
        message = message && String(message);
      } finally {
        cycles.pop();
      }
      return message ? name + ': ' + message : String(name);
    }
    // 其他类型
    if (this.data !== null) {
      // RegExp, Date, and boxed primitives.
      return String(this.data);
    }
    return '[object ' + this.class + ']';
  }
  valueOf() {
    if (!ObjectConstructor.currentInterpreter_) {
      // Called from outside an interpreter.
      return this;
    }
    if (this.data === undefined || this.data === null ||
      this.data instanceof RegExp) {
      return this; // empty or RegExp
    }
    if (this.data instanceof Date) {
      return this.data.valueOf(); // 日期类型
    }
    return /** @type {(boolean|number|string)} */ (this.data); // 基础类型
  }
};

// 基础数据类型
class ValueFactory {
  static Completion = Constants.Completion;
  static Status = Constants.Status;
  static PARSE_OPTIONS = Constants.PARSE_OPTIONS;
  static READONLY_DESCRIPTOR = Constants.READONLY_DESCRIPTOR;
  static NONENUMERABLE_DESCRIPTOR = Constants.NONENUMERABLE_DESCRIPTOR;
  static READONLY_NONENUMERABLE_DESCRIPTOR = Constants.READONLY_NONENUMERABLE_DESCRIPTOR;
  static NONCONFIGURABLE_READONLY_NONENUMERABLE_DESCRIPTOR = Constants.NONCONFIGURABLE_READONLY_NONENUMERABLE_DESCRIPTOR;
  static VARIABLE_DESCRIPTOR = Constants.VARIABLE_DESCRIPTOR;
  static STEP_ERROR = Constants.STEP_ERROR;
  static SCOPE_REFERENCE = Constants.SCOPE_REFERENCE;
  static VALUE_IN_DESCRIPTOR = Constants.VALUE_IN_DESCRIPTOR;
  static REGEXP_TIMEOUT = Constants.REGEXP_TIMEOUT;
  static vm = Constants.vm;
  static WORKER_CODE = Constants.WORKER_CODE;
  static placeholderGet_ = Constants.placeholderGet_;
  static placeholderSet_ = Constants.placeholderSet_;
  static Object = ObjectConstructor;

  OBJECT_PROTO: ObjectConstructor;
  FUNCTION_PROTO: ObjectConstructor;
  getterStep_?: boolean; // 对象的getter访问开关
  setterStep_?: boolean; // 对象的setter访问开关
  constructor() {
    this.OBJECT_PROTO = new ValueFactory.Object(null);
    this.FUNCTION_PROTO = new ValueFactory.Object(this.OBJECT_PROTO);
    bindClassPrototype(ValueFactory, this);
  }

  /**
   * 处理 JavaScript 解释器中的控制流（如 return、break、continue 和异常）语句,
   * 保证和原生javascript一样的执行行为
   * @param type 
   * @param value 
   * @param label 
   * @returns 
   */
  unwind(type, value, label) {
    // 正常完成不应该触发unwind操作
    if (type === ValueFactory.Completion.NORMAL) {
      throw TypeError('Should not unwind for NORMAL completions');
    }
    // 处理控制流语句
    loop: for (let stack = this.stateStack; stack.length > 0; stack.pop()) {
      const state = stack[stack.length - 1];
      switch (state.node.type) {
        // 设置cv属性来保存完成信息，并返回，以便 catch 块能够捕获到异常
        case 'TryStatement':
          state.cv = { type: type, value: value, label: label };
          return;
        // 处理函数调用或对象创建时的返回值；对于非法的 break 或 continue 抛出错误。
        case 'CallExpression':
        case 'NewExpression':
          if (type === ValueFactory.Completion.RETURN) {
            state.value = value;
            return;
          } else if (type === ValueFactory.Completion.BREAK ||
            type === ValueFactory.Completion.CONTINUE) {
            throw Error('Unsyntactic break/continue not rejected by Acorn');
          }
          break;
        // 根节点标记状态为完成
        case 'Program':
          // setTimeout/setInterval场景下出现顶层作用域弹出应返回
          if (type === ValueFactory.Completion.RETURN) {
            return;
          }
          // 仅退出带标签的for循环
          state.done = true;
          break loop;
      }
      // BREAK, 如果有标签且当前状态包含该标签，或者当前状态是一个循环或switch语句，则弹出栈顶并返回
      if (type === ValueFactory.Completion.BREAK) {
        if (label ? (state.labels && state.labels.indexOf(label) !== -1) :
          (state.isLoop || state.isSwitch)) {
          stack.pop();
          return;
        }
        // CONTINUE 类型的完成，如果有标签且当前状态包含该标签，或者当前状态是一个循环，则直接返回。
      } else if (type === ValueFactory.Completion.CONTINUE) {
        if (label ? (state.labels && state.labels.indexOf(label) !== -1) :
          state.isLoop) {
          return;
        }
      }
    }

    // 错误语句处理
    let realError;
    if (isInherit(value, this.ERROR)) {
      const errorTable = {
        'EvalError': EvalError,
        'RangeError': RangeError,
        'ReferenceError': ReferenceError,
        'SyntaxError': SyntaxError,
        'TypeError': TypeError,
        'URIError': URIError,
      };
      const name = String(this.getProperty(value, 'name'));
      const message = this.getProperty(value, 'message').valueOf();
      const errorConstructor = errorTable[name] || Error;
      realError = errorConstructor(message);
      realError.stack = String(this.getProperty(value, 'stack'));
    } else {
      realError = String(value);
    }
    // TODO
    // this.value = realError;
    throw realError;
  }
  // 给错误对象填充信息，包含详细的错误信息和调用栈追踪
  populateError(pseudoError: ObjectConstructor, opt_message?: string) {
    if (opt_message) {
      this.setProperty(pseudoError, 'message', String(opt_message),
        ValueFactory.NONENUMERABLE_DESCRIPTOR);
    }
    // 当前函数调用栈
    const tracebackData: Array<{ datumName?: string; datumLoc: AcornSourceLocation }> = [];
    for (let i = this.stateStack.length - 1; i >= 0; i--) {
      const state = this.stateStack[i];
      const node = state.node;
      if (node.type === 'CallExpression') {
        const func = state.func_;
        // 先记录当前调用栈且属于函数调用的信息
        if (func && tracebackData.length) {
          tracebackData[tracebackData.length - 1].datumName = this.getProperty(func, 'name');
        }
      }
      if (node.loc && (!tracebackData.length || node.type === 'CallExpression')) {
        tracebackData.push({ datumLoc: node.loc });
      }
    }
    // 从调用栈中提取错误名称和信息
    const errorName = String(this.getProperty(pseudoError, 'name'));
    const errorMessage = String(this.getProperty(pseudoError, 'message'));
    let stackString = errorName + ': ' + errorMessage + '\n';
    for (let i = 0; i < tracebackData.length; i++) {
      const loc = tracebackData[i].datumLoc;
      const name = tracebackData[i].datumName;
      const locString = loc.source + ':' + loc.start.line + ':' + loc.start.column;
      if (name) {
        stackString += '  at ' + name + ' (' + locString + ')\n';
      } else {
        stackString += '  at ' + locString + '\n';
      }
    }
    this.setProperty(pseudoError, 'stack', stackString.trim(),
      ValueFactory.NONENUMERABLE_DESCRIPTOR);
  };
  // 抛出错误
  throwException(errorConstructor?: ObjectConstructor, opt_message?: string) {
    const ObjectFactory = ValueFactory.Object;
    // TODO
    // if (!this.globalScope) {
    //   // This is an error being thrown in the initialization, throw a real error.
    //   throw (opt_message === undefined) ? errorConstructor : opt_message;
    // }
    let error;
    if (opt_message && (errorConstructor instanceof ObjectFactory)) {
      error = new ObjectFactory(errorConstructor.properties['prototype']);
      this.populateError(error, opt_message);
    } else {
      error = errorConstructor;
    }
    this.unwind(ValueFactory.Completion.THROW, error, undefined);
    // Abort anything related to the current step.
    throw ValueFactory.STEP_ERROR;
  }
  // 获取值的原型
  getPrototype(value) {
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
  // 获取伪对象的属性
  getProperty(obj?: ObjectConstructor, name?: string) {
    const ObjectFactory = ValueFactory.Object;
    // 是否正在执行getter操作，防止getter递归
    if (this.getterStep_) {
      throw Error('Getter not supported in that context');
    }
    name = String(name);
    if (obj === undefined || obj === null) {
      this.throwException(this.TYPE_ERROR,
        "Cannot read property '" + name + "' of " + obj);
      return;
    }
    if (typeof obj === 'object' && !(obj instanceof ObjectFactory)) {
      throw TypeError('Expecting native value or pseudo object');
    }
    if (name === 'length') {
      // Special cases for magic length property.
      if (isInherit(obj, this.STRING)) {
        return String(obj).length;
      }
    } else if (name.charCodeAt(0) < 0x40) {
      // Might have numbers in there?
      // Special cases for string array indexing
      if (isInherit(obj, this.STRING)) {
        const n = legalArrayIndex(name);
        if (!isNaN(n) && n < String(obj).length) {
          return String(obj)[n];
        }
      }
    }
    do {
      if (obj.properties && name in obj.properties) {
        const getter = obj.getter[name];
        if (getter) {
          // 1. 一个防止递归执行的开关 2. 表示立即执行getter
          this.getterStep_ = true;
          return getter;
        }
        return obj.properties[name];
      }
    } while ((obj = this.getPrototype(obj)));
    return undefined;
  };
  // 给伪对象中设置属性
  setProperty(obj?: ObjectConstructor, name?: string, value?: unknown, opt_descriptor?: object) {
    const ObjectFactory = ValueFactory.Object;
    // 是否正在执行setter操作，防止setter递归
    if (this.setterStep_) {
      // Getter from previous call to setProperty was not handled.
      throw Error('Setter not supported in that context');
    }
    name = String(name);
    if (obj === undefined || obj === null) {
      this.throwException(this.TYPE_ERROR,
        "Cannot set property '" + name + "' of " + obj);
      return;
    }
    const strict = !this.stateStack || this.getState().scope?.strict;
    if (!(obj instanceof ObjectFactory)) {
      if (typeof obj === 'object') {
        throw TypeError('Expecting native value or pseudo object');
      }
      if (strict) {
        this.throwException(this.TYPE_ERROR, "Can't create property '" + name +
          "' on '" + obj + "'");
      }
      return;
    }
    // 不允许扩展则报错
    if (obj.preventExtensions && !(name in obj.properties)) {
      if (strict) {
        this.throwException(this.TYPE_ERROR, "Can't add property '" + name +
          "', object is not extensible");
      }
      return;
    }
    // 字符串
    if (isInherit(obj, this.STRING)) {
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
    // 数组
    if (obj.class === 'Array') {
      // Arrays have a magic length variable that is bound to the elements.
      const len = obj.properties.length;
      if (name === 'length') {
        if (opt_descriptor && !('value' in opt_descriptor)) {
          return;
        }
        const val = legalArrayLength(opt_descriptor ? opt_descriptor?.['value'] : value);
        if (isNaN(val)) {
          this.throwException(this.RANGE_ERROR, 'Invalid array length');
        }
        if (val < len) {
          for (let i in obj.properties) {
            const arrIndex = legalArrayIndex(i);
            if (!isNaN(arrIndex) && val <= arrIndex) {
              delete obj.properties[i];
            }
          }
        }
      } else {
        const arrIndex = legalArrayIndex(name);
        if (!isNaN(arrIndex)) {
          obj.properties.length = Math.max(len, arrIndex + 1);
        }
      };
    }
    // 对象通过Object.defineProperty定义属性
    if (opt_descriptor) {
      if (('get' in opt_descriptor || 'set' in opt_descriptor) &&
        ('value' in opt_descriptor || 'writable' in opt_descriptor)) {
        this.throwException(this.TYPE_ERROR, 'Invalid property descriptor. ' +
          'Cannot both specify accessors and a value or writable attribute');
      }
      // Define the property.
      const descriptor = {};
      if ('get' in opt_descriptor && opt_descriptor['get']) {
        obj.getter[name] = opt_descriptor['get'];
        descriptor['get'] = ValueFactory.placeholderGet_;
      }
      if ('set' in opt_descriptor && opt_descriptor['set']) {
        obj.setter[name] = opt_descriptor['set'];
        descriptor['set'] = ValueFactory.placeholderSet_;
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
      } else if (value !== ValueFactory.VALUE_IN_DESCRIPTOR) {
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
      if (value === ValueFactory.VALUE_IN_DESCRIPTOR) {
        throw ReferenceError('Value not specified');
      }
      // Determine the parent (possibly self) where the property is defined.
      let defObj = obj;
      while (!(name in defObj.properties)) {
        defObj = this.getPrototype(defObj);
        if (!defObj) {
          // This is a new property.
          defObj = obj;
          break;
        }
      }
      if (defObj.setter && defObj.setter[name]) {
        this.setterStep_ = true;
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
  }
};

export {
  ValueFactory
};
