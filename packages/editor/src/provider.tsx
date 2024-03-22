import React from 'react';
import { useSimpleFormRender, useSimpleForm } from './formrender';
import { FormEditorContext, FormEditorState, useEditorState } from './context';
import EditorConfig from './config';

export interface EditorProviderProps extends FormEditorState {
  children?: any;
}
function EditorProvider(props: EditorProviderProps) {
  const curEditor = useSimpleFormRender();
  const curEditorForm = useSimpleForm();

  const {
    children,
    editorConfig,
    editor = curEditor,
    editorForm = curEditorForm,
    ...rest
  } = props;

  const [state, dispatch] = useEditorState({
    editor: editor,
    editorForm: editorForm,
    editorConfig: { ...EditorConfig, ...editorConfig },
    selected: {},
    widgetList: [],
    ...rest
  });

  return (
    <FormEditorContext.Provider value={{ state, dispatch }}>
      {children}
    </FormEditorContext.Provider>
  );
}

export default EditorProvider;
