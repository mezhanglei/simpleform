import { deepGet } from "../formrender";
import { copy } from "copy-anything";
import { isEmpty, isObject } from "./type";

export function deepClone<T = any>(value: T) {
  return copy(value);
}

/**
 * 递归去除参数的前后空格
 * @param {*} data 参数
 */
export const trimParams = (data: any) => {
  if (typeof data === 'string') return data.trim();
  if (isObject(data)) {
    for (let key in data) {
      data[key] = trimParams(data[key]);
    }
  }
  return data;
};


/**
 * 递归将对象/嵌套对象的数据转化为formdata格式数据
 * @param {Object} obj 传入的对象数据
 * @param {FormData} formData 是否传入已有的formData数据
 */
export function objectToFormData(obj: any, formData?: FormData) {
  const fd = (formData instanceof FormData) ? formData : new FormData();
  let formKey;
  for (let property in obj) {
    if (obj.hasOwnProperty(property)) {
      formKey = property;
      // 如果传入数据的值为对象且不是二进制文件
      if (typeof obj[property] === 'object' && !(obj[property] instanceof File)) {
        objectToFormData(obj[property], fd);
      } else {
        fd.append(formKey, obj[property]);
      }
    }
  }
  return fd;
}

// 深度合并两个对象
export const deepMergeObject = function (obj1: any, obj2: any) {
  const obj1Type = Object.prototype.toString.call(obj1);
  const obj2Type = Object.prototype.toString.call(obj2);
  if (isEmpty(obj1)) return obj2;
  if (obj1Type !== obj2Type) return obj1;
  const cloneObj = deepClone(obj1);
  for (let key in obj2) {
    if (isObject(cloneObj[key])) {
      cloneObj[key] = deepMergeObject(cloneObj[key], obj2[key]);
    } else {
      cloneObj[key] = obj2[key];
    }
  }
  return cloneObj;
};

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
