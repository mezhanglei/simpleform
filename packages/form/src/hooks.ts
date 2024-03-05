import { useEffect, useMemo, useRef, useState } from 'react';
import { SimpleForm } from './form-store';
import { pickObject } from './utils/object';

export function useSimpleForm<T extends Object = any>(
  values?: Partial<T>
) {
  const formRef = useRef(new SimpleForm(values));
  useFormValues(formRef.current);
  return formRef.current;
}

// 获取error信息
export function useFormError(form?: SimpleForm, path?: string) {
  const [error, setError] = useState();

  const subscribeError = () => {
    if (!path || !form) return;
    form.subscribeError(path, (newVal) => {
      setError(newVal);
    });
  };

  useMemo(() => {
    subscribeError();
  }, [JSON.stringify(path)]);

  // 订阅组件更新错误的函数
  useEffect(() => {
    return () => {
      form && form.unsubscribeError(path);
    };
  }, [JSON.stringify(path)]);

  return [error, setError];
}

// 获取表单值
export function useFormValues<T = unknown>(form: SimpleForm, path?: string | string[]) {
  const [formValues, setFomValues] = useState<T>();

  const subscribeForm = () => {
    if (!form) return;
    form.subscribeFormValues((newVal) => {
      if (path == undefined) {
        setFomValues(newVal);
      } else {
        const keys = path instanceof Array ? path : [path];
        const result = keys ? pickObject(newVal, keys) : newVal;
        setFomValues(result);
      }
    });
  };

  useMemo(() => {
    subscribeForm();
  }, [JSON.stringify(path)]);

  useEffect(() => {
    return () => {
      form && form.unsubscribeFormValues();
    };
  }, [JSON.stringify(path)]);

  return formValues;
}
