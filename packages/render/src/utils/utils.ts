import { arrayMove } from "./array";
import { pathToArr, deepSet, joinFormPath, deepGet, FormPathType } from "@simpleform/form";
import { WidgetList } from "../typings";

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
export const setItemByPath = <V>(widgetList?: V, data?: unknown, path?: string) => {
  const pathArr = pathToArr(path);
  // 无路径时表示设置当前值
  if (pathArr.length == 0) return data as V;
  return deepSet(widgetList, path, data);
};

// 根据path获取指定路径的项
export const getItemByPath = <V, Path extends FormPathType = string>(widgetList?: V, path?: Path) => {
  return deepGet(widgetList, path);
};

// 根据index获取目标项
export const getKeyValueByIndex = <V>(widgetList?: WidgetList, index?: number, parent?: string) => {
  if (!(widgetList instanceof Array) || typeof index !== 'number') return;
  const container = (parent ? getItemByPath(widgetList, parent) : widgetList);
  if (!container) return;
  const childKeys = Object.keys(container || {});
  const isList = container instanceof Array;
  const key = isList ? index : childKeys[index];
  return [key, container[key]] as [string, V];
};

// 转化为有序列表
export const toEntries = <V>(data) => {
  if (!data) return { isList: false, entries: [] };
  const isList = data instanceof Array;
  return {
    isList,
    entries: Object.entries(data) as Array<[string, V]>
  };
};

// 从有序列表中还原源数据
export const parseEntries = <T>(entries: Array<[string, T]>, isList?: boolean) => {
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
  const container = (parent ? getItemByPath(widgetList, parent) : widgetList);
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
    const fromParent = (fromParentPath ? getItemByPath(widgetList, fromParentPath) : widgetList);
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
