import { useCallback, useEffect, useMemo, useState } from 'react';
import { SimpleFormRender } from './store';
import { FormChildrenProps } from './typings';

/* eslint-disable */
export function useSimpleFormRender() {
  return useMemo(() => new SimpleFormRender(), []);
}

// 获取widgetList的state数据
export function useWidgetList(formrender: SimpleFormRender, callback?: Function) {
  const [widgetList, setWidgetList] = useState<FormChildrenProps['widgetList']>();

  const subscribe = useCallback(() => {
    if (formrender?.subscribeWidgetList) {
      formrender.subscribeWidgetList((newValue, oldValue) => {
        setWidgetList(newValue);
        callback?.(newValue, oldValue);
      });
    }
  }, [formrender?.subscribeWidgetList, callback]);

  useMemo(() => {
    subscribe?.();
  }, [subscribe]);

  useEffect(() => {
    subscribe?.();
    return () => {
      if (formrender) {
        formrender.unsubscribeWidgetList();
      }
    };
  }, [subscribe]);

  return [widgetList, setWidgetList] as const;
}
/* eslint-enable */
