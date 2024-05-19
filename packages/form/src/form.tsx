import React, { useEffect } from 'react';
import { FormItem, FormItemOptions } from './form-item';
import { SimpleFormContext, FormInitialValuesContext } from './context';
import { ItemProps } from './components/Item';
import { isObject } from './utils/type';
import { SimpleForm } from './store';

interface CreateFormProps extends React.HTMLAttributes<HTMLElement> {
  tagName?: keyof React.ReactHTML;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  onReset?: (e: React.FormEvent<HTMLFormElement>) => void;
}
const CreateForm = React.forwardRef<unknown, CreateFormProps>((props, ref) => {
  const { tagName = "form", ...rest } = props;
  return React.createElement(tagName, { ...rest, ref });
});

export type WatchHandler = <T>(newValue: T, oldValue: T) => void;
export type FormProps<V = any, P = ItemProps> = {
  watch?: { [key: string]: { immediate?: boolean, handler: WatchHandler } | WatchHandler };
  children?: unknown;
  initialValues?: unknown;
  form?: SimpleForm<V>;
} & FormItemOptions<P> & CreateFormProps;

export function Form(props: FormProps) {
  const { className = '', style, children, initialValues, tagName, onSubmit, onReset, watch, ...rest } = props;

  const classNames = 'simple-form ' + className;
  const form = rest?.form;

  useEffect(() => {
    if (!form || !watch) return;
    Object.entries(watch)?.forEach(([key, watcher]) => {
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
  }, [watch]);

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
