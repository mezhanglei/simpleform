import { copy } from 'copy-anything';
import compare from 'react-fast-compare';
import { isEmpty } from './type';
import { isWithBracket } from './utils';

export function deepClone<T = any>(value: T) {
  return copy(value);
}

// 判断两个值是否相等
export function isEqual(a: any, b: any) {
  return compare(a, b);
}

// 接收路径字符串或数组字符串，返回数组字符串表示路径
export function pathToArr(path?: string | Array<string | number>) {
  if (path instanceof Array) return path;
  const regex = /([^\.\[\]]+)|(\[\d+\])/g;
  const parts = typeof path === 'string' && path ? path.match(regex) : [];
  return parts || [];
}

// 格式化字段为对象的键
export function formatFormKey(code?: any) {
  if (typeof code !== 'number' && typeof code !== 'string') return '';
  if (typeof code === 'number') return code;
  return code.toString().replace(/\]/, '').replace(/\[/, '');
}

// 提取对象中的部分属性
export const pickObject = <T = any>(obj: T | undefined, keys: string[] | ((key?: string, value?: any) => boolean)) => {
  if (obj === undefined || obj === null) return obj;
  if (keys instanceof Array) {
    return keys.reduce((iter, key) => {
      const item = deepGet(obj as any, key);
      if (item !== undefined) {
        // @ts-ignore
        iter[key] = item;
      }
      return iter;
    }, {}) as T;
  } else if (typeof keys === 'function') {
    return Object.keys(obj || {}).reduce((iter, key) => {
      // @ts-ignore
      const item = obj[key];
      if (keys(key, item)) {
        // @ts-ignore
        iter[key] = item;
      }
      return iter;
    }, {}) as T;
  }
};

// 根据路径获取目标对象中的单个值或多个值
export function deepGet(obj: any, keys?: string | Array<string | number>): any {
  if (!keys?.length) return;
  if (typeof obj !== 'object') return;
  if (keys instanceof Array) {
    const result = obj instanceof Array ? [] : {};
    for (let key of keys) {
      // @ts-ignore
      result[key] = pathToArr(key)?.reduce?.((o, k) => (o)?.[formatFormKey(key)], obj);
    }
    return result;
  } else {
    // @ts-ignore
    return pathToArr(keys)?.reduce?.((o, k) => (o)?.[formatFormKey(k)], obj);
  }
}

// 给对象目标属性添加值, ['a', 0] 和 ['a', '[0]'] 等同于 'a[0]'
export function deepSet<T = any>(obj: T, path?: string | Array<string | number>, value?: any) {
  const parts = pathToArr(path);
  if (!parts?.length) return obj;
  if (isEmpty(deepGet(obj, path)) && value === undefined) {
    return obj;
  }

  // 判断是否为数组序号
  const isNumberIndex = (code?: string | number) => {
    if (typeof code !== 'number' && typeof code !== 'string') return;
    return typeof code === 'number' ? true : isWithBracket(code);
  };

  let temp: any = isEmpty(obj) ? (isNumberIndex(parts[0]) ? [] : {}) : deepClone(obj);
  const root = temp;

  for (let i = 0; i < parts?.length; i++) {
    const current = formatFormKey(parts[i]);
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
        temp[current] = isNumberIndex(next) ? [] : {};
      }
    }
    // 下个嵌套
    temp = temp[current];
  }
  return root;
}
