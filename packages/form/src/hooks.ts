import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SimpleForm } from './store';
import { deepGet, deepSet, FormPathType, isIndexCode, joinFormPath, pathToArr } from './utils/utils';

export function useSimpleForm<T>(
  values?: T
) {
  const formRef = useRef(new SimpleForm(values));
  return formRef.current;
}

// 获取error信息
export function useFormError(form?: SimpleForm, path?: FormPathType) {
  const [error, setError] = useState<ReturnType<SimpleForm['getFieldError']>>();

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
export function useFormValues<V>(form: SimpleForm<V>, path?: FormPathType | Array<FormPathType>) {
  const [mapData, setMapData] = useState<Partial<V>>();

  const subscribe = useCallback(() => {
    if (!form?.subscribeFormValue) return;
    form?.subscribeFormValue((newVal) => {
      if (path) {
        const isArr = path instanceof Array ? isIndexCode(pathToArr(path[0])?.[0]) : isIndexCode(pathToArr(path)?.[0]);
        const initial = isArr ? [] : {};
        if (path instanceof Array) {
          let temp = initial;
          path.forEach((formPath) => {
            const item = deepGet(newVal, formPath);
            if (item !== undefined) {
              temp = deepSet(temp, formPath, item) as any;
            }
          });
          setMapData(temp as Partial<V>);
        } else {
          const result = deepGet(newVal, path) || initial;
          setMapData(result as Partial<V>);
        }
      } else {
        setMapData(newVal as Partial<V>);
      }
    });
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

  return mapData;
}
