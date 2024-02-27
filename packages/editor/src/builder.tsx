import React, { CSSProperties } from 'react';
import Provider, { ProviderProps } from './provider';
import EditorPanel from './panel';
import EditorView from './view';
import EditorSetting from './setting';
import classnames from 'classnames';
import { Col, Row } from 'antd';
import './builder.less';

export interface EasyFormEditorProps extends ProviderProps {
  className?: string;
  style?: CSSProperties;
};

const FormBuilder = ({ className, ...props }: EasyFormEditorProps) => {
  return (
    <Row className={classnames('simple-form-container', className)}>
      <Provider {...props}>
        <Col className='panel' xs={24} sm={24} md={5} lg={5}><EditorPanel /></Col>
        <Col className='editor' xs={24} sm={24} md={14} lg={14}><EditorView /></Col>
        <Col className='setting' xs={24} sm={24} md={5} lg={5}><EditorSetting /></Col>
      </Provider>
    </Row>
  );
};

FormBuilder.Provider = Provider;
FormBuilder.Panel = EditorPanel;
FormBuilder.Editor = EditorView;
FormBuilder.Setting = EditorSetting;
export default FormBuilder;
