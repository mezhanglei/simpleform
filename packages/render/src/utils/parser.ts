// 默认的沙盒全局环境变量
export const sandboxGlobals = {
  // Math: Math,
  // JSON: JSON,
  // Array: Array,
  // Object: Object,
  // String: String,
  // Number: Number,
  // Boolean: Boolean,
  // Date: Date,
  // RegExp: RegExp,
  // console: console
};

export function evaluateCode(code, context) {
  try {
    // 创建参数列表
    const args = Object.keys(context).join(',');
    // 使用 new Function 创建一个具有独立作用域的函数
    // 并将 allowedGlobals 中的对象作为参数传递进去
    const sandboxedFunction = new Function(args, `
        'use strict';
        return (${code});
    `);
    // 执行代码并获取返回的对象或值
    return sandboxedFunction(...Object.values(context));
  } catch (e) {
    throw new Error(`Error evaluating code: ${e.message}`);
  }
};

// 从序列化字符串转化为js
export const parseExpression = (value: unknown, variables?: object) => {
  if (typeof value === 'string') {
    return value.replace(/{{\s*([^}]*(?:\}[^}]*)*)\s*}}/g, (match, expr) => {
      try {
        // 尝试计算表达式的值
        const result = evaluateCode(expr, variables);
        // 返回计算后的字符串表示
        return String(result);
      } catch (e: any) {
        // 如果计算失败，返回原始的匹配文本，并打印错误信息
        console.error(`Error evaluating expression "${expr}: ${e?.message}"`);
        return match;
      }
    });
  } else {
    return value;
  }
};
