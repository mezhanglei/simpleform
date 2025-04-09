import { bindClassPrototype } from "./utils/object";
import * as acorn from 'acorn';
import { Constants } from "./constants";
import { isStrict, parse_, stripLocations_, traverseAstDeclar } from "./utils/node";
import Context from "./Context";
import ScopeConstructor from "./constructor/Scope";
import polyfills from "./polyfills";

// 执行代码字符串
class Script {
  static VARIABLE_DESCRIPTOR = Constants.VARIABLE_DESCRIPTOR;
  static STEP_ERROR = Constants.STEP_ERROR;
  appendCodeNumber_ = 0;
  code?: string | acorn.Program;
  ast?: acorn.Program;
  paused_?: boolean;
  value?: any;
  getterStep_ = false; // TODO
  setterStep_ = false; // TODO
  options: {
    context?: Context;
    stepFunction?: (stack: Context['stateStack'], state: Context['stateStack'][number]) => Context['stateStack'][number]
  };
  constructor(code, options?) {
    this.code = code;
    this.options = options || {};
    bindClassPrototype(Script, this);
  }

  // 初始化polyfill
  initPolyfill(code, context) {
    if (!context) return;
    this.options.context = context;
    const ast = parse_(code, 'polyfills', Context.PARSE_OPTIONS);
    stripLocations_(ast, undefined, undefined);
    const state = new Context.State(ast, context.globalScope);
    state.done = false;
    context.setStateStack(state.node ? [state] : []);
  };

  // 初始化代码字符串
  initCode(code, context) {
    if (!context) return;
    this.options.context = context;
    const globalScope = context?.getGlobalScope();
    if (!code) return;
    this.getterStep_ = false;
    this.setterStep_ = false;
    this.paused_ = false;
    this.value = undefined;
    const ast = parse_(code, 'code', Context.PARSE_OPTIONS);
    this.ast = ast;
    this.populateScope_?.(ast, globalScope);
    globalScope.isStrict = isStrict(ast);
    const state = new Context.State(ast, globalScope);
    state.done = false;
    context?.setStateStack(state.node ? [state] : []);
  }

  // 在指定context运行
  runInContext(context) {
    this.initPolyfill(polyfills.join('\n'), context);
    this.runInThisContext();
    this.initCode(this.code, context);
    this.runInThisContext();
  }

  runInThisContext() {
    while (!this.paused_ && this.step()) { }
    return this.paused_;
  };

  // 执行栈
  step() {
    const context = this.options.context;
    const stepFunction = this.options?.stepFunction;
    if (!context || !stepFunction) return;
    var stack = context?.getStateStack();
    var endTime;
    do {
      var state: null | Context['stateStack'][number] = stack[stack.length - 1];
      const tasks = context.tasks || [];
      if (this.paused_) {
        // Blocked by an asynchronous function.
        return true;
      } else if (!state || (state.node.type === 'Program' && state.done)) {
        if (!tasks.length) {
          // Main program complete and no queued tasks.  We're done!
          return false;
        }
        state = context.nextTask_();
        if (!state) {
          // Main program complete, queued tasks, but nothing to run right now.
          return true;
        }
        // Found a queued task, execute it.
      }
      var node = state.node;
      // Record the interpreter in a global property so calls to toString/valueOf
      // can execute in the proper context.
      var oldInterpreterValue = Context.Object.currentInterpreter_;
      Context.Object.currentInterpreter_ = this;
      let nextState;
      try {
        nextState = stepFunction(stack, state);
      } catch (e) {
        // Eat any step errors.  They have been thrown on the stack.
        if (e !== Script.STEP_ERROR) {
          // This is a real error, either in the JS-Interpreter, or an uncaught
          // error in the interpreted code.  Rethrow.
          if (this.value !== e) {
            // Uh oh.  Internal error in the JS-Interpreter.
            this.value = undefined;
          }
          throw e;
        }
      } finally {
        // Restore to previous value (probably null, maybe nested toString calls).
        Context.Object.currentInterpreter_ = oldInterpreterValue;
      }
      if (nextState) {
        stack.push(nextState);
      }
      if (this.getterStep_) {
        // Getter from this step was not handled.
        this.value = undefined;
        throw Error('Getter not supported in this context');
      }
      if (this.setterStep_) {
        // Setter from this step was not handled.
        this.value = undefined;
        throw Error('Setter not supported in this context');
      }
      // This may be polyfill code.  Keep executing until we arrive at user code.
      if (!endTime && !node.end) {
        // Ideally this would be defined at the top of the function, but that
        // wastes time if the step isn't a polyfill.
        endTime = Date.now() + this['POLYFILL_TIMEOUT'];
      }
    } while (!node.end && endTime > Date.now());
    return true;
  };

  // 填充作用域
  populateScope_(node, scope: ScopeConstructor) {
    const context = this.options.context;
    if (!context) return;
    const variableCache = traverseAstDeclar(node, (currentCache) => {
      for (const name in currentCache) {
        // 给作用域填充变量或者函数
        const val = currentCache[name] === true ? undefined : context.createFunction(currentCache[name], scope);
        scope.object.setProperty(name, val, Script.VARIABLE_DESCRIPTOR);
      }
    });
    return variableCache;
  }

  // 添加字符串
  append(code) {
    const context = this.options.context;
    if (!context) return;
    const stack = context?.getStateStack();
    const state = stack?.[0];
    if (!state || state.node.type !== 'Program') {
      throw Error('Expecting original AST to start with a Program node');
    }
    const newAst = typeof code === 'string' ? parse_(code, 'appendCode' + (this.appendCodeNumber_++), Context.PARSE_OPTIONS) : code;
    if (!newAst || newAst.type !== 'Program') {
      throw Error('Expecting new AST to start with a Program node');
    }
    this.populateScope_?.(newAst, state.scope);
    // Append the new program to the old one.
    Array.prototype.push.apply(state.node.body, newAst.body);
    state.done = false;
  };
};

export default Script;
