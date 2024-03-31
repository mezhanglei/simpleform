import React, { useState } from 'react';
import FormRender from './FormRender';
import { Checkbox, Radio } from 'antd';

export default function Demo() {

  const widgetList = [{
    label: "组件1",
    name: 'name1',
    type: 'Input',
    props: {},
  }, {
    label: "组件2",
    name: 'name2',
    type: 'Checkbox.Group',
    props: {
      options: [{ label: '选项1', value: 1 }, { label: '选项2', value: 2 }]
    },
  }]

  const [forbid, setForbid] = useState<boolean>();
  const [layout, setLayout] = useState('horizontal');

  return (
    <div>
      <p>
        <Checkbox onChange={(e) => setForbid(e.target.checked)}>组件自身props.disabled属性禁用</Checkbox>
      </p>
      <p>
        <Radio.Group onChange={(e) => setLayout(e.target.value)} value={layout}>
          <Radio value="horizontal">水平对齐</Radio>
          <Radio value="vertical">垂直对齐</Radio>
        </Radio.Group>
      </p>
      <FormRender widgetList={widgetList} options={{
        layout: layout,
        props: { disabled: forbid }
      }} />
    </div>
  );
}