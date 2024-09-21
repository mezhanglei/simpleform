import { saveAs } from 'file-saver';
import { copy } from "copy-anything";
import { isEmpty, isObject } from "./type";
import Clipboard from 'clipboard';
import pickAttrs from './pickAttrs';
import createRequest from './request';
import TableUtils from './tableUtils';
import SimpleUndo from './simpleUndo';
import serialize from 'serialize-javascript';
import renderModal from './renderModal';

export {
  pickAttrs,
  createRequest,
  TableUtils,
  SimpleUndo,
  renderModal,
};

export * from './mime';
export * from './type';
export * from './utils';
export * from './tableUtils';
export * from './request';
export * from './renderModal';

// 转化对象数组为map数据
export interface GetArrMap {
  <T>(arr?: T[], valueKey?: string): Record<string, T>;
  <T>(arr?: T[], valueKey?: string, labelKey?: string): Record<string, T[keyof T]>
}
export const getArrMap = <T>(arr: T[] = [], valueKey?: string, labelKey?: string) => {
  const data = {};
  arr.forEach((item) => item && item[valueKey || ''] !== undefined && (data[item?.[valueKey || '']] = labelKey ? item[labelKey] : item));
  return data as Record<string, T>;
};

// 保存文件
export const saveAsFile = (fileContent: string | File, fileName: string) => {
  const fileBlob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
  saveAs(fileBlob, fileName);
};

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
export const deepMergeObject = <V>(obj1: V, obj2?: unknown): V => {
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

// 复制到剪贴板
export function copyToClipboard(content?: unknown, clickEvent?: Event, successFn?: () => void, errorFn?: () => void) {
  if (typeof content !== 'string') return;
  const el = clickEvent?.target as HTMLElement;
  const clipboard = new Clipboard(el, {
    text: () => content
  });

  clipboard.on('success', () => {
    successFn && successFn();
    clipboard.destroy();
  });

  clipboard.on('error', () => {
    errorFn && errorFn();
    clipboard.destroy();
  });

  (clipboard as any)?.onClick(clickEvent);
}

// 将对象转化为普通字符串
export function convertToString(val?: unknown): string {
  if (isEmpty(val)) return '';
  if (typeof val === 'string') return val;
  return serialize(val);
}

// 将普通字符串转化为js
export function evalString<V>(val: string): V | undefined {
  if (typeof val !== 'string') return;
  try {
    return eval(`(function(){return ${val} })()`);
  } catch (e) {
    console.error(e);
  }
}
