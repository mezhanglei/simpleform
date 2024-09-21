import React from 'react';
import {
  BaseDnd,
  EditorPanel,
  EditorProvider,
  EditorSetting,
  EditorTools,
  EditorView,
  getConfigItem,
  getListIndex,
  insertWidgetItem,
} from '@simpleform/editor';
import './index.less';
import { Tag } from 'antd';
import editorConfig from '../FormEditor/editorConfig';
import renderConfig from '../FormEditor/FormRender/defineConfig';
import { getParent } from '../FormEditor/FormRender';

const panelData = {
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
    "Cascader",
    "FileUpload",
    "ImageUpload",
    "RichEditor",
    "RichText",
  ]
};

// 自定义EditorPanel
const CustomEditorPanel = (editorContext?: any) => {
  const { selected, editor, editorConfig, historyRecord } = editorContext?.state;

  const onChange = (key: string) => {
    const newIndex = getListIndex(editor, selected?.path) + 1; // 插入位置序号
    const configItem = getConfigItem(key, editorConfig); // 插入新组件
    insertWidgetItem(editor, configItem, newIndex, getParent(selected?.path));
    historyRecord?.save();
  };

  return (
    <>
      {Object.entries(panelData).map(([title, list]) => {
        return (
          <div key={title}>
            <p>{title}</p>
            <BaseDnd
              dndList={list}
              forceFallback={true}
              sort={false}
              group={{
                name: "panel",
                pull: "clone",
                put: false,
              }}
            >
              {
                list.map((key) => {
                  const data = editorConfig?.[key] || {};
                  const panel = data?.panel || {};
                  return <Tag style={{ marginBottom: '10px' }} color="processing" key={key} data-type={key} data-group='panel' onClick={() => onChange(key)}>{panel.label}</Tag>
                })
              }
            </BaseDnd>
          </div>
        );
      })}
    </>
  )
}

const CustomEditor = () => {

  return (
    <EditorProvider
      editorConfig={editorConfig}
      renderConfig={renderConfig}
    >
      <EditorPanel panelData={panelData}>
        {CustomEditorPanel}
      </EditorPanel>
      <div style={{ maxHeight: '500px', marginTop: '20px', overflow: 'auto' }}>
        <EditorTools />
        <EditorView />
      </div>
      <EditorSetting />
    </EditorProvider>
  );
};

export default CustomEditor;
