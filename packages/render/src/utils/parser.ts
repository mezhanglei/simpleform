import createEvaluator from '@simpleform/evaluator';
import serialize from 'serialize-javascript';

/* eslint-disable */

// 加载模块
let evaluator;
createEvaluator().then((res) => {
  evaluator = res;
});

// 序列化成字符串
export const toExpression = (val?: unknown) => {
  if (val === undefined || val === null || val === '') return;
  const str = serialize(val);
  return str ? '{{ ' + str + ' }}' : undefined;
};

// 匹配字符串表达式
export const matchExpression = (value?: unknown) => {
  if (typeof value === 'string') {
    // /{{([\s\S]+?)}}/g
    const reg = new RegExp('{{s*.*?s*}}', 'g');
    const result = value?.match(reg)?.[0];
    return result;
  }
};

// 从序列化字符串转化为js
export const parseExpression = <V>(value: V, variables?: object) => {
  if (typeof value === 'string') {
    const matchStr = matchExpression(value);
    if (matchStr) {
      evaluator.expose(variables || {});
      // 尝试计算表达式的值
      const result = evaluator.evalCode(matchStr);
      return result;
    } else {
      return value;
    }
  } else {
    return value;
  }
};

/* eslint-enable */
