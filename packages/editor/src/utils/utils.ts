import { deepMergeObject } from './object';
import { nanoid } from 'nanoid';
import { SimpleForm, EditorSelection, SimpleFormRender, getInitialValues, getPathEnd, joinFormPath } from '../components/formrender';
import { FormEditorState } from '../context';

export const defaultGetId = (key?: string) => {
  return typeof key == 'string' ? `${key.replace(/\./g, '')}_${nanoid(6)}` : '';
};

// 失去选中
export const isNoSelected = (path?: string) => {
  if (!path || path === '#') return true;
};

// name的setting
export const getNameSetting = (selected?: EditorSelection) => {
  const selectedPath = selected?.path;
  const attributeName = selected?.attributeName;
  if (attributeName) return;
  if (typeof selected?.path !== 'string') return;
  // 获取选中的字段值
  const endName = getPathEnd(selectedPath);
  // 表单节点才允许展示
  if (typeof endName === 'string' && selected?.field?.ignore !== true) {
    return {
      name: {
        label: '字段名',
        type: 'Input'
      }
    };
  }
};

// 获取当前选中位置序号
export const getSelectedIndex = (editor?: SimpleFormRender | null, selected?: EditorSelection) => {
  if (!editor) return -1;
  const len = Object.keys(editor.getProperties() || {}).length || 0;
  if (isNoSelected(selected?.path)) return len;
  const index = selected?.field?.index as number;
  return typeof index === 'number' ? index : -1;
};

// 根据节点的配置返回节点的初始值
export const getSettingInitial = (setting?: any) => {
  // 从配置表单中获取初始属性
  const expandSetting = Object.values(setting || {}).reduce((pre, cur) => {
    const result = deepMergeObject(pre, cur);
    return result;
  }, {}) as any;
  const initialValues = getInitialValues(expandSetting);
  return initialValues;
};

// 根据配置键名获取默认值
export const getConfigItem = (key: string | undefined, editorConfig?: FormEditorState['editorConfig']) => {
  if (!key || !editorConfig) return;
  const item = editorConfig[key];
  const { setting, ...rest } = item;
  const initialValues = getSettingInitial(setting);
  const field = deepMergeObject(initialValues, rest);
  return field;
};

// 根据路径获取节点的值和属性
export const getFormItem = (formrender?: SimpleFormRender | null, path?: string, attributeName?: string) => {
  if (isNoSelected(path) || !formrender) return;
  const item = formrender.getItemByPath(path, attributeName);
  return item;
};

// 插入新节点
export const insertFormItem = (formrender?: SimpleFormRender | null, data?: any, index?: number, parent?: { path?: string, attributeName?: string }) => {
  if (!formrender) return;
  const { path, attributeName } = parent || {};
  const parentItem = formrender.getItemByPath(path, attributeName);
  const childs = attributeName ? parentItem : (path ? parentItem?.properties : parentItem);
  const isInArray = childs instanceof Array;
  if (isInArray) {
    formrender?.insertItemByIndex(data, index, parent);
  } else {
    if (data?.type) {
      const newName = defaultGetId(data?.type);
      const newData = { [newName]: data };
      formrender.insertItemByIndex(newData, index, parent);
    }
  }
};

// 更新节点的属性
export const updateFormItem = (formrender?: SimpleFormRender | null, data?: any, path?: string, attributeName?: string) => {
  if (isNoSelected(path) || !formrender) return;
  if (attributeName) {
    // 设置属性节点
    formrender?.updateItemByPath(data, path, attributeName);
  } else {
    // 更新表单节点
    const { name, ...rest } = data || {};
    if (rest) {
      formrender?.updateItemByPath(rest, path);
    }
    if (name) {
      formrender?.updateNameByPath(name, path);
    }
  }
};

// 覆盖设置节点的属性
export const setFormItem = (formrender?: SimpleFormRender | null, data?: any, path?: string, attributeName?: string) => {
  if (isNoSelected(path) || !formrender) return;
  if (attributeName) {
    // 设置属性节点
    formrender?.setItemByPath(data, path, attributeName);
  } else {
    // 设置表单节点
    const { name, ...rest } = data || {};
    if (rest) {
      formrender?.setItemByPath(rest, path);
    }
    if (name) {
      formrender?.updateNameByPath(name, path);
    }
  }
};

// 表单赋值
export const setFormValue = (form?: SimpleForm | null, name?: string, value?: any) => {
  if (isNoSelected(name) || !name || !form) return;
  if (value !== undefined) {
    form?.setFieldValue(name, value);
  };
};

// 表单存储initialValue
export const setFormInitialValue = (formrender?: SimpleFormRender | null, settingForm?: SimpleForm | null, selected?: EditorSelection, initialValue?: any) => {
  updateFormItem(formrender, initialValue, selected?.path, joinFormPath(selected?.attributeName, 'initialValue'));
  // 回填setting表单的intialValue选项
  settingForm && settingForm.setFieldValue('initialValue', initialValue);
};

// 同步目标的编辑区域值到属性面板回显
export const asyncSettingForm = (editor?: SimpleFormRender | null, settingForm?: SimpleForm | null, selected?: EditorSelection) => {
  if (isNoSelected(selected?.path) || !settingForm) return;
  const currentField = getFormItem(editor, selected?.path, selected?.attributeName);
  // 非属性节点需要该节点的字段名
  const settingValues = selected?.attributeName ? currentField : { ...currentField, name: selected?.name };
  settingForm.setFieldsValue(settingValues);
};
