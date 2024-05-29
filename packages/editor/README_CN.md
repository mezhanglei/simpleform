# `@simpleform/editor`

[English](./README.md) | 中文说明

[![](https://img.shields.io/badge/version-4.0.2-green)](https://www.npmjs.com/package/@simpleform/editor)

> 基于`react`实现的表单设计器，支持自定义组件，模板导入导出，可视化设计等表单设计功能，二次开发非常简单。

* [在线预览](https://mezhanglei.github.io/simpleform/demo/#/)
* [开发指南](https://mezhanglei.github.io/simpleform/docs/#/)
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
  * 导入模板：需要通过`renderTools`函数从设计器组件外面添加导入模板功能入口

## 安装
- [Node.js](https://nodejs.org/en/) Version >= 14.0.0
- [react](https://react.docschina.org/) Version >= 16.8.0
```bash
npm install @simpleform/editor --save
# 或者
yarn add @simpleform/editor
```
