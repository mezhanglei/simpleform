import React, { useContext, useEffect, useState } from 'react';
import { GenerateParams, CustomUnionType, CustomRenderType, FormChildrenProps, WidgetList, WidgetItem, GenerateWidgetItem } from './types';
import { Form, joinFormPath, SimpleFormContext } from '@simpleform/form';
import { isEqual } from './utils/object';
import '@simpleform/form/lib/css/main.css';
import { matchExpression } from './utils/utils';
import { useSimpleFormRender } from './hooks';
import { isEmpty, isObject } from './utils/type';
import { CustomCol, CustomRow } from './components';

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

  const [widgetList, setWidgetList] = useState<WidgetList>([]);
  const [compileData, setCompileData] = useState<Record<string, any>>({});
  formrender.registry(Object.assign({}, defaultComponents, components));
  formrender.addPlugin(plugins);

  // 从SimpleFormRender中订阅更新widgetList
  useEffect(() => {
    if (!formrender) return;
    formrender.subscribeWidgetList((newValue, oldValue) => {
      setWidgetList(newValue);
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

  // 递归检测对象
  const evalAttr = (val: any): any => {
    const isElement = React.isValidElement(val);
    if (isElement) {
      return val;
    } else if (val instanceof Array) {
      return val.map((item) => {
        return evalAttr(item);
      });
    } else if (isObject(val)) {
      return Object.fromEntries(
        Object.entries(val || {})?.map(
          ([propsKey, propsItem]) => {
            return [propsKey, evalAttr(propsItem)];
          }
        )
      );
    } else {
      const generateItem = compileExpression(val, uneval);
      return generateItem;
    }
  };

  // 递归遍历编译表达式信息
  const handleExpression = () => {
    if (!(widgetList instanceof Array)) return;
    const compileData: Record<string, any> = {};
    const deepHandleItem = (item: WidgetItem, path: string) => {
      for (const key of Object.keys(item)) {
        if (key === 'widgetList') {
          // @ts-ignore
          const widgetList = item[key] as WidgetList;
          const curPath = joinFormPath(path, key);
          widgetList.forEach((child, index) => {
            const childPath = joinFormPath(curPath, `[${index}]`);
            deepHandleItem(child, childPath);
          });
        } else {
          // @ts-ignore
          const val = item[key];
          const curPath = joinFormPath(path, key);
          if (isObject(val) || val instanceof Array) {
            compileData[curPath] = evalAttr(val);
          } else {
            const matchStr = matchExpression(val);
            if (matchStr) {
              const result = compileExpression(val, uneval);
              compileData[curPath] = result;
            }
          }
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

  // 值兼容字符串表达式
  const compileExpression = (value?: unknown, uneval?: boolean): any => {
    if (uneval) return value;
    if (typeof value === 'string') {
      const matchStr = matchExpression(value);
      if (matchStr) {
        // 引入变量
        const variable = {
          form: form,
          formrender: formrender,
          formvalues: form && form.getFieldValue() || {},
          ...plugins
        };
        const variableKeys = Object.keys(variable); // 变量名
        const variableValues = Object.values(variable); // 变量
        const target = matchStr?.replace(/\{\{|\}\}/g, '');
        const codeStr = "return " + target;
        // 函数最后一个参数为函数体，前面均为传入的变量名
        const action = new Function(...variableKeys, codeStr);
        const result = action(...variableValues);
        return compileExpression(result, uneval);
      } else {
        return value;
      }
    } else {
      return value;
    }
  };

  // 目标套上其他组件
  const withSide = (children: any, side?: CustomUnionType, render?: CustomRenderType, commonProps?: GenerateParams) => {
    const childs = typeof render === 'function' ? render(Object.assign({ children }, commonProps)) : children;
    const renderSide = side && formrender.createFormElement(side, Object.assign({}, commonProps));
    const childsWithSide = React.isValidElement(renderSide) ? React.cloneElement(renderSide, { children: childs } as Partial<unknown>) : childs;
    const cloneChilds = React.isValidElement(childsWithSide) ? React.cloneElement(childsWithSide, { key: commonProps?.path }) : childsWithSide;
    return cloneChilds;
  };

  const renderChild = (item: GenerateWidgetItem | undefined, path: string | undefined, index: number) => {
    if (!item) return;
    const optionsProps = typeof options === 'function' ? options(item) : options;
    const mergeItem = Object.assign({}, optionsProps, item, { props: Object.assign({}, optionsProps?.props, item?.props) });
    if (mergeItem?.hidden === true) return;
    const commonParams = {
      index,
      path,
      widgetItem: mergeItem,
      formrender,
      form
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
      const footerInstance = formrender.createFormElement(footer, commonParams);
      const suffixInstance = formrender.createFormElement(suffix, commonParams);
      const fieldProps = Object.assign({
        footer: footerInstance,
        suffix: suffixInstance,
        component: formrender.getFormComponent(component),
      }, restField);
      let child;
      if (mergeItem?.readOnly === true) {
        // 只读节点
        const readOnlyWidget = formrender.createFormElement(readOnlyRender, commonParams);
        child = (
          <Form.Item {...fieldProps}>
            {readOnlyWidget}
          </Form.Item>
        );
      } else {
        const { onValuesChange, ...restFieldProps } = fieldProps;
        const FormWidget = formrender.createFormElement(typeRender || { type, props }, commonParams);
        child = (
          <Form.Item
            {...restFieldProps}
            onValuesChange={(...args) => {
              onValuesChange && onValuesChange(...args);
              handleExpression();
            }}>
            {({ bindProps }: any) => React.isValidElement(FormWidget) ? React.cloneElement(FormWidget, bindProps) : FormWidget}
          </Form.Item>
        );
      }
      return withSide(child, outside, renderItem, commonParams);
    } else {
      const { typeRender, type, props, inside, outside, widgetList } = mergeItem;
      const isHaveWidgetList = widgetList instanceof Array ? true : false;
      const widgetNode = formrender.createFormElement(typeRender || { type, props }, commonParams);
      if (isHaveWidgetList) {
        const widgetNodeChildren = widgetList?.map((child, childIndex) => {
          const childPath = joinFormPath(path, 'widgetList', childIndex);
          const compileItem = getComileWidgetItem(child, childPath);
          return renderChild(compileItem, childPath, childIndex);
        });
        const withSideChildren = withSide(widgetNodeChildren, inside, renderList, commonParams);
        const result = React.isValidElement(widgetNode) ?
          React.cloneElement(widgetNode, { children: withSideChildren } as Partial<unknown>)
          : withSideChildren;
        return withSide(result, outside, renderItem, commonParams);
      } else {
        return withSide(widgetNode, outside, renderItem, commonParams);
      }
    }
  };

  const childs = (widgetList || []).map((item, index) => {
    const curPath = `[${index}]`;
    const compileItem = getComileWidgetItem(item, curPath);
    return renderChild(compileItem, curPath, index);
  });

  return withSide(childs, inside, renderList, { formrender, form });
}

FormChildren.displayName = 'Form.Children';
