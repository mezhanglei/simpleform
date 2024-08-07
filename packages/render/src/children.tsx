import React, { useContext, useEffect, useState } from 'react';
import { FormChildrenProps } from './typings';
import { joinFormPath, SimpleFormContext } from '@simpleform/form';
import '@simpleform/form/lib/css/main.css';
import { useSimpleFormRender } from './hooks';
import { SimpleFormRender } from './store';
import { evalAttr, renderWidgetItem, withSide } from './utils/transform';
import { deepClone } from './utils';

// 渲染表单children
export default function FormChildren(props: FormChildrenProps) {
  const curFormrender = useSimpleFormRender();
  const { form: curForm, ...restOptions } = useContext(SimpleFormContext);
  const {
    uneval,
    components,
    plugins = {},
    variables = {},
    onRenderChange,
    renderItem,
    renderList,
    inside,
    widgetList: propsWidgetList,
    form = curForm,
    formrender = curFormrender,
    options
  } = props;

  const _baseOptions = {
    ...restOptions,
    formrender,
    form,
    renderItem,
    renderList
  };

  const mergeVariables = {
    form,
    formrender,
    formvalues: form && form.getFieldValue() || {},
    ...plugins,
    ...variables
  };

  const [widgetList, setWidgetList] = useState<SimpleFormRender['widgetList']>([]);

  formrender.defineConfig({
    variables: Object.assign({}, plugins, variables),
    components: components,
  });

  // 从SimpleFormRender中订阅更新widgetList
  useEffect(() => {
    if (formrender.subscribeWidgetList) {
      formrender.subscribeWidgetList((newValue, oldValue) => {
        setWidgetList(newValue || []);
        onRenderChange && onRenderChange(newValue, oldValue);
      });
    }
    return () => {
      formrender?.unsubscribeWidgetList();
    };
  }, [formrender.subscribeWidgetList, onRenderChange]);

  // 从props中同步widgetList, 不触发subscribeWidgetList监听
  useEffect(() => {
    if (!formrender) return;
    const cloneData = deepClone(propsWidgetList);
    setWidgetList(cloneData || []);
    formrender.setWidgetList(cloneData, { ignore: true });
  }, [propsWidgetList]);

  const childs = widgetList instanceof Array && widgetList.map((item, index) => {
    const curPath = joinFormPath(index);
    const generateWidgetItem = evalAttr(item, mergeVariables, uneval);
    if (!generateWidgetItem) return;
    const optionsProps = typeof options === 'function' ? options(generateWidgetItem) : options;
    const childOptions = {
      ..._baseOptions,
      ...optionsProps,
      index,
      path: curPath,
      // 监听表单值，重新渲染
      onValuesChange: () => {
        setWidgetList(old => [...old]);
      },
    };
    return renderWidgetItem(formrender, generateWidgetItem, childOptions);
  });

  return <>{withSide(childs, renderList, formrender.createFormElement(inside, { _options: _baseOptions }), { _options: _baseOptions })}</>;
}

FormChildren.displayName = 'Form.Children';
