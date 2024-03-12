# `@simpleform/render`

[English](./README.md) | 中文说明

[![](https://img.shields.io/badge/version-2.0.7-green)](https://www.npmjs.com/package/@simpleform/render)

> 轻量级动态表单引擎，实现动态渲染表单很简单.

## 介绍
- 组件注册: 在`@simpleform/render`中使用的表单控件必须是具有`value`和`onChange`两个props的受控组件.
- 组件描述：`properties`支持对象或者数组类型的渲染，支持通过`properties`属性添加嵌套对象字段。
- 组件渲染：`Form`组件处理表单的值, `FormChildren`组件处理表单的渲染, 一个`Form`组件可以支持多个`FormChildren`组件在内部渲染.
- 组件联动：表单属性均可以支持字符串表达式描述联动条件(`properties`除外).

## 安装
- [Node.js](https://nodejs.org/en/) Version >= 14.0.0
- [react](https://react.docschina.org/) Version >= 16.8.0
```bash
npm install @simpleform/render --save
# 或者
yarn add @simpleform/render
```

## 快速启动

### 1.首先注册基本组件(以antd@5.x组件库为例)
```javascript
// register
import FormRenderCore, { FormChildren as FormChildrenCore, FormRenderProps, FormChildrenProps } from '@simpleform/render';
import '@simpleform/render/lib/css/main.css';
import React from 'react';
import dayjs from 'dayjs';
import {
  Input,
  InputNumber,
  Checkbox,
  DatePicker,
  Mentions,
  Radio,
  Rate,
  Select,
  Slider,
  Switch,
  TimePicker,
  TreeSelect,
} from 'antd';

export * from '@simpleform/render';

export const widgets = {
  "Input": Input,
  "Input.TextArea": Input.TextArea,
  "Input.Password": Input.Password,
  "Input.Search": Input.Search,
  "InputNumber": InputNumber,
  "Checkbox": Checkbox,
  'Checkbox.Group': Checkbox.Group,
  "DatePicker": DatePicker,
  "DatePicker.RangePicker": DatePicker.RangePicker,
  "Mentions": Mentions,
  "Mentions.Option": Mentions.Option,
  "Radio": Radio,
  "Radio.Group": Radio.Group,
  "Radio.Button": Radio.Button,
  "Rate": Rate,
  "Select": Select,
  "Select.Option": Select.Option,
  "TreeSelect": TreeSelect,
  "Slider": Slider,
  "Switch": Switch,
  "TimePicker": TimePicker,
  "TimePicker.RangePicker": TimePicker.RangePicker
};

export type CustomFormChildrenProps = FormChildrenProps<any>;
export function FormChildren(props: CustomFormChildrenProps) {
  const { components, plugins, ...rest } = props;
  return (
    <FormChildrenCore
      options={{ props: { autoComplete: 'off' } }}
      components={{ ...widgets, ...components }}
      plugins={{ ...plugins, dayjs }}
      {...rest}
    />
  );
}
export type CustomFormRenderProps = FormRenderProps<any>;
export default function FormRender(props: CustomFormRenderProps) {
  const { components, plugins, ...rest } = props;
  return (
    <FormRenderCore
      options={{ props: { autoComplete: 'off' } }}
      components={{ ...widgets, ...components }}
      plugins={{ ...plugins, dayjs }}
      {...rest}
    />
  );
};
```
### 2. 引入第一步已经注册完的组件
```javascript
import { Button } from 'antd';
import React, { useState } from 'react';
import FormRender, { useSimpleForm, useSimpleFormRender } from './form-render';
export default function Demo5(props) {

  const watch = {
    'name2': (newValue, oldValue) => {
      console.log(newValue, oldValue)
    },
    'name3[0]': (newValue, oldValue) => {
      console.log(newValue, oldValue)
    },
    'name4': (newValue, oldValue) => {
      console.log(newValue, oldValue)
    }
  }

  const properties = {
      name1: {
        label: "readonly",
        readOnly: true,
        readOnlyRender: "readonly component",
        initialValue: 1111,
        hidden: '{{formvalues && formvalues.name6 == true}}',
        type: 'Input',
        props: {}
      },
      name2: {
        label: "input",
        rules: [{ required: true, message: 'input empty' }],
        initialValue: 1,
        hidden: '{{formvalues && formvalues.name6 == true}}',
        type: 'Input',
        props: {}
      },
      name3: {
        // type: '',
        // props: {},
        properties: [{
          label: 'list[0]',
          rules: [{ required: true, message: 'list[0] empty' }],
          initialValue: { label: 'option1', value: '1', key: '1' },
          type: 'Select',
          props: {
            labelInValue: true,
            style: { width: '100%' },
            children: [
              { type: 'Select.Option', props: { key: 1, value: '1', children: 'option1' } },
              { type: 'Select.Option', props: { key: 2, value: '2', children: 'option2' } }
            ]
          }
        }, {
          label: 'list[1]',
          rules: [{ required: true, message: 'list[1] empty' }],
          type: 'Select',
          props: {
            labelInValue: true,
            style: { width: '100%' },
            children: [
              { type: 'Select.Option', props: { key: 1, value: '1', children: 'option1' } },
              { type: 'Select.Option', props: { key: 2, value: '2', children: 'option2' } }
            ]
          }
        }]
      },
      name4: {
        // type: '',
        // props: {},
        properties: {
          first: {
            label: 'first',
            rules: [{ required: true, message: 'first empty' }],
            type: 'Select',
            props: {
              style: { width: '100%' },
              children: [{ type: 'Select.Option', props: { key: 1, value: '1', children: 'option1' } }]
            }
          },
          second: {
            label: 'second',
            rules: [{ required: true, message: 'second empty' }],
            type: 'Select',
            props: {
              style: { width: '100%' },
              children: [{ type: 'Select.Option', props: { key: 1, value: '1', children: 'option1' } }]
            }
          }
        }
      },
      name5: {
        label: 'name5',
        initialValue: { span: 12 },
        valueSetter: "{{(value)=> (value && value['span'])}}",
        valueGetter: "{{(value) => ({span: value})}}",
        type: 'Select',
        props: {
          style: { width: '100%' },
          children: [
            { type: 'Select.Option', props: { key: 1, value: 12, children: 'option1' } },
            { type: 'Select.Option', props: { key: 2, value: 6, children: 'option2' } },
            { type: 'Select.Option', props: { key: 3, value: 4, children: 'option3' } }
          ]
        }
      },
      name6: {
        label: 'checkbox',
        valueProp: 'checked',
        initialValue: true,
        rules: [{ required: true, message: 'checkbox empty' }],
        type: 'Checkbox',
        props: {
          style: { width: '100%' },
          children: 'option'
        }
      },
    }

  const form = useSimpleForm();
  // const formrender = useSimpleFormRender();

  const onSubmit = async (e) => {
    e?.preventDefault?.();
    const result = await form.validate();
    console.log(result, 'result');
  };

  return (
    <div>
      <FormRender
        form={form}
        // formrender={formrender}
        properties={properties}
        watch={watch} />
      <div style={{ marginLeft: '120px' }}>
        <Button onClick={onSubmit}>submit</Button>
      </div>
    </div>
  );
}
```

### 3. 多模块渲染
表单引擎还支持多个`FormChildren`组件渲染，然后由`Form`组件统一处理表单值.
- `useSimpleForm`: 创建表单值的管理实例.
- `useSimpleFormRender`: 创建渲染表单的实例.
```javascript
import React, { useState } from 'react';
import { FormChildren, Form, useSimpleForm } from './form-render';
import { Button } from 'antd';
export default function Demo(props) {
  
  const properties1 = {
    part1: {
      label: "part1input",
      rules: [{ required: true, message: 'name1 empty' }],
      initialValue: 1,
      type: 'Input',
      props: {}
    },
  }

  const properties2 = {
    part2: {
      label: "part2input",
      rules: [{ required: true, message: 'name1 empty' }],
      initialValue: 1,
      type: 'Input',
      props: {}
    },
  }

  const form = useSimpleForm();
  // const formrender1 = useSimpleFormRender()
  // const formrender2 = useSimpleFormRender()

  const onSubmit = async (e) => {
    e?.preventDefault?.();
    const result = await form.validate();
    console.log(result, 'result');
  };

  return (
    <div style={{ padding: '0 8px' }}>
      <Form form={form}>
        <div>
          <p>part1</p>
          <FormChildren
            // formrender={formrender1}
            properties={properties1}
          />
        </div>
        <div>
          <p>part2</p>
          <FormChildren
            // formrender={formrender2}
            properties={properties2}
          />
        </div>
      </Form>
      <div style={{ marginLeft: '120px' }}>
        <Button onClick={onSubmit}>submit</Button>
      </div>
    </div>
  );
}
```
### 4. 数组数据
支持数组渲染
```javascript
import React, { useState } from 'react';
import FormRender, { useSimpleForm } from './form-render';
import { Button } from 'antd';
export default function Demo(props) {
  const form = useSimpleForm();
  const properties =
    [
      {
        label: "list-0",
        rules: [{ required: true, message: 'name1 empty' }],
        initialValue: 1,
        type: 'Input',
        props: {}
      },
      {
        label: "list-1",
        rules: [{ required: true, message: 'name1 empty' }],
        initialValue: 2,
        type: 'Input',
        props: {}
      },
      {
        label: "list-2",
        rules: [{ required: true, message: 'name1 empty' }],
        initialValue: 3,
        type: 'Input',
        props: {}
      },
      {
        label: "list-3",
        rules: [{ required: true, message: 'name1 empty' }],
        initialValue: 4,
        type: 'Input',
        props: {}
      },
    ];

  const onSubmit = async (e) => {
    e?.preventDefault?.();
    const result = await form.validate();
    console.log(result, 'result');
  };

  return (
    <div style={{ padding: '0 8px' }}>
      <FormRender
        form={form}
        properties={properties}
      />
      <div style={{ marginLeft: '120px' }}>
        <Button onClick={onSubmit}>submit</Button>
      </div>
    </div>
  );
}
```

## API

### Form`s props
来源于[@simpleform/form](../form);

### FormChildren's props
- `properties`: `{ [name: string]: FormNodeProps } | FormNodeProps[]` 渲染表单的DSL形式的json数据
- `components`：注册表单中的所有组件;
- `plugins`：表单中需要引入的外来库;
- `options`： `GenerateFormNodeProps | ((field: GenerateFormNodeProps) => any)` 传递给表单节点组件的参数信息. 优先级比表单节点自身的参数要低
- `renderList`：提供自定义渲染列表的函数.
- `renderItem`：提供自定义渲染节点的函数.
- `onPropertiesChange`: `(newValue: PropertiesData) => void;` `properties`更改时回调函数
- `formrender`: 负责渲染的表单类。通过`useSimpleFormRender()`创建，选填.
- `form`: 负责表单的值的类。通过`useSimpleForm()`创建，选填.
- `uneval`: 不执行表单中的字符串表达式.

### SimpleFormRender's Methods
- `updateItemByPath`: `(data?: any, path?: string, attributeName?: string) => void` 更新路径`path`对应的节点，如果更新节点中的具体属性则需要`attributeName`参数
- `setItemByPath`: `(data?: any, path?: string, attributeName?: string) => void` 设置路径`path`对应的节点，如果设置节点中的具体属性则需要`attributeName`参数
- `updateNameByPath`: `(newName?: string, path: string) => void` 更新指定路径的name键
- `delItemByPath`: `(path?: string, attributeName?: string) => void` 删除路径`path`对应的节点，如果删除节点中的具体属性则需要`attributeName`参数
- `insertItemByIndex`: `(data: InsertItemType, index?: number, parent?: { path?: string, attributeName?: string }) => void` 根据序号和父节点路径添加选项
- `getItemByPath`: `(path?: string, attributeName?: string) => void` 获取路径`path`对应的节点，如果是节点中的具体属性则需要`attributeName`参数
- `moveItemByPath`: `(from: { parent?: string, index: number }, to: { parent?: string, index?: number })` 把树中的选项从一个位置调换到另外一个位置
- `setProperties`: `(data?: Partial<FormNodeProps>) => void` 设置`properties`;

### Hooks
- `useSimpleFormRender()`: 创建 `new SimpleFormRender()`.
- `useSimpleForm(defaultValues)`: 创建 `new SimpleForm()`

## 其他

### properties结构说明
`properties`属性中每一项均为一个表单节点，节点分为嵌套节点和控件节点。
- 嵌套节点:
有`properties`属性的节点，通过`type`和`props`字段描述该节点为哪个组件，不携带表单域组件(`Form.Item`)。
- 控件节点:
无`properties`属性的节点，默认携带表单域组件(`Form.Item`)。
```javascript
const properties = {
  name3: {
    // 嵌套节点
    // type: '',
    // props: {},
    properties: {
      // 控件节点
      first: {
        label: 'first',
        rules: [{ required: true, message: 'first empty' }],
        type: 'Select',
        props: {
          style: { width: '100%' },
          children: [{ type: 'Select.Option', props: { key: 1, value: '1', children: 'option1' } }]
        }
      },
    }
  },
}
```
- 节点的类型
```javascript
export interface FormComponent {
  type?: string;
  props?: any & { children?: any | Array<FormComponent> };
}

export type UnionComponent<P> =
  | React.ComponentType<P>
  | React.ForwardRefExoticComponent<P>
  | React.FC<P>
  | keyof React.ReactHTML;

// 表单上的组件联合类型
export type CustomUnionType = FormComponent | Array<FormComponent> | UnionComponent<any> | Function | ReactNode
// 表单对象
export type PropertiesData = { [name: string]: FormNodeProps } | FormNodeProps[]
// 表单域(字符串表达式编译后)
export type GenerateFormNodeProps<T = {}> = FormComponent & FormItemProps & T & {
  ignore?: boolean; // 标记当前节点为非表单节点
  inside?: CustomUnionType; // 节点内层嵌套组件
  outside?: CustomUnionType; // 节点外层嵌套组件
  readOnly?: boolean; // 只读模式
  readOnlyRender?: CustomUnionType; // 只读模式展示的组件
  typeRender?: CustomUnionType; // 自定义注册组件
  properties?: PropertiesData;
  hidden?: boolean;
}
// 表单域(字符串表达式编译前)
export type FormNodeProps = {
  [key in keyof GenerateFormNodeProps]: key extends 'rules' ?
  (string | Array<{ [key in keyof FormRule]: FormRule[key] | string }> | GenerateFormNodeProps[key])
  : (key extends 'properties' ? GenerateFormNodeProps[key] : (string | GenerateFormNodeProps[key]))
}
```

### 参数注入
- 表单节点的属性全局设置：
通过`options`设置表单节点的全局属性
```javascript

  ...

  <FormRender
    options={{
      layout: 'vertical',
      props: { disabled: true }
    }}
  />
```

- 表单中的注册组件接收的参数:
表单中的注册组件会接收到上下文参数
```javascript
export interface GenerateParams<T = {}> {
  name?: string;
  path?: string;
  field?: GenerateFormNodeProps<T>;
  parent?: { name?: string; path?: string, field?: GenerateFormNodeProps<T>; };
  formrender?: SimpleFormRender;
  form?: SimpleForm;
};
```
### 表单的中涉及的path路径规则
表单允许嵌套，所以表单中会涉及寻找某个属性。其路径遵循一定的规则

举例：
- `a[0]`表示数组a下面的第一个选项
- `a.b` 表示a对象的b属性
- `a[0].b`表示数组a下面的第一个选项的b属性

### 字符串表达式用法
 表单节点中属性字段除`properties`外均可以支持字符串表达式来进行联动
 1. 快速使用：用`{{`和`}}`包裹目标属性值的计算表达式
```javascript
  ...

  const properties = {
    name1: {
      label: 'name1',
      valueProp: 'checked',
      initialValue: true,
      type: 'Checkbox',
      props: {
        children: 'option'
      }
    },
    name2: {
      label: "name2",
      rules: '{{[{ required: formvalues && formvalues.name1 === true, message: "name2 empty" }]}}',
      initialValue: 1,
      type: 'Input',
      props: {}
    },
  }

  // OR

  const properties = {
    name1: {
      label: 'name1',
      valueProp: 'checked',
      initialValue: true,
      type: 'Checkbox',
      props: {
        children: 'option'
      }
    },
    name2: {
      label: "name2",
      hidden: '{{formvalues && formvalues.name1 === true}}',
      initialValue: 1,
      type: 'Input',
      props: {}
    },
  }
```
2. 字符串表达式的使用规则
- 一个字符串有且只能有一对`{{`和`}}`.
- 除了内置的三个变量(`form`(即`useSimpleForm()`), `formrender`(即`useSimpleFormRender()`), `formvalues`(表单值对象))以外, 还可以通过`plugins`引入外部模块, 然后在字符串表达式内直接引用该变量名.
```javascript
import dayjs from 'dayjs';
import FormRender from "./form-render";

const properties = {
   name3: {
     label: "name3",
     initialValue: "{{dayjs().format('YYYY-MM-DD')}}",
     type: 'Input',
     props: {}
   },
 }
 
<FormRender properties={properties} plugins={{ dayjs }} />
```