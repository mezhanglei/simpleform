import { copy } from "copy-anything";
import { isObject } from "./type";

export function deepClone<T>(value: T) {
  return copy(value);
}

/**
 * 递归去除参数的前后空格
 * @param {*} data 参数
 */
export const trimParams = <V>(data?: V) => {
  if (typeof data === 'string') return data.trim();
  if (data && isObject(data)) {
    for (let key of Object.keys(data)) {
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
export function objectToFormData(obj?: object, formData?: FormData) {
  const fd = (formData instanceof FormData) ? formData : new FormData();
  if (typeof obj !== 'object') return fd;
  let formKey;
  for (let property of Object.keys(obj)) {
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
export const deepMergeObject = <V>(obj1: V, obj2: unknown): V => {
  const obj1Type = Object.prototype.toString.call(obj1);
  const obj2Type = Object.prototype.toString.call(obj2);
  if (obj1Type !== obj2Type || typeof obj2 !== 'object') return obj1;
  const cloneObj = deepClone(obj1);
  for (let key of Object.keys(obj2 || {})) {
    if (isObject(cloneObj[key])) {
      cloneObj[key] = deepMergeObject(cloneObj[key], obj2?.[key]);
    } else {
      cloneObj[key] = obj2?.[key];
    }
  }
  return cloneObj;
};
