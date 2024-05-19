# `@simpleform/editor`

English | [中文说明](./README_CN.md)

[![](https://img.shields.io/badge/version-3.1.15-green)](https://www.npmjs.com/package/@simpleform/editor)

> Based on `react` implementation of the form designer , support for custom components , template import and export , visual design and other form design features , the secondary development is very simple .

* [Preview](https://mezhanglei.github.io/simpleform/demo/#/)
* [Guide](https://mezhanglei.github.io/simpleform/docs/#/)
* [UI widgets](https://ant.design/index-cn/) `antd@5.x`, the designer registers the base form control by default.

## Introduction
- Designer Composition: The designer consists of six modules
  * Configuration context `EditorProvider`: provides the context for the editor
  * Configuration panel `EditorPanel`: configures the display list of registered components
  * Operation area `EditorTools`: the operation area of the designer
  * Edit area `EditorView`: the editor area of the designer.
  * Configuration property component `EditorSetting`: displays the corresponding property configuration form when the component is selected by the mouse.
  * Renderer `FormRender`: the core component for form rendering in the designer, you need to configure the registered component and related properties before using it.
- Customization features: The designer allows two types of customization
  * Custom Component: By customizing a component and registering it in the designer and renderer, you can then configure the control for use in the component panel.
  * Import Templates: You need to add an import template entry from outside the designer component via the `renderTools` function.


Translated with DeepL.com (free version)


Translated with DeepL.com (free version)

## install
- [Node.js](https://nodejs.org/en/) Version >= 14.0.0
- [react](https://react.docschina.org/) Version >= 16.8.0
```bash
npm install @simpleform/editor --save
# 或者
yarn add @simpleform/editor
```
