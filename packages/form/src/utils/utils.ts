import { pathToArr, deepGet, deepSet, formatFormKey } from "./object";
import { isEmpty } from "./type";
export { pathToArr, deepGet, deepSet, formatFormKey };

// 是否存在前缀
export function isExitPrefix(prefix: string, path: string | string[]) {
  const prefixParts = pathToArr(prefix);
  const parts = pathToArr(path);
  if (prefixParts?.length > parts?.length || !prefixParts?.length || !parts?.length) {
    return false;
  }
  return prefixParts?.every((item, index) => {
    return item == parts[index];
  });
}

// 表单值的键名
export function getValuePropName(valueProp: string | ((type: any) => string), type?: any) {
  return typeof valueProp === 'function' ? valueProp(type) : valueProp;
}

// 表单的值
export function getValueFromEvent(...args: any[]) {
  const e = args[0] as React.ChangeEvent<any>;
  return e && e.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e;
}

// 是否携带中括号
export const isWithBracket = (code?: any) => {
  return typeof code === 'string' && /^\[\d+\]$/.test(code);
};

// 由前到后拼接当前项的表单的path
export function joinFormPath(...args: Array<string | number | undefined>) {
  const result = args instanceof Array ? args.reduce((pre, cur) => {
    const curName = isEmpty(cur) ? '' : (typeof cur === 'number' ? `[${cur}]` : cur);
    const parent = isEmpty(pre) ? '' : (typeof pre === 'number' ? `[${pre}]` : pre);
    if (isWithBracket(curName)) {
      return parent && curName ? `${parent}${curName}` : (curName || parent);
    } else {
      return parent && curName ? `${parent}.${curName}` : (curName || parent);
    }
  }, '') : '';
  return result as string;
};

export function toArray<T>(list?: T | T[]): T[] {
  if (!list) {
    return [];
  }
  return Array.isArray(list) ? list : [list];
}
