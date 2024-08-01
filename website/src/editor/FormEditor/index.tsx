import { Col, Row } from 'antd';
import React from 'react';
import { EditorPanel, EditorProvider, EditorSetting, EditorTools, EditorView } from '@simpleform/editor';
import '@simpleform/editor/lib/css/main.css';
import FormRender from '../FormRender';
import EditorConfig from './config';
import panelData from './config/panelData';
import ImportModal from './template';
import './index.less';

const renderTools = (context) => {
  return <ImportModal context={context} />;
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
