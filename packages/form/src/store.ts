import { deepGet, deepSet, getValuePropName, comparePrefix } from './utils/utils';
import { deepClone } from './utils/object';
import { handleRules, isCanTrigger } from './validator';
import { getRulesTriggers, getTriggers } from './item-core';
import { isEmpty, isObject } from './utils/type';
import { FormItemProps } from './form-item';
import { PathValue } from './typings';

export type FormListener<V> = { path: string, onChange: (newValue?: V, oldValue?: V) => void }

export type FormErrors = Record<string, string | boolean>;

export type FieldProps = FormItemProps;

export type FormFieldsProps = Record<string, FieldProps>;

export class SimpleForm<T = unknown> {

  private formItemListeners: Array<FormListener<unknown>> = [];
  private formValueListeners: Array<FormListener<unknown>> = [];
  private globalFormListeners: Array<FormListener<T>['onChange']> = [];
  private errorListeners: Array<FormListener<ReturnType<SimpleForm['getFieldError']>>> = [];

  private initialValues?: unknown;
  private values?: unknown;
  private lastValues?: unknown;
  private formErrors: FormErrors = {};
  private fieldPropsMap: FormFieldsProps = {};

  public constructor(values?: T) {
    this.initialValues = values;
    this.fieldPropsMap = {};
    this.formErrors = {};
    this.values = deepClone(values);
    this.getFieldValue = this.getFieldValue.bind(this);
    this.getLastValue = this.getLastValue.bind(this);
    this.setFieldValue = this.setFieldValue.bind(this);
    this.setFieldsValue = this.setFieldsValue.bind(this);
    this.getInitialValues = this.getInitialValues.bind(this);
    this.setInitialValue = this.setInitialValue.bind(this);
    this.getFieldError = this.getFieldError.bind(this);
    this.setFieldError = this.setFieldError.bind(this);
    this.setFieldsError = this.setFieldsError.bind(this);

    this.getFieldProps = this.getFieldProps.bind(this);
    this.setFieldProps = this.setFieldProps.bind(this);
    this.getBindProps = this.getBindProps.bind(this);
    this.bindChange = this.bindChange.bind(this);

    this.reset = this.reset.bind(this);
    this.validate = this.validate.bind(this);
    this.notifyForm = this.notifyForm.bind(this);

    this.subscribeError = this.subscribeError.bind(this);
    this.unsubscribeError = this.unsubscribeError.bind(this);
    this.notifyError = this.notifyError.bind(this);

    this.subscribeFormItem = this.subscribeFormItem.bind(this);
    this.unsubscribeFormItem = this.unsubscribeFormItem.bind(this);
    this.notifyFormItem = this.notifyFormItem.bind(this);

    this.subscribeFormValue = this.subscribeFormValue.bind(this);
    this.unsubscribeFormValue = this.unsubscribeFormValue.bind(this);
    this.notifyFormValue = this.notifyFormValue.bind(this);

    this.subscribeGlobalForm = this.subscribeGlobalForm.bind(this);
    this.unsubscribeGlobalForm = this.unsubscribeGlobalForm.bind(this);
    this.notifyGlobalForm = this.notifyGlobalForm.bind(this);
  }

  // 获取
  public getFieldProps(): FormFieldsProps
  public getFieldProps(path: string): FieldProps
  public getFieldProps(path?: string) {
    if (path === undefined) {
      return this.fieldPropsMap;
    } else {
      return this.fieldPropsMap?.[path];
    }
  }

  // 给目标控件绑定change事件
  bindChange(path?: string, eventName?: string, ...args) {
    if (!path) return;
    const props = this.getFieldProps(path);
    const { valueGetter, onFieldsChange } = props || {};
    const newValue = typeof valueGetter == 'function' ? valueGetter(...args) : undefined;
    this.setFieldValue(path, newValue, eventName);
    // 主动onchange事件
    onFieldsChange && onFieldsChange({ name: path, value: newValue }, this.getFieldValue());
  }

  // 给目标控件绑定的props
  getBindProps<V>(path?: string, newValue?: V) {
    if (!path) return;
    const props = this.getFieldProps(path);
    const currentValue = this.getFieldValue(path);
    const { valueProp, valueSetter, trigger, validateTrigger, rules, nonform } = props || {};
    const valuePropName = getValuePropName(valueProp) || "";
    const triggers = getTriggers(trigger, validateTrigger, getRulesTriggers(rules));
    const childValue = typeof valueSetter === 'function' ? valueSetter(currentValue) : (valueSetter ? undefined : currentValue);
    const bindProps = { [valuePropName]: childValue } as Record<string, unknown>;
    if (newValue !== undefined) {
      const newChildValue = typeof valueSetter === 'function' ? valueSetter(newValue) : (valueSetter ? undefined : newValue);
      bindProps[valuePropName] = newChildValue;
    }
    triggers.forEach((eventName) => {
      bindProps[eventName] = (...args) => {
        this.bindChange(path, eventName, ...args);
      };
    });
    return nonform === true ? {} : bindProps;
  }

  // 设置表单域
  public setFieldProps<V>(path: string, field?: V) {
    if (!path) return;
    const lastField = this.fieldPropsMap[path];
    if (field === undefined) {
      if (lastField !== undefined) {
        delete this.fieldPropsMap[path];
      }
    } else {
      const newField = Object.assign({}, lastField, field);
      this.fieldPropsMap[path] = newField;
    };
  }

  // 获取所有表单值，或者单个表单值
  public getFieldValue(): T
  public getFieldValue(path: string): PathValue<T, string>
  public getFieldValue(path?: string | undefined) {
    const val = this.values;
    return path === undefined ? val : deepGet(val, path);
  }

  // 获取旧表单值
  public getLastValue(): T
  public getLastValue(path: string): PathValue<T, string>
  public getLastValue(path?: string) {
    const val = this.lastValues;
    return path === undefined ? val : deepGet(val, path);
  }

  // 初始值设置
  public setInitialValue(path: string, initialValue?: unknown) {
    const oldValue = this.getFieldValue(path);
    if (isEmpty(oldValue) && initialValue === undefined) return;
    this.initialValues = deepSet(this.initialValues, path, initialValue);
    // 旧表单值存储
    this.lastValues = this.values;
    // 设置值
    this.values = deepSet(this.values, path, initialValue);
    this.notifyForm(path);
  }

  public notifyForm(path?: string) {
    this.notifyFormItem(path);
    this.notifyFormValue(path);
    this.notifyGlobalForm();
  }

  // 获取初始值
  public getInitialValues(path?: string) {
    return path === undefined ? this.initialValues : deepGet(this.initialValues, path);
  }

  // 更新表单值，单个表单值或多个表单值
  public setFieldValue(path: object, eventName?: FieldProps['trigger']): void;
  public setFieldValue(path: string, value?: unknown, eventName?: FieldProps['trigger']): void;
  public setFieldValue(path: string | object, value?: unknown, eventName?: FieldProps['trigger']) {
    // 设置单个表单值
    const setFormItemValue = (path: string, value?: unknown, eventName?: FieldProps['trigger']) => {
      // 旧表单值存储
      this.lastValues = this.values;
      // 设置值
      this.values = deepSet(this.values, path, value);
      // 规则
      const fieldProps = this.getFieldProps(path);
      const rules = fieldProps?.['rules'];
      if (rules?.length && rules instanceof Array) {
        // 校验规则
        this.validate(path, eventName);
      }
      this.notifyForm(path);
    };

    if (typeof path === 'string') {
      setFormItemValue(path, value, eventName);
    } else if (isObject(path)) {
      // @ts-ignore
      Promise.all(Object.keys(path).map((n) => setFormItemValue(n, path?.[n])));
    }
  }

  // 设置表单值(覆盖更新)
  public setFieldsValue<V>(values?: V) {
    this.lastValues = this.values;
    this.values = values;
    this.notifyForm();
  }

  // 重置表单
  public reset<V>(endValues?: V) {
    const end = endValues || this.initialValues;
    this.setFieldsError({});
    this.setFieldsValue(end);
  }

  // 获取error信息
  public getFieldError(): FormErrors
  public getFieldError(path: string): FormErrors[string]
  public getFieldError(path?: string) {
    if (path === undefined) {
      return this.formErrors;
    } else {
      return this.formErrors[path];
    }
  }

  // 更新error信息
  private setFieldError(path: string, val?: FormErrors[string]) {
    if (!path) return;
    if (val === undefined) {
      delete this.formErrors[path];
    } else {
      this.formErrors[path] = val;
    }
    this.notifyError(path);
  }

  // 设置error信息(覆盖更新)
  private setFieldsError(erros?: FormErrors) {
    this.formErrors = { ...erros };
    this.notifyError();
  }

  // 校验整个表单或校验表单中的某个控件
  public async validate(path?: string | string[], eventName?: FieldProps['trigger']) {

    const validateError = async (path: string) => {
      this.setFieldError(path, undefined);
      const fieldProps = this.getFieldProps(path) || {};
      const value = this.getFieldValue(path);
      const nonform = fieldProps?.nonform;
      const canTrigger = isCanTrigger(eventName, fieldProps?.['validateTrigger']);
      if (canTrigger && nonform !== true) {
        const rules = fieldProps['rules'];
        const error = await handleRules(rules, value, eventName);
        if (error) {
          this.setFieldError(path, error);
        }
        return error;
      }
    };

    if (typeof path === 'string') {
      const currentError = await validateError(path);
      return {
        error: currentError,
        values: this.getFieldValue()
      };
    } else {
      const fieldPropsMap = this.getFieldProps() || {};
      const keys = path instanceof Array ? path : Object.keys(fieldPropsMap || {});
      const result = await Promise.all(keys?.map((key) => {
        const fieldProps = fieldPropsMap?.[key];
        const rules = fieldProps?.['rules'];
        if (rules instanceof Array) {
          return validateError(key);
        }
      }));
      const currentError = result?.filter((error) => error !== undefined)?.[0];
      return {
        error: currentError,
        values: this.getFieldValue()
      };
    }
  }

  // 订阅当前表单域值的变动(当表单域消失时会卸载)
  public subscribeFormItem(path: string, listener: SimpleForm<T>['formItemListeners'][number]['onChange']) {
    this.formItemListeners.push({
      onChange: listener,
      path: path
    });
    return () => {
      this.unsubscribeFormItem(path);
    };
  }
  // 卸载
  public unsubscribeFormItem(path?: string) {
    if (path === undefined) {
      this.formItemListeners = [];
    } else if (typeof path === 'string') {
      this.formItemListeners = this.formItemListeners.filter((sub) => sub.path !== path);
    }
  }
  // 同步当前表单域值的变化
  private notifyFormItem(path?: string) {
    if (path) {
      this.formItemListeners.forEach((listener) => {
        if (listener?.path === path) {
          listener?.onChange && listener?.onChange(this.getFieldValue(listener.path), this.getLastValue(listener.path));
        }
      });
    } else {
      this.formItemListeners.forEach((listener) => listener.onChange(this.getFieldValue(listener.path), this.getLastValue(listener.path)));
    }
  }

  // 主动订阅路径上所有表单控件的变动(表单控件消失不会卸载)
  public subscribeFormValue(path: string, listener: SimpleForm<T>['formValueListeners'][number]['onChange']) {
    this.formValueListeners.push({
      onChange: listener,
      path: path
    });
    return () => {
      this.unsubscribeFormValue(path);
    };
  }
  // 卸载
  public unsubscribeFormValue(path?: string) {
    if (path === undefined) {
      this.formValueListeners = [];
    } else if (typeof path === 'string') {
      this.formValueListeners = this.formValueListeners.filter((sub) => sub.path !== path);
    }
  }
  // 同步路径上任意节点的变化
  private notifyFormValue(path?: string) {
    if (path) {
      this.formValueListeners.forEach((listener) => {
        if (comparePrefix(listener?.path, path)) {
          listener?.onChange && listener?.onChange(this.getFieldValue(listener.path), this.getLastValue(listener.path));
        }
      });
    } else {
      this.formValueListeners.forEach((listener) => listener.onChange(this.getFieldValue(listener.path), this.getLastValue(listener.path)));
    }
  }

  // 订阅整个表单值(表单控件消失不会卸载)
  public subscribeGlobalForm(listener: SimpleForm<T>['globalFormListeners'][number]) {
    this.globalFormListeners.push(listener);
    return () => {
      this.unsubscribeGlobalForm();
    };
  }
  // 卸载
  public unsubscribeGlobalForm() {
    this.globalFormListeners = [];
  }
  // 同步
  private notifyGlobalForm() {
    this.globalFormListeners.forEach((onChange) => onChange(this.getFieldValue(), this.getLastValue()));
  }

  // 订阅表单错误的变动
  public subscribeError(path: string, listener: SimpleForm<T>['errorListeners'][number]['onChange']) {
    this.errorListeners.push({
      onChange: listener,
      path: path
    });
    return () => {
      this.unsubscribeError(path);
    };
  }
  // 卸载
  public unsubscribeError(path?: string) {
    if (path === undefined) {
      this.errorListeners = [];
    } else if (typeof path === 'string') {
      this.errorListeners = this.errorListeners.filter((sub) => sub.path !== path);
    }
  }
  // 同步错误的变化
  private notifyError(path?: string) {
    if (path) {
      this.errorListeners.forEach((listener) => {
        if (listener?.path === path) {
          listener?.onChange && listener?.onChange(this.getFieldError(path));
        }
      });
    } else {
      this.errorListeners.forEach((listener) => listener.onChange(this.getFieldError(listener.path)));
    }
  }
}
