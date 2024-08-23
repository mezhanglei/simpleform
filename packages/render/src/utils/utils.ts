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
export function getEntriesByIndex<T>(widgetList?: T[], index?: number, parent?: string): [number, T]
export function getEntriesByIndex<T>(widgetList?: Record<string, T>, index?: number, parent?: string): [string, T]
export function getEntriesByIndex<T>(widgetList?: T[] | Record<string, T>, index?: number, parent?: string) {
  const container = (parent ? getItemByPath(widgetList, parent) : widgetList);
  if (!container || typeof index !== 'number') return;
  if (container instanceof Array) {
    return [index, container[index]];
  } else {
    return Object.entries(container)[index] as [string, T];
  }
};

// 转化为有序列表
export function toEntries<T>(data: T[]): [number, T][]
export function toEntries<T>(data: Record<string, T>): [string, T][]
export function toEntries<T>(data?: T[] | Record<string, T>) {
  if (data instanceof Array) {
    return data.map((item, index) => ([index, item] as [number, T]));
  } else {
    return Object.entries(data || {});
  }
};

// 从有序列表中还原源数据
export function parseEntries<T>(entries: Array<[number, T]>): T[]
export function parseEntries<T>(entries: Array<[string, T]>): Record<string, T>
export function parseEntries<T>(entries?: Array<[string, T]> | Array<[number, T]>) {
  if (!(entries instanceof Array)) return;
  if (typeof entries[0]?.[0] === 'number') {
    return entries.map((item) => item?.[1] as T);
  } else {
    return Object.fromEntries(entries);
  }
};

// 插入数据
export const insertItemByIndex = (widgetList?: WidgetList, data?: unknown, index?: number, parent?: string) => {
  const container = (parent ? getItemByPath(widgetList, parent) : widgetList);
  if (!container || !data) return;
  const entriesData = toEntries(container);
  const payload = toEntries(data instanceof Array ? data : [data]);
  if (typeof index === 'number') {
    entriesData?.splice(index, 0, ...payload);
  } else {
    entriesData?.push(...payload);
  }
  const changedChilds = parseEntries(entriesData);
  return setItemByPath(widgetList, changedChilds, parent);
};

// 同级调换位置
export const moveSameLevel = (widgetList: WidgetList | undefined, from: { parent?: string, index: number }, to: { parent?: string, index?: number }) => {
  const container = from?.parent ? getItemByPath(widgetList, from?.parent) : widgetList;
  if (!container) return;
  if (from?.parent === to?.parent) {
    const entriesData = toEntries(container);
    const toIndex = typeof to?.index === 'number' ? to?.index : entriesData?.length;
    const newEntries = arrayMove(entriesData, from?.index, toIndex);
    const result = parseEntries(newEntries);
    return setItemByPath(widgetList, result, from?.parent);
  }
};

// 跨级调换位置
export const moveDiffLevel = (widgetList: WidgetList | undefined, from: { parent?: string, index: number }, to: { parent?: string, index?: number }) => {
  const fromLen = getPathLen(from?.parent);
  const toLen = getPathLen(to?.parent);
  const entries = getEntriesByIndex(widgetList, from?.index, from?.parent);
  if (!entries) return widgetList;
  const fromData = parseEntries([entries]);
  const fromPath = joinFormPath(from?.parent, from?.index);
  // 先计算内部变动，再计算外部变动
  if (fromLen > toLen || !toLen) {
    const result = setItemByPath(widgetList, undefined, fromPath);
    return insertItemByIndex(result, fromData, to?.index, to?.parent);
  } else {
    const result = insertItemByIndex(widgetList, fromData, to?.index, to?.parent);
    return setItemByPath(result, undefined, fromPath);
  }
};
