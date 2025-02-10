import { Constants } from "./constants";
import { ObjectConstructor, ScopeConstructor } from "./constructor";
import { AcornSourceLocation } from "./typings";
import { bindClassPrototype, isInherit, legalArrayIndex, legalArrayLength } from "./utils";

// 解释器-执行环境上下文
class Context {
  static READONLY_DESCRIPTOR = Constants.READONLY_DESCRIPTOR;
  static NONCONFIGURABLE_READONLY_NONENUMERABLE_DESCRIPTOR = Constants.NONCONFIGURABLE_READONLY_NONENUMERABLE_DESCRIPTOR;
  static Object = ObjectConstructor;
  static Scope = ScopeConstructor;

  OBJECT_PROTO?: ObjectConstructor;
  FUNCTION_PROTO?: ObjectConstructor;
  globalScope?: ScopeConstructor;
  constructor(initFunc) {
    bindClassPrototype(Context, this);
    this.initGlobal(initFunc);
  }

  // 初始化环境
  initGlobal(initFunc?) {
    this.globalScope = new Context.Scope(null, false, new Context.Object(null));
    this.OBJECT_PROTO = new Context.Object(null);
    this.FUNCTION_PROTO = new Context.Object(this.OBJECT_PROTO);
    const globalObject = this.globalScope.object;
    // this.setProperty(globalObject, 'NaN', NaN,
    //   Context.NONCONFIGURABLE_READONLY_NONENUMERABLE_DESCRIPTOR);
    // this.setProperty(globalObject, 'Infinity', Infinity,
    //   Context.NONCONFIGURABLE_READONLY_NONENUMERABLE_DESCRIPTOR);
    // this.setProperty(globalObject, 'undefined', undefined,
    //   Context.NONCONFIGURABLE_READONLY_NONENUMERABLE_DESCRIPTOR);
    // this.setProperty(globalObject, 'window', globalObject,
    //   Context.READONLY_DESCRIPTOR);
    // this.setProperty(globalObject, 'this', globalObject,
    //   Context.NONCONFIGURABLE_READONLY_NONENUMERABLE_DESCRIPTOR);
    // this.setProperty(globalObject, 'self', globalObject); // Editable.
  }

  initFunction(globalObject) {
  }
};

export {
  Context
};
