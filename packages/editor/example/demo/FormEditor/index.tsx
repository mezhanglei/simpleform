import React from 'react';
import FormEditorCore from '../../../src';
import FormRender from '../FormRender';
import EditorConfig from './config';
import ImportModal from './template';

const panelData = {
  '布局组件': ['Grid', 'Divider', 'Alert'],
  '控件组合': ['FormTable'],
  '基础控件': [
    "Input",
    "Radio.Group",
    "Checkbox.Group",
    "Select",
    "Switch",
    "TimePicker",
    "TimePicker.RangePicker",
    "DatePicker",
    "DatePicker.RangePicker",
    "Slider",
    "Rate",
    "ColorPicker",
    "Cascader",
    "FileUpload",
    "ImageUpload",
    "RichEditor",
    "RichText",
  ],
  '业务组件': ['example']
};

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
