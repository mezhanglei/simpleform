import { deepMergeObject } from './object';
import { nanoid } from 'nanoid';
import { SimpleForm, SimpleFormRender, getInitialValues, getPathEnd, getParent, CustomWidgetItem } from '../formrender';
import { ConfigWidgetSetting, FormEditorState } from '../context';

export const defaultGetId = (key?: string) => {
  return typeof key == 'string' ? `${key.replace(/\./g, '')}_${nanoid(6)}` : '';
};

// 未被选中
export const isNoSelected = (path?: string) => {
  if (!path || path === '#') return true;
};

// 根据目标路径推测其在父列表中的序号
export const getListIndex = (editor?: SimpleFormRender | null, path?: string) => {
  if (!editor) return -1;
  const widgetList = editor.getWidgetList();
  const len = widgetList.length || 0;
  if (isNoSelected(path)) return len - 1;
  const containerPath = getParent(path);
  const container = containerPath ? getWidgetItem(editor, containerPath) : widgetList;
  const endName = getPathEnd(path);
  const endCode = typeof endName == 'string' ? endName?.replace(/\]/, '').replace(/\[/, '') : endName;
  const keys = Object.keys(container);
  const index = keys.findIndex((key) => key == endCode);
  return index;
};

// 从配置中获取初始值
export const getSettingInitial = (setting?: ConfigWidgetSetting) => {
  // // 从配置表单中获取初始属性
  const expandSetting = Object.values(setting || {}).reduce((pre, cur) => {
    const result = [...pre, ...cur];
    return result;
  }, []) as any;
  const initialValues = getInitialValues(expandSetting);
  return initialValues;
};

// 返回配置组件信息
export const getConfigItem = (type: string | undefined, editorConfig?: FormEditorState['editorConfig']) => {
  if (!type || !editorConfig) return;
  const item = editorConfig[type];
  const { setting, ...rest } = item;
  const initialValues = getSettingInitial(setting);
  const widgetItem = deepMergeObject(initialValues, rest);
  return widgetItem;
};

// 根据路径获取节点的值和属性
export const getWidgetItem = (formrender?: SimpleFormRender | null, path?: string) => {
  if (!formrender) return;
  const item = formrender.getItemByPath(path);
  return item;
};

// 移动新节点
export const moveWidgetItem = (formrender?: SimpleFormRender | null, from?: { index: number; parent?: string }, to?: { index?: number; parent?: string }) => {
  if (!formrender || !from || !to) return;
  formrender?.moveItemByPath(from, to);
};

// 插入新节点
export const insertWidgetItem = (formrender?: SimpleFormRender | null, data?: CustomWidgetItem, index?: number, parent?: string) => {
  if (!formrender || !data) return;
  const newData = data;
  formrender?.insertItemByIndex(newData, index, parent);
};

// 设置节点的属性
export const setWidgetItem = (formrender?: SimpleFormRender | null, data?: any, path?: string) => {
  if (!formrender) return;
  formrender?.setItemByPath(data, path);
};

// 删除节点
export const delWidgetItem = (formrender?: SimpleFormRender | null, path?: string) => {
  if (isNoSelected(path) || !formrender) return;
  formrender?.delItemByPath(path);
};

