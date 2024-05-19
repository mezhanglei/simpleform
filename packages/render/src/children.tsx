import React, { useContext, useEffect, useState } from 'react';
import { FormChildrenProps, WidgetItem, GenerateWidgetItem } from './typings';
import { Form, joinFormPath, SimpleFormContext } from '@simpleform/form';
import { isEqual } from './utils/object';
import '@simpleform/form/lib/css/main.css';
import { useSimpleFormRender } from './hooks';
import { isEmpty } from './utils/type';
import { CustomCol, CustomRow } from './components';
import { SimpleFormRender } from './store';
import { evalAttr, withSide } from './utils/transform';

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
  formrender.addPlugin(plugins);

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
        if (key === 'widgetList') {
          // @ts-ignore
          const widgetList = item[key] as WidgetList;
          const curPath = joinFormPath(path, key);
          widgetList.forEach((child, index) => {
            const childPath = joinFormPath(curPath, index);
            deepHandleItem(child, childPath);
          });
        } else {
          // @ts-ignore
          const val = item[key] as WidgetItem;
          const curPath = joinFormPath(path, key);
          const variable = {
            form: form,
            formrender: formrender,
            formvalues: form && form.getFieldValue() || {},
            ...plugins
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

  const getComileWidgetItem = (item?: WidgetItem, path?: string) => {
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

  const renderChild = (item: GenerateWidgetItem | undefined, path: string | undefined, index: number) => {
    if (!item) return;
    const optionsProps = typeof options === 'function' ? options(item) : options;
    const mergeItem = Object.assign({}, optionsProps, item, { props: Object.assign({}, optionsProps?.props, item?.props) });
    if (mergeItem?.hidden === true) return;
    const _options = {
      index,
      path,
      formrender,
      form,
      ...mergeItem
    };
    // 存在name字段就是表单控件字段
    if (mergeItem?.name) {
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
        ...restField
      } = mergeItem;
      const footerInstance = formrender.createFormElement(footer, { _options });
      const suffixInstance = formrender.createFormElement(suffix, { _options });
      const fieldProps = Object.assign({
        footer: footerInstance,
        suffix: suffixInstance,
        component: formrender.getFormComponent(component),
      }, restField);
      let child: React.ReactNode | undefined;
      if (mergeItem?.readOnly === true) {
        // 只读节点
        const readOnlyWidget = formrender.createFormElement(readOnlyRender, { _options });
        child = (
          <Form.Item {...fieldProps}>
            {readOnlyWidget}
          </Form.Item>
        );
      } else {
        const { onValuesChange, ...restFieldProps } = fieldProps;
        const FormWidget = formrender.createFormElement(typeRender || { type, props }, { _options });
        child = (
          <Form.Item
            {...restFieldProps}
            onValuesChange={(...args) => {
              onValuesChange && onValuesChange(...args);
              handleExpression();
            }}>
            {({ bindProps }) => React.isValidElement(FormWidget) ? React.cloneElement(FormWidget, bindProps) : FormWidget}
          </Form.Item>
        );
      }
      return withSide(formrender, child, renderItem, outside, { _options });
    } else {
      const { typeRender, type, props, inside, outside, widgetList } = mergeItem;
      const isHaveWidgetList = widgetList instanceof Array ? true : false;
      const widgetNode = formrender.createFormElement(typeRender || { type, props }, { _options });
      if (isHaveWidgetList) {
        const widgetNodeChildren = widgetList?.map((child, childIndex) => {
          const childPath = joinFormPath(path, 'widgetList', childIndex);
          const compileItem = getComileWidgetItem(child, childPath);
          return renderChild(compileItem, childPath, childIndex);
        });
        const withSideChildren = withSide(formrender, widgetNodeChildren, renderList, inside, { _options });
        const result = React.isValidElement(widgetNode) ?
          React.cloneElement(widgetNode, { children: withSideChildren } as Partial<unknown>)
          : withSideChildren;
        return withSide(formrender, result, renderItem, outside, { _options });
      } else {
        return withSide(formrender, widgetNode, renderItem, outside, { _options });
      }
    }
  };

  const childs = (widgetList || []).map((item, index) => {
    const curPath = `[${index}]`;
    const compileItem = getComileWidgetItem(item, curPath);
    return renderChild(compileItem, curPath, index);
  });
  const withSideChilds = withSide(formrender, childs, renderList, inside, { _options: { formrender, form } });

  return <>{withSideChilds}</>;
}

FormChildren.displayName = 'Form.Children';
