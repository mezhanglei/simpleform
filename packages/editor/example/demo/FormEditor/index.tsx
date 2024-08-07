import { Col, Row } from 'antd';
import React, { CSSProperties } from 'react';
import FormRender, { EditorPanel, EditorProvider, EditorProviderProps, EditorSetting, EditorTools, EditorView } from '../FormRender';
import EditorConfig from './config';
import panelData from './panelData';
import ImportModal from './ImportTemplate';
import './index.less';

const renderTools = (context) => {
  return <ImportModal context={context} />;
};

export type EasyFormEditorProps = EditorProviderProps & {
  className?: string;
  style?: CSSProperties;
};

const FormEditor = () => {

  return (
    <Row className='simple-form-container'>
      <EditorProvider
        editorConfig={EditorConfig}
        FormRender={FormRender}
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
