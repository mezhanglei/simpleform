import React from 'react';
import { useSimpleFormRender, useSimpleForm } from './components/formrender';
import { FormEditorContext, FormEditorState, useEditorState } from './context';
import { useEventBus } from './utils/hooks';
import EditorConfig from './config';

export interface ProviderProps extends Pick<FormEditorState, 'editor' | 'editorForm' | 'platType' | 'editorConfig' | 'panelData' | 'templates' | 'FormRender'> {
  children?: any;
}
function Provider(props: ProviderProps) {
  const curEditor = useSimpleFormRender();
  const curEditorForm = useSimpleForm();
  const eventBus = useEventBus();

  const {
    children,
    editorConfig,
    platType = 'pc',
    editor = curEditor,
    editorForm = curEditorForm,
    ...rest
  } = props;

  const [state, dispatch] = useEditorState({
    editor: editor,
    editorForm: editorForm,
    editorConfig: {
      widgets: { ...EditorConfig.widgets, ...editorConfig?.widgets },
      settings: { ...EditorConfig?.settings, ...editorConfig?.settings }
    },
    settingForm: null,
    eventBus: eventBus,
    platType: platType,
    selected: {},
    properties: {},
    ...rest
  });

  return (
    <FormEditorContext.Provider value={{ state, dispatch }}>
      {children}
    </FormEditorContext.Provider>
  );
}

export default Provider;
