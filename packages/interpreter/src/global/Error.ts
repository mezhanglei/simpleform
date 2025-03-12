import { AcornSourceLocation } from "../typings";

// 返回调用栈的信息
export const getStackError = (name: string, opt_message?: string, script?) => {
  const tracebackData: Array<{ datumName?: string; datumLoc: AcornSourceLocation }> = [];
  for (let i = script?.stateStack.length - 1; i >= 0; i--) {
    const state = script.stateStack[i];
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
