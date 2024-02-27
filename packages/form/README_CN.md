# `@simpleform/form`

[English](./README.md) | 中文说明

[![](https://img.shields.io/badge/version-2.0.0-green)](https://www.npmjs.com/package/@simpleform/form)

> 表单底层组件，通过`getBindProps`方法或者回调函数方式实现表单值的显示和更新事件的绑定.

# Matters
 - 在使用之前需要先引入css样式文件，例：`import '@simpleform/form/lib/css/main.css'`;

# Form.Item

表单域组件，用于双向绑定目标控件。

- 绑定：通过表单实例的`getBindProps`或者回调函数方式，对目标控件进行值和事件的绑定。
- 更新：可通过`form.setFieldValue`等实例方法设置表单值。
- 校验规则：可以提供表单校验规则属性`rules`，进行自定义表单校验规则。

## 安装
- [Node.js](https://nodejs.org/en/) Version >= 14.0.0
- [react](https://react.docschina.org/) Version >= 16.8.0
```bash
npm install @simpleform/form --save
# 或者
yarn add @simpleform/form
```

## 基本使用

```javascript
import React from "react";
import { Form, useSimpleForm, useFormValues } from "@simpleform/form";
import '@simpleform/form/lib/css/main.css';
import { Input, Select } from "antd";

export default function Demo() {

  const form = useSimpleForm();
  const formvalues = useFormValues(form, ['name1', 'name2'])
  console.log(formvalues, 'formvalues')

  const onSubmit = async (e) => {
    e.preventDefault();
    const { error, values } = await form.validate();
    console.log(error, values, 'error ang values');
  };

  const validator = (value) => {
    if (value?.length < 2) {
      return Promise.reject(new Error('length is < 2'));
    }
  }

  return (
    <Form initialValues={{ name1: 1111 }} form={form} onSubmit={onSubmit}>
      <Form.Item label="Name1" name="name1" rules={[{ required: true, message: 'name1 is Empty' }, { validator: validator, message: 'validator error' }]}>
        <div>
          <input  {...form.getBindProps("name1")} />
        </div>
      </Form.Item>
      <Form.Item label="object" name="name2.a" rules={[{ required: true, message: 'name2.a is empty' }]}>
        <input  {...form.getBindProps("name2.a")} />
      </Form.Item>
      <Form.Item label="list" name="name3[0]" rules={[{ required: true, message: 'name3[0] is empty' }]}>
        {({ bindProps }) =>  <input {...bindProps} />}
      </Form.Item>
      <Form.Item label="">
        <button>Submit</button>
      </Form.Item>
    </Form>
  );
};
```
## APIs

### 默认的表单域显示组件的属性
- `className` `string` 类名，`可选`。
- `label` `string` 标签，`可选`。
- `labelStyle` `CSSProperties` 自定义`label`样式，`可选`。
- `labelWidth` `CSSProperties['width']`, label标签的宽度。
- `labelAlign` `CSSProperties['textAlign']`, label标签的textAlign属性。
- `inline` `boolean`, 是否设置行内布局。
- `layout` `'horizontal'|'vertical'` 设置布局类型，默认值为`horizontal`。
- `colon` `boolean` 是否添加冒号
- `required` `boolean` 是否显示星号，不包含表单校验，仅用于显示，默认值为`false`。
- `gutter` `number` 自定义`label`标签和表单组件间的距离，`可选`。
- `error` `string` 表单域显示组件的报错信息字段。
- `suffix` `React.ReactNode` 后缀节点，`可选`。
- `footer` `React.ReactNode` 底部节点，`可选`。
- `tooltip` `string` 提示图标，可以提示信息。`可选`。
- `compact` `boolean` 是否紧凑，会去掉组件的`margin-bottom`。`可选`。

### Form Props
继承表单域显示组件(`component`)的props

- `className` 表单元素类名，`可选`。
- `form` 表单数据管理，`必须`。
- `tagName` 更换表单的元素标签名, 默认`form`标签
- `initialValues` 表单的初始值，会被表单域的`initialValue`覆盖, 注意此值只能初始化表单赋值`可选`。
- `onSubmit` `form`标签提交事件, 只有提供`htmlType=submit`的`button`标签才可以触发，`可选`。
- `onReset` `form`标签触发重置默认值触发事件, 只有`htmlType=reset`的`button`标签才可以触发 `可选`。
- `onFieldsChange` 表单域 `onChange` 变化时的事件函数，只会被控件主动`onChange`触发，不会被`form.setFieldValue`和`form.setFieldsValue`触发, 避免循环调用。`可选`。
- `onValuesChange` 监听表单值的变化。`可选`。
- `watch` 监听任意字段的值的变化。


### Form.Item Props
继承表单域显示组件(`component`)的props

- `className` 表单域类名，`可选`。
- `component` 表单域显示组件。
- `name` 表单域字段名，`可选`。
- `trigger` 设置表单域收集表单值的事件名，默认`onChange`.
- `validateTrigger` 设置表单域校验的触发事件, 默认`onChange`.
- `valueProp` 回调函数对象中值的字段名，默认值为`'value'`。
- `valueGetter` 格式化输出表单值的函数，配合`valueSetter`使用, `可选`。
- `valueSetter` 格式化输入表单值的函数，配合`valueGetter`使用, `可选`。
- `rules` 表单域的校验规则 `可选`。
- `initialValue` 表单域的初始值，注意此值和`value`不同，只能表单第一次渲染时赋值`可选`。
- `onFieldsChange` 控件的值变化时的事件函数，只会被控件主动`onChange`触发，不会被`form.setFieldValue`和`form.setFieldsValue`触发, 避免循环调用。`可选`。
- `onValuesChange` 监听表单值的变化。`可选`。
- `errorClassName` 控件当有错误信息时，添加一个自定义类名，`可选`。

### 表单的rules中的校验字段
`rules`中的值的字段中的规则会按照顺序执行校验，`rules`中每一项只能设置一种规则。
- `validateTrigger` `string` 校验表单规则的触发事件, 默认`onChange`.
- `message` `string` 校验规则报错时，默认的报错信息 `可选`。
- `required` `boolean` 标记必填符号, 同时`rules`中的`required`属性为`true`也自动添加必填标记 `可选`。
- `validator` `(value) => void | boolean` 自定义校验函数, `value`为当前控件值 `可选`。
- `pattern` `RegExp | string` 表达式校验，不符合则报错 `可选`。
- `whitespace` `boolean` 空格校验 `可选`。
- `max` `number` 表单值为`string`类型时字符串最大长度；`number` 类型时为最大值；`array` 类型时为数组最大长度 `可选`。
- `min` `number` 表单值为`string`类型时字符串最小长度；`number` 类型时为最小值；`array` 类型时为数组最小长度 `可选`。

### SimpleForm
 通过`useSimpleForm`创建`form`实例, 可使用以下方法:
- `form.getFieldValue(path?: string)` 返回指定`path`的表单域的值，不指定`path`返回整个表单的值。
- `form.setFieldValue(path, value)` 更新表单域的值
- `form.setFieldsValue(obj: Partial<T>)` 设置表单域的值(覆盖)。
- `form.reset(values?: Partial<T>)` 重置表单, 可以传值重置为目标值。
- `form.validate(path?: string)` 校验表单，并返回错误信息和表单值。
- `form.getFieldError(path?: string)` 返回目标的错误信息或所有的错误信息。

### Hooks

- `useSimpleForm(defaultValues)`: 创建 `new SimpleForm()`
- `useFormError(form: SimpleForm, path?: string)`: 使用 hooks 获取指定的报错信息。
- `useFormValues(form: SimpleForm, path?: string | string[])`: 使用 hooks 获取指定的表单值。