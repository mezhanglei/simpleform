import React from 'react';
import { CustomWidget, GenerateParams } from "../types";
import { isValidComponent } from "./ReactIs";
import { isEmpty, isObject } from './type';

export interface ComponentsMap {
  [key: string]: React.ComponentType;
}
// 是否为注册组件
const isRegistered = (target?: any, typeMap?: ComponentsMap): React.ComponentType | null => {
  const Com = isObject(target) && typeMap ? typeMap[(target as CustomWidget).type || ''] : null;
  return Com;
};

// 是声明组件则返回，否则返回空
export const getFormComponent = (target: any, typeMap?: ComponentsMap): React.ComponentType | undefined | null => {
  // 是否为空
  if (isEmpty(target)) return target;
  // 如果是react元素则返回空
  if (React.isValidElement(target)) return null;
  // 是否为注册组件
  const Com = isRegistered(target, typeMap);
  if (Com) {
    return Com;
  }
  if (isValidComponent(target)) return target;
  return null;
};

// 生成组件实例
export const createFormElement = (target?: any, typeMap?: ComponentsMap, commonProps?: GenerateParams): any => {
  // 如果为列表
  if (target instanceof Array) return target.map((item) => createFormElement(item, typeMap, commonProps));
  // 是否为注册组件
  const Com = getFormComponent(target, typeMap);
  if (Com) {
    const { children, ...rest } = target?.props || {};
    const mergeProps = Object.assign({}, commonProps, rest);
    return React.createElement(Com, mergeProps, createFormElement(children, typeMap, commonProps));
  }
  // 是否为React元素
  if (React.isValidElement(target) || typeof target === 'string' || typeof target === 'number') return target;
  return null;
};
