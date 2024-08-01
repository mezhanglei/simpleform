import { isValidElementType } from "react-is";
import { isEmpty } from "./type";

// 是否为组件(不包括html标签字符串)
export function isValidComponent(component?: unknown) {
  if (isEmpty(component) || typeof component === 'string') return false;
  return isValidElementType(component);
};
