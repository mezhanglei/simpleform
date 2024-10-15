import React from "react";
import { isObject } from "./type";

// 合并配置项(浅合并，嵌套属性合并只允许一层深度)
export const mergeFormOptions = <V>(
  oldConfig: V,
  newConfig?: Partial<V>,
  mergeFunNames: string[] = []) => {
  if (!isObject(newConfig)) return oldConfig;
  const cloneConfig = { ...oldConfig };
  Object.keys(newConfig || {}).forEach((key) => {
    const oldItem = oldConfig?.[key];
    const newItem = newConfig?.[key];
    if (isObject(oldItem) && isObject(newItem) && !React.isValidElement(oldItem)) {
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
