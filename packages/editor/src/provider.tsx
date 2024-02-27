import React from 'react';
import { useSimpleFormRender, useSimpleForm } from './components/formrender';
import { FormEditorContext, FormEditorState, useEditorReducer } from './context';
import { useEventBus } from './utils/hooks';
import EditorConfig from './config';

export interface ProviderProps extends FormEditorState {
  children?: any;
}
function Provider(props: ProviderProps) {

  const { children, ...rest } = props;
  const editor = useSimpleFormRender();
  const editorForm = useSimpleForm();
  const eventBus = useEventBus();

  const [state, dispatch] = useEditorReducer({
    editor: editor,
    editorForm: editorForm,
    settingForm: null,
    eventBus: eventBus,
    selected: {},
    properties: {},
    editorConfig: EditorConfig,
    historyData: {
      index: -1,
      maxStep: 20,
      steps: []
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
