import React, { useState } from "react";
import { Form, useSimpleForm } from "@simpleform/form";
import '@simpleform/form/lib/css/main.css';

export default function Demo() {

  const [formRes, setFormRes] = useState<any>({});
  const form = useSimpleForm();

  const onSubmit = async (e: any) => {
    e.preventDefault();
    const { error, values } = await form.validate() || {};
    console.log(error, values, 'error ang values');
    setFormRes({ error, values });
  };

  const validator = (value: unknown) => {
    if (value?.length < 2) {
      return Promise.reject(new Error('length is < 2'));
    }
  }
  
  return (
    <div>
      <p>报错：<span style={{ color: 'red' }}>{formRes.error}</span></p>
      <p>提交表单值：<span style={{ color: 'green' }}>{JSON.stringify(formRes.values || {})}</span></p>
      <Form initialValues={{ name1: 1111 }} form={form} onSubmit={onSubmit}>
        <Form.Item tooltip="提示信息" label="Name1" name="name1" rules={[{ required: true, message: 'name1 is Empty' }, { validator: validator, message: 'validator error' }]}>
          {({ bindProps }: any) => (
            <div>
              <input  {...bindProps} />
            </div>
          )}
        </Form.Item>
        <Form.Item label="object" name="name2.a" rules={[{ required: true, message: 'name2.a is empty' }]}>
          {({ bindProps }: any) => <input {...bindProps} />}
        </Form.Item>
        <Form.Item label="list" name="name3[0]" rules={[{ required: true, message: 'name3[0] is empty' }]}>
          {({ bindProps }: any) => <input {...bindProps} />}
        </Form.Item>
        <Form.Item label="">
          <button>Submit</button>
        </Form.Item>
      </Form>
    </div>
  );
};
