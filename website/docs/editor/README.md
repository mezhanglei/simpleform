---
title: FormEditor
order: 0
nav:
  title: FormEditor
  order: 2
---

# @simpleform/editor
[![](https://img.shields.io/badge/version-3.1.15-green)](https://www.npmjs.com/package/@simpleform/editor)

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
  * 渲染器`FormRender`：设计器的表单渲染核心组件，使用前需要配置好注册组件及相关的属性
- 自定义功能：设计器允许两种自定义类型
  * 自定义组件：通过自定义一个组件，在设计器和渲染器中注册，然后就可以在组件面板中配置该控件使用
  * 导入模板：可渲染成界面的`JSON`列表，列表中的每一项均为注册组件，需要通过`renderTools`函数从设计器组件外面添加导入模板功能入口.

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
概述：1.配置渲染器`FormRender`的`components`用于提供组件 → 2.然后进行编辑器`FormEditor`的`editorConfig`配置 → 3.最后在编辑器的`EditPanel`展示列表中显示即可使用, 具体代码请在项目内的`packages/editor/example/demo`路径下查看
<code src="../../src/editor/FormEditor/index.tsx"></code>

## FormRender配置项

### 请求配置
编辑器内置了`axios`，使用编辑器前需要根据你当前的项目进行个性化配置，参考示例：
```javascript
import { createRequest } from '@simpleform/editor';
...

const axiosConfig = {
  // baseURL: '',
  // headers: {},
  // // 处理响应结果
  // handleResult: (data) => {

  // }
}

<FormRender plugins={{ request: createRequest(axiosConfig) }} />
```

### 请求数据源
在编辑器中比如`Select`，我们可以通过`bindRequest`高阶函数使组件具备接收`props`参数完成请求返回数据源的能力，参考示例：
```javascript

import { Checkbox } from 'antd';
import { bindRequest } from '@simpleform/editor';

const components = {
  'Checkbox.Group': bindRequest(Checkbox.Group, 'options'),
}

<FormRender components={components} />

```

## FormEditor配置项

### 上传组件
默认内置了上传组件，但是需要通过`uploadCallback`这个`props`字段来自定义接口响应的数据.有两种方式解决:
- 界面上的上传组件有`uploadCallback`（接口响应数据）配置选项，修改即可.
- 在配置`editorConfig`时重新配置上传组件的`props`
```javascript
// 在配置editorConfig时重新配置上传图片和上传文件的uploadCallback

import { EditorConfig as oldEditorConfig } from '@simpleform/editor'

const editorConfig = {
  "FileUpload": {
    ...oldEditorConfig['FileUpload'],
    props: {
      uploadCallback: "{{(data) => ({ fileId: data.fileId })}}"
    },
  },
  "ImageUpload": {
    ...oldEditorConfig['ImageUpload'],
    props: {
      uploadCallback: "{{(data) => ({ fileId: data.fileId })}}"
    },
  },
}
```

### editorConfig配置说明
```javascript

import { FieldSetting } from '@simpleform/editor';

const EditorConfig = {
  'example': {
    // EditorPanel组件上的一些信息
    panel: {
      label: 'example-demo',
    },
    // 组件名字
    label: '',
    // FormRender中注册的组件键名
    type: 'example',
    props: {},
    // EditorSetting属性面板组件的配置表单JSON
    setting: {
      // FieldSetting为表单域组件公共配置，如果是表单控件需要合并这个，非表单控件无需合并此表单JSON
      // ...FieldSetting
    }
  }
}

<EditorProvider editorConfig={EditorConfig}></EditorProvider>
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
