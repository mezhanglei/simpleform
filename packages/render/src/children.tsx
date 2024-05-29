import React, { useContext, useEffect, useState } from 'react';
import { FormChildrenProps, WidgetItem, GenerateWidgetItem, WidgetList, ReactComponent } from './typings';
import { Form, joinFormPath, SimpleFormContext } from '@simpleform/form';
import { isEqual } from './utils/object';
import '@simpleform/form/lib/css/main.css';
import { useSimpleFormRender } from './hooks';
import { isEmpty } from './utils/type';
import { CustomCol, CustomRow } from './components';
import { SimpleFormRender } from './store';
import { evalAttr, withSide } from './utils/transform';
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
  const [compileData, setCompileData] = useState<Record<string, unknown>>({});
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
    if (!(widgetList instanceof Array)) return;
    const compileData: Record<string, unknown> = {};
    const deepHandleItem = (item: WidgetItem, path: string) => {
      for (const key of Object.keys(item)) {
        const val = item[key];
        if (key === 'children' && val instanceof Array) {
          const curPath = joinFormPath(path, key);
          val.forEach((child, index) => {
            const childPath = joinFormPath(curPath, index);
            deepHandleItem(child, childPath);
          });
        } else {
          const curPath = joinFormPath(path, key);
          const variable = {
            form: form,
            formrender: formrender,
            formvalues: form && form.getFieldValue() || {},
            ...plugins,
            ...variables
          };
          compileData[curPath] = evalAttr(val, variable, uneval);
        }
      }
    };

    widgetList.forEach((item, index) => {
      const path = `[${index}]`;
      deepHandleItem(item, path);
    });

    setCompileData(compileData);
  };

  const getComileWidgetItem = (item?: WidgetItem, path?: string): GenerateWidgetItem | undefined => {
    if (isEmpty(item)) return;
    return Object.fromEntries(
      Object.entries(item || {})?.map(
        ([propsKey, propsValue]) => {
          const curPath = joinFormPath(path, propsKey);
          if (curPath in compileData) {
            if (propsKey === 'valueSetter' || propsKey === 'valueGetter') {
              return [propsKey, compileData[curPath] ? compileData[curPath] : () => undefined];
            }
            return [propsKey, compileData[curPath]];
          } else {
            return [propsKey, propsValue];
          }
        }
      )
    );
  };

  const _baseOptions = {
    formrender,
    form,
  };

  const renderChild = (widgetList?: WidgetList, parent?: string) => {
    if (!(widgetList instanceof Array) || !formrender) return;
    return widgetList.map((item, index) => {
      const curPath = joinFormPath(parent, `[${index}]`);
      const _options = {
        index,
        path: curPath,
        ..._baseOptions
      };
      if (item === undefined || item === null || typeof item === 'string' || typeof item === 'number') {
        return item;
      }
      // 判断是否为ReactElment
      if (React.isValidElement(item)) {
        return React.cloneElement(item, { _options });
      }
      // 判断是否为声明组件
      if (isValidComponent(item)) {
        return React.createElement(item as ReactComponent<unknown>, { _options } as React.Attributes);
      }
      const compileItem = getComileWidgetItem(item, curPath);
      if (!compileItem) return;
      const optionsProps = typeof options === 'function' ? options(compileItem) : options;
      const mergeItem = Object.assign({}, optionsProps, compileItem, { props: Object.assign({}, optionsProps?.props, compileItem?.props) });
      const commonProps = {
        _options: {
          ..._options,
          ...mergeItem
        },
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
      const footerEle = formrender.createFormElement(footer, commonProps);
      const suffixEle = formrender.createFormElement(suffix, commonProps);
      const insideEle = formrender.createFormElement(inside, commonProps);
      const outsideEle = formrender.createFormElement(outside, commonProps);
      const fieldProps = Object.assign({
        footer: footerEle,
        suffix: suffixEle,
        component: formrender.getFormComponent(component),
      }, restField);
      const typeWidget = formrender.createFormElement(mergeItem?.readOnly === true ? readOnlyRender : (typeRender || { type, props }), commonProps);
      const typeChildren = children instanceof Array ? renderChild(children, joinFormPath(curPath, 'children')) : formrender.createFormElement(children, commonProps);
      const curNode = React.isValidElement(typeWidget) && !isEmpty(typeChildren)
        ? React.cloneElement(
          typeWidget,
          {},
          withSide(typeChildren, renderList, insideEle, commonProps)
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
      return withSide(result, renderItem, outsideEle, commonProps);
    });
  };

  return <>{withSide(renderChild(widgetList), renderList, formrender.createFormElement(inside, { _options: _baseOptions }), { _options: _baseOptions })}</>;
}

FormChildren.displayName = 'Form.Children';
