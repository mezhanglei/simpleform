import React, { useState } from 'react';
import "./index.less";
import FormEditor from '../../src';
import EditorConfig from './config';

export default function Demo(props) {

  return <FormEditor editorConfig={EditorConfig} />;
}
