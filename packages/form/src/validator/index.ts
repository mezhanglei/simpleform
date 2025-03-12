import { ItemCoreProps } from "../core";
import { configValidator, ConfigValidatorKeys } from "./rules";
export type FormRule = {
  required?: boolean;
  pattern?: RegExp;
  whitespace?: boolean;
  max?: number;
  min?: number;
  message?: string;
  validator?: FormValidator;
  validateTrigger?: ItemCoreProps['validateTrigger'];
}
export type FormValidatorCallBack = (message?: string) => void;
export type FormValidator = <T>(value: T, callBack?: FormValidatorCallBack) => T | Promise<T>;

// 处理单条规则
const handleRule = async (rule?: FormRule, value?: unknown, eventName?: ItemCoreProps['trigger']) => {
  if (!rule) return;
  const { validateTrigger, message: defaultMessage, validator, ...restRule } = rule || {};
  const canTrigger = isCanTrigger(eventName, validateTrigger);
  if (!canTrigger) return;
  // 自定义校验
  if (typeof validator === 'function') {
    try {
      let errorMsg: string | undefined;
      await validator(value, (err) => {
        errorMsg = err;
      });
      if (errorMsg) {
        return errorMsg;
      }
    } catch (err: unknown) {
      if (typeof err === 'string') {
        return err;
      }
      const otherErr = err as { message?: string };
      if (typeof otherErr.message == 'string') {
        return otherErr.message;
      }
      return defaultMessage || true;
    }
  }
  // 其他校验字段
  const entries = Object.entries(restRule || {}) as Array<[ConfigValidatorKeys, FormRule[ConfigValidatorKeys]]>;
  for (let [ruleKey, ruleValue] of entries) {
    const ruleValidator = configValidator[ruleKey];
    if (typeof ruleValidator === 'function') {
      if (ruleValidator(ruleValue, value) === true) {
        return defaultMessage || true;
      }
    }
  }
};

// 处理多条规则
export const handleRules = async (rules?: FormRule[], value?: unknown, eventName?: ItemCoreProps['trigger']) => {
  if (!(rules instanceof Array)) return;
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    const message = await handleRule(rule, value, eventName);
    if (message) {
      return message;
    }
  }
};

// 是否触发校验规则
export const isCanTrigger = (eventName?: ItemCoreProps['trigger'], validateTrigger?: ItemCoreProps['validateTrigger']) => {
  // 默认允许触发
  if (eventName === undefined) return true;
  if (typeof eventName === 'boolean') return eventName;
  if (validateTrigger === undefined) return true;
  if (typeof validateTrigger === 'string') {
    return validateTrigger === eventName;
  }
  if (validateTrigger instanceof Array) {
    return validateTrigger.includes(eventName);
  }
};
