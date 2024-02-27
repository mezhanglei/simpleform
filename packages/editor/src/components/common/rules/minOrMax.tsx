import React from "react";
import RuleItem, { RuleCoreProps, RuleCoreRefs } from "./core";

const MinOrMaxComponent = React.forwardRef<RuleCoreRefs, RuleCoreProps>((props, ref) => {

  return <RuleItem {...props} ref={ref} setting={{
    label: '数值',
    type: 'InputNumber',
    props: {
      placeholder: '请输入'
    }
  }} />;
});

export default MinOrMaxComponent;
