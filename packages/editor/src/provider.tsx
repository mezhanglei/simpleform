import React from 'react';
import { useSimpleFormRender, useSimpleForm } from '@simpleform/render';
import { FormEditorContext, FormEditorState, useEditorState } from './context';

export interface EditorProviderProps extends FormEditorState {
  children?: React.ReactNode;
}
function EditorProvider(props: EditorProviderProps) {
  const curEditor = useSimpleFormRender();
  const curEditorForm = useSimpleForm();

  const {
    children,
    editor = curEditor,
    editorForm = curEditorForm,
    ...rest
  } = props;

  const [state, dispatch] = useEditorState({
    editor: editor,
    editorForm: editorForm,
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
