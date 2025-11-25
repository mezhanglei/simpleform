import React, { useState } from 'react';
import FormRender from '../FormRender';
import { Checkbox } from 'antd';
import { Item } from './Item';

export default function Demo() {

  const widgetList = [{
    label: "姓名",
    name: 'name',
    readOnly: true,
    readOnlyRender: () => "xxx",
    props: {},
  }, {
    label: "联系电话",
    name: 'phone',
    readOnly: true,
    readOnlyRender: () => "xxxx-xxx-xxx",
    props: {},
  }, {
    label: "职位",
    name: 'job',
    readOnly: true,
    readOnlyRender: () => "产品经理",
    props: {},
  }, {
    label: "住址",
    name: 'address',
    type: 'Input',
    props: {
    },
  }]

  const [isNew, setIsNew] = useState<boolean>();

  return (
    <div>
      <Checkbox onChange={(e) => setIsNew(e.target.checked)}>切换新表单域组件</Checkbox>
      <FormRender widgetList={widgetList} options={isNew ? { component: Item } : {}} />
    </div>
  );
}