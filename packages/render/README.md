# `@simpleform/render`

English | [中文说明](./README_CN.md)

[![](https://img.shields.io/badge/version-3.0.6-green)](https://www.npmjs.com/package/@simpleform/render)

> A lightweight dynamic forms engine that makes it easy to dynamically render forms.

* Break Change: Version >= 3.x is recommended, providing a better semanticized `JSON` structure.
 - Deprecated ~`properties`~ : Replaced by `widgetList`.
 - Deprecated ~`onPropertiesChange`~ : replaced by `onRenderChange`.
 - All methods of `useSimpleFormRender()` are changed.
## Introduction
- Component Registration: The form control used in `@simpleform/render` must be a controlled component with `value` and `onChange` `props`.
- Component Description: `widgetList` array list describing the current form structure.
- Component Rendering: `Form` component handles the values of the form, `FormChildren` component handles the rendering of the form, a `Form` component can support multiple `FormChildren` components for internal rendering.
- Component linkage: All form properties can support string expressions to describe linkage conditions (except `widgetList` property).

## install
- [Node.js](https://nodejs.org/en/) Version >= 14.0.0
- [react](https://react.docschina.org/) Version >= 16.8.0
```bash
npm install @simpleform/render --save
# 或者
yarn add @simpleform/render
```
## Quick Start

### 1. First register the basic components (Take antd@5.x as an example)
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
### 2. Introduce the components that were registered in the first step.
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
### 3. Multi-module rendering
The form engine also supports rendering by multiple `FormChildren` components, which then unify the processing of form values by the `Form` component.
- `useSimpleForm`: Creates a managed instance of a form value.
- `useSimpleFormRender`: creates an instance that renders the form.
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
### 4. List Demo
Support for array rendering
```javascript
import React, { useState } from 'react';
import FormRender, { useSimpleForm } from './form-render';
import { Button } from 'antd';
export default function Demo(props) {
  const form = useSimpleForm();
  const widgetList =
    [
      {
        label: "list-0",
        name: 'list[0]',
        rules: [{ required: true, message: 'list[0] empty' }],
        initialValue: 1,
        type: 'Input',
        props: {}
      },
      {
        label: "list-1",
        name: 'list[1]',
        rules: [{ required: true, message: 'list[1] empty' }],
        initialValue: 2,
        type: 'Input',
        props: {}
      },
      {
        label: "list-2",
        name: 'list[2]',
        rules: [{ required: true, message: 'list[2] empty' }],
        initialValue: 3,
        type: 'Input',
        props: {}
      },
      {
        label: "list-3",
        name: 'list[3]',
        rules: [{ required: true, message: 'list[3] empty' }],
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
        widgetList={widgetList}
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
Sourced from [@simpleform/form](../form);

### FormChildren's props
- `widgetList`: `WidgetItem[]` Renders the form's DSL form json data
- `components`: registers all components in the form.
- `plugins`: foreign libraries to be introduced in the form.
- `options`: `GenerateFormNodeProps | ((field: GenerateFormNodeProps) => any)` Parameter information passed to the form node components. The priority is lower than the form node's own parameters
- `renderList`: Provides a function to customize the rendered list.
- `renderItem`: provides a function to customize the rendering of the node.
- `onRenderChange`: `(newValue: WidgetList) => void;` `onRenderChange` change callback function.
- `formrender`: The form class responsible for rendering. Created by `useSimpleFormRender()`, optional.
- `form`: Class responsible for the value of the form. Created via `useSimpleForm()`, optional.
- `uneval`: does not execute string expressions in the form.

### SimpleFormRender's Methods
- `updateItemByPath`: `(data?: any, path?: string) => void` Get the corresponding node based on `path`.
- `setItemByPath`: `(data?: any, path?: string) => void` Sets the corresponding node according to `path`.
- `delItemByPath`: `(path?: string) => void` Removes the node corresponding to the path `path`.
- `insertItemByIndex`: `(data: WidgetItem | WidgetItem[], index?: number, parent?: string) => void` Adds a node based on the serial number and the path of the parent node.
- `getItemByPath`: `(path: string) => void` Get the node corresponding to the path `path`.
- `moveItemByPath`: `(from: { parent?: string, index: number }, to: { parent?: string, index?: number })` Swap options in the tree from one position to another
- `setWidgetList`: `(data?: WidgetList) => void` Sets the `widgetList` attribute of the form.

### Hooks
- `useSimpleFormRender()`: create `new SimpleFormRender()`.
- `useSimpleForm(defaultValues)`: create `new SimpleForm()`

## Other

### widgetList structure description
Each item in the `widgetList` list is a rendering node, divided into a form control node and nonform node.
- Form control nodes.
Nodes with the `name` attribute are form control nodes and carry the form field component (`Form.Item`) by default, for example:
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
- nonform node.
Nodes without the `name` attribute. Example:
```javascript
const widgetList = [{
  type: 'CustomCard',
  props: {}
}]
```
- Form Node's types
```javascript
export type GenerateWidgetItem<T extends Record<string, any> = {}> = FormItemProps & T & {
  inside?: CustomUnionType; // The inner layer of the node
  outside?: CustomUnionType; // The outside layer of the node
  readOnly?: boolean; // read-only mode
  readOnlyRender?: CustomUnionType; // Read-only mode rendering
  typeRender?: CustomUnionType; // Registering components for custom rendering
  hidden?: boolean;
  type?: string; //  Register the component
  props?: Record<string, any> & { children?: any | Array<CustomWidget> }; // Register the component's props
  widgetList?: WidgetList; // children of the component(will override props.children)
}
```
### parameter injection
- The properties of the form node are set globally:
Set the global properties of the form node via 'options'
```javascript

  ...
  
  <FormRender
    options={{
      layout: 'vertical',
      props: { disabled: true }
    }}
  />
```

- Parameters received by the registration component of the form:
The registration component in the form receives a context parameter
```javascript
export interface GenerateParams<T = {}> {
  path?: string;
  widgetItem?: GenerateWidgetItem<T>;
  formrender?: SimpleFormRender;
  form?: SimpleForm;
};
```
### Path path rules involved in forms
Forms are allowed to be nested, so the form involves looking for a certain property. The paths follow certain rules
Example:
- `a[0]` denotes the first option below the array `a`
- `a.b` denotes the `b` attribute of the `a` object
- `a[0].b` represents the `b` attribute of the first option below the array `a`

### String Expression Usage
Property fields in a form node can support string expressions for linkage, except for `widgetList`.
1. Quick use: computational expressions wrapping target attribute values in `{{` and `}}`
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
2. Rules for the use of string expressions
- A string has and can have only one pair of `{{` and `}}`.
- In addition to the three built-in variables (`form` (i.e., `useSimpleForm()`), `formrender` (i.e., `useSimpleFormRender()`), `formvalues`)), you can introduce an external variable via `plugins` and then reference the variable name directly in the string expression. in a string expression.
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