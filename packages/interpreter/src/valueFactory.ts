import { getPropInPrototypeChain } from "./utils";

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

  constructor(proto = null) {
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
}

// 创建数据类型
class ValueFactory {
  constructor() {

  }
};

export {
  ValueFactory,
  ObjectConstructor
};
