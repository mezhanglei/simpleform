import { Constants } from "../constants";
import { ObjectConstructor } from "../constructor";

// 伪结构构造函数
class PseudoFactory {
  static Object = ObjectConstructor;
  script: any;
  OBJECT_PROTO: ObjectConstructor;
  FUNCTION_PROTO: ObjectConstructor;
  functionCounter_: number;
  constructor(globalObject, script) {
    this.functionCounter_ = 0;
    this.script = script;
    this.OBJECT_PROTO = globalObject.proto;
    this.FUNCTION_PROTO = new PseudoFactory.Object(this.OBJECT_PROTO);
  }

  createFunctionBase_(argumentLength: number, isConstructor: boolean) {
    const func = new PseudoFactory.Object(this.FUNCTION_PROTO);
    const script = this.script;
    if (isConstructor) {
      const proto = new PseudoFactory.Object(this.OBJECT_PROTO);
      func.setProperty('prototype', proto, Constants.NONENUMERABLE_DESCRIPTOR, script);
      proto.setProperty('constructor', func, Constants.NONENUMERABLE_DESCRIPTOR, script);
    } else {
      func.illegalConstructor = true;
    }
    func.setProperty('length', argumentLength, Constants.READONLY_NONENUMERABLE_DESCRIPTOR, script);
    func.class = 'Function';
    // When making changes to this function, check to see if those changes also
    // need to be made to the creation of FUNCTION_PROTO in initFunction.
    return func;
  };

  createNativeFunction(nativeFunc, isConstructor) {
    const func = this.createFunctionBase_(nativeFunc.length, isConstructor);
    func.nativeFunc = nativeFunc;
    nativeFunc.id = this.functionCounter_++;
    func.setProperty('name', nativeFunc.name, Constants.READONLY_NONENUMERABLE_DESCRIPTOR, this.script);
    return func;
  };

  setNativeFunctionPrototype(obj: ObjectConstructor, name: string, wrapper) {
    obj.properties['prototype'].setProperty(
      name,
      this.createNativeFunction(wrapper, false),
      Constants.NONENUMERABLE_DESCRIPTOR
    );
  };

  createAsyncFunction(asyncFunc) {
    const func = this.createFunctionBase_(asyncFunc.length, true);
    func.asyncFunc = asyncFunc;
    asyncFunc.id = this.functionCounter_++;
    func.setProperty('name', asyncFunc.name, Constants.READONLY_NONENUMERABLE_DESCRIPTOR, this.script);
    return func;
  };

  setAsyncFunctionPrototype(obj: ObjectConstructor, name, wrapper) {
    obj.properties['prototype'].setProperty(
      name,
      this.createAsyncFunction(wrapper),
      Constants.NONENUMERABLE_DESCRIPTOR);
  };
};

export default PseudoFactory;
