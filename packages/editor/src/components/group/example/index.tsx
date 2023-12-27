import React from 'react';
import FormRender, { useSimpleForm, FormRenderProps } from '../../formrender';
import FormConfigs from './render';

const ExampleGroup = (props: any) => {
  const form = useSimpleForm();
  const { value, onChange } = props;

  const handleChange: FormRenderProps['onFieldsChange'] = (_, values) => {
    onChange && onChange(values);
  };

  return <FormRender form={form} properties={FormConfigs} onFieldsChange={handleChange} />;
};

export default ExampleGroup;
