# `@simpleform/editor`

[English](./README.md) | 中文说明

[![](https://img.shields.io/badge/version-2.0.3-green)](https://www.npmjs.com/package/@simpleform/editor)

> 基于`react`实现的表单设计器，支持自定义组件，模板导入导出，可视化设计等表单设计功能，二次开发非常简单。

* [在线预览](https://mezhanglei.github.io/simpleform/)
* [开发指南](https://mezhanglei.github.io/simpleform/)
* [默认组件库](https://ant.design/index-cn/) `antd@5.x`，设计器默认注册了基础的表单控件.

## 简介
- 设计器组成：设计器包含五大模块
  * 配置面板`EditorPanel`：配置组件可选择到编辑
  * 操作区域 `EditorTools`：设计器的操作区域
  * 编辑区域`EditorView`：设计器的编辑区域
  * 配置属性组件`EditorSetting`：鼠标选中组件时展示对应的属性配置表单
  * 渲染器`FormRender`：设计器的表单渲染核心组件，使用前需要配置好注册组件及相关的属性
- 自定义功能：设计器允许两种自定义类型
  * 自定义组件：通过自定义一个组件，在设计器和渲染器中注册，然后就可以在组件面板中配置该控件使用
  * 导入模板：需要通过`renderTools`函数从设计器组件外面添加导入模板功能入口，这样可以自定义`JSON`模板列表的渲染界面.

## 安装
- [Node.js](https://nodejs.org/en/) Version >= 14.0.0
- [react](https://react.docschina.org/) Version >= 16.8.0
```bash
npm install @simpleform/editor --save
# 或者
yarn add @simpleform/editor
```

## 快速启动
具体代码请在`packages/editor/example/demo`路径下查看
### 1.首先自定义渲染器FormRender
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

### 2. 自定义编辑器FormEditor
* 编辑器的组件配置
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
* 配置`EditorPanel`的渲染列表
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
### 3. 使用上述配置好的编辑器FormEditor和渲染器FormRender
* 使用编辑器示例
```javascript
import React from 'react';
import FormEditor from './FormEditor';

export default function Demo(props) {
  return <FormEditor />;
}

```
* 使用渲染器示例
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
