import React from 'react';
import FormEditorCore from '../../../src';
import FormRender from '../FormRender';
import EditorConfig from './config';
import panelData from './config/panelData';
import ImportModal from './template';

const renderTools = (context) => {
  return <ImportModal context={context} />;
};

export default function FormEditor(props) {
  return <FormEditorCore
    {...props}
    renderTools={renderTools}
    panelData={panelData}
    editorConfig={EditorConfig}
    FormRender={FormRender}
  />;
}
