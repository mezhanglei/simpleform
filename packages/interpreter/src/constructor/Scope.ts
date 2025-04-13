// 作用域构造函数
class ScopeConstructor<T = any> {
  parentScope: ScopeConstructor;
  strict: boolean;
  object: T;
  constructor(parentScope, strict, object) {
    this.parentScope = parentScope; // 父级作用域
    this.strict = strict; // 是否严格模式
    this.object = object; // 作用域对象
  }
};

export default ScopeConstructor;
