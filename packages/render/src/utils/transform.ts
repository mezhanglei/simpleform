import React from 'react';
import { SimpleFormRender } from '../store';
import { CustomRenderType, CustomUnionType, CustomWidget, ReactComponent, RegisteredComponents, WidgetContextProps } from "../typings";
import { isValidComponent } from "./ReactIs";
import { isObject } from './type';
import { matchExpression } from './utils';

// 返回注册组件
const getRegistered = (target?: unknown, typeMap?: RegisteredComponents) => {
  const Com = isObject(target) && typeMap ? typeMap[(target as CustomWidget).type || ''] : null;
  return Com;
};

// 是声明组件则返回，否则返回空
export const getFormComponent = (target?: unknown, typeMap?: RegisteredComponents) => {
  if (target === undefined) return;
  // 如果是react元素则返回空
  if (React.isValidElement(target as React.ReactNode)) return null;
  const Com = getRegistered(target, typeMap);
  if (Com) {
    return Com;
  } else if (isValidComponent(target)) {
    return target as ReactComponent<unknown>;
  }
  return null;
};

// 生成组件实例
export const createFormElement = (target?: unknown, typeMap?: RegisteredComponents, commonProps?: unknown): React.ReactNode => {
  // 如果为列表
  if (target instanceof Array) return target.map((item) => createFormElement(item, typeMap, commonProps));
  // 是否为注册组件
  const Com = getFormComponent(target, typeMap);
  if (Com) {
    const { children, ...rest } = (target as CustomWidget)?.props || {};
    const mergeProps = Object.assign({}, commonProps, rest) as React.Attributes;
    return React.createElement(Com, mergeProps, createFormElement(children, typeMap, commonProps));
  }
  // 是否为React元素
  if (React.isValidElement(target as React.ReactNode) || typeof target === 'string' || typeof target === 'number') return target as React.ReactNode;
  return null;
};

// 针对值进行表达式解析
export const compileExpression = <V, P extends object = {}>(value: V, plugins?: P, uneval?: boolean) => {
  if (uneval) return value;
  if (typeof value === 'string') {
    const matchStr = matchExpression(value);
    if (matchStr) {
      // 引入变量
      const variable = { ...plugins };
      const variableKeys = Object.keys(variable); // 变量名
      const variableValues = Object.values(variable); // 变量
      const target = matchStr?.replace(/\{\{|\}\}/g, '');
      const codeStr = "return " + target;
      // 函数最后一个参数为函数体，前面均为传入的变量名
      const action = new Function(...variableKeys, codeStr);
      const result = action(...variableValues);
      return compileExpression(result, plugins, uneval);
    } else {
      return value;
    }
  } else {
    return value;
  }
};

// 递归解析对象或数组中的每个属性
export const evalAttr = <V, P extends object = {}>(val: V, plugins?: P, uneval?: boolean) => {
  const isElement = React.isValidElement(val);
  if (isElement) return val;
  if (val instanceof Array) {
    return val.map((item) => {
      return evalAttr(item, plugins, uneval);
    });
  } else if (isObject(val)) {
    return Object.fromEntries(
      Object.entries(val || {})?.map(
        ([propsKey, propsItem]) => {
          return [propsKey, evalAttr(propsItem, plugins, uneval)];
        }
      )
    );
  } else {
    const generateItem = compileExpression(val, plugins, uneval);
    return generateItem;
  }
};

// 目标套上其他组件
export const withSide = (formrender: SimpleFormRender, target?: React.ReactNode, render?: CustomRenderType, side?: CustomUnionType, params?: WidgetContextProps) => {
  const childs = typeof render === 'function' ? render(target, params) : target;
  const renderSide = formrender.createFormElement(side, params);
  const childsWithSide = React.isValidElement(renderSide) ? React.cloneElement(renderSide, { children: childs } as React.Attributes) : childs;
  const cloneChilds = React.isValidElement(childsWithSide) ? React.cloneElement(childsWithSide, { key: params?._options?.path }) : childsWithSide;
  return cloneChilds;
};
