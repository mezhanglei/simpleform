---
title: FormRender
order: 0
nav:
  title: FormRender
  order: 1
---

# @simpleform/render
[![](https://img.shields.io/badge/version-3.0.14-green)](https://www.npmjs.com/package/@simpleform/render)

> 基于`@simpleform/form`实现的轻量级动态表单引擎，实现动态渲染表单很简单.

## 特性
- 组件注册(`components`属性): 使用之前需要注册表单控件和非表单组件，如果是表单控件需要控件内部支持`value`和`onChange`两个`props`.
- 组件描述(`widgetList`属性)：我们使用列表来描述界面UI结构, 列表中的每一项都表示一个组件节点.支持节点嵌套`widgetList`属性字段.
- 组件模块：默认导出`FormRender`, `FormRender`组件由[Form](./form)和`FormChildren`组成, 支持多模块渲染，[Form](./form)组件处理表单的值, `FormChildren`组件处理表单的渲染, 一个`Form`组件可以支持多个`FormChildren`组件在内部渲染.
- 组件联动：表单属性均可以支持字符串表达式描述联动条件(`widgetList`属性除外).

## 安装

### npm安装
推荐使用 npm 的方式安装。
- [Node.js](https://nodejs.org/en/) Version >= 14.0.0
- [react](https://react.docschina.org/) Version >= 16.8.0
```bash
npm install @simpleform/render --save
# 或者
yarn add @simpleform/render
```

### 引入样式
在使用之前需要先引入css样式文件
```javascript
import '@simpleform/render/lib/css/main.css';
```
### 基本使用
概述：1.注册组件对象 → 2.赋值给`FormRender`或`FormChildren`中的`components`即可完成前置工作
<code src="../../src/render/base.tsx"></code>

## 多模块渲染
表单引擎还支持多个`FormChildren`组件渲染，然后由`Form`组件统一处理表单值.
<code src="../../src/render/multiple.tsx"></code>

## 数组列表渲染
复杂的列表渲染增删改功能demo
<code src="../../src/render/list.tsx"></code>

## 渲染结构说明
`FormRender`或`FormChildren`使用`widgetList`列表渲染，列表中每一项均为一个渲染节点, 分为表单控件节点和非表单节点
- 表单控件节点:
具有`name`属性的节点为表单控件节点，默认携带表单域组件(`Form.Item`)，控件则由`type`和`props`生成, 使用规则[@simpleform/form](./form/usage#表单字段)，举例：
```javascript
const widgetList = [{
  label: "part2input",
  name: 'part2',
  rules: [{ required: true, message: 'part2 empty' }],
  initialValue: 1,
  type: 'Input',
  props: {}
}]
```
- 非表单节点:
无`name`属性的节点。举例：
```javascript
const widgetList = [{
  type: 'CustomCard',
  props: {}
}]
```
- 节点类型
```javascript
export type GenerateWidgetItem<T extends Record<string, any> = {}> = FormItemProps & T & {
  inside?: CustomUnionType; // 节点的内层
  outside?: CustomUnionType; // 节点的外层
  readOnly?: boolean; // 只读模式
  readOnlyRender?: CustomUnionType; // 只读模式下的组件
  typeRender?: CustomUnionType; // 自定义渲染实例
  hidden?: boolean; // 隐藏节点
  type?: string; //  注册组件
  props?: Record<string, any> & { children?: any | Array<CustomWidget> }; // 注册组件的props
  widgetList?: WidgetList; // 嵌套的子节点(会覆盖props.children)
}
```
:::warning
`readOnly`和`readOnlyRender`只在表单控件节点才会生效
:::

## 表单注册组件
表单中的任意组件都会被注入五个上下文参数: 
- `index`：当前组件所在的列表的索引数字
- `path`：当前组件所在的节点路径
- `widgetItem`：当前组件节点的所有信息
- `formrender`: `SimpleFormRender`的实例
- `form`: `SimpleForm`的实例
```jsx | pure
const CustomInput: React.FC<GenerateParams & InputProps> = (props) => {
  const {
    value,
    onChange,
    // index,
    // path,
    // widgetItem,
    // formrender,
    // form,
  } = props;

  // console.log(index, path, widgetItem, formrender, form)

  return (
    <Input value={value} onChange={onChange} />
  )
}
```

## 全局参数注入
通过`options`可设置全表单内部[Form.Item](./form#api)和组件自身的`props`，也可以注入新的其他字段到上下文参数`widgetItem`中
<code src="../../src/render/global.tsx"></code>

## 表单联动
### 普通情况下实现联动
<code src="../../src/render/linkage.tsx"></code>

### 通过javascript表达式实现联动
此方式实现联动可以进行完整的JSON转换而不丢失信息，这就意味着表单信息可以存储在服务端,然后传到客户端渲染.
<code src="../../src/render/expression.tsx"></code>

### 表达式使用规则
- 目标有且只能有一对`{{`和`}}`包裹.
- 表达式中使用的模块或变量由`plugins`注入，默认内置的有三个:
  - `form`：即`useSimpleForm()`
  - `formrender`：即`useSimpleFormRender()`
  - `formvalues`：即`form.getFieldValue()`
```javascript
import dayjs from 'dayjs';
import FormRender from "./FormRender";

const widgetList = [{
  label: "name3",
  initialValue: "{{dayjs().format('YYYY-MM-DD')}}",
  type: 'Input',
  props: {}
}]
 
<FormRender widgetList={widgetList} plugins={{ dayjs }} />
```

## API

### Hooks
- `useSimpleFormRender`: `(widgetList: WidgetItem[]) => SimpleFormRender` 等于`new SimpleFormRender()`.
- `useSimpleForm`: 继承`@simpleform/form`组件的`hooks`.

### Props
`FormRender`或`FormChildren`组件的`props`
- `widgetList`: `WidgetItem[]` 渲染表单的DSL形式的json数据
- `components`：注册表单中的所有组件;
- `plugins`：表单中需要引入的外来库;
- `options`： `GenerateFormNodeProps | ((field: GenerateFormNodeProps) => any)` 传递给表单节点组件的参数信息. 优先级比表单节点自身的参数要低
- `renderList`：提供自定义渲染列表的函数.
- `renderItem`：提供自定义渲染节点的函数.
- `onRenderChange`: `(newValue: WidgetList) => void;` `widgetList`更改时回调函数
- `formrender`: 负责渲染的表单类。通过`useSimpleFormRender()`创建，选填.
- `form`: 负责表单的值的类。通过`useSimpleForm()`创建，选填.
- `uneval`: 不执行表单中的字符串表达式.

### SimpleFormRender Method
- `updateItemByPath`: `(data?: any, path?: string) => void` 根据`path`获取对应的节点
- `setItemByPath`: `(data?: any, path?: string) => void` 根据`path`设置对应的节点
- `delItemByPath`: `(path?: string) => void` 删除路径`path`对应的节点
- `insertItemByIndex`: `(data: WidgetItem | WidgetItem[], index?: number, parent?: string) => void` 根据序号和父节点路径添加节点
- `getItemByPath`: `(path: string) => void` 获取路径`path`对应的节点
- `moveItemByPath`: `(from: { parent?: string, index: number }, to: { parent?: string, index?: number })` 把树中的选项从一个位置调换到另外一个位置
- `setWidgetList`: `(data?: WidgetList) => void` 设置表单的`widgetList`属性;
