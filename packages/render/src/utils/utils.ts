import { arrayMove } from "./array";
import { pathToArr, deepSet, joinFormPath, deepGet } from "@simpleform/form";
import { isObject } from "./type";
import { WidgetItem, WidgetList } from "../types";

// 匹配字符串表达式
export const matchExpression = (value?: any) => {
  if (typeof value === 'string') {
    // /\{\{(.*)\}\}/
    const reg = new RegExp('\{\{\s*.*?\s*\}\}', 'g');
    const result = value?.match(reg)?.[0];
    return result;
  }
};

// 获取路径的末尾节点字符串(不带中括号)
export const getPathEnd = (path?: string) => {
  const pathArr = pathToArr(path);
  const end = pathArr?.pop();
  return end;
};

// 根据路径返回父路径(兼容a[0],a.[0],a.b, a[0].b形式的路径)
export const getParent = (path?: string) => {
  const pathArr = pathToArr(path);
  pathArr?.pop();
  return joinFormPath(...pathArr);
};

// 获取路径的长度
export const getPathLen = (path?: string) => {
  const pathArr = pathToArr(path);
  return pathArr.length;
};

// 设置指定路径的值
export const setItemByPath = (widgetList: WidgetList, data?: any, path?: string) => {
  const pathArr = pathToArr(path);
  if (pathArr.length == 0) return data;
  return deepSet(widgetList, path, data);
};

// 根据path获取指定路径的项
export const getItemByPath = (widgetList?: WidgetList, path?: string) => {
  return deepGet(widgetList, path);
};

// 根据index获取目标项
export const getKeyValueByIndex = (widgetList: WidgetList, index?: number, parent?: string) => {
  if (!(widgetList instanceof Array) || typeof index !== 'number') return;
  const container = parent ? getItemByPath(widgetList, parent) : widgetList;
  if (!isObject(container) && !(container instanceof Array)) return;
  const childKeys = Object.keys(container || {});
  const isList = container instanceof Array;
  const key = isList ? index : childKeys[index];
  return [key, container[key]] as [string | number, any];
};

// 转化为有序列表
export const toEntries = (data: any) => {
  const temp: Array<[string, any]> = [];
  const isList = data instanceof Array;
  for (let key of Object.keys(data || {})) {
    const value = data[key];
    temp.push([key, value]);
  }
  return {
    isList,
    entries: temp
  };
};

// 从有序列表中还原源数据
const parseEntries = (entriesData?: { entries: Array<[string | number, any]>, isList?: boolean }) => {
  const { isList, entries = [] } = entriesData || {};
  if (isList) {
    const temp = [];
    for (let i = 0; i < entries.length; i++) {
      const item = entries[i];
      temp[i] = item && item[1];
    }
    return temp;
  } else {
    return Object.fromEntries(entries);
  }
};

// 插入数据
export const insertItemByIndex = (widgetList: WidgetList, data?: WidgetItem | Array<WidgetItem>, index?: number, parent?: string) => {
  const container = parent ? getItemByPath(widgetList, parent) : widgetList;
  const entriesData = toEntries(container);
  const isList = entriesData?.isList;
  const addItems = isList ? Object.entries(data instanceof Array ? data : [data]) : Object.entries(data || {});
  if (typeof index === 'number') {
    entriesData?.entries?.splice(index, 0, ...addItems);
  } else {
    entriesData?.entries?.push(...addItems);
  }
  const changedChilds = parseEntries(entriesData);
  return setItemByPath(widgetList, changedChilds, parent);
};

// 同级调换位置
export const moveSameLevel = (widgetList: WidgetList, from: { parent?: string, index: number }, to: { parent?: string, index?: number }) => {
  // 拖拽源
  const fromParentPath = from?.parent;
  const fromIndex = from?.index;
  // 拖放源
  const toParentPath = to?.parent;
  let toIndex = to?.index;
  // 同域排序
  if (fromParentPath === toParentPath) {
    const fromParent = fromParentPath ? getItemByPath(widgetList, fromParentPath) : widgetList;
    // 转成列表以便排序
    const entriesData = toEntries(fromParent);
    const entries = entriesData?.entries;
    toIndex = typeof toIndex === 'number' ? toIndex : entries?.length;
    entriesData.entries = arrayMove(entries, fromIndex, toIndex);
    const result = parseEntries(entriesData);
    return setItemByPath(widgetList, result, fromParentPath);
  }
};

// 跨级调换位置
export const moveDiffLevel = (widgetList: WidgetList, from: { parent?: string, index: number }, to: { parent?: string, index?: number }) => {
  // 拖拽源
  const fromParentPath = from?.parent;
  const fromIndex = from?.index;
  const fromLen = getPathLen(fromParentPath);
  const keyValue = getKeyValueByIndex(widgetList, fromIndex, fromParentPath);
  if (!keyValue) return widgetList;
  const insertItem = parseEntries({ isList: typeof keyValue[0] === 'number', entries: [keyValue] });
  const fromPath = joinFormPath(fromParentPath, keyValue[0]);
  // 拖放源
  const toParentPath = to?.parent;
  const toIndex = to?.index;
  const toLen = getPathLen(toParentPath);
  // 先计算内部变动，再计算外部变动
  if (fromLen > toLen || !toLen) {
    const result = setItemByPath(widgetList, undefined, fromPath);
    return insertItemByIndex(result, insertItem, toIndex, toParentPath);
  } else {
    const result = insertItemByIndex(widgetList, insertItem, toIndex, toParentPath);
    return setItemByPath(result, undefined, fromPath);
  }
};

// 提取widgetList中的默认值
export const getInitialValues = (widgetList?: WidgetList) => {
  if (!(widgetList instanceof Array)) return;
  let initialValues = {};
  const deepHandleItem = (item: WidgetItem, path: string) => {
    for (const key of Object.keys(item)) {
      if (key === 'widgetList') {
        // @ts-ignore
        const widgetList = item[key] as WidgetList;
        const curPath = joinFormPath(path, key);
        widgetList.forEach((child, index) => {
          const childPath = joinFormPath(curPath, `[${index}]`);
          deepHandleItem(child, childPath);
        });
      } else {
        // @ts-ignore
        const val = item[key];
        if (key === 'initialValue' && item?.name && val !== undefined) {
          initialValues = deepSet(initialValues, item.name, val);
        }
      }
    }
  };

  widgetList.forEach((item, index) => {
    const path = `[${index}]`;
    deepHandleItem(item, path);
  });
  return initialValues;
};
