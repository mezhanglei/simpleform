import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SimpleForm } from './store';
import { FormPathType, pickObject } from './utils/utils';

export function useSimpleForm<T>(
  values?: T
) {
  const formRef = useRef(new SimpleForm(values));
  useFormValues(formRef.current);
  return formRef.current;
}

// 获取error信息
export function useFormError(form?: SimpleForm, path?: string) {
  const [error, setError] = useState<SimpleForm['formErrors'][string]>();

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
    subscribeError();
    return () => {
      form && form.unsubscribeError(path);
    };
  }, [JSON.stringify(path)]);

  return [error, setError] as const;
}

// 获取表单值
export function useFormValues<V>(form: SimpleForm<V>, path?: FormPathType | FormPathType[]) {
  const [formValues, setFomValues] = useState<SimpleForm<V>['values']>();

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
    subscribeForm();
    return () => {
      form && form.unsubscribeFormValues();
    };
  }, [JSON.stringify(path)]);

  return formValues;
}
