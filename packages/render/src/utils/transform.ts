import { deepSet, joinFormPath } from '@simpleform/form';
import React from 'react';
import { CustomRenderType, CustomUnionType, GenerateWidgetItem, ReactComponent, RegisteredComponents, WidgetContextProps, WidgetItem, WidgetList } from "../typings";
import { isValidComponent } from "./ReactIs";
import { isObject } from './type';

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
export const traverseWidgetList = (list?: WidgetList, callback?: (item: WidgetItem, path: string, index?: number,) => void, parent?: string) => {
  if (!(list instanceof Array)) return;
  list.map((item, index) => {
    const curPath = joinFormPath(parent, index);
    callback?.(item, curPath, index);
    traverseWidgetList(item?.children, callback, joinFormPath(curPath, 'children'));
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
export const getFormComponent = (target?: unknown, registeredComponents?: RegisteredComponents) => {
  if (target === undefined || target === null) {
    return target;
  }
  if (typeof target === 'string' || typeof target === 'number' || React.isValidElement(target as React.ReactNode)) {
    return;
  }
  if (isValidComponent(target)) {
    return target as ReactComponent<any>;
  }
  const widgetItem = target as GenerateWidgetItem;
  const Com = isObject(widgetItem) && registeredComponents ? registeredComponents[widgetItem.type || ''] : null;
  if (Com) {
    return Com;
  }
};

// 创建元素
export const createFormElement = (target?: CustomUnionType, props?: unknown, registeredComponents?: RegisteredComponents): React.ReactNode => {
  if (target instanceof Array) {
    return target.map((item) => createFormElement(item, props, registeredComponents));
  }
  if (target === undefined || target === null || typeof target === 'string' || typeof target === 'number') {
    return target;
  }
  // 判断是否为ReactElment
  if (React.isValidElement(target)) {
    return React.cloneElement(target, props as React.Attributes);
  }
  // 判断是否为声明组件
  if (isValidComponent(target)) {
    return React.createElement(target as ReactComponent<unknown>, props as React.Attributes);
  }
  // 是否为注册组件
  const widgetItem = target as GenerateWidgetItem;
  const Com = isObject(widgetItem) && registeredComponents ? registeredComponents[widgetItem.type || ''] : null;
  if (Com) {
    const mergeProps = Object.assign({}, props, widgetItem?.props) as React.Attributes;
    return React.createElement(Com, mergeProps);
  }
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
      const target = matchStr?.replace(/\{\{|\}\}/g, '');
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

// 目标套上其他组件
export const withSide = (target?: React.ReactNode, customRender?: CustomRenderType, side?: React.ReactNode, params?: WidgetContextProps) => {
  const childs = typeof customRender === 'function' ? customRender(target, params) : target;
  const childsWithSide = React.isValidElement(side) ? React.cloneElement(side, {}, childs) : childs;
  const cloneChilds = React.isValidElement(childsWithSide) ? React.cloneElement(childsWithSide, { key: params?._options?.path }) : childsWithSide;
  return cloneChilds;
};
