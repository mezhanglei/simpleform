import React from "react";
import { isValidElementType } from "react-is";
import { isEmpty } from "./type";

// 是否为组件(不包括html标签字符串)
export function isValidComponent(component?: unknown) {
  if (isEmpty(component) || typeof component === 'string') return false;
  return isValidElementType(component);
};

export const isValidElement = <T>(val?: T | React.ReactElement): val is React.ReactElement => {
  return React.isValidElement(val);
};

export const createElement = (...args: Parameters<typeof React.createElement>): ReturnType<typeof React.createElement> => {
  return React.createElement(...args);
};

export const cloneElement = (...args: Parameters<typeof React.cloneElement>): ReturnType<typeof React.cloneElement> => {
  return React.cloneElement(...args);
};
