---
title: RuleBuilder
order: 0
nav:
  title: RuleBuilder
  order: 2
---

# @simpleform/rule
[![](https://img.shields.io/badge/version-0.0.5-green)](https://www.npmjs.com/package/@simpleform/rule)

> 规则构建器，支持自定义配置控件.

# Matters
 - 在使用之前需要先引入css样式文件，例：`import '@simpleform/rule/lib/css/main.css'`;

## 安装
- [Node.js](https://nodejs.org/en/) Version >= 14.0.0
- [react](https://react.docschina.org/) Version >= 16.8.0
```bash
npm install @simpleform/rule --save
# 或者
yarn add @simpleform/rule
```

### 基本使用
<code src="../../src/rule/base/index.tsx"></code>

### 类型

- 规则行类型
```javascript
export interface RuleBuilderRule {
  type: string;
  properties: any;
}
```
- 规则组类型
```javascript
export interface RuleBuilderGroup {
  type: string;
  children: Array<RuleBuilderRule | RuleBuilderGroup>;
  properties: { conjunction: string };
}
```