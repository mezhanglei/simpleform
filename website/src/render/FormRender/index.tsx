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

export type CustomFormChildrenProps = FormChildrenProps;
export function FormChildren(props: CustomFormChildrenProps) {
  const { components, variables, ...rest } = props;
  return (
    <DefaultFormChildren
      options={{ props: { autoComplete: 'off' } }}
      components={{ ...widgets, ...components }}
      variables={{ ...variables, dayjs }}
      {...rest}
    />
  );
}
export type CustomFormRenderProps = FormRenderProps;
export default function FormRender(props: CustomFormRenderProps) {
  const { components, variables, ...rest } = props;
  return (
    <DefaultFormRender
      options={{ props: { autoComplete: 'off' } }}
      components={{ ...widgets, ...components }}
      variables={{ ...variables, dayjs }}
      {...rest}
    />
  );
};
