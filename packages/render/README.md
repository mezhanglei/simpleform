# `@simpleform/render`

English | [中文说明](./README_CN.md)

[![](https://img.shields.io/badge/version-2.0.5-green)](https://www.npmjs.com/package/@simpleform/render)

> A lightweight dynamic forms engine that makes it easy to dynamically render forms.

## Introduction
- Component Registration: Form controls used in `@simpleform/render` must be controlled components with `value` and `onChange` props.
- Component Description: `properties` supports rendering of object or array types, and adding nested object fields via the `properties` property.
- Component Rendering: `Form` component handles form values, `FormChildren` component handles form rendering, a `Form` component can support multiple `FormChildren` components rendering inside.
- Component linkage: All form properties can support string expressions to describe linkage conditions (except `properties`).

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
### 3. Multi-module rendering
The form engine also supports rendering by multiple `FormChildren` components, which then unify the processing of form values by the `Form` component.
- `useSimpleForm`: Creates a managed instance of a form value.
- `useSimpleFormRender`: creates an instance that renders the form.
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
### 4. List Demo
Support for array rendering
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
Sourced from [@simpleform/form](../form);

### FormChildren's props
- `properties`: `{ [name: string]: FormNodeProps } | FormNodeProps[]` Renders the form's DSL form json data
- `components`: registers all components in the form.
- `plugins`: foreign libraries to be introduced in the form.
- `options`: `GenerateFormNodeProps | ((field: GenerateFormNodeProps) => any)` Parameter information passed to the form node components. The priority is lower than the form node's own parameters
- `renderList`: Provides a function to customize the rendered list.
- `renderItem`: provides a function to customize the rendering of the node.
- `onPropertiesChange`: `(newValue: PropertiesData) => void;` `Properties` change callback function.
- `formrender`: The form class responsible for rendering. Created by `useSimpleFormRender()`, optional.
- `form`: Class responsible for the value of the form. Created via `useSimpleForm()`, optional.
- `uneval`: does not execute string expressions in the form.

### SimpleFormRender's Methods
- `updateItemByPath`: `(data?: any, path?: string, attributeName?: string) => void` Updates the node corresponding to the path `path`, if updating a specific attribute in the node then the `attributeName` parameter is required.
- `setItemByPath`: `(data?: any, path?: string, attributeName?: string) => void` Sets the node corresponding to the path `path`, the `attributeName` parameter is required if you are updating a specific attribute in the node.
- `updateNameByPath`: `(newName?: string, path: string) => void` Updates the name key of the specified path.
- `delItemByPath`: `(path?: string, attributeName?: string) => void` Deletes the node corresponding to the path `path`, if deleting a specific attribute in the node then the `attributeName` parameter is required.
- `insertItemByIndex`: `(data: InsertItemType, index?: number, parent?: { path?: string, attributeName?: string }) => void` Adds an option based on the serial number and the path of the parent node.
- `getItemByPath`: `(path?: string, attributeName?: string) => void` Get the node that corresponds to the path `path`, or the `attributeName` parameter if it is a specific attribute in the node.
- `moveItemByPath`: `(from: { parent?: string, index: number }, to: { parent?: string, index?: number })` Swap options in the tree from one location to another.
- `setProperties`: `(data?: Partial<FormNodeProps>) => void` sets `properties`.

### Hooks
- `useSimpleFormRender()`: create `new SimpleFormRender()`.
- `useSimpleForm(defaultValues)`: create `new SimpleForm()`

## Other

### Properties structure description
Each item in the `properties` property is a form node, and the nodes are categorized into nested nodes and control nodes.
- Nested nodes.
Nodes that have a `properties` property that describes which component the node is, via the `type` and `props` fields, and do not carry a form field component (`Form.Item`).
- Form control Node.
A node with no `properties` attribute that carries the form field component (`Form.Item`) by default.
```javascript
const properties = {
  name3: {
    // Nested nodes
    // type: '',
    // props: {},
    properties: {
      // Control node
      first: {
        label: 'first',
        rules: [{ required: true, message: 'first empty' }],
        type: 'Select',
        props: {
          style: { width: '100%' },
          children: [{ type: 'Select.Option', props: { key: 1, value: '1', children: 'option1' } }]
        }
      }
    }
  },
}
```
- Form Node's types
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

// Component
export type CustomUnionType = FormComponent | Array<FormComponent> | UnionComponent<any> | Function | ReactNode
// FormRender's properties
export type PropertiesData = { [name: string]: FormNodeProps } | FormNodeProps[]
// field's props(String expressions after compilation)
export type GenerateFormNodeProps<T = {}> = FormComponent & FormItemProps & T & {
  ignore?: boolean; // Mark the current node as a non-form node
  inside?: CustomUnionType; // Nested components within nodes
  outside?: CustomUnionType; // Nested components in the outer layer of the node
  readOnly?: boolean; // read-only mode
  readOnlyRender?: CustomUnionType; // Read-only mode rendering
  typeRender?: CustomUnionType; // Registering components for custom rendering
  properties?: PropertiesData;
  hidden?: boolean;
}
// field's props(String expressions before compilation)
export type FormNodeProps = {
  [key in keyof GenerateFormNodeProps]: key extends 'rules' ?
  (string | Array<{ [key in keyof FormRule]: FormRule[key] | string }> | GenerateFormNodeProps[key])
  : (key extends 'properties' ? GenerateFormNodeProps[key] : (string | GenerateFormNodeProps[key]))
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
  name?: string;
  path?: string;
  field?: GenerateFormNodeProps<T>;
  parent?: { name?: string; path?: string, field?: GenerateFormNodeProps<T>; };
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
Property fields in a form node can support string expressions for linkage, except for `properties`.
1. Quick use: computational expressions wrapping target attribute values in `{{` and `}}`
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
2. Rules for the use of string expressions
- A string has and can have only one pair of `{{` and `}}`.
- In addition to the three built-in variables (`form` (i.e., `useSimpleForm()`), `formrender` (i.e., `useSimpleFormRender()`), `formvalues`)), you can introduce an external variable via `plugins` and then reference the variable name directly in the string expression. in a string expression.
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