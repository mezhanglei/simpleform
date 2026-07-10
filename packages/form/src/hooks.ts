import { useCallback, useEffect, useRef, useState } from "react";
import { SimpleForm } from "./store";
import {
  deepGet,
  deepSet,
  FormPathType,
  isIndexCode,
  pathToArr,
} from "./utils/utils";

export function useSimpleForm<T>(values?: T) {
  const formRef = useRef(new SimpleForm(values));
  return formRef.current;
}

// 获取error信息
export function useFormError(form?: SimpleForm, path?: FormPathType) {
  const [error, setError] = useState<ReturnType<SimpleForm["getFieldError"]>>();

  const errorWatcher = useCallback(
    (newVal) => {
      setError(newVal);
    },
    [JSON.stringify(path)]
  );

  // 订阅组件更新错误的函数
  useEffect(() => {
    if (!form) return;
    const uninstall = form.subscribeError(path, errorWatcher);
    return () => {
      uninstall?.();
    };
  }, [errorWatcher]);

  return [error, setError] as const;
}

// 获取表单值
export function useFormValues<V>(
  form: SimpleForm<V>,
  path?: FormPathType | Array<FormPathType>
) {
  const [formData, setFormData] = useState<Partial<V>>();

  const formWatcher = useCallback(
    (newVal) => {
      if (path) {
        const isArr =
          path instanceof Array
            ? isIndexCode(pathToArr(path[0])?.[0])
            : isIndexCode(pathToArr(path)?.[0]);
        if (path instanceof Array) {
          let temp = isArr ? [] : {};
          path.forEach((formPath) => {
            const item = deepGet(newVal, formPath);
            if (item !== undefined) {
              temp = deepSet(temp, formPath, item) as any;
            }
          });
          setFormData(temp as Partial<V>);
        } else {
          const result = deepGet(newVal, path);
          setFormData(result as Partial<V>);
        }
      } else {
        setFormData(newVal as Partial<V>);
      }
    },
    [JSON.stringify(path)]
  );

  useEffect(() => {
    if (!form) return;
    const uninstall = form?.subscribeFormValue(formWatcher);
    return () => {
      uninstall();
    };
  }, [formWatcher]);

  return formData;
}
