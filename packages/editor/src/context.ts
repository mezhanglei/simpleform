import React, { useContext, useRef, useState } from 'react';
import { CustomWidgetItem, FormDesignData, SimpleFormRender, SimpleForm, ReactComponent } from './formrender';
import { PlatType } from './tools/platContainer';
import { useMethod } from './utils/hooks';
import SimpleUndo from './utils/simple-undo';

// 配置属性类型
export interface ConfigWidgetSetting {
  [title: string]: FormDesignData
}

// 表单编辑器的context
export interface FormEditorState {
  editorForm?: SimpleForm;
  editor?: SimpleFormRender;
  settingForm?: SimpleForm | null;
  FormRender?: ReactComponent<any>;
  selected?: { path?: string; setting?: ConfigWidgetSetting };
  widgetList?: FormDesignData;
  editorConfig?: Record<string, CustomWidgetItem>;
  platType?: PlatType;
  historyRecord?: SimpleUndo;
  onEvent?: (type: string, context?: FormEditorContextProps) => void;
}

export interface FormEditorContextProps {
  state: FormEditorState;
  dispatch: (action: React.SetStateAction<unknown>) => void
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
