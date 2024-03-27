import * as ReactIs from "react-is";
import { isEmpty } from "./type";

// 是否为组件(不包括html标签字符串)
export function isValidComponent(component?: any) {
  if (isEmpty(component) || typeof component === 'string') return;
  return ReactIs.isValidElementType(component);
};
