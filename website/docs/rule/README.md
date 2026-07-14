---
title: RuleBuilder
order: 0
nav:
  title: RuleBuilder
  order: 2
---

# @simpleform/rule

[![](https://img.shields.io/badge/version-0.0.7-green)](https://www.npmjs.com/package/@simpleform/rule)

> 规则构建器，支持自定义配置控件.

:::warning
版本建议`>=0.0.7`
:::

# Matters

- 在使用之前需要先引入 css 样式文件，例：`import '@simpleform/rule/lib/css/main.css'`;

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

- 规则组件`RuleBuilder`的配置项

```javascript
// 组件内公共入参
export type BuilderOptions = {
  path: Array<string | number>,
  actions?: Record<string, (...args: unknown[]) => void>,
  config?: RuleBuilderConfig,
};

// 构造函数
export type RBFactory = (
  props?: BuilderOptions & {
    properties?: any,
    onChange?: (...args) => void,
  },
) => React.ReactNode;

// 字段所在域
export type RBField = {
  label?: React.ReactNode,
  name: string,
  defaultValue?: any,
  widget: string | [string, ValueOfRecord<RuleBuilderConfig['widgets']>] | any,
};

export interface RuleBuilderConfig {
  tree?: RuleBuilderGroup; // 规则树渲染数据源
  conjunctions?: Record<string, { label: string }>; // 关系符号配置
  operators?: Record<string, { label: string }>; // 操作符配置
  widgets?: Record<string, { factory?: RBFactory } & Record<string, any>>; // 组件配置
  fields?: ((options) => Array<RBField>) | Array<RBField>; // 规则行的字段列表
  // 组件固定配置项
  settings?: {
    defaultConjunction?: string, // 默认连接符
    maxNesting?: number, // 默认的最大嵌套深度
    addGroup: { text?: string, factory?: RBFactory }, // 新增规则组按钮
    addRule: { text?: string, factory?: RBFactory }, // 新增规则行按钮
    deleteGroup: { text?: string, factory?: RBFactory }, // 删除规则组按钮
    deleteRule: { text?: string, factory?: RBFactory }, // 删除规则行按钮
  };
}
```

- 规则行类型

```javascript
export interface RuleBuilderItem {
  type: string;
  properties: any;
}
```

- 规则组类型

```javascript
export interface RuleBuilderGroup {
  type: string;
  children: Array<RuleBuilderItem | RuleBuilderGroup>;
  properties: { conjunction: string };
}
```
