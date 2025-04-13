import Context from "../Context";
import { throwException } from "../utils/error";
import { Constants } from "../constants";
import { parse_ } from "../utils/node";

const initFunction = (globalObject: NonNullable<Context['globalScope']>['object'], context: Context) => {
  const FUNCTION_PROTO = globalObject.FUNCTION_PROTO;
  FUNCTION_PROTO.nativeFunc = function () { };
  FUNCTION_PROTO.nativeFunc.id = globalObject.functionCounter_++;
  FUNCTION_PROTO.illegalConstructor = true;
  FUNCTION_PROTO.class = 'Function';
  const identifierRegexp = /^[A-Za-z_$][\w$]*$/;
  let functionCodeNumber_ = 0;
  // Function constructor.
  const FUNCTION = globalObject.createNativeFunction(function Function(...var_args) {
    const stack = context.getStateStack();
    const code = var_args.length ? String(var_args[var_args.length - 1]) : '';
    let argsStr = Array.prototype.slice.call(var_args, 0, -1).join(',').trim();
    if (argsStr) {
      const args = argsStr.split(/\s*,\s*/);
      for (let i = 0; i < args.length; i++) {
        const name = args[i];
        if (!identifierRegexp.test(name)) {
          throwException(Constants.ERROR_KEYS.SyntaxError, 'Invalid function argument: ' + name, stack);
        }
      }
      argsStr = args.join(', ');
    }
    // Acorn needs to parse code in the context of a function or else `return`
    // statements will be syntax errors.
    let ast;
    try {
      ast = parse_('(function(' + argsStr + ') {' + code + '})',
        'function' + (functionCodeNumber_++), Constants.PARSE_OPTIONS);
    } catch (e) {
      // Acorn threw a SyntaxError.  Rethrow as a trappable error.
      throwException(Constants.ERROR_KEYS.SyntaxError,
        'Invalid code: ' + e?.message, stack);
    }
    if (ast.body.length !== 1) {
      // Function('a', 'return a + 6;}; {alert(1);');
      throwException(Constants.ERROR_KEYS.SyntaxError,
        'Invalid code in function body', stack);
    }
    const node = ast.body[0].expression;
    // Note that if this constructor is called as `new Function()` the function
    // object created by stepCallExpression and assigned to `this` is discarded.
    // Interestingly, the scope for constructed functions is the global scope,
    // even if they were constructed in some other scope.
    return globalObject.createFunction(node, context.globalScope, 'anonymous');
  }, true);

  // Throw away the created prototype and use the root prototype.
  FUNCTION.setProperty('prototype', FUNCTION_PROTO, Context.NONENUMERABLE_DESCRIPTOR);
  // Configure Function.prototype.
  FUNCTION_PROTO.setProperty('constructor', FUNCTION, Context.NONENUMERABLE_DESCRIPTOR);
  FUNCTION_PROTO.setProperty('length', 0, Context.READONLY_NONENUMERABLE_DESCRIPTOR);

  globalObject.setNativeFunctionPrototype(FUNCTION, 'apply', function apply_(func, thisArg, args) {
    const stack = context.getStateStack();
    const state = stack[stack.length - 1];
    if (!state) return;
    // Rewrite the current CallExpression state to apply a different function.
    // Note: 'func' is provided by the polyfill as a non-standard argument.
    state.func_ = func;
    // Assign the `this` object.
    state.funcThis_ = thisArg;
    // Bind any provided arguments.
    state.arguments_ = [];
    if (args !== null && args !== undefined) {
      if (args instanceof Context.Object) {
        // Convert the pseudo array of args into a native array.
        // The pseudo array's properties object happens to be array-like.
        state.arguments_ = Array.from(args.properties);
      } else {
        throwException(Constants.ERROR_KEYS.TypeError, 'CreateListFromArrayLike called on non-object', stack);
      }
    }
    state.doneExec_ = false;
  });

  globalObject.setNativeFunctionPrototype(FUNCTION, 'call', function call(thisArg /*, var_args */) {
    const stack = context.getStateStack();
    const state = stack[stack.length - 1];
    if (!state) return;
    // Rewrite the current CallExpression state to call a different function.
    state.func_ = this;
    // Assign the `this` object.
    state.funcThis_ = thisArg;
    // Bind any provided arguments.
    state.arguments_ = [];
    for (let i = 1; i < arguments.length; i++) {
      state.arguments_.push(arguments[i]);
    }
    state.doneExec_ = false;
  });

  const setNativeFunctionProperty = (obj, name: string, wrapper) => {
    obj.properties['prototype']?.setProperty(
      name,
      globalObject.createNativeFunction(wrapper, false),
      Constants.NONENUMERABLE_DESCRIPTOR
    );
    if (['toString', 'valueOf'].includes(name)) {
      obj?.setProperty(name, globalObject.createNativeFunction(wrapper, false), Context.NONENUMERABLE_DESCRIPTOR);
    }
  };

  // Function has no parent to inherit from, so it needs its own mandatory
  // toString and valueOf functions.
  setNativeFunctionProperty(FUNCTION, 'toString', function toString() {
    return String(this);
  });
  setNativeFunctionProperty(FUNCTION, 'valueOf', function valueOf() {
    return this.valueOf();
  });
  globalObject.setProperty('Function', FUNCTION, Context.NONENUMERABLE_DESCRIPTOR);
  return FUNCTION;
};

export default initFunction;
