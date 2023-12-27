# `@simpleform/form`
English | [中文说明](./README_CN.md)

[![](https://img.shields.io/badge/version-1.0.1-green)](https://www.npmjs.com/package/@simpleform/form)

> The underlying form component automatically injects `value` and `onChange` into the target control to display and update the form values.

# Matters
- The css style file needs to be introduced before it can be used, for example: `import '@simpleform/form/lib/css/main.css'`;

# Form.Item

The smallest unit of a component in a form, and nodes as an object can be nested within each other.

- Provides styles, as well as `value` (or set via `valueProp`) and `onChange` two-way bindings.
- You can customize `onChange` in outside, but you can only set the form value via an instance method such as `form.setFieldValue`.
- Custom form validation rules can be provided with the form validation rules property `rules`.
- When a non-form component or node is added outside the input form control, bind the target control by adding `data-type="ignore"` to filter the non-target node or by setting `data-name` to mark the target input form.

# Form.List

The `Form.Item` component acts as an item in the `Form.List` array type and is combined to form an array

- Only `Form.Item` items are recognised in `Form.List`, The `name` field of `Form.Item`, if set, is the field property in the array, if not, it defaults to the array serial number.
- The `rules` provided by `Form.List` are valid for all input items in the array, but have a lower priority than the `rules` of the `Form.Item` in the array

## install
- [Node.js](https://nodejs.org/en/) Version >= 14.0.0
- [react](https://react.docschina.org/) Version >= 16.8.0
```bash
npm install @simpleform/form --save
# or
yarn add @simpleform/form
```

## base

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
        <div data-type="ignore">
          <input />
        </div>
      </Form.Item>
      <Form.Item label="object" name="name2.a" rules={[{ required: true, message: 'name2.a is empty' }]}>
        <input />
      </Form.Item>
      <Form.Item label="list" name="name3[0]" rules={[{ required: true, message: 'name3[0] is empty' }]}>
        <input />
      </Form.Item>
      <Form.Item label="">
        <button>Submit</button>
      </Form.Item>
    </Form>
  );
};
```
## Form.List

```javascript
import React from "react";
import { Form, useSimpleForm } from "@simpleform/form";
import '@simpleform/form/lib/css/main.css';
import { Input, Select } from "antd";

export default function Demo() {

  const form = useSimpleForm();

  const onSubmit = async (e) => {
    e.preventDefault();
    const { error, values } = await form.validate();
    console.log(error, values, 'error ang values');
  };

  const validator = async (value) => {
    if (value?.length < 2) {
      return Promise.reject(new Error('length is < 2'));
    }
  }

  return (
    <Form form={form} onSubmit={onSubmit}>
      <Form.List name="list">
        <Form.Item
          rules={[
            { required: true, message: "list's one is Empty" },
            { validator: validator, message: "custome tips" },
          ]}
          >
          <Input />
        </Form.Item>
        <Form.Item
          rules={[{ required: true, message: "list's two is Empty" }]}
        >
          <Input />
        </Form.Item>
      </Form.List>
      <Form.Item label="">
        <button>Submit</button>
      </Form.Item>
    </Form>
  );
};

```

## APIs

### Default field display component

- `className` `string` class name, `optional`.
- `label` `string` label, `optional`.
- `labelStyle` `CSSProperties` custom label's style, `optional`.
- `labelWidth` `CSSProperties['width']`, the width of the label label.
- `labelAlign` `CSSProperties['textAlign']`, the label label's textAlign property.
- `inline` `boolea`, Whether or not field display components have inline layout.
- `layout` `'horizontal'|'vertical'` field’s display components set the layout type, the default value is `horizontal`.
- `colon` `boolean` whether add colon
- `required` `boolean` Indicates that the value of the field is required `optional`。
- `gutter` `number` The distance between field's display component custom labels and form components, `optional`.
- `error` `string` form field displays the component's error message field.
- `suffix` `React.ReactNode` Suffix node, `optional`.
- `footer` `React.ReactNode` bootom node, `optional`.
- `tooltip` `string` Tip icon to prompt for information. `optional`.
- `compact` `boolean` Whether or not compact, will remove the component's `margin-bottom`. `optional`.

### Form Props
Inherited field display component

- `className` The class name of the form element, `optional`.
- `form` The form data store, `required`.
- `tagName` Replace the element tag name of the form, default `form` tag
- `initialValues` The initial value of the form, which is overridden by the `initialValue` of the form field, Note that this value can only initialise the form `optional`.
- `onSubmit` `form` tag triggers the reset default event, only `button` tags that provide `htmlType=submit` can trigger `optional`.
- `onReset` `form` tag triggers the reset default event, only `button` tags that provide `htmlType=reset` can trigger `optional`.
- `onFieldsChange` The event function when a form changes onChange will only be triggered by the control's active `onChange`, not by `form.setFieldValue` and `form.setFieldsValue`, avoiding circular calls。`optional`.
- `onValuesChange` Listening for changes in form values.`optional`.
- `watch` Listens for changes in the value of any field.

### Form.Item Props
Inherited field display component

- `className` Form field class name, `optional`.
- `component` field display component. 
- `name` Form field name, `optional`.
- `trigger` Sets the event name of the form field to collect form values, default `onChange`.
- `validateTrigger` Sets the event for trigger form field validation, default `onChange`.
- `valueProp` The field name of the value in the callback function object, the default value is `'value'`.
- `valueGetter` A function to format the output form value, used with `valueSetter`, `optional`.
- `valueSetter` function to format input form value, used with `valueGetter`, `optional`.
- `rules` Checksum rules for form fields `optional`.
- `initialValue` The initial value of the form field, note that this value is different from `value` when the form is rendered for the first time.
- `onFieldsChange` The event function when the value of the control changes will only be triggered by the control's active `onChange`, not by `form.setFieldValue` and `form.setFieldsValue`, avoiding circular calls. `optional`.
- `onValuesChange` Listening for changes in form values.`optional`。
- `errorClassName` add a custom class name when there is an error message, `optional`.

### Form.List Props
Inherited field display component

- `className` Form field class name, `optional`.
- `component` field display component. 
- `name` Form field name, `optional`.
- `initialValue` Form field initial value, Note that this value can only initialise the form `optional`.
- `rules` Checksum rules for form fields `optional`.

### rules
The rules in the fields of the values in `rules` perform the checks in order, and only one rule can be set for each item in `rules`.
- `validateTrigger` `string` Event to trigger validate form rules, default `onChange`.
- `message` `string` Default error message when a check rule reports an error `optional`。
- `required` `boolean` The required symbol is marked, and a `required` attribute of `true` in `rules` also automatically adds the required symbol `optional`。
- `validator` `(value) => void | boolean` Custom check function, `value` is the current control value `optional`.
- `pattern` `RegExp | string` Expression check, error if does not match `optional`.
- `whitespace` `boolean` space check `optional`.
- `max` `number` Maximum length for string type; maximum length for number type; maximum length for array type `optional`.
- `min` `number` minimum length for `string` type; minimum value for `number` type; minimum length for `array` type. `optional`.

### SimpleForm
To create an instance of `form` via `useSimpleForm`, use the following:
- `form.getFieldValue(path?: string)` Returns the value of the form field for which `path` is specified, or the value of the whole form without `name`.
- `form.setFieldValue(path, value)` Update the value of a form field
- `form.setFieldsValue(obj: Partial<T>)` Set the value of the form field (override).
- `form.reset(values?: Partial<T>)` Reset the form.The value can be passed to reset to the target value.
- `form.validate(path?: string)` Checks form and returns error messages and form values.
- `form.getFieldError(path?: string)` Returns the target's error message or all error messages.

### Hooks

- `useSimpleForm(defaultValues)` create `new SimpleForm()`
- `useFormError(form: SimpleForm, path?: string)` Use hooks to get the specified form error.
- 3.0.12 `useFormValues(form: SimpleForm, path?: string | string[])` Use hooks to get the specified form values.