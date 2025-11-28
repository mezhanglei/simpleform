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
    const matches = value.match(/({{.*?}})|([^{{]*)/g)?.filter((p) => !!p);
    return matches;
  }
};

// 从序列化字符串转化为js
export const parseExpression = <V>(value: V, variables?: object) => {
  if (typeof value !== 'string') return value;
  const matches = matchExpression(value);
  const bracketRegx = /^{{(.*)}}$/;
  const codeList = matches?.filter((str) => bracketRegx.test(str));
  if (!codeList?.length) return value;

  // js沙盒解析字符串能力，目前处于隐藏状态
  const compileCode = (code) => {
    evaluator.expose(variables || {});
    const result = evaluator.evalCode(code);
    return result;
  };

  // 遍历解析
  const target = matches?.map((part) => {
    if (bracketRegx.test(part)) {
      const code = part?.replace(bracketRegx, '$1');
      return compileCode(code);
    } else {
      return part;
    }
  })
  const res = matches?.length === 1 ? target?.[0] : target?.join('')
  return res
};

/* eslint-enable */
