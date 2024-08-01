import React, { useContext, useEffect, useState } from 'react';
import { FormChildrenProps, GenerateWidgetItem } from './typings';
import { joinFormPath, SimpleFormContext } from '@simpleform/form';
import '@simpleform/form/lib/css/main.css';
import { useSimpleFormRender } from './hooks';
import { SimpleFormRender } from './store';
import { evalAttr, renderWidgetItem, traverseWidgetList, withSide } from './utils/transform';

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

  const [widgetList, setWidgetList] = useState<SimpleFormRender['widgetList']>([]);
  const [widgetListMap, setWidgetListMap] = useState<Record<string, GenerateWidgetItem>>({});
  formrender.defineConfig({
    variables: Object.assign({}, plugins, variables),
    registeredComponents: components,
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
    setWidgetList(propsWidgetList || []);
    formrender.setWidgetList(propsWidgetList, { ignore: true });
  }, [propsWidgetList]);

  // 变化时更新
  useEffect(() => {
    if (!widgetList) return;
    handleExpression();
  }, [widgetList]);

  // 递归遍历编译表达式信息
  const handleExpression = () => {
    const data = {};
    traverseWidgetList(widgetList, (item, { path }) => {
      const mergeVariables = {
        form: form,
        formrender: formrender,
        formvalues: form && form.getFieldValue() || {},
        ...plugins,
        ...variables
      };
      data[path] = evalAttr(item, mergeVariables, uneval);
    });
    setWidgetListMap(data);
  };

  const childs = widgetList instanceof Array && widgetList.map((_, index) => {
    const curPath = joinFormPath(index);
    const compileItem = widgetListMap[curPath];
    if (!compileItem) return;
    const optionsProps = typeof options === 'function' ? options(compileItem) : options;
    const childOptions = {
      ..._baseOptions,
      ...optionsProps,
      index,
      path: curPath,
    };
    return renderWidgetItem(formrender, compileItem, childOptions, handleExpression);
  });

  return <>{withSide(childs, renderList, formrender.createFormElement(inside, { _options: _baseOptions }), { _options: _baseOptions })}</>;
}

FormChildren.displayName = 'Form.Children';
