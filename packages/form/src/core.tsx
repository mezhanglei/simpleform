import React, { useContext, useEffect, useState } from 'react';
import { SimpleFormContext, FormInitialValuesContext } from './context';
import { deepGet, FormPathType, getValueFromEvent, isValidFormName, toArray } from './utils/utils';
import { FormRule } from './validator';
import { isEmpty } from './utils/type';
import { FormProps } from './form';

export type FormEventHandler<V = unknown, A = unknown> = (obj: { name?: FormPathType; value?: V }, values?: A) => void;
export interface ItemCoreProps {
  name?: FormPathType;
  nonform?: boolean;
  clearOnUninstall?: boolean;
  index?: number;
  trigger?: string; // 设置收集字段值变更的时机
  validateTrigger?: string | string[];
  valueProp?: string | ((type: string) => string);
  valueGetter?: typeof getValueFromEvent;
  valueSetter?: (value) => unknown;
  rules?: FormRule[];
  initialValue?: unknown;
  errorClassName?: string;
  onFieldsChange?: FormEventHandler;
  onFieldsMounted?: FormEventHandler;
  onValuesChange?: FormEventHandler;
  children?: React.ReactNode | ((P: { className?: string; form?: FormProps['form'], bindProps: ReturnType<NonNullable<FormProps['form']>['getBindProps']> }) => React.ReactNode);
}

export function bindWrapper(children, props, triggerName = 'onChange') {
  const { bindProps, ...restProps } = props;
  if (typeof children === 'function') {
    return children(props);
  } else {
    const len = React.Children.count(children);
    const cloneBindProps = { ...bindProps, ...restProps };
    if (triggerName) {
      cloneBindProps[triggerName] = (...args) => {
        children?.props?.[triggerName]?.(...args);
        bindProps?.[triggerName]?.(...args);
      };
    }
    if (len === 1 && React.isValidElement(children)) {
      return React.cloneElement(children, cloneBindProps);
    }
    return children;
  }
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
    clearOnUninstall = true,
    ...rest
  } = restProps;

  const fieldProps = { ...restProps, valueProp, valueGetter, trigger };
  const nonform = rest?.nonform || rest?.readOnly;
  const currentPath = (!isValidFormName(name) || nonform === true) ? undefined : name;
  const [value, setValue] = useState<unknown>();
  // 初始化fieldProps
  form?.setFieldProps(currentPath, fieldProps);

  // 订阅更新值的函数
  useEffect(() => {
    if (!isValidFormName(currentPath) || !form) return;
    // 订阅目标控件
    form.subscribeFormItem(currentPath, (newValue, oldValue) => {
      setValue(newValue);
      if (isEmpty(newValue) && isEmpty(oldValue)) return;
      onValuesChange && onValuesChange({ name: currentPath, value: newValue }, form?.getFieldValue());
    });
    return () => {
      form.unsubscribeFormItem(currentPath);
    };
  }, [JSON.stringify(currentPath), form, onValuesChange]);

  // 表单域初始化值
  useEffect(() => {
    if (!isValidFormName(currentPath) || !form) return;
    form?.setFieldProps(currentPath, fieldProps);
    // 回填初始值
    const initValue = initialValue === undefined ? deepGet(initialValues, currentPath) : initialValue;
    if (!isEmpty(initValue)) {
      form.setInitialValue(currentPath, initValue);
    } else {
      const lastValue = form.getFieldValue(currentPath);
      if (clearOnUninstall === true && !isEmpty(lastValue)) {
        setValue(lastValue);
      }
    }
    onFieldsMounted && onFieldsMounted({ name: currentPath, value: initValue }, form?.getFieldValue());
    return () => {
      if (clearOnUninstall === true) {
        // 清除该表单域的props(在设置值的前面)
        form?.setFieldProps(currentPath, undefined);
        // 清除初始值
        form?.setInitialValue(currentPath, undefined);
      }
    };
  }, [JSON.stringify(currentPath)]);

  const bindProps = form && form.getBindProps(currentPath, value) || {};
  const childs = bindWrapper(children, { bindProps, className: errorClassName, form, }, trigger);
  return <>{childs}</>;
};

ItemCore.displayName = "ItemCore";
