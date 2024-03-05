import React from 'react';
import { useSimpleFormRender, useSimpleForm } from './components/formrender';
import { FormEditorContext, FormEditorState, useEditorState } from './context';
import { useEventBus } from './utils/hooks';
import EditorConfig from './config';

export interface ProviderProps extends FormEditorState {
  children?: any;
}
function Provider(props: ProviderProps) {

  const { children, editorConfig, ...rest } = props;
  const editor = useSimpleFormRender();
  const editorForm = useSimpleForm();
  const eventBus = useEventBus();

  const [state, dispatch] = useEditorState({
    editor: editor,
    editorForm: editorForm,
    settingForm: null,
    eventBus: eventBus,
    selected: {},
    properties: {},
    editorConfig: {
      widgets: { ...EditorConfig.widgets, ...editorConfig?.widgets },
      settings: { ...EditorConfig?.settings, ...editorConfig?.settings }
    },
    ...rest
  });
  
  return (
    <FormEditorContext.Provider value={{ state, dispatch }}>
      {children}
    </FormEditorContext.Provider>
  );
}

export default Provider;
