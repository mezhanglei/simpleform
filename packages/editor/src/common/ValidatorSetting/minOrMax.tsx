import { InputNumber } from "antd";
import React from "react";
import RuleItem, { RuleCoreProps, RuleCoreRefs } from "./core";

const MinOrMaxComponent = React.forwardRef<RuleCoreRefs, RuleCoreProps>((props, ref) => {

  return <RuleItem {...props} ref={ref} widgetConfig={{
    label: '数值',
    typeRender: () => <InputNumber placeholder="请输入" />,
  }} />;
});

export default MinOrMaxComponent;
