import React from 'react';
import FormRender, { GenerateParams } from './FormRender';
import { Input, InputProps } from 'antd';

const CustomInput: React.FC<GenerateParams & InputProps> = (props) => {
  const {
    value,
    onChange,
    // path,
    // widgetItem,
    // formrender,
    // form,
  } = props;

  // console.log(path, widgetItem, formrender, form)

  return (
    <Input value={value} onChange={onChange} />
  )
}

const components = {
  CustomInput
}

export default function Demo() {

  const widgetList = [{
    label: "自定义组件",
    layout: 'vertical',
    name: 'name1',
    type: 'CustomInput',
    props: {}
  }]

  return (
    <div>
      <FormRender components={components} widgetList={widgetList} />
    </div>
  );
}