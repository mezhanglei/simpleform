import React from 'react';
import FormRender, { WidgetContextProps } from './FormRender';
import { Input, InputProps } from 'antd';

const CustomInput: React.FC<WidgetContextProps & InputProps> = (props) => {
  const {
    value,
    onChange,
    _options,
  } = props;

  console.log(_options, '上下文参数')

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