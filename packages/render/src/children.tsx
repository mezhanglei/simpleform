import React, { useContext, useEffect, useState } from 'react';
import { FormChildrenProps, GenerateWidgetItem, WidgetList, ReactComponent, WidgetContextProps } from './typings';
import { Form, joinFormPath, SimpleFormContext } from '@simpleform/form';
import { isEqual } from './utils/object';
import '@simpleform/form/lib/css/main.css';
import { useSimpleFormRender } from './hooks';
import { isEmpty } from './utils/type';
import { CustomCol, CustomRow } from './components';
import { SimpleFormRender } from './store';
import { evalAttr, traverseWidgetList, withSide } from './utils/transform';
import { isValidComponent } from './utils';

const defaultComponents = {
  'row': CustomRow,
  'col': CustomCol,
  'Form.Item': Form.Item
};

// 渲染表单children
export default function FormChildren(props: FormChildrenProps) {
  const curFormrender = useSimpleFormRender();
  const { form: curForm } = useContext(SimpleFormContext);
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

  const [widgetList, setWidgetList] = useState<SimpleFormRender['widgetList']>([]);
  const [compileItems, setCompileItems] = useState<Record<string, GenerateWidgetItem>>({});
  formrender.registry(Object.assign({}, defaultComponents, components));
  formrender.addModule(plugins);
  formrender.addModule(variables);

  // 从SimpleFormRender中订阅更新widgetList
  useEffect(() => {
    if (!formrender) return;
    formrender.subscribeWidgetList((newValue, oldValue) => {
      setWidgetList(newValue || []);
      if (!isEqual(newValue, oldValue)) {
        onRenderChange && onRenderChange(newValue, oldValue);
      }
    });
    return () => {
      formrender?.unsubscribeWidgetList();
    };
  }, [formrender, onRenderChange]);

  // 从props中更新widgetList
  useEffect(() => {
    if (!formrender) return;
    formrender.setWidgetList(propsWidgetList);
  }, [propsWidgetList]);

  // 变化时更新
  useEffect(() => {
    if (!widgetList) return;
    handleExpression();
  }, [widgetList]);

  // 递归遍历编译表达式信息
  const handleExpression = () => {
    const data = {};
    traverseWidgetList(widgetList, (item, path) => {
      const mergeVariables = {
        form: form,
        formrender: formrender,
        formvalues: form && form.getFieldValue() || {},
        ...plugins,
        ...variables
      };
      data[path] = evalAttr(item, mergeVariables, uneval);
    });
    setCompileItems(data);
  };

  const baseContext = {
    _options: {
      formrender,
      form,
    },
  } as WidgetContextProps;

  const renderChild = (widgetList?: WidgetList, parent?: string) => {
    if (!(widgetList instanceof Array) || !formrender) return;
    return widgetList.map((item, index) => {
      const curPath = joinFormPath(parent, `[${index}]`);
      const itemProps = {
        _options: {
          ...baseContext['_options'],
          index,
          path: curPath
        }
      };
      if (item === undefined || item === null || typeof item === 'string' || typeof item === 'number') {
        return item;
      }
      // 判断是否为ReactElment
      if (React.isValidElement(item)) {
        return React.cloneElement(item, itemProps);
      }
      // 判断是否为ReactComponent
      if (isValidComponent(item)) {
        return React.createElement(item as ReactComponent<unknown>, itemProps as React.Attributes);
      }
      const compileItem = compileItems[curPath];
      if (!compileItem) return;
      const optionsProps = typeof options === 'function' ? options(compileItem) : options;
      const mergeItem = Object.assign({}, optionsProps, compileItem, { props: Object.assign({}, optionsProps?.props, compileItem?.props) });
      const mergeProps = {
        _options: {
          ...itemProps['_options'],
          ...mergeItem
        }
      };
      const {
        hidden,
        readOnlyRender,
        type,
        props,
        typeRender,
        footer,
        suffix,
        component,
        inside,
        outside,
        children,
        onValuesChange,
        ...restField
      } = mergeItem;
      if (hidden === true) return;
      const footerEle = formrender.createFormElement(footer, mergeProps);
      const suffixEle = formrender.createFormElement(suffix, mergeProps);
      const insideEle = formrender.createFormElement(inside, mergeProps);
      const outsideEle = formrender.createFormElement(outside, mergeProps);
      const fieldProps = Object.assign({
        footer: footerEle,
        suffix: suffixEle,
        component: formrender.getFormComponent(component),
      }, restField);
      const typeWidget = formrender.createFormElement(mergeItem?.readOnly === true ? readOnlyRender : (typeRender || { type, props }), mergeProps);
      const typeChildren = children instanceof Array ? renderChild(children, joinFormPath(curPath, 'children')) : formrender.createFormElement(children, mergeProps);
      const curNode = React.isValidElement(typeWidget) && !isEmpty(typeChildren)
        ? React.cloneElement(
          typeWidget,
          {},
          withSide(typeChildren, renderList, insideEle, mergeProps)
        )
        : (isEmpty(typeWidget) ? typeChildren : typeWidget);
      const result = mergeItem?.name ?
        <Form.Item
          {...fieldProps}
          onValuesChange={(...args) => {
            onValuesChange && onValuesChange(...args);
            handleExpression();
          }}>
          {({ bindProps }) => React.isValidElement(curNode) ? React.cloneElement(curNode, bindProps) : curNode}
        </Form.Item>
        : curNode;
      return withSide(result, renderItem, outsideEle, mergeProps);
    });
  };

  return <>{withSide(renderChild(widgetList), renderList, formrender.createFormElement(inside, baseContext), baseContext)}</>;
}

FormChildren.displayName = 'Form.Children';
