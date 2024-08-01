import { useCallback, useEffect, useMemo, useState } from 'react';
import { SimpleFormRender } from './store';
import { WidgetList } from './typings';

export function useSimpleFormRender() {
  return useMemo(() => new SimpleFormRender(), []);
}

// 获取widgetList的state数据
export function useWidgetList(formrender: SimpleFormRender, callback?: Function) {
  const [widgetList, setWidgetList] = useState<WidgetList>();

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
      formrender && formrender.unsubscribeWidgetList();
    };
  }, [subscribe]);

  return [widgetList, setWidgetList] as const;
}
