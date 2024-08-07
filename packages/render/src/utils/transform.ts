import { deepSet, Form, joinFormPath } from '@simpleform/form';
import React from 'react';
import { CustomRenderType, CustomUnionType, FormRenderProps, GenerateWidgetItem, ReactComponent, RegisteredComponents, WidgetContextProps, WidgetItem, WidgetList } from "../typings";
import { isValidComponent } from "./ReactIs";
import { isEmpty, isObject } from './type';

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
    if (oldItem instanceof Array) {
      cloneConfig[key] = oldItem.concat(newItem);
    } else if (isObject(oldItem) && !React.isValidElement(oldItem)) {
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

// 递归遍历转换嵌套对象的子属性
export const traverseMapObject = (val, callback) => {
  const isElement = React.isValidElement(val);
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

// 匹配字符串表达式
export const matchExpression = (value?: unknown) => {
  if (typeof value === 'string') {
    // /{{([\s\S]+?)}}/g
    const reg = new RegExp('\{\{\s*.*?\s*\}\}', 'g');
    const result = value?.match(reg)?.[0];
    return result;
  }
};

// 递归解析对象或数组中的每个属性
export const evalAttr = <V>(val: V, variables?: object, uneval?: boolean) => {
  const isElement = React.isValidElement(val);
  if (isElement) return val;
  return traverseMapObject(val, (target) => {
    const generateItem = compileExpression(target, variables, uneval);
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
  if (typeof target === 'string' || typeof target === 'number' || React.isValidElement(target as React.ReactNode)) {
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
  if (React.isValidElement(target)) {
    return React.cloneElement(target, props as React.Attributes);
  }
  // 判断是否为声明组件
  const widgetItem = target as GenerateWidgetItem;
  const Com = getFormComponent(widgetItem, widgets);
  if (Com) {
    const mergeProps = Object.assign({}, props, widgetItem?.props) as React.Attributes;
    return React.createElement(Com, mergeProps);
  }
};

// 字符串转换
export const transformStr = (str?: string) => {
  if (typeof str !== 'string') return;
  // 移除{{}}
  let target = str?.replace(/\{\{|\}\}/g, '');
  return target;
};

// 针对值进行表达式解析
export const compileExpression = <V>(value: V, variables?: object, uneval?: boolean) => {
  if (uneval) return value;
  if (typeof value === 'string') {
    const matchStr = matchExpression(value);
    if (matchStr) {
      // 引入变量
      const curVariables = { ...variables };
      const variableKeys = Object.keys(curVariables); // 变量名
      const variableValues = Object.values(curVariables); // 变量
      const target = transformStr(matchStr);
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

// 目标嵌套其他组件
export const withSide = (target?: React.ReactNode, customRender?: CustomRenderType, side?: React.ReactNode, context?: WidgetContextProps) => {
  const childs = typeof customRender === 'function' ? customRender(target, context) : target;
  const childsWithSide = React.isValidElement(side) ? React.cloneElement(side, {}, childs) : childs;
  const cloneChilds = React.isValidElement(childsWithSide) ? React.cloneElement(childsWithSide, { key: context?._options?.path }) : childsWithSide;
  return cloneChilds;
};

export const renderWidgetItem = (
  formrender?: FormRenderProps['formrender'],
  target?: CustomUnionType,
  options?: WidgetContextProps['_options'],
) => {
  if (!formrender) return;
  if (target === undefined || target === null || typeof target === 'string' || typeof target === 'number') {
    return target;
  }
  // 判断是否为ReactElment
  if (React.isValidElement(target)) {
    return React.cloneElement(target, { _options: options } as React.Attributes);
  }
  // 判断是否为ReactComponent
  if (isValidComponent(target)) {
    return React.createElement(target as ReactComponent<unknown>, { _options: options } as React.Attributes);
  }
  const mergeItem = mergeFormOptions(options, target as GenerateWidgetItem) || {};
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
  const typeChildren = children instanceof Array ? children?.map((child, childIndex) => {
    const childOptions = {
      ...options,
      index: childIndex,
      path: joinFormPath(mergeItem?.path, 'children', childIndex)
    };
    return renderWidgetItem(formrender, child, childOptions);
  }) : formrender.createFormElement(children, childContext);
  const curNode = React.isValidElement(typeWidget) && !isEmpty(typeChildren)
    ? React.cloneElement(
      typeWidget,
      {},
      withSide(typeChildren, mergeItem?.renderList, insideEle, childContext)
    )
    : (isEmpty(typeWidget) ? typeChildren : typeWidget);
  const result = isFormWidget ?
    React.createElement(Form.Item, {
      ...restItem,
      footer: formrender.createFormElement(restItem?.footer, childContext),
      suffix: formrender.createFormElement(restItem?.suffix, childContext),
      component: formrender.getFormComponent(restItem?.component),
    },
      (({ bindProps }) => React.isValidElement(curNode) ?
        React.cloneElement(curNode, {
          ...bindProps,
          [triggerName]: (...args) => {
            (curNode?.props as GenerateWidgetItem)?.[triggerName]?.(...args);
            return bindProps[triggerName]?.(...args);
          }
        }) : curNode) as any
    )
    : curNode;
  return withSide(result, mergeItem?.renderItem, outsideEle, childContext);
};
