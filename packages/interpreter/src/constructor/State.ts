import ObjectConstructor from "./Object";
import ScopeConstructor from "./Scope";

// state构造函数
class StateConstructor {
  node: any; // 节点
  scope: ScopeConstructor;
  done?: boolean;
  doneCallee_?: number;
  func_?: ObjectConstructor; // 当前函数执行引用
  funcThis_?: ObjectConstructor; // apply/call新的引用
  doneArgs_?: boolean;
  arguments_?: any[];
  doneExec_?: boolean; // 执行状态是否完成

  constructor(node, scope) {
    this.node = node;
    this.scope = scope;
  }
};

export default StateConstructor;
