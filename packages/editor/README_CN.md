# `@simpleform/editor`

[English](./README.md) | 中文说明

[![](https://img.shields.io/badge/version-2.0.3-green)](https://www.npmjs.com/package/@simpleform/editor)

> 基于`react`实现的表单设计器，支持自定义组件，模板导入导出，可视化设计等表单设计功能，二次开发非常简单。

* [在线预览](https://mezhanglei.github.io/simpleform/)
* [开发指南](https://mezhanglei.github.io/simpleform/)
* [默认组件库](https://ant.design/index-cn/) `antd@5.x`，设计器默认注册了基础的表单控件.

## 介绍
- 注册组件：目前默认`antd@5.x`，`editorConfig`可增加或者替换已有的注册组件.
- `JSON`模板：是一组`JSON`字符串，可以在编辑器中渲染（可以通过设计器的导出`JSON`功能制作）。
- 设计器模块：设计器包含四大模块
  * 组件面板`EditorPanel`
  * 操作项 `EditorTools`
  * 编辑区域`EditorView`
  * 配置属性`EditorSetting`
- 自定义功能：设计器允许两种自定义类型
  * 自定义组件：通过自定义一个组件，在设计器中注册，然后就可以在组件面板中配置该控件使用
  * 导入模板：需要通过`renderTools`函数从组件外面添加导入模板功能入口，这样可以自定义`JSON`模板列表的渲染界面.

// TODO: DEMONSTRATE API
```
