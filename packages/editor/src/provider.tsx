import React from 'react';
import { useSimpleFormRender, useSimpleForm } from './components/formrender';
import { FormEditorContext, useEditorReducer } from './context';
import { useEventBus } from './utils/hooks';
import editorConfig from './config';

export interface ProviderProps {
  children: any;
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
    editorConfig: editorConfig,
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
