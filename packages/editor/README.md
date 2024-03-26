# `@simpleform/editor`

English | [中文说明](./README_CN.md)

[![](https://img.shields.io/badge/version-3.1.5-green)](https://www.npmjs.com/package/@simpleform/editor)

> Based on `react` implementation of the form designer , support for custom components , template import and export , visual design and other form design features , the secondary development is very simple .

* [Preview](https://mezhanglei.github.io/simpleform/demo/#/)
<!-- * [Guide](https://mezhanglei.github.io/simpleform/docs/#/) -->
* [UI widgets](https://ant.design/index-cn/) `antd@5.x`, the designer registers the base form control by default.

## Introduction
- Designer Composition: The designer consists of six modules
  * Configuration context `EditorProvider`: provides the context of the editor
  * Configuration panel `EditorPanel`: configuration components can be selected to the editor area
  * Operation area `EditorTools`: the operation area of the designer.
  * Edit area `EditorView`: the designer's editing area
  * Configuration property component `EditorSetting`: displays the corresponding property configuration form when the component is selected by the mouse.
  * Renderer `FormRender`: the core component for form rendering in the designer, you need to configure the registered component and related properties before using it.
- Customization features: The designer allows two types of customization
  * Custom Component: By customizing a component and registering it in the designer and renderer, you can then configure the control for use in the component panel.
  * Import Templates: You need to add an import template entry from outside the designer component via the `renderTools` function, so that you can customize the rendering interface of the `JSON` template list.


Translated with DeepL.com (free version)

## install
- [Node.js](https://nodejs.org/en/) Version >= 14.0.0
- [react](https://react.docschina.org/) Version >= 16.8.0
```bash
npm install @simpleform/editor --save
# 或者
yarn add @simpleform/editor
```

## Quick Start
Three steps: registering the `FormRender` component, `FormEditor` config `editorConfig` of that component, and config the `EditPanel` showcase list. Please check the code in `packages/editor/example/demo`.
### 1.First customize the FormRender
```javascript
import React from 'react';
import { FormRender as DefaultFormRender, FormChildren as DefaultFormChildren, createRequest, CustomFormChildrenProps, CustomFormRenderProps } from '@simpleform/editor';
import '@simpleform/editor/lib/css/main.css';

export * from '@simpleform/editor';
// import Example from './Example';

// TODO: axios config
const axiosConfig = {

};

// TODO: default antd@5.x and to add new components
const widgets = {
//  example: Example
}

export function FormChildren(props: CustomFormChildrenProps) {
  const { components, plugins, ...rest } = props;
  return (
    <DefaultFormChildren
      options={{ props: { autoComplete: 'off' } }}
      components={{ ...widgets, ...components }}
      plugins={{ ...plugins, request: createRequest(axiosConfig) }}
      {...rest}
    />
  );
}

export default function FormRender(props: CustomFormRenderProps) {
  const { components, plugins, ...rest } = props;
  return (
    <DefaultFormRender
      options={{ props: { autoComplete: 'off' } }}
      components={{ ...widgets, ...components }}
      plugins={{ ...plugins, request: createRequest(axiosConfig) }}
      {...rest}
    />
  );
}
```

### 2. Customizable FormEditor
* Configuring information of component
```javascript
const EditorConfig = {
  'example': {
    // EditorPanel's data
    panel: {
      label: 'example-demo',
    },
    label: '',
    // The name of the component registered by FormRender
    type: 'example',
    props: {
    },
    // EditorSetting's Configuration Forms
    setting: { }
  }
}
```
* Add this component in the `EditorPanel`
```javascript
// config data for EditPanel
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
    "Cascader",
    "FileUpload",
    "ImageUpload",
    "RichEditor",
    "RichText",
  ],
  '业务组件': ['example']
};
```
* import the above configurations into the `FormEditor`.
```javascript
import { Col, Row } from 'antd';
import classnames from 'classnames';
import React, { CSSProperties } from 'react';
import { EditorPanel, EditorProvider, EditorProviderProps, EditorSetting, EditorTools, EditorView } from '@simpleform/editor';
import FormRender from '../FormRender';
import EditorConfig from './config';
import panelData from './config/panelData';
import '@simpleform/editor/lib/css/main.css';
// import ImportModal from './template';
import './index.less';

// // import template
// const renderTools = (context) => {
//   return <ImportModal context={context} />;
// };

export type EasyFormEditorProps = EditorProviderProps & {
  className?: string;
  style?: CSSProperties;
};

const FormEditor = ({ className, style, ...props }: EasyFormEditorProps) => {

  return (
    <Row className={classnames('simple-form-container', className)}>
      <EditorProvider
        editorConfig={EditorConfig}
        FormRender={FormRender}
      >
        <Col className='panel' xs={24} sm={24} md={5} lg={5}>
          <EditorPanel panelData={panelData} />
        </Col>
        <Col className='editor' xs={24} sm={24} md={14} lg={14}>
          <EditorTools
            // renderTools={renderTools}
          />
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
```
### 3. Using the above configured editor FormEditor and renderer FormRender
* Example of using the FormEditor
```javascript
import React from 'react';
import FormEditor from './FormEditor';

export default function Demo(props) {
  return <FormEditor />;
}

```
* Example of using the FormRender
```javascript
import React from 'react';
import FormRender from './FormRender';

export default function Demo(props) {
  // JSON
  const JSON_Data = []

  return <FormRender widgetList={JSON_Data} />;
}

```