import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SimpleForm } from './store';
import { FormPathType } from './utils/utils';

export function useSimpleForm<T>(
  values?: T
) {
  const formRef = useRef(new SimpleForm(values));
  return formRef.current;
}

// 获取error信息
export function useFormError(form?: SimpleForm, path?: string) {
  const [error, setError] = useState<SimpleForm['formErrors'][string]>();

  const subscribe = useCallback(() => {
    if (form?.subscribeError && path) {
      form.subscribeError(path, (newVal) => {
        setError(newVal);
      });
    }
  }, [form?.subscribeError, JSON.stringify(path)]);

  useMemo(() => {
    subscribe?.();
  }, [subscribe]);

  // 订阅组件更新错误的函数
  useEffect(() => {
    subscribe?.();
    return () => {
      form?.unsubscribeError(path);
    };
  }, [subscribe]);

  return [error, setError] as const;
}

// 获取表单值
export function useFormValues<V>(form: SimpleForm<V>, path?: FormPathType) {
  const [values, setValues] = useState<Partial<V>>();
  const keys = path instanceof Array ? path : path !== undefined && [path];

  const subscribe = useCallback(() => {
    if (!form?.subscribeFormValue) return;
    if (keys) {
      keys.forEach((key) => {
        form?.subscribeFormValue(key as string, (newVal) => {
          setValues((old) => old instanceof Array ? [...old, newVal] : ({ ...old, [key]: newVal }));
        });
      });
    } else {
      form?.subscribeFormValue((newVal) => {
        setValues(newVal as Partial<V>);
      });
    }
  }, [form?.subscribeFormValue, JSON.stringify(path)]);

  useMemo(() => {
    subscribe?.();
  }, [subscribe]);

  useEffect(() => {
    subscribe?.();
    return () => {
      form?.unsubscribeFormValue();
    };
  }, [subscribe]);

  return values;
}
