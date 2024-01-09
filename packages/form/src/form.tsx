import React, { CSSProperties, useEffect } from 'react';
import { FormItem } from './form-item';
import { SimpleForm } from './form-store';
import { SimpleFormContext, FormInitialValuesContext } from './form-context';
import { FormList } from './form-list';
import { ItemCoreProps } from './item-core';
import { ItemProps } from './components/Item';
import { isObject } from './utils/type';

interface CreateFormProps extends React.HTMLAttributes<HTMLElement> {
  tagName?: keyof React.ReactHTML;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  onReset?: (e: React.FormEvent<HTMLFormElement>) => void;
}
const CreateForm = React.forwardRef<any, CreateFormProps>((props, ref) => {
  const { tagName = "form", ...rest } = props;
  return React.createElement(tagName, { ...rest, ref });
});

export type WatchHandler = (newValue: any, oldValue: any) => void;
export type FormProps<S = SimpleForm, T = ItemProps> = T & ItemCoreProps & {
  className?: string;
  form?: S;
  watch?: { [key: string]: { immediate?: boolean, handler: WatchHandler } | WatchHandler };
  style?: CSSProperties;
  children?: any;
  initialValues?: any;
  component?: any;
} & CreateFormProps;

export function Form(props: FormProps) {
  const { className = '', style, children, initialValues, tagName, onSubmit, onReset, watch, ...rest } = props;

  const classNames = 'simple-form ' + className;
  const form = rest?.form;

  useEffect(() => {
    if (!form || !watch) return;
    Object.entries(watch)?.map(([key, watcher]) => {
      // 函数形式
      if (typeof watcher === 'function') {
        form?.subscribeFormValue(key, watcher);
        // 对象形式
      } else if (isObject(watcher)) {
        if (typeof watcher.handler === 'function') {
          form?.subscribeFormValue(key, watcher.handler);
        }
        if (watcher.immediate) {
          watcher.handler(form?.getFieldValue(key), form?.getLastValue(key));
        }
      }
    });
    return () => {
      Object.entries(watch || {})?.forEach(([key]) => {
        form?.unsubscribeFormValue(key);
      });
    };
  }, [form, watch]);

  return (
    <CreateForm
      tagName={tagName}
      className={classNames}
      style={style}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(e);
      }}
      onReset={onReset}
    >
      <SimpleFormContext.Provider value={rest}>
        <FormInitialValuesContext.Provider value={initialValues}>
          {children}
        </FormInitialValuesContext.Provider>
      </SimpleFormContext.Provider>
    </CreateForm>
  );
}

Form.Item = FormItem;
Form.List = FormList;
