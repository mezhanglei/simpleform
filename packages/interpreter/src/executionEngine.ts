// ast节点执行引擎
class ExecutionEngine {
  interpreter: any;
  constructor(interpreter) {
    this.interpreter = interpreter;
  }
};

export {
  ExecutionEngine
};
