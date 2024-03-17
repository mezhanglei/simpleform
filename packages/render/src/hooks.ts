import { useEffect, useMemo, useState } from 'react';
import { SimpleFormRender } from './store';
import { WidgetList } from './types';

export function useSimpleFormRender() {
  return useMemo(() => new SimpleFormRender(), []);
}

// 获取widgetList的state数据
export function useWidgetList(formrender: SimpleFormRender) {
  const [widgetList, setWidgetList] = useState<WidgetList>();

  const subscribeData = () => {
    if (!formrender) return;
    formrender.subscribeWidgetList((newValue) => {
      setWidgetList(newValue);
    });
  };

  useMemo(() => {
    subscribeData();
  }, []);

  useEffect(() => {
    subscribeData();
    return () => {
      formrender && formrender.unsubscribeWidgetList();
    };
  }, []);

  return [widgetList, setWidgetList];
}
