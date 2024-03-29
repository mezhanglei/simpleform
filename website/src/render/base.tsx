import { Button } from 'antd';
import React, { useState } from 'react';
import FormRender, { useSimpleForm } from './FormRender';

export default function Demo() {

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
  const [formRes, setFormRes] = useState<any>({});
  // const formrender = useSimpleFormRender();

  const onSubmit = async (e: any) => {
    e?.preventDefault?.();
    const result = await form.validate();
    console.log(result, 'result');
    setFormRes(result);
  };

  return (
    <div>
      <p>报错：<span style={{ color: 'red' }}>{formRes.error}</span></p>
      <p>提交表单值：<span style={{ color: 'green' }}>{JSON.stringify(formRes.values || {})}</span></p>
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