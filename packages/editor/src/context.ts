import React, { useContext, useRef, useState } from 'react';
import { CustomFormNodeProps, EditorSelection, FormDesignData, SimpleFormRender, SimpleForm } from './components/formrender';
import EventBus from './utils/event-bus';
import SimpleUndo from './utils/simple-undo';

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
  historyRecord: SimpleUndo;
}
export interface FormEditorContextProps {
  state: FormEditorState;
  dispatch: (state: React.SetStateAction<FormEditorState>) => void
}

export function useMethod<T extends (...args: any[]) => any>(method: T) {
  const { current } = React.useRef<{ method: T, func: T | undefined }>({
    method,
    func: undefined,
  });
  current.method = method;

  // 只初始化一次
  if (!current.func) {
    // 返回给使用方的变量
    current.func = ((...args: unknown[]) => current.method.call(current.method, ...args)) as T;
  }

  return current.func;
}


// 初始化reducer
export function useEditorState(initialState: FormEditorState) {
  const [state, setState] = useState(initialState);
  const stateRef = useRef(state);
  const historyRef = useRef(new SimpleUndo({
    maxLength: 10,
    provider: (done) => {
      const properties = stateRef.current.properties;
      done(JSON.stringify(properties));
    }
  }));
  // 更新state
  const dispatch: FormEditorContextProps['dispatch'] = useMethod((newState) => {
    const newData = typeof newState === 'function' ? newState(stateRef.current) : newState;
    setState(newData);
    stateRef.current = newData;
  });

  return [Object.assign({ historyRecord: historyRef.current }, state), dispatch] as const;
};


// 编辑器的context
export const FormEditorContext = React.createContext<FormEditorContextProps>({});

// 消费context的值
export function useEditorContext() {
  const context = useContext(FormEditorContext);
  return context;
};
