import { PathValue } from "../typings";
import { ItemCoreProps } from "../item-core";
import { deepClone } from "./object";
import { isArray, isEmpty, isObject } from "./type";

export type FormPathType = string | number | Array<string | number>;
// 接收路径字符串或数组字符串，返回数组字符串表示路径
export function pathToArr(path?: FormPathType) {
  if (path instanceof Array) return path;
  if (typeof path === 'number') return [path];
  const regex = /([^\.\[\]]+)|(\[\d+\])/g;
  const parts = typeof path === 'string' ? path.match(regex) : [];
  return parts || [];
}

// 格式化字段为对象的键
export function formatFormKey(code?: unknown) {
  if (typeof code !== 'number' && typeof code !== 'string') return '';
  if (typeof code === 'number') return code;
  return code.toString().replace(/\]/, '').replace(/\[/, '');
}

// 提取对象中的部分属性
export const pickObject = <T, K extends FormPathType = string>(obj: T | undefined, keys: Array<K> | ((key?: keyof T, value?: T[keyof T]) => boolean)) => {
  if (obj === undefined || obj === null) return obj;
  if (!isObject(obj) && !isArray(obj)) return;
  const initial = {} as Record<string, unknown>;
  if (keys instanceof Array) {
    for (const k of keys) {
      const changedKey = typeof k === 'string' || typeof k === 'number' ? k : joinFormPath(k);
      const item = deepGet(obj, changedKey);
      if (item !== undefined) {
        initial[changedKey.toString()] = item;
      }
    }
  } else {
    const objKeys = Object.keys(obj) as Array<keyof T>;
    for (const k of objKeys) {
      const item = obj[k];
      if (keys(k, item) && item !== undefined) {
        initial[k as string] = item;
      }
    }
  }
  return initial as PathValue<T, K>;
};

// 根据路径获取目标对象中的单个值或多个值
export function deepGet<T>(obj?: T, keys?: string | number) {
  if (typeof obj !== 'object') return;
  if (!isObject(obj) && !isArray(obj)) return;
  const parts = pathToArr(keys);
  if (!parts?.length) return;
  let temp = obj as unknown;
  for (const k of parts) {
    const key = formatFormKey(k);
    temp = (temp as object)?.[key];
  }
  return temp as PathValue<T, keyof typeof keys>;
}

// 给对象目标属性添加值, ['a', 0] 和 ['a', '[0]'] 等同于 'a[0]'
export function deepSet<T, P extends FormPathType>(obj?: T, path?: P, value?: unknown) {
  const parts = pathToArr(path);
  if (!parts?.length) return obj;
  // 有值但是非对象和数组的不允许赋值
  if (obj && !isObject(obj) && !isArray(obj)) return obj;

  const isIndex = <N>(code: N) => (typeof code === 'number' ? true : isWithBracket(code));
  let temp = (isEmpty(obj) ? (isIndex(parts[0]) ? [] : {}) : deepClone(obj)) as Record<string, unknown>;
  const cloneData = temp as T;
  for (let i = 0; i < parts?.length; i++) {
    const curKey = formatFormKey(parts[i]);
    const nextKey = parts[i + 1];
    if (temp[curKey] === undefined && value === undefined) {
      return cloneData;
    }
    // 最后一个
    if (i === parts?.length - 1) {
      if (value === undefined) {
        if (temp instanceof Array) {
          temp?.splice(+curKey, 1);
        } else {
          delete temp?.[curKey];
        }
      } else {
        temp[curKey] = value;
      }
    } else {
      if (isEmpty(temp[curKey])) {
        temp[curKey] = isIndex(nextKey) ? [] : {};
      }
      temp = temp[curKey] as Record<string, unknown>;
    }
  }
  return cloneData;
}

// 对比路径，分辨是不是匹配的上前缀
export function comparePrefix(prefix: FormPathType, path: FormPathType) {
  const prefixParts = pathToArr(prefix);
  const parts = pathToArr(path);
  if (!parts?.length) return false;
  if (prefixParts?.length !== parts?.length) return false;
  return prefixParts?.every((item, index) => {
    return item == parts[index];
  });
}

// 表单值的键名
export function getValuePropName(valueProp?: ItemCoreProps['valueProp'], type?: string) {
  return typeof valueProp === 'function' ? valueProp(type || '') : valueProp;
}

// 从事件对象中取值
export function getValueFromEvent<V extends unknown>(val: V) {
  const eventTarget = (val as React.ChangeEvent<HTMLInputElement>)?.target;
  if (eventTarget) {
    return eventTarget.type === 'checkbox' ? eventTarget.checked : eventTarget.value;
  }
  return val;
}

// 是否携带中括号
export const isWithBracket = (code?: unknown) => {
  return typeof code === 'string' && /^\[\d+\]$/.test(code);
};

// 由前到后拼接当前项的表单的path
export function joinFormPath(...args: Array<unknown>) {
  if (!(args instanceof Array)) return '';
  return args.reduce<string>((pre, cur) => {
    const curName = typeof cur === 'string' ? cur : (typeof cur === 'number' ? `[${cur}]` : '');
    const parent = typeof pre === 'string' ? pre : (typeof pre === 'number' ? `[${pre}]` : '');
    if (isWithBracket(curName)) {
      return parent && curName ? `${parent}${curName}` : (curName || parent);
    } else {
      return parent && curName ? `${parent}.${curName}` : (curName || parent);
    }
  }, '');
};

export function toArray<T>(list?: T | T[]): T[] {
  if (!list) {
    return [];
  }
  return Array.isArray(list) ? list : [list];
}
