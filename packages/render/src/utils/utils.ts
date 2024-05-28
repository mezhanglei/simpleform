import { arrayMove } from "./array";
import { pathToArr, deepSet, joinFormPath, deepGet } from "@simpleform/form";
import { WidgetItem, WidgetList } from "../typings";

// 匹配字符串表达式
export const matchExpression = (value?: unknown) => {
  if (typeof value === 'string') {
    // /\{\{(.*)\}\}/
    const reg = new RegExp('\{\{\s*.*?\s*\}\}', 'g');
    const result = value?.match(reg)?.[0];
    return result;
  }
};

// 获取路径的末尾节点
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
export const setItemByPath = (widgetList?: WidgetList, data?: unknown, path?: string) => {
  const pathArr = pathToArr(path);
  // 无路径时表示设置当前值
  if (pathArr.length == 0) return data as WidgetList;
  return deepSet(widgetList, path, data);
};

// 根据path获取指定路径的项
export type GetItemByPath = {
  (widgetList?: WidgetList): WidgetList | undefined;
  <V>(widgetList?: WidgetList, path?: string): V | undefined;
}
export const getItemByPath: GetItemByPath = (widgetList?: WidgetList, path?: string) => {
  return deepGet(widgetList, path);
};

// 根据index获取目标项
export const getKeyValueByIndex = <V>(widgetList?: WidgetList, index?: number, parent?: string) => {
  if (!(widgetList instanceof Array) || typeof index !== 'number') return;
  const container = (parent ? getItemByPath(widgetList, parent) : widgetList) as (Array<V> | Record<string, V>);
  if (!container) return;
  const childKeys = Object.keys(container || {});
  const isList = container instanceof Array;
  const key = isList ? index : childKeys[index];
  return [key, container[key]] as [string, V];
};

// 转化为有序列表
export const toEntries = <T>(data: T) => {
  if (!data) return { isList: false, entries: [] };
  const temp = [] as Array<unknown>;
  const isList = data instanceof Array;
  for (let key of Object.keys(data)) {
    const value = data[key];
    const item = [key, value];
    temp.push(item);
  }
  return {
    isList,
    entries: temp as Array<T extends Array<infer I> | Record<string, infer I> ? [string, I] : unknown>
  };
};

// 从有序列表中还原源数据
export type ParseEntries = {
  <T>(entries: Array<[string, T]>): Record<string, T>;
  <T>(entries: Array<[string, T]>, isList: boolean): Array<T> | Record<string, T>;
}
export const parseEntries: ParseEntries = <T>(entries: Array<[string, T]>, isList?: boolean) => {
  if (isList) {
    const temp = [] as unknown[];
    for (let i = 0; i < entries.length; i++) {
      const item = entries[i];
      temp[i] = item && item[1];
    }
    return temp as Array<T>;
  } else {
    return Object.fromEntries(entries);
  }
};

// 插入数据
export const insertItemByIndex = <V>(widgetList?: WidgetList, data?: V | Array<V>, index?: number, parent?: string) => {
  if (!data) return;
  const container = (parent ? getItemByPath(widgetList, parent) : widgetList) as (Array<V> | Record<string, V>);
  const entriesData = toEntries(container);
  const isList = entriesData?.isList;
  const addItems = isList ? Object.entries(data instanceof Array ? data : [data]) : Object.entries(data || {});
  if (typeof index === 'number') {
    entriesData?.entries?.splice(index, 0, ...addItems);
  } else {
    entriesData?.entries?.push(...addItems);
  }
  const changedChilds = parseEntries(entriesData.entries, entriesData.isList);
  return setItemByPath(widgetList, changedChilds, parent);
};

// 同级调换位置
export const moveSameLevel = (widgetList: WidgetList | undefined, from: { parent?: string, index: number }, to: { parent?: string, index?: number }) => {
  // 拖拽源
  const fromParentPath = from?.parent;
  const fromIndex = from?.index;
  // 拖放源
  const toParentPath = to?.parent;
  let toIndex = to?.index;
  // 同域排序
  if (fromParentPath === toParentPath) {
    const fromParent = (fromParentPath ? getItemByPath(widgetList, fromParentPath) : widgetList) as (Array<unknown> | Record<string, unknown>);
    // 转成列表以便排序
    const entriesData = toEntries(fromParent);
    const entries = entriesData?.entries;
    toIndex = typeof toIndex === 'number' ? toIndex : entries?.length;
    entriesData.entries = arrayMove(entries, fromIndex, toIndex);
    const result = parseEntries(entriesData.entries, entriesData.isList);
    return setItemByPath(widgetList, result, fromParentPath);
  }
};

// 跨级调换位置
export const moveDiffLevel = (widgetList: WidgetList | undefined, from: { parent?: string, index: number }, to: { parent?: string, index?: number }) => {
  // 拖拽源
  const fromParentPath = from?.parent;
  const fromIndex = from?.index;
  const fromLen = getPathLen(fromParentPath);
  const keyValue = getKeyValueByIndex(widgetList, fromIndex, fromParentPath);
  if (!keyValue) return widgetList;
  const insertItem = parseEntries([keyValue], typeof keyValue[0] === 'number');
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
export const getInitialValues = <V>(widgetList?: WidgetList) => {
  if (!(widgetList instanceof Array)) return;
  let initialValues = {} as V;
  const deepHandleItem = (item: WidgetItem, path: string) => {
    for (const key of Object.keys(item)) {
      const val = item[key];
      if (key === 'children' && val instanceof Array) {
        const curPath = joinFormPath(path, key);
        val.forEach((child, index) => {
          const childPath = joinFormPath(curPath, index);
          deepHandleItem(child, childPath);
        });
      } else {
        if (key === 'initialValue' && item?.name && val !== undefined) {
          initialValues = (deepSet(initialValues, item.name, val) || {}) as V;
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
