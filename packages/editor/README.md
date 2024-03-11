# `@simpleform/editor`

English | [中文说明](./README_CN.md)

[![](https://img.shields.io/badge/version-2.0.3-green)](https://www.npmjs.com/package/@simpleform/editor)

> Based on `react` implementation of the form designer , support for custom components , template import and export , visual design and other form design features , the secondary development is very simple .

* [Online Preview](https://mezhanglei.github.io/simpleform/)
* [Guide](https://mezhanglei.github.io/simpleform/)
* [UI widgets](https://ant.design/index-cn/) `antd@5.x`, the designer registers the base form control by default.

## Introduction
- Designer Composition: The designer consists of five main modules
  * Configuration Panel `EditorPanel`: Configuration components can be selected for editing.
  * Operation area `EditorTools`: the operation area of the designer.
  * Edit area `EditorView`: the editing area of the designer.
  * Configuration property component `EditorSetting`: displays the corresponding property configuration form when the component is selected by the mouse.
  * Renderer `FormRender`: the core component for form rendering in the designer, you need to configure the registered component and related properties before using it.
- Customization features: The designer allows two types of customization
  * Custom Component: By customizing a component and registering it in the designer and renderer, you can then configure the control for use in the component panel.
  * Import Templates: You need to add an import template entry from outside the designer component via the `renderTools` function, so that you can customize the rendering interface of the `JSON` template list.

## install
- [Node.js](https://nodejs.org/en/) Version >= 14.0.0
- [react](https://react.docschina.org/) Version >= 16.8.0
```bash
npm install @simpleform/editor --save
# 或者
yarn add @simpleform/editor
```

## Quick Start
Please check the code in `packages/editor/example/demo`.
### 1.First customize the FormRender
```javascript
import React from 'react';
import { FormRender as DefaultFormRender, FormChildren as DefaultFormChildren, createRequest, CustomFormChildrenProps, CustomFormRenderProps } from '@simpleform/editor';

export * from '@simpleform/editor';
// import Example from './Example';

// TODO axios config
const axiosConfig = {

};

// TODO default antd@5.x and to add new components
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
* Component configuration of the editor
```javascript
const EditorConfig = {
  'example': {
    // EditorPanel's data
    panel: {
      icon: '',
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
* Configuring the `EditorPanel` rendering list
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
    "ColorPicker",
    "Cascader",
    "FileUpload",
    "ImageUpload",
    "RichEditor",
    "RichText",
  ],
  '业务组件': ['example']
};
```
* 引入`EditorConfig`和`FormRender`
```javascript
import React from 'react';
import FormEditorCore from '@simpleform/editor';
import FormRender from '../FormRender';
import EditorConfig from './config';
import panelData from './config/panelData';
// import ImportModal from './template';

// // import template
// const renderTools = (context) => {
//   return <ImportModal context={context} />;
// };

export default function FormEditor(props) {
  return <FormEditorCore
    {...props}
    // renderTools={renderTools}
    panelData={panelData}
    editorConfig={EditorConfig}
    FormRender={FormRender}
  />;
}
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
  const JSON_Data = {
    
  }

  return <FormRender properties={JSON_Data} />;
}

```