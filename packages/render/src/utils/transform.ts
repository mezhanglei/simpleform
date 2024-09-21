import { deepSet, Form, joinFormPath } from '@simpleform/form';
import React from 'react';
import { CustomRenderType, CustomUnionType, FormRenderProps, GenerateWidgetItem, ReactComponent, RegisteredComponents, WidgetContextProps, WidgetItem, WidgetList } from "../typings";
import { cloneElement, createElement, isValidComponent, isValidElement } from "./framework";
import { isEmpty, isObject } from './type';
import serialize from 'serialize-javascript';

// 合并表单配置项(浅合并，嵌套属性合并只允许一层深度)
export const mergeFormOptions = <V>(
  oldConfig: V,
  newConfig?: Partial<V>,
  mergeFunNames: string[] = ['onValuesChange', 'onFieldsMounted', 'onFieldsChange']) => {
  if (!isObject(newConfig)) return oldConfig;
  const cloneConfig = { ...oldConfig };
  Object.keys(newConfig || {}).forEach((key) => {
    const oldItem = oldConfig?.[key];
    const newItem = newConfig?.[key];
    if (isObject(oldItem) && isObject(newItem) && !isValidElement(oldItem)) {
      cloneConfig[key] = { ...oldItem, ...newItem };
    } else if (typeof oldItem === 'function' && mergeFunNames.includes(key)) {
      cloneConfig[key] = (...args: unknown[]) => {
        oldItem?.(...args);
        return newItem?.(...args);
      };
    } else {
      cloneConfig[key] = newItem;
    }
  });
  return cloneConfig;
};

// 匹配字符串表达式
export const matchExpression = (value?: unknown) => {
  if (typeof value === 'string') {
    // /{{([\s\S]+?)}}/g
    const reg = new RegExp('\{\{\s*.*?\s*\}\}', 'g');
    const result = value?.match(reg)?.[0];
    return result;
  }
};

// 序列化成字符串
export const toExpression = (val?: unknown) => {
  if (val === undefined || val === null || val === '') return;
  const str = serialize(val);
  return str ? '{{ ' + str + ' }}' : undefined;
};

// 从序列化字符串转化为js
export const parseExpression = <V>(value: V, variables?: object) => {
  if (typeof value === 'string') {
    const matchStr = matchExpression(value);
    if (matchStr) {
      // 引入变量
      const curVariables = { ...variables };
      const variableKeys = Object.keys(curVariables); // 变量名
      const variableValues = Object.values(curVariables); // 变量
      const target = matchStr?.replace(/\{\{|\}\}/g, '');;
      const codeStr = "return " + target;
      // 函数最后一个参数为函数体，前面均为传入的变量名
      const action = new Function(...variableKeys, codeStr);
      const result = action(...variableValues);
      return result;
    } else {
      return value;
    }
  } else {
    return value;
  }
};

// 递归遍历转换嵌套对象的子属性
export const traverseMapObject = (val, callback) => {
  const isElement = isValidElement(val);
  if (Array.isArray(val)) {
    return val.map((item) => traverseMapObject(item, callback));
  } else if (isObject(val) && !isElement) {
    const temp = {};
    Object.keys(val || {}).forEach(key => {
      const item = val[key];
      temp[key] = traverseMapObject(item, callback);
    });
    return temp;
  }
  return typeof callback === 'function' ? callback(val) : val;
};

// 递归遍历widgetList数据结构
export const traverseWidgetList = <R>(
  list?: WidgetList,
  callback?: (item: WidgetItem, _options: { path: string, index?: number }, children?: R[]) => R,
  parent?: string
) => {
  if (!(list instanceof Array)) return;
  return list.map((item, index) => {
    const curPath = joinFormPath(parent, index);
    const children = traverseWidgetList(item?.children, callback, joinFormPath(curPath, 'children'));
    return callback?.(item, { path: curPath, index }, children);
  });
};

// 递归解析对象或数组中的每个属性
export const evalAttr = <V>(val: V, variables?: object, parser?: FormRenderProps['parser']) => {
  const isElement = isValidElement(val);
  if (isElement || typeof parser !== 'function') return val;
  return traverseMapObject(val, (target) => {
    const generateItem = parser(target, variables);
    return generateItem;
  });
};

// 提取widgetList中的默认值
export const getInitialValues = <V>(widgetList?: WidgetList) => {
  if (!(widgetList instanceof Array)) return;
  let initialValues = {} as V;
  traverseWidgetList(widgetList, (item) => {
    if (item?.initialValue !== undefined && item?.name) {
      initialValues = (deepSet(initialValues, item.name, item?.initialValue) || {}) as V;
    }
  });
  return initialValues;
};

// 返回组件声明或者空
export const getFormComponent = (target?: any, widgets?: RegisteredComponents) => {
  if (target === undefined || target === null) {
    return target;
  }
  if (typeof target === 'string' || typeof target === 'number' || isValidElement(target as React.ReactNode)) {
    return;
  }
  if (isValidComponent(target)) {
    return target as ReactComponent<any>;
  }
  if (isValidComponent(target?.type)) {
    return target?.type;
  }
  if (typeof target?.type === 'string') {
    return widgets?.[target?.type];
  }
};

// 创建元素
export const createFormElement = (target?: CustomUnionType, props?: unknown, widgets?: RegisteredComponents): React.ReactNode => {
  if (target instanceof Array) {
    return target.map((item) => createFormElement(item, props, widgets));
  }
  if (target === undefined || target === null || typeof target === 'string' || typeof target === 'number') {
    return target;
  }
  // 判断是否为ReactElment
  if (isValidElement(target)) {
    return cloneElement(target, props as React.Attributes);
  }
  // 判断是否为声明组件
  const widgetItem = target as GenerateWidgetItem;
  const Com = getFormComponent(widgetItem, widgets);
  if (Com) {
    const mergeProps = Object.assign({}, props, widgetItem?.props) as React.Attributes;
    return createElement(Com, mergeProps);
  }
};

// 目标嵌套其他组件
export const withSide = (target?: React.ReactNode, customRender?: CustomRenderType, side?: React.ReactNode, context?: WidgetContextProps) => {
  const childs = typeof customRender === 'function' ? customRender(target, context) : target;
  const childsWithSide = isValidElement(side) ? cloneElement(side, {}, childs) : childs;
  const cloneChilds = isValidElement(childsWithSide) ? cloneElement(childsWithSide, { key: context?._options?.path }) : childsWithSide;
  return cloneChilds;
};

export const renderWidgetItem = (
  formrender?: FormRenderProps['formrender'],
  target?: WidgetItem | ReactComponent<any> | React.ReactNode,
  baseOptions?: WidgetContextProps['_options'],
) => {
  if (!formrender) return;
  if (target === undefined || target === null || typeof target === 'string' || typeof target === 'number') {
    return target;
  }
  // 判断是否为ReactElment
  if (isValidElement(target)) {
    return cloneElement(target, { _options: baseOptions } as React.Attributes);
  }
  // 判断是否为ReactComponent
  if (isValidComponent(target)) {
    return createElement(target as ReactComponent<unknown>, { _options: baseOptions } as React.Attributes);
  }
  const defineConfig = formrender?.config;
  const generateWidgetItem = evalAttr(
    target,
    {
      form: defineConfig?.form,
      formrender,
      formvalues: defineConfig?.form?.getFieldValue() || {},
      ...defineConfig?.variables,
    },
    defineConfig?.parser
  );
  const mergeItem = mergeFormOptions(baseOptions, generateWidgetItem as GenerateWidgetItem) || {};
  const {
    hidden,
    readOnlyRender,
    type,
    props,
    typeRender,
    inside,
    outside,
    children,
    ...restItem
  } = mergeItem;
  const triggerName = mergeItem?.trigger || 'onChange';
  const childContext = {
    _options: mergeItem
  };
  if (hidden === true) return;
  const isFormWidget = mergeItem?.name ? true : false;
  const insideEle = formrender.createFormElement(inside, childContext);
  const outsideEle = formrender.createFormElement(outside, childContext);
  const readOnlyEle = typeof readOnlyRender === 'function' ? readOnlyRender(childContext) : readOnlyRender;
  const typeRenderEle = typeof typeRender === 'function' ? typeRender(childContext) : typeRender;
  const typeWidget = formrender.createFormElement(mergeItem?.readOnly === true ? readOnlyEle : (typeRenderEle || { type, props }), childContext);
  const typeChildren = children instanceof Array
    ? renderWidgetList(formrender, children, { ...baseOptions, path: joinFormPath(mergeItem?.path, 'children') })
    : formrender.createFormElement(children, childContext);
  const curNode = isValidElement(typeWidget) && !isEmpty(typeChildren)
    ? cloneElement(
      typeWidget,
      {},
      withSide(typeChildren, defineConfig?.renderList, insideEle, childContext)
    )
    : (isEmpty(typeWidget) ? typeChildren : typeWidget);
  const result = isFormWidget ?
    createElement(Form.Item, {
      ...restItem,
      footer: formrender.createFormElement(restItem?.footer, childContext),
      suffix: formrender.createFormElement(restItem?.suffix, childContext),
      component: formrender.getFormComponent(restItem?.component),
    } as React.Attributes,
      (({ bindProps }) => isValidElement(curNode) ?
        cloneElement(curNode, {
          ...bindProps,
          [triggerName]: (...args) => {
            (curNode?.props as GenerateWidgetItem)?.[triggerName]?.(...args);
            return bindProps[triggerName]?.(...args);
          }
        }) : curNode) as any
    )
    : curNode;
  return withSide(result, defineConfig?.renderItem, outsideEle, childContext);
};

export const renderWidgetList = (
  formrender?: FormRenderProps['formrender'],
  widgetList?: WidgetList,
  baseOptions?: WidgetContextProps['_options'],
) => {
  if (!formrender || !(widgetList instanceof Array)) return;
  return widgetList.map((item, index) => {
    const curPath = joinFormPath(baseOptions?.path, index);
    const childOptions = {
      ...baseOptions,
      index,
      path: curPath,
    };
    return renderWidgetItem(formrender, item, childOptions);
  });
};
