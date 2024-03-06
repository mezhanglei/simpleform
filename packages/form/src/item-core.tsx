import { useContext, useEffect, useState } from 'react';
import { SimpleFormContext, FormInitialValuesContext } from './form-context';
import { deepGet, getValueFromEvent, toArray } from './utils/utils';
import { FormRule } from './validator';
import { isEmpty } from './utils/type';

export type TriggerType = string;
export interface FieldChangedParams {
  name?: string;
  value: any;
}

export interface ItemCoreProps {
  name?: string;
  ignore?: boolean;
  index?: number;
  trigger?: TriggerType; // 设置收集字段值变更的时机
  validateTrigger?: TriggerType | TriggerType[];
  valueProp?: string | ((type: any) => string);
  valueGetter?: ((...args: any[]) => any);
  valueSetter?: ((value: any) => any);
  rules?: FormRule[];
  initialValue?: any;
  errorClassName?: string;
  onFieldsChange?: (obj: FieldChangedParams, values?: any) => void;
  onFieldsMounted?: (obj: FieldChangedParams, values?: any) => void;
  onValuesChange?: (obj: FieldChangedParams, values?: any) => void;
  children?: any
}

export function getRulesTriggers(rules?: ItemCoreProps['rules']) {
  const result = [];
  if (rules instanceof Array) {
    if (rules instanceof Array) {
      for (let i = 0; i < rules?.length; i++) {
        const rule = rules?.[i];
        if (rule?.validateTrigger) {
          result.push(rule?.validateTrigger);
        }
      }
    }
  }
  return result;
}

export function getTriggers(trigger: ItemCoreProps['trigger'], validateTrigger: ItemCoreProps['validateTrigger'], ruleTriggers: Array<string>) {
  return new Set<string>([
    ...toArray(trigger),
    ...toArray(validateTrigger),
    ...ruleTriggers
  ]);
}

export const ItemCore = (props: ItemCoreProps) => {
  const { form, ...options } = useContext(SimpleFormContext);
  const initialValues = useContext(FormInitialValuesContext);
  const mergeProps = Object.assign({}, options, props);
  const { children, ...restProps } = mergeProps;
  const {
    name,
    valueProp = 'value',
    valueGetter = getValueFromEvent,
    valueSetter,
    errorClassName,
    onFieldsChange,
    onFieldsMounted,
    onValuesChange,
    initialValue,
    trigger = 'onChange',
    validateTrigger,
    ...rest
  } = restProps;

  const fieldProps = { ...restProps, valueProp, valueGetter, trigger };

  const ignore = rest?.ignore || rest?.readOnly;
  const currentPath = (isEmpty(name) || ignore === true) ? undefined : name;
  const initValue = initialValue ?? deepGet(initialValues, currentPath);
  const storeValue = form && form.getFieldValue(currentPath);
  const initialItemValue = storeValue ?? initValue;
  const [value, setValue] = useState();

  // 初始化fieldProps
  currentPath && form?.setFieldProps(currentPath, fieldProps);

  // 订阅更新值的函数
  useEffect(() => {
    if (!currentPath || !form) return;
    // 订阅目标控件
    form.subscribeFormItem(currentPath, (newValue, oldValue) => {
      setValue(newValue);
      if (!(isEmpty(newValue) && isEmpty(oldValue))) {
        onValuesChange && onValuesChange({ name: currentPath, value: newValue }, form?.getFieldValue());
      }
    });
    return () => {
      form.unsubscribeFormItem(currentPath);
    };
  }, [JSON.stringify(currentPath), form, onValuesChange]);

  // 表单域初始化值
  useEffect(() => {
    if (!currentPath || !form) return;
    // 回填form.initialValues和回填form.values
    if (initialItemValue !== undefined) {
      form.setInitialValues(currentPath, initialItemValue);
    }
    onFieldsMounted && onFieldsMounted({ name: currentPath, value: initialItemValue }, form?.getFieldValue());
    return () => {
      // 清除该表单域的props(在设置值的前面)
      currentPath && form?.setFieldProps(currentPath, undefined);
      // 清除初始值
      currentPath && form.setInitialValues(currentPath, undefined);
    };
  }, [JSON.stringify(currentPath)]);

  // 对目标控件进行双向绑定
  const bindChildren = (children: any) => {
    if (typeof children === 'function') {
      const bindProps = form && form.getBindProps(currentPath, value) || {};
      return children({ className: errorClassName, form: form, bindProps: bindProps });
    } else {
      return children;
    }
  };

  const childs = bindChildren(children);
  return childs;
};

ItemCore.displayName = "ItemCore";
