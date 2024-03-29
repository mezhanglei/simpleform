import React, { useState } from 'react';
import { FormChildren, Form, useSimpleForm } from './FormRender';
import { Button } from 'antd';

export default function Demo() {

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
  const [formRes, setFormRes] = useState<any>({});
  // const formrender1 = useSimpleFormRender()
  // const formrender2 = useSimpleFormRender()

  const onSubmit = async () => {
    const result = await form.validate();
    console.log(result, 'result');
    setFormRes(result);
  };

  return (
    <div style={{ padding: '0 8px' }}>
      <p>报错：<span style={{ color: 'red' }}>{formRes.error}</span></p>
      <p>提交表单值：<span style={{ color: 'green' }}>{JSON.stringify(formRes.values || {})}</span></p>
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