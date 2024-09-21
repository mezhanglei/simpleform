import React, { useContext, useEffect, useState } from 'react';
import { FormChildrenProps } from './typings';
import { SimpleFormContext } from '@simpleform/form';
import '@simpleform/form/lib/css/main.css';
import { useSimpleFormRender } from './hooks';
import { SimpleFormRender } from './store';
import { parseExpression, renderWidgetList, withSide, mergeFormOptions } from './utils/transform';
import { deepClone } from './utils';

// 渲染表单children
export default function FormChildren(props: FormChildrenProps) {
  const curFormrender = useSimpleFormRender();
  const formContext = useContext(SimpleFormContext);
  const {
    wrapper,
    options,
    plugins,
    variables,
    onRenderChange,
    renderList,
    components = {},
    widgetList: propWidgetList,
    parser = parseExpression,
    form = formContext?.form,
    formrender = curFormrender,
  } = props;
  const curVariables = Object.assign({}, plugins, variables);
  formrender.defineConfig({
    ...props,
    parser,
    formrender,
    form,
    components,
    variables: curVariables,
  });

  const _baseOptions = {
    ...formContext,
    ...(typeof options === 'function' ? options() : options),
    formrender,
    form,
  };

  const [widgetList, setWidgetList] = useState<SimpleFormRender['widgetList']>([]);

  // 从SimpleFormRender中订阅更新widgetList
  useEffect(() => {
    if (formrender.subscribeWidgetList) {
      formrender.subscribeWidgetList((newValue, oldValue) => {
        setWidgetList(newValue || []);
        onRenderChange?.(newValue, oldValue);
      });
    }
    return () => {
      formrender?.unsubscribeWidgetList();
    };
  }, [formrender.subscribeWidgetList, onRenderChange]);

  // 从props中同步widgetList, 不触发subscribeWidgetList监听
  useEffect(() => {
    if (!formrender) return;
    const cloneData = deepClone(propWidgetList);
    setWidgetList(cloneData || []);
    formrender.setWidgetList(cloneData, { ignore: true });
  }, [propWidgetList]);

  const childs = renderWidgetList(formrender, widgetList, mergeFormOptions(_baseOptions, {
    // 监听表单值，重新渲染
    onValuesChange: () => {
      setWidgetList(old => [...old]);
    },
  }));

  return <>{
    withSide(
      childs,
      renderList,
      formrender.createFormElement(wrapper, { _options: _baseOptions }), { _options: _baseOptions })
  }</>;
}

FormChildren.displayName = 'Form.Children';
