
import { AcornNode } from "./typings";

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
  ScopeConstructor,
  StateConstructor,
  TaskConstructor,
};
