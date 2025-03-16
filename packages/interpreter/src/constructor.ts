
import { Constants } from "./constants";
import { isArray, isString } from "./utils/type";
import { AcornNode } from "./typings";
import { legalArrayIndex, legalArrayLength } from "./utils/array";
import { throwException } from "./utils/error";
import {
  bindClassPrototype,
  getPropInPrototypeChain,
  isa,
  placeholderGet_,
  placeholderSet_
} from "./utils/object";

// 对象构造函数
class ObjectConstructor {
  static currentInterpreter_: unknown = null;
  static toStringCycles_: ObjectConstructor[] = [];

  getter: { [key: string]: () => any };
  setter: { [key: string]: (value: any) => void };
  properties: { length: number; name?: string; message?: string };
  proto: ObjectConstructor | null;
  class: string = 'Object';
  data: Date | RegExp | boolean | number | string | null = null; // 值
  preventExtensions?: boolean;
  illegalConstructor?: boolean;
  parentScope?: ScopeConstructor;
  node?: StateConstructor['done'];
  nativeFunc?: Function;
  asyncFunc?: Function;

  constructor(proto) {
    this.getter = Object.create(null);
    this.setter = Object.create(null);
    this.properties = Object.create(null);
    this.proto = proto;
    bindClassPrototype(ObjectConstructor, this);
  }
  toString() {
    if (!ObjectConstructor.currentInterpreter_) {
      // Called from outside an interpreter.
      return '[object Interpreter.Object]';
    }
    // 原js基础类型
    if (!(this instanceof ObjectConstructor)) {
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
  hasProperty(name) {
    let obj: ObjectConstructor | null = this;
    if (!(obj instanceof ObjectConstructor)) {
      throw TypeError('Primitive data type has no properties');
    }
    name = String(name);
    if (name === 'length' && isString(obj)) {
      return true;
    }
    if (isString(obj)) {
      const n = legalArrayIndex(name);
      if (!isNaN(n) && n < String(obj).length) {
        return true;
      }
    }
    while (obj !== null) {
      if (obj.properties && name in obj.properties) {
        return true;
      }
      obj = obj.proto;
    }
    return false;
  };
  getProperty(name: string, script) {
    if (script.getterStep_) {
      throw Error('Getter not supported in that context');
    }
    name = String(name);
    let obj: ObjectConstructor | null = this;
    if (obj === undefined || obj === null) {
      throwException(Constants.ERROR_KEYS.TypeError,
        "Cannot read property '" + name + "' of " + obj, script);
    }
    if (typeof obj === 'object' && !(obj instanceof ObjectConstructor)) {
      throw TypeError('Expecting native value or pseudo object');
    }
    if (name === 'length') {
      // Special cases for magic length property.
      if (isString(obj)) {
        return String(obj).length;
      }
    } else if (name.charCodeAt(0) < 0x40) {
      // Might have numbers in there?
      // Special cases for string array indexing
      if (isString(obj)) {
        const n = legalArrayIndex(name);
        if (!isNaN(n) && n < String(obj).length) {
          return String(obj)[n];
        }
      }
    }
    while (obj !== null) {
      if (obj.properties && name in obj.properties) {
        const getter = obj.getter[name];
        if (getter) {
          script.getterStep_ = true;
          return getter;
        }
        return obj.properties[name];
      }
      obj = obj.proto;
    }
    return undefined;
  }
  setProperty(name, value, opt_descriptor, script) {
    const obj = this;
    if (script?.setterStep_) {
      // Getter from previous call to setProperty was not handled.
      throw Error('Setter not supported in that context');
    }
    const strict = !script?.stateStack || script?.getScope()?.strict;
    if (isString(obj)) {
      const n = legalArrayIndex(name);
      if (name === 'length' || (!isNaN(n) && n < String(obj).length)) {
        // Can't set length or letters on String objects.
        if (strict) {
          throwException(Constants.ERROR_KEYS.TypeError, "Cannot assign to read only " +
            "property '" + name + "' of String '" + obj.data + "'", script);
        }
        return;
      }
    }
    if (isArray(obj)) {
      // Arrays have a magic length variable that is bound to the elements.
      const len = obj.properties.length;
      if (name === 'length') {
        if (opt_descriptor && !('value' in opt_descriptor)) {
          return;
        }
        const maxLen = legalArrayLength(opt_descriptor && 'value' in opt_descriptor ? opt_descriptor['value'] : value);
        if (isNaN(maxLen)) {
          throwException(Constants.ERROR_KEYS.RangeError, 'Invalid array length', script);
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
        throwException(Constants.ERROR_KEYS.TypeError, "Can't add property '" + name +
          "', object is not extensible", script);
      }
      return;
    }
    if (opt_descriptor) {
      if (opt_descriptor && ('get' in opt_descriptor || 'set' in opt_descriptor) &&
        ('value' in opt_descriptor || 'writable' in opt_descriptor)) {
        throwException(Constants.ERROR_KEYS.TypeError, 'Invalid property descriptor. ' +
          'Cannot both specify accessors and a value or writable attribute', script);
      }
      // Define the property.
      const descriptor = {};
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
      } else if (value !== Constants.VALUE_IN_DESCRIPTOR) {
        descriptor['value'] = value;
        delete obj.getter[name];
        delete obj.setter[name];
      }
      try {
        Object.defineProperty(obj.properties, name, descriptor);
      } catch (e) {
        throwException(Constants.ERROR_KEYS.TypeError, 'Cannot redefine property: ' + name, script);
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
      if (value === Constants.VALUE_IN_DESCRIPTOR) {
        throw ReferenceError('Value not specified');
      }
      // Determine the parent (possibly self) where the property is defined.
      let defObj: ObjectConstructor | null = obj;
      while (!(name in defObj.properties)) {
        defObj = defObj.proto;
        if (!defObj) {
          // This is a new property.
          defObj = obj;
          break;
        }
      }
      if (defObj.setter && defObj.setter[name]) {
        script.setterStep_ = true;
        return defObj.setter[name];
      }
      if (defObj.getter && defObj.getter[name]) {
        if (strict) {
          throwException(Constants.ERROR_KEYS.TypeError, "Cannot set property '" + name +
            "' of object '" + obj + "' which only has a getter", script);
        }
      } else {
        // No setter, simple assignment.
        try {
          obj.properties[name] = value;
        } catch (_e) {
          if (strict) {
            throwException(Constants.ERROR_KEYS.TypeError, "Cannot assign to read only " +
              "property '" + name + "' of object '" + obj + "'", script);
          }
        }
      }
    }
  }
};

// 作用域构造函数
class ScopeConstructor {
  parentScope: ObjectConstructor;
  strict: boolean;
  object: ObjectConstructor;
  constructor(parentScope, strict, object) {
    this.parentScope = parentScope; // 父级作用域
    this.strict = strict; // 是否严格模式
    this.object = object; // 作用域对象
  }
};

// state构造函数
class StateConstructor {
  node: AcornNode;
  scope: ScopeConstructor;
  done?: boolean;
  constructor(node, scope) {
    this.node = node;
    this.scope = scope;
  }
};

// 异步任务Task构造函数
class TaskConstructor {
  static pid = 0;
  functionRef: unknown;
  argsArray: unknown;
  scope: StateConstructor['scope'];
  node: StateConstructor['node'];
  interval: number;
  pid: number;
  time: number;
  constructor(functionRef, argsArray, scope, node, interval) {
    this.functionRef = functionRef; // 异步函数引用
    this.argsArray = argsArray; // 异步函数的入参
    this.scope = scope;
    this.node = node;
    this.interval = interval;
    this.pid = ++TaskConstructor.pid;
    this.time = 0;
  }
};

export {
  ObjectConstructor,
  ScopeConstructor,
  StateConstructor,
  TaskConstructor,
};
