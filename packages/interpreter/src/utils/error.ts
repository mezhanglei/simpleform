import { Constants } from "../constants";
import { AcornSourceLocation } from "../typings";
import Context from "../Context";

// 抛出错误
function throwException(errorName: string, opt_message: string, stateStack?: Context['stateStack']) {
  const name = String(errorName);
  const message = String(opt_message);
  const errorConstructor = Constants.ERROR_TYPES[name] || Error;
  const realError = errorConstructor(message);
  realError.stack = getStackError(errorName, opt_message, stateStack);
  // // Overwrite the previous (more or less random) interpreter return value.
  // // Replace it with the error.
  // this.value = realError;
  throw realError;
}

// 返回调用栈的信息
const getStackError = (name: string, opt_message: string, stateStack?: Context['stateStack']) => {
  const tracebackData: Array<{ datumName?: string; datumLoc: AcornSourceLocation }> = [];
  const stack = stateStack || [];
  for (let i = stack.length - 1; i >= 0; i--) {
    const state = stack[i];
    const node = state.node;
    if (node.type === 'CallExpression') {
      const func = state.func_;
      if (func && tracebackData.length) {
        tracebackData[tracebackData.length - 1].datumName = func?.properties.name;
      }
    }
    if (node.loc &&
      (!tracebackData.length || node.type === 'CallExpression')) {
      tracebackData.push({ datumLoc: node.loc });
    }
  }
  const errorName = String(name);
  const errorMessage = String(opt_message);
  let stackString = errorName + ': ' + errorMessage + '\n';
  for (let i = 0; i < tracebackData.length; i++) {
    const loc = tracebackData[i].datumLoc;
    const name = tracebackData[i].datumName;
    const locString = loc.source + ':' +
      loc.start.line + ':' + loc.start.column;
    if (name) {
      stackString += '  at ' + name + ' (' + locString + ')\n';
    } else {
      stackString += '  at ' + locString + '\n';
    }
  }
  return stackString.trim();
};

export {
  throwException,
  getStackError,
};
