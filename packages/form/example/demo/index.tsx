import React from 'react';
import "./index.less";
// import { Form, useFormStore, useFormValues } from '../../lib';
import { Form, useFormStore, useFormValues } from '../../src';

export default function Demo() {

  const form = useFormStore();

  const onSubmit = async (e) => {
    e.preventDefault();
    const { error, values } = await form.validate();
    console.log(error, values, 'error ang values');
  };

  const validator = (value) => {
    if (value?.length < 2) {
      return Promise.reject(new Error('length is < 2'));
    }
  };

  const formvalues = useFormValues(form);
  console.log(formvalues, '监听表单值变化');

  return (
    <Form initialValues={[{ name1: 1111 }]} form={form} onSubmit={onSubmit}>
      <Form.List>
        <Form.Item tooltip='11111' label="Name1" name="name1" rules={[{ required: true, message: 'name1 is Empty' }, { validator: validator, message: '自定义校验' }]}>
          <div data-type="ignore">
            <input />
          </div>
        </Form.Item>
        <Form.Item label="Name2" name="name2.a" rules={[{ required: true, message: 'name2 is empty' }]}>
          <input />
        </Form.Item>
        <Form.Item label="">
          <button>Submit</button>
        </Form.Item>
      </Form.List>
    </Form>
  );
};
