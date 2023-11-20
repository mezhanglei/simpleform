import { copy } from 'copy-anything';
import compare from 'react-fast-compare';
import { isEmpty, isNumberStr } from './type';

export function deepClone<T = any>(value: T) {
  return copy(value);
}

// 判断两个值是否相等
export function isEqual(a: any, b: any) {
  return compare(a, b);
}

// 接收路径字符串或数组字符串，返回数组字符串表示路径
export function pathToArr(path?: string | string[]) {
  if (path instanceof Array) return path;
  const parts = typeof path === 'string' && path ? path.replace(/\]$/, '').replace(/^\[/, '').split(/\.\[|\]\[|\[|\]\.|\]|\./g) : [];
  return parts;
}

// 提取对象中的部分属性
export const pickObject = <T = any>(obj: T | undefined, keys: string[] | ((key?: string, value?: any) => boolean)) => {
  if (obj === undefined || obj === null) return obj;
  if (keys instanceof Array) {
    return keys.reduce((iter, key) => {
      const item = deepGet(obj as any, key);
      if (item !== undefined) {
        iter[key] = item;
      }
      return iter;
    }, {}) as T;
  } else if (typeof keys === 'function') {
    return Object.keys(obj || {}).reduce((iter, key) => {
      const item = obj[key];
      if (keys(key, item)) {
        iter[key] = item;
      }
      return iter;
    }, {}) as T;
  }
};

// 根据路径获取目标对象中的单个值或多个值
export function deepGet(obj: object | undefined, keys?: string | string[]): any {
  if (!keys?.length) return;
  if (keys instanceof Array) {
    const result = obj instanceof Array ? [] : {};
    for (let key of keys) {
      result[key] = pathToArr(key)?.reduce?.((o, k) => (o)?.[k], obj);
    }
    return result;
  } else {
    return pathToArr(keys)?.reduce?.((o, k) => (o)?.[k], obj);
  }
}

// 给对象目标属性添加值, path：['a', 0] 等同于 'a[0]'
export function deepSet<T = any>(obj: T, path: string | string[], value: any) {
  const parts = pathToArr(path);
  if (!parts?.length) return obj;

  // 是否为数组序号
  const isIndex = (str?: string) => {
    return Array.isArray(path) ? isNumberStr(str) : path?.indexOf(`[${str}]`) > -1;
  };

  let temp: any = isEmpty(obj) ? (isIndex(parts[0]) ? [] : {}) : deepClone(obj);
  const root = temp;

  for (let i = 0; i < parts?.length; i++) {
    const current = parts[i];
    const next = parts[i + 1];

    const handleTarget = () => {
      if (value === undefined) {
        if (temp instanceof Array) {
          const index = +current;
          temp?.splice(index, 1);
        } else {
          delete temp[current];
        }
      } else {
        temp[current] = value;
      }
    };

    if (i === parts?.length - 1) {
      handleTarget();
    } else {
      const currentValue = temp[current];
      if (isEmpty(currentValue)) {
        // 如果目标值也是赋值undefined则提前结束查找
        if (value == undefined) {
          handleTarget();
          return root;
        }
        temp[current] = isIndex(next) ? [] : {};
      }
    }
    // 下个嵌套
    temp = temp[current];
  }
  return root;
}
