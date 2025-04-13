import { Constants } from '../constants';
import ObjectConstructor from '../constructor/Object';

class GlobalObject extends ObjectConstructor {
  static NONENUMERABLE_DESCRIPTOR = Constants.NONENUMERABLE_DESCRIPTOR;
  static READONLY_NONENUMERABLE_DESCRIPTOR = Constants.READONLY_NONENUMERABLE_DESCRIPTOR;
  functionCounter_: number;
  FUNCTION_PROTO: ObjectConstructor;
  constructor(proto) {
    const OBJECT_PROTO = new ObjectConstructor(proto);
    super(OBJECT_PROTO);
    this.functionCounter_ = 0;
    this.FUNCTION_PROTO = new ObjectConstructor(OBJECT_PROTO);
  }

  createFunctionBase_(argumentLength: number, isConstructor: boolean) {
    const FUNCTION_PROTO = this.FUNCTION_PROTO;
    const OBJECT_PROTO = FUNCTION_PROTO.proto;
    const func = new ObjectConstructor(FUNCTION_PROTO);
    if (isConstructor) {
      const proto = new ObjectConstructor(OBJECT_PROTO);
      func.setProperty('prototype', proto, GlobalObject.NONENUMERABLE_DESCRIPTOR);
      proto.setProperty('constructor', func, GlobalObject.NONENUMERABLE_DESCRIPTOR);
    } else {
      func.illegalConstructor = true;
    }
    func.setProperty('length', argumentLength, GlobalObject.READONLY_NONENUMERABLE_DESCRIPTOR);
    func.class = 'Function';
    // When making changes to this function, check to see if those changes also
    // need to be made to the creation of FUNCTION_PROTO in initFunction.
    return func;
  };

  createNativeFunction(nativeFunc, isConstructor) {
    const func = this.createFunctionBase_(nativeFunc.length, isConstructor);
    func.nativeFunc = nativeFunc;
    nativeFunc.id = this.functionCounter_ ? this.functionCounter_++ : 0;
    func.setProperty('name', nativeFunc.name, GlobalObject.READONLY_NONENUMERABLE_DESCRIPTOR);
    return func;
  };

  setNativeFunctionPrototype(obj: ObjectConstructor, name: string, wrapper) {
    obj.properties['prototype']?.setProperty(
      name,
      this.createNativeFunction(wrapper, false),
      GlobalObject.NONENUMERABLE_DESCRIPTOR,
    );
  };

  createAsyncFunction(asyncFunc) {
    const func = this.createFunctionBase_(asyncFunc.length, true);
    func.asyncFunc = asyncFunc;
    asyncFunc.id = this.functionCounter_++;
    func.setProperty('name', asyncFunc.name, GlobalObject.READONLY_NONENUMERABLE_DESCRIPTOR);
    return func;
  };

  setAsyncFunctionPrototype(obj: ObjectConstructor, name, wrapper) {
    obj.properties['prototype']?.setProperty(
      name,
      this.createAsyncFunction(wrapper),
      Constants.NONENUMERABLE_DESCRIPTOR);
  };

  createFunction(node, scope, opt_name?) {
    const func = this.createFunctionBase_(node.params.length, true);
    func.parentScope = scope;
    func.node = node;
    // Choose a name for this function.
    // function foo() {}             -> 'foo'
    // var bar = function() {};      -> 'bar'
    // var bar = function foo() {};  -> 'foo'
    // foo.bar = function() {};      -> ''
    // var bar = new Function('');   -> 'anonymous'
    const name = node.id ? String(node.id.name) : (opt_name || '');
    func.setProperty('name', name, GlobalObject.READONLY_NONENUMERABLE_DESCRIPTOR);
    return func;
  };
};

export default GlobalObject;
