import StateConstructor from "./State";
import ObjectConstructor from "./Object";

// 异步任务Task构造函数
class TaskConstructor {
  static pid = 0;
  functionRef: ObjectConstructor;
  argsArray: any[];
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

export default TaskConstructor;
