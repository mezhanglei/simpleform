import React, { useEffect } from 'react';
import FormRender, { useSimpleForm, FormRenderProps } from '../../../FormRender';
import FormConfigs from './render';

const ExampleGroup = (props: any) => {
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
    properties={FormConfigs}
    onFieldsChange={handleChange}
    options={{ props: { disabled } }}
  />;
};

export default ExampleGroup;
