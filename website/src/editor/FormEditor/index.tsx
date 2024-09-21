import { Col, Row } from 'antd';
import React, { CSSProperties } from 'react';
import { EditorPanel, EditorProvider, EditorProviderProps, EditorSetting, EditorTools, EditorView } from '@simpleform/editor';
import '@simpleform/editor/lib/css/main.css';
import panelData from './panelData';
import ImportModal from './ImportTemplate';
import editorConfig from './editorConfig';
import renderConfig from './FormRender/defineConfig';
import './index.less';

export * from '@simpleform/editor';

const renderTools = (editorContext) => {
  return <ImportModal editorContext={editorContext} />;
};

export type EasyFormEditorProps = EditorProviderProps & {
  className?: string;
  style?: CSSProperties;
};

const FormEditor = () => {

  return (
    <Row className='simple-form-container'>
      <EditorProvider
        editorConfig={editorConfig}
        renderConfig={renderConfig}
      >
        <Col className='panel' xs={24} sm={24} md={5} lg={5}>
          <EditorPanel panelData={panelData} />
        </Col>
        <Col className='editor' xs={24} sm={24} md={14} lg={14}>
          <EditorTools renderTools={renderTools} />
          <EditorView />
        </Col>
        <Col className='setting' xs={24} sm={24} md={5} lg={5}>
          <EditorSetting />
        </Col>
      </EditorProvider>
    </Row>
  );
};

export default FormEditor;
