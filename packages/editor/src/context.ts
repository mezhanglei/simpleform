import React, { useContext, useRef, useState } from 'react';
import { CustomWidgetItem, FormDesignData, SimpleFormRender, SimpleForm } from './components/formrender';
import { PlatType } from './tools/platContainer';
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

// 表单编辑器的context
export interface FormEditorState {
  editorForm?: SimpleForm;
  editor?: SimpleFormRender;
  settingForm?: SimpleForm | null;
  FormRender?: React.ComponentType<any> | React.ForwardRefExoticComponent<any>;
  selected?: { path?: string; setting?: ConfigSettingItem };
  beforeSelected?: { path?: string; setting?: ConfigSettingItem };
  widgetList?: FormDesignData;
  editorConfig?: Record<string, CustomWidgetItem>;
  platType?: PlatType;
  historyRecord?: SimpleUndo;
}

export interface FormEditorContextProps {
  state: FormEditorState;
  dispatch: (state: React.SetStateAction<Partial<FormEditorContextProps['state']>>) => void
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
      const widgetList = stateRef.current.widgetList || [];
      done(JSON.stringify(widgetList));
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
export const FormEditorContext = React.createContext<FormEditorContextProps>({ state: {}, dispatch: () => { } });

// 消费context的值
export function useEditorContext() {
  const context = useContext(FormEditorContext);
  return context;
};
