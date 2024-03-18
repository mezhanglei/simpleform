import React, { useEffect } from 'react';
import { CommonWidgetProps } from '../../../../../src';
import FormRender, { useSimpleForm, FormRenderProps } from '../../../FormRender';
import data from './data';

const ExampleGroup = (props: CommonWidgetProps) => {
  const form = useSimpleForm();
  const { value, onChange, disabled } = props;

  useEffect(() => {
    if (form) {
      form.setFieldsValue(value);
    }
  }, [value]);

  const handleChange: FormRenderProps['onFieldsChange'] = (_, values) => {
    onChange && onChange(values);
  };

  return <FormRender
    form={form}
    widgetList={data}
    onFieldsChange={handleChange}
    options={{ props: { disabled } }}
  />;
};

export default ExampleGroup;
