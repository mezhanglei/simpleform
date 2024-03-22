# `@simpleform/render`

[English](./README.md) | 中文说明

[![](https://img.shields.io/badge/version-3.0.9-green)](https://www.npmjs.com/package/@simpleform/render)

> 轻量级动态表单引擎，实现动态渲染表单很简单.

* Break Change: 建议使用3.x以上版本，提供了更好的语义化`JSON`结构。
 - 废弃 ~`properties`~ : 由`widgetList`代替.
 - 废弃 ~`onPropertiesChange`~ : 由`onRenderChange`代替.
 - `useSimpleFormRender()`的方法全部变更使用方式.

## 介绍
- 组件注册: 在`@simpleform/render`中使用的表单控件必须是具有`value`和`onChange`两个`props`的受控组件.
- 组件描述：`widgetList`数组列表描述当前的表单结构.
- 组件渲染：`Form`组件处理表单的值, `FormChildren`组件处理表单的渲染, 一个`Form`组件可以支持多个`FormChildren`组件在内部渲染.
- 组件联动：表单属性均可以支持字符串表达式描述联动条件(`widgetList`属性除外).

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
import DefaultFormRender, { FormChildren as DefaultFormChildren, FormRenderProps, FormChildrenProps } from '@simpleform/render';
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
    <DefaultFormChildren
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
    <DefaultFormRender
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

  const widgetList = [
    {
      label: "readonly",
      name: 'name1',
      readOnly: true,
      readOnlyRender: "readonly component",
      initialValue: 1111,
      hidden: '{{formvalues && formvalues.name6 == true}}',
      type: 'Input',
      props: {}
    },
    {
      label: "input",
      name: 'name2',
      rules: [{ required: true, message: 'input empty' }],
      initialValue: 1,
      hidden: '{{formvalues && formvalues.name6 == true}}',
      type: 'Input',
      props: {}
    },
    {
      label: 'list[0]',
      name: 'list[0]',
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
    },
    {
      label: 'list[1]',
      name: 'list[1]',
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
    },
    {
      label: 'first',
      name: 'name4.first',
      rules: [{ required: true, message: 'first empty' }],
      type: 'Select',
      props: {
        style: { width: '100%' },
        children: [{ type: 'Select.Option', props: { key: 1, value: '1', children: 'option1' } }]
      }
    },
    {
      label: 'second',
      name: 'name4.second',
      rules: [{ required: true, message: 'second empty' }],
      type: 'Select',
      props: {
        style: { width: '100%' },
        children: [{ type: 'Select.Option', props: { key: 1, value: '1', children: 'option1' } }]
      }
    },
    {
      label: 'name5',
      name: 'name5',
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
    {
      label: 'checkbox',
      name: 'name6',
      valueProp: 'checked',
      initialValue: true,
      rules: [{ required: true, message: 'checkbox empty' }],
      type: 'Checkbox',
      props: {
        style: { width: '100%' },
        children: 'option'
      }
    },
  ]

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
        widgetList={widgetList}
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
  
  const widgetList1 = [{
    label: "part1input",
    name: 'part1',
    rules: [{ required: true, message: 'part1 empty' }],
    initialValue: 1,
    type: 'Input',
    props: {}
  }]

  const widgetList2 = [{
    label: "part2input",
    name: 'part2',
    rules: [{ required: true, message: 'part2 empty' }],
    initialValue: 1,
    type: 'Input',
    props: {}
  }]

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
            widgetList={widgetList1}
          />
        </div>
        <div>
          <p>part2</p>
          <FormChildren
            // formrender={formrender2}
            widgetList={widgetList2}
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
复杂的列表渲染增删改功能demo
```javascript
import React, { useEffect, useState } from 'react';
import FormRender, { CustomFormRenderProps, useSimpleForm } from './form-render';
import { Button } from 'antd';

const OptionList = React.forwardRef<HTMLElement, any>((props, ref) => {

  const {
    value,
    onChange,
    ...rest
  } = props;

  const intialValue = [{ label: '', value: '' }];
  const [dataSource, setDataSource] = useState<Array<any>>([]);
  const form = useSimpleForm();

  useEffect(() => {
    const options = value || [...intialValue];
    setDataSource(options);
    form.setFieldsValue(options);
  }, [value]);

  const widgetList = dataSource.map((item, index) => ({
    type: 'row',
    props: {
      gutter: 12,
      align: 'middle',
    },
    widgetList: [
      {
        name: `[${index}]label`,
        compact: true,
        outside: { type: 'col', props: { span: 9 } },
        rules: [{ required: true }],
        type: 'Input',
        props: {
          placeholder: 'label',
          style: { width: '100%' }
        }
      },
      {
        name: `[${index}]value`,
        compact: true,
        outside: { type: 'col', props: { span: 9 } },
        rules: [{ required: true }],
        type: 'Input',
        props: {
          placeholder: 'value',
          style: { width: '100%' }
        }
      },
      {
        outside: { type: 'col', props: { span: 6 } },
        typeRender: <Button type="link" onClick={() => deleteItem(index)}>delete</Button>
      },
    ]
  }));

  const deleteItem = (index: number) => {
    const oldData = [...dataSource];
    if (!oldData) return;
    const newData = [...oldData];
    newData.splice(index, 1);
    setDataSource(newData);
    form.setFieldsValue(newData);
    onChange && onChange(newData);
  };

  const addItem = () => {
    const { error } = await form.validate();
    if (error) {
      return;
    }
    const newData = dataSource.concat(intialValue);
    form.setFieldsValue(newData);
    setDataSource(newData);
  };

  const onFieldsChange: CustomFormRenderProps['onFieldsChange'] = (_, values) => {
    setDataSource(values);
    onChange && onChange(values);
  };

  return (
    <div>
      <FormRender
        form={form}
        widgetList={widgetList}
        onFieldsChange={onFieldsChange}
      />
      <Button type="link" onClick={addItem}>
        add
      </Button>
    </div>
  );
});

export default OptionList;
```

## API

### Form`s props
来源于[@simpleform/form](../form);

### FormChildren's props
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

### SimpleFormRender's Methods
- `updateItemByPath`: `(data?: any, path?: string) => void` 根据`path`获取对应的节点
- `setItemByPath`: `(data?: any, path?: string) => void` 根据`path`设置对应的节点
- `delItemByPath`: `(path?: string) => void` 删除路径`path`对应的节点
- `insertItemByIndex`: `(data: WidgetItem | WidgetItem[], index?: number, parent?: string) => void` 根据序号和父节点路径添加节点
- `getItemByPath`: `(path: string) => void` 获取路径`path`对应的节点
- `moveItemByPath`: `(from: { parent?: string, index: number }, to: { parent?: string, index?: number })` 把树中的选项从一个位置调换到另外一个位置
- `setWidgetList`: `(data?: WidgetList) => void` 设置表单的`widgetList`属性;

### Hooks
- `useSimpleFormRender()`: 创建 `new SimpleFormRender()`.
- `useSimpleForm(defaultValues)`: 创建 `new SimpleForm()`

## 其他

### widgetList结构说明
`widgetList`列表中每一项均为一个渲染节点, 分为表单控件节点和非控件节点
- 表单控件节点:
具有`name`属性的节点为表单控件节点，默认携带表单域组件(`Form.Item`)，举例：
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
- 普通组件节点:
无`name`属性的节点。举例：
```javascript
const widgetList = [{
  type: 'CustomCard',
  props: {}
}]
```
- 节点的属性
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
  path?: string;
  widgetItem?: GenerateWidgetItem<T>;
  formrender?: SimpleFormRender;
  form?: SimpleForm;
};
```
### 表单控件name字段的规则
`name`字段可表示数组或对象中某个属性字段的位置路径

举例：
- `a[0]`表示数组a下面的第一个选项
- `a.b` 表示a对象的b属性
- `a[0].b`表示数组a下面的第一个选项的b属性

### 字符串表达式用法
 表单节点中属性字段除`widgetList`外均可以支持字符串表达式来进行联动
 1. 快速使用：用`{{`和`}}`包裹目标属性值的计算表达式
```javascript
  ...

  const widgetList = [
    {
      label: 'name1',
      name: 'name1',
      valueProp: 'checked',
      initialValue: true,
      type: 'Checkbox',
      props: {
        children: 'option'
      }
    },
    {
      label: "name2",
      name: 'name2',
      rules: '{{[{ required: formvalues && formvalues.name1 === true, message: "name2 empty" }]}}',
      initialValue: 1,
      type: 'Input',
      props: {}
    }
  ]

  // OR

  const widgetList = [
    {
      label: 'name1',
      name: 'name1',
      valueProp: 'checked',
      initialValue: true,
      type: 'Checkbox',
      props: {
        children: 'option'
      }
    },
    {
      label: "name2",
      name: 'name2',
      hidden: '{{formvalues && formvalues.name1 === true}}',
      initialValue: 1,
      type: 'Input',
      props: {}
    },
  ]
```
2. 字符串表达式的使用规则
- 一个字符串有且只能有一对`{{`和`}}`.
- 除了内置的三个变量(`form`(即`useSimpleForm()`), `formrender`(即`useSimpleFormRender()`), `formvalues`(表单值对象))以外, 还可以通过`plugins`引入外部模块, 然后在字符串表达式内直接引用该变量名.
```javascript
import dayjs from 'dayjs';
import FormRender from "./form-render";

const widgetList = [{
  label: "name3",
  initialValue: "{{dayjs().format('YYYY-MM-DD')}}",
  type: 'Input',
  props: {}
}]
 
<FormRender widgetList={widgetList} plugins={{ dayjs }} />
```
