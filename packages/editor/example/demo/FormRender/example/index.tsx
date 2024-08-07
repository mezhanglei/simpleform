import React, { useEffect } from 'react';
import FormRender, { useSimpleForm, FormRenderProps, CommonFormProps } from '..';
import data from './data';

const ExampleGroup = (props: CommonFormProps) => {
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
