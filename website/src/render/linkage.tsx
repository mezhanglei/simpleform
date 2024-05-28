import React from 'react';
import FormRender, { useFormValues, useSimpleForm } from './FormRender';

export default function Demo() {

  const form = useSimpleForm();
  const formvalues = useFormValues<any>(form);

  const widgetList = [
    {
      label: '方式1',
      name: 'name1',
      valueProp: 'checked',
      initialValue: true,
      type: 'Checkbox',
      children: '是否必填'
    },
    {
      label: "展示控件",
      name: 'name2',
      rules: [{ required: formvalues && formvalues.name1 === true, message: "name2 empty" }],
      initialValue: 1,
      type: 'Input',
      props: {}
    }
  ]

  return (
    <div>
      <FormRender form={form} widgetList={widgetList} />
    </div>
  );
}