import { TriggerType } from "../item-core";
import { ValidatorKey, validatorsMap } from "./rules";
export type FormRule = {
  required?: boolean;
  pattern?: RegExp;
  whitespace?: boolean;
  max?: number;
  min?: number;
  message?: string;
  validator?: FormValidator;
  validateTrigger?: TriggerType;
}
export type FormValidatorCallBack = (message?: string) => void;
export type FormValidator = (value: any, callBack?: FormValidatorCallBack) => any | Promise<any>;

// 处理单条规则
const handleRule = async (rule?: FormRule | undefined, value?: any, eventName?: TriggerType | boolean) => {
  if (!rule) return;
  const { validateTrigger, message: defaultMessage, ...restRule } = rule || {};
  const canTrigger = isCanTrigger(eventName, validateTrigger);
  if (!canTrigger) return;
  // 参与校验的字段
  const entries = Object.entries(restRule || {});
  for (let [ruleKey, ruleValue] of entries) {
    const configRule = validatorsMap[ruleKey as ValidatorKey];
    // 自定义校验
    if (ruleKey === 'validator' && typeof ruleValue === 'function') {
      try {
        let msg;
        await ruleValue(value, (err: any) => {
          msg = err;
        });
        return msg;
      } catch (error: any) {
        if (typeof error === 'string') {
          return error;
        }
        if (typeof error.message == 'string') {
          return error.message;
        }
        return defaultMessage;
      }
      // 其他字段的校验，返回true表示报错
      // @ts-ignore
    } else if (typeof configRule === 'function') {
      if (configRule(ruleValue, value) === true) {
        return defaultMessage;
      }
    }
  }
};

// 处理多条规则
export const handleRules = async (rules?: FormRule[], value?: any, eventName?: TriggerType | boolean) => {
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
export const isCanTrigger = (eventName?: TriggerType | boolean, validateTrigger?: TriggerType | TriggerType[],) => {
  // 默认允许触发
  if (validateTrigger === undefined || eventName === undefined) return true;
  // 如果为布尔值则返回该值
  if (typeof eventName === 'boolean') return eventName;
  if (typeof validateTrigger === 'string') {
    return validateTrigger === eventName;
  }
  if (validateTrigger instanceof Array) {
    return validateTrigger.includes(eventName);
  }
};
