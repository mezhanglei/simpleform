import React, { useContext, useReducer } from 'react';
import { CustomFormNodeProps, EditorSelection, FormDesignData, SimpleFormRender, SimpleForm } from './components/formrender';
import EventBus from './utils/event-bus';
import { isObject } from './utils/type';

// 模板类型
export interface TemplateItem {
  name: string;
  img: string;
  data: FormDesignData;
}

// 配置属性类型
export interface ConfigSettingItem {
  [title: string]: FormDesignData
}

// 编辑器配置类型
export interface EditorConfigType {
  widgets: { [type: string]: CustomFormNodeProps }, // 注册组件
  settings: { [type: string]: ConfigSettingItem } // 属性面板
}
// 表单编辑器的context
export interface FormEditorState {
  editorForm?: SimpleForm;
  editor?: SimpleFormRender;
  settingForm?: SimpleForm | null;
  eventBus?: EventBus;
  selected?: EditorSelection;
  properties?: FormDesignData;
  editorConfig?: EditorConfigType,
  panelData?: { [title: string]: Array<string> }, // 组件面板配置
  templates?: Array<TemplateItem>;
  FormRender?: any;
  historyData?: {
    index: number;
    maxStep: number;
    steps: Array<EditorSelection>;
  }
}
export interface FormEditorContextProps {
  state: FormEditorState;
  dispatch: (state?: Partial<FormEditorState>) => void
}

function reducer(state: FormEditorState, action: any) {
  // 函数类型参数
  if (typeof action === 'function') {
    const newState = action(state);
    return Object.assign({}, state, newState);
  }
  // {type: string, payload: unknown} 传参
  if (typeof action.type == 'string' && action.payload) {
    const newVal = action.payload;
    return Object.assign({}, state, { [action.type]: newVal });
  }
  if (isObject(action)) {
    return Object.assign({}, state, action);
  }
  return state;
};

// 初始化reducer
export function useEditorReducer(initialState: FormEditorState) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return [state, dispatch];
}

// 编辑器的context
export const FormEditorContext = React.createContext<FormEditorContextProps>({});

// 消费context的值
export function useEditorContext() {
  const context = useContext(FormEditorContext);
  return context;
};
