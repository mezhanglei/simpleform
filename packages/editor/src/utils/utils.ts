import { deepMergeObject } from './object';
import { nanoid } from 'nanoid';
import { SimpleFormRender, getInitialValues, getPathEnd, CustomGenerateWidgetItem, CommonFormProps } from '../formrender';
import { ConfigWidgetSetting, FormEditorState } from '../context';
import React from 'react';

export const defaultGetId = (key?: string) => {
  return typeof key == 'string' ? `${key.replace(/\./g, '')}_${nanoid(6)}` : '';
};

// 未被选中
export const isNoSelected = (path?: string | number) => {
  if (!path || path === '#') return true;
};

// 提取目标所在列表的序号
export const getListIndex = (editor?: SimpleFormRender | null, path?: string) => {
  if (!editor) return -1;
  const widgetList = editor.getWidgetList();
  const len = widgetList.length || 0;
  const endName = getPathEnd(path);
  if (isNoSelected(path) || endName === undefined || endName === '') return len - 1;
  const endCode = typeof endName == 'string' ? endName?.replace(/\]/, '').replace(/\[/, '') : endName;
  return typeof endCode === 'string' ? +endCode : endCode;
};

// 从配置中获取初始值
export const getSettingInitial = (setting?: ConfigWidgetSetting) => {
  // // 从配置表单中获取初始属性
  const expandSetting = Object.values(setting || {}).reduce((pre, cur) => {
    const result = [...pre, ...cur];
    return result;
  }, []);
  const initialValues = getInitialValues<CustomGenerateWidgetItem>(expandSetting);
  return initialValues;
};

// 返回组件config信息
export const getConfigItem = (type: string | undefined, editorConfig?: FormEditorState['editorConfig']) => {
  if (!type || !editorConfig) return;
  const configItem = editorConfig[type] as CustomGenerateWidgetItem;
  const { setting, ...rest } = configItem;
  const initialData = getSettingInitial(typeof setting === 'object' ? setting : {});
  return deepMergeObject(initialData, rest);
};

// 根据路径获取节点的值和属性
export const getWidgetItem = <V = CustomGenerateWidgetItem>(formrender?: SimpleFormRender | null, path?: string) => {
  if (!formrender) return;
  const item = formrender.getItemByPath(path) as (V | undefined);
  return item;
};

// 移动新节点
export const moveWidgetItem = (formrender?: SimpleFormRender | null, from?: { index: number; parent?: string }, to?: { index?: number; parent?: string }) => {
  if (!formrender || !from || !to) return;
  formrender?.moveItemByPath(from, to);
};

// 插入新节点
export const insertWidgetItem = (formrender?: SimpleFormRender | null, data?: unknown, index?: number, parent?: string) => {
  if (!formrender || !data) return;
  const newData = data;
  formrender?.insertItemByIndex(newData, index, parent);
};

// 设置节点的属性
export const setWidgetItem = (formrender?: SimpleFormRender | null, data?: unknown, path?: string) => {
  if (!formrender) return;
  formrender?.setItemByPath(data, path);
};

// 删除节点
export const delWidgetItem = (formrender?: SimpleFormRender | null, path?: string) => {
  if (isNoSelected(path) || !formrender) return;
  formrender?.delItemByPath(path);
};

// 提取对象中公共的选项
export const getCommonOptions = (_options?: CommonFormProps['_options']) => {
  const { isEditor, formrender, form, renderItem, renderList, context, props } = _options || {};
  return { isEditor, formrender, form, context, renderItem, renderList, props };
};
