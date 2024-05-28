import React from 'react';
import { CustomRenderType, CustomUnionType, GenerateWidgetItem, ReactComponent, RegisteredComponents, WidgetContextProps } from "../typings";
import { isValidComponent } from "./ReactIs";
import { isObject } from './type';
import { matchExpression } from './utils';

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
  if (target instanceof Array) {
    return target.map((item) => createFormElement(item, props, registeredComponents));
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
export const compileExpression = <V, P extends object = {}>(value: V, variables?: P, uneval?: boolean) => {
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
      return compileExpression(result, curVariables, uneval);
    } else {
      return value;
    }
  } else {
    return value;
  }
};

// 递归解析对象或数组中的每个属性
export const evalAttr = <V, P extends object = {}>(val: V, variables?: P, uneval?: boolean) => {
  const isElement = React.isValidElement(val);
  if (isElement) return val;
  if (val instanceof Array) {
    return val.map((item) => {
      return evalAttr(item, variables, uneval);
    });
  } else if (isObject(val)) {
    return Object.fromEntries(
      Object.entries(val || {})?.map(
        ([propsKey, propsItem]) => {
          return [propsKey, evalAttr(propsItem, variables, uneval)];
        }
      )
    );
  } else {
    const generateItem = compileExpression(val, variables, uneval);
    return generateItem;
  }
};

// 目标套上其他组件
export const withSide = (target?: React.ReactNode, customRender?: CustomRenderType, side?: React.ReactNode, params?: WidgetContextProps) => {
  const childs = typeof customRender === 'function' ? customRender(target, params) : target;
  const childsWithSide = React.isValidElement(side) ? React.cloneElement(side, {}, childs) : childs;
  const cloneChilds = React.isValidElement(childsWithSide) ? React.cloneElement(childsWithSide, { key: params?._options?.path }) : childsWithSide;
  return cloneChilds;
};
