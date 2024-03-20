import { deepMergeObject } from './object';
import { nanoid } from 'nanoid';
import { SimpleForm, SimpleFormRender, getInitialValues, getPathEnd, getParent, CustomWidgetItem } from '../components/formrender';
import { ConfigSettingItem, FormEditorState } from '../context';

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
  const len = editor.getWidgetList().length || 0;
  if (isNoSelected(path)) return len - 1;
  const containerPath = getParent(path);
  const container = editor.getItemByPath(containerPath);
  const endName = getPathEnd(path);
  const endCode = typeof endName == 'string' ? endName?.replace(/\]/, '').replace(/\[/, '') : endName;
  const keys = Object.keys(container);
  const index = keys.findIndex((key) => key == endCode);
  return index;
};

// 根据节点的配置返回节点的初始值
export const getSettingInitial = (setting?: ConfigSettingItem) => {
  // // 从配置表单中获取初始属性
  const expandSetting = Object.values(setting || {}).reduce((pre, cur) => {
    const result = [...pre, ...cur];
    return result;
  }, []) as any;
  const initialValues = getInitialValues(expandSetting);
  return initialValues;
};

// 获取控件的配置属性
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
  if (isNoSelected(path) || !formrender) return;
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
  formrender?.insertItemByIndex(data, index, parent);
};

// 覆盖设置节点的属性
export const setWidgetItem = (formrender?: SimpleFormRender | null, data?: any, path?: string) => {
  if (isNoSelected(path) || !formrender) return;
  formrender?.setItemByPath(data, path);
};

// 同步选中项到属性面板回显
export const asyncSettingForm = (editor?: SimpleFormRender | null, settingForm?: SimpleForm | null, selected?: FormEditorState['selected']) => {
  if (isNoSelected(selected?.path) || !settingForm) return;
  const item = getWidgetItem(editor, selected?.path);
  settingForm.setFieldsValue(item);
};
