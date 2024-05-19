import { isEmpty } from "../utils/type";

// 必填校验
const required = <T>(ruleValue: T, value?: unknown) => {
  if (typeof ruleValue === 'boolean') {
    if (isEmpty(value)) {
      return ruleValue;
    }
  }
};

// pattern 表达式校验
const pattern = <T>(ruleValue: T, value?: unknown) => {
  if (typeof value !== 'string') return;
  if (ruleValue instanceof RegExp) {
    return !ruleValue.test(value);
  } else if (typeof ruleValue === 'string') {
    const _pattern = new RegExp(ruleValue);
    return !_pattern.test(value);
  }
};

// whitespace 包含空格时校验不通过, value为string类型时生效
const whitespace = <T>(ruleValue: T, value?: unknown) => {
  if (typeof ruleValue === 'boolean' && ruleValue && typeof value === 'string') {
    return /^\s+$/.test(value) || value === '';
  }
};

// max 校验 value为string类型时字符串最大长度；number 类型时为最大值；array 类型时为数组最大长度
const max = <T>(ruleValue: T, value?: unknown) => {
  if (typeof ruleValue === 'number') {
    if (typeof value === 'string' || value instanceof Array) {
      return value.length > ruleValue;
    } else if (typeof value === 'number') {
      return value > ruleValue;
    }
  }
};

// min 校验 value为string类型时字符串最小长度；number 类型时为最小值；array 类型时为数组最小长度
const min = <T>(ruleValue: T, value?: unknown) => {
  if (typeof ruleValue === 'number') {
    if (value === undefined) return true;
    if (typeof value === 'string' || value instanceof Array) {
      return value.length < ruleValue;
    } else if (typeof value === 'number') {
      return value < ruleValue;
    }
  }
};

// 导出校验方法
export const configValidator = {
  'required': required,
  'pattern': pattern,
  'whitespace': whitespace,
  'max': max,
  'min': min
};

export type ConfigValidator = typeof configValidator;
export type ConfigValidatorKeys = keyof ConfigValidator;
