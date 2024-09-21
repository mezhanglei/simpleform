---
title: FormEditor
order: 0
nav:
  title: FormEditor
  order: 2
---

# @simpleform/editor
[![](https://img.shields.io/badge/version-4.2.0-green)](https://www.npmjs.com/package/@simpleform/editor)

> 基于`@simpleform/render`实现的表单设计器，支持自定义组件，模板导入导出，可视化设计等表单设计功能，二次开发非常简单。

* [在线预览](https://mezhanglei.github.io/simpleform/demo/#/)
* [默认组件库](https://ant.design/index-cn/) `antd@5.x`，设计器默认注册了基础的表单控件.

## 简介
- 设计器组成：设计器包含六大模块
  * 配置上下文`EditorProvider`：提供编辑器的上下文环境
  * 配置面板`EditorPanel`：配置已经注册的组件显示列表
  * 操作区域 `EditorTools`：设计器的操作区域
  * 编辑区域`EditorView`：设计器的编辑区域
  * 配置属性组件`EditorSetting`：鼠标选中组件时展示对应的属性配置表单
  * 渲染器`FormRender`：表单渲染引擎
- 自定义功能：设计器允许两种自定义类型
  * 注册组件：通过自定义一个组件，在设计器和渲染器中注册，然后就可以在组件面板中配置该组件使用
  * 导入模板：可渲染成界面的`JSON`列表，列表中的每一项均为注册组件，此功能未内置，可在`EditorTools`组件中扩展一个导入入口

:::warning
推荐使用版本`>=4.2`版本
:::

## 安装

### npm安装
推荐使用 npm 的方式安装。
- [Node.js](https://nodejs.org/en/) Version >= 14.0.0
- [react](https://react.docschina.org/) Version >= 16.8.0
```bash
npm install @simpleform/editor --save
# 或者
yarn add @simpleform/editor
```

### 引入样式
在使用之前需要先引入css样式文件
```javascript
import '@simpleform/editor/lib/css/main.css';
```
### 基本使用
概述：1.配置渲染器`FormRender`的配置项文件 → 2.配置编辑器`FormEditor`的`editorConfig`属性和`renderConfig`属性 → 3.最后在编辑器的`EditPanel`展示列表中显示即可使用, 具体代码请在项目内的`packages/editor/example/demo`路径下查看
<code src="../../src/editor/FormEditor/index.tsx"></code>

## FormRender配置项

### 配置文件
`FormRender`组件的配置项可以单独写在一个文件里面导出.
```javascript
// defineConfig.js
import dayjs from 'dayjs';
import { commonWidgets, createRequest, bindRequest } from '@simpleform/editor';

// TODO axios请求配置，编辑器内置了`axios`，使用编辑器前需要根据你当前的项目进行个性化配置
const axiosConfig = {
// baseURL: '',
// headers: {},
// // 处理响应结果
// handleResult: (data) => {
// }
};

// 配置项
export default {
  // 组件内的变量
  variables: {
    dayjs,
    request: createRequest(axiosConfig)
  },
  // 注册组件
  components: {
    ...commonWidgets,
    // 通过`bindRequest`高阶函数使组件具备通过请求返回数据源的能力
    'Checkbox.Group': bindRequest(Checkbox.Group, 'options'),
  },
  // 节点属性默认配置
  options: {
    props: { autoComplete: 'off' }
  }
};
```

### 引入配置文件
编辑器内置了`axios`，使用编辑器前需要根据你当前的项目进行个性化配置，参考示例：
```javascript
import React from 'react';
import { FormRender as DefaultFormRender, FormChildren as DefaultFormChildren, FormChildrenProps, FormRenderProps } from '@simpleform/editor';
import { EditorOptions } from '@simpleform/editor';
import '@simpleform/editor/lib/css/main.css';
import defineConfig from './defineConfig';

export * from '@simpleform/editor';

export type CustomFormChildrenProps = FormChildrenProps<EditorOptions>;
export function FormChildren(props: CustomFormChildrenProps) {
  const { components, variables, ...rest } = props;
  return (
    <DefaultFormChildren
      options={defineConfig.options}
      components={{ ...defineConfig.components, ...components }}
      variables={{ ...defineConfig.variables, ...variables }}
      {...rest}
    />
  );
}

export type CustomFormRenderProps = FormRenderProps<EditorOptions>;
export default function FormRender(props: CustomFormRenderProps) {
  const { components, variables, ...rest } = props;
  return (
    <DefaultFormRender
      options={defineConfig.options}
      components={{ ...defineConfig.components, ...components }}
      variables={{ ...defineConfig.variables, ...variables }}
      {...rest}
    />
  );
}
```
## FormEditor配置项
### 引入editorConfig配置和FormRender的defineConfig
- 示例配置`editorConfig`中的`input`控件信息:
```javascript

import { Col, Row } from 'antd';
import React, { CSSProperties } from 'react';
import { EditorPanel, EditorProvider, EditorProviderProps, EditorSetting, EditorTools, EditorView } from '@simpleform/editor';
import '@simpleform/editor/lib/css/main.css';
import panelData from './panelData';
import ImportModal from './ImportTemplate';
import renderConfig from './FormRender/defineConfig';
import './index.less';

export * from '@simpleform/editor';

const editorConfig = {
  'input': {
    // EditorPanel组件上的一些信息
    panel: {
      label: '输入框',
    },
    // 组件名字
    label: '输入框',
    // FormRender中注册的组件键名
    type: 'Input',
    props: {},
    // EditorSetting属性面板组件的配置表单JSON
    setting: {
      // FieldSetting为表单域组件公共配置，如果是表单控件需要合并这个，非表单控件无需合并此表单JSON
      ...FieldSetting
    }
  }
}

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
```
### 上传组件
默认内置了上传组件，但是需要处理响应数据.有两种方式解决:
- 界面上的上传组件有`uploadCallback`（接口响应数据）配置选项，修改即可.
- 在`editorConfig`中重新配置上传组件的`props`属性
```javascript
// 在配置editorConfig时重新配置上传图片和上传文件的uploadCallback

import FileUploadConfig from '../components/FileUpload/config';
import ImageUploadConfig from '../components/ImageUpload/config';

const editorConfig = {
  "FileUpload": {
    ...FileUploadConfig,
    props: {
      uploadCallback: "{{(data) => ({ fileId: data.fileId })}}"
    },
  },
  "ImageUpload": {
    ...ImageUploadConfig,
    props: {
      uploadCallback: "{{(data) => ({ fileId: data.fileId })}}"
    },
  },
}
```
### EditPanel组件配置
默认的`EditPanel`组件通过`panelData`来配置显示列表. 参考示例：
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

<EditorPanel panelData={panelData} />
```
