import React from "react";
import RuleItem, { RuleCoreProps, RuleCoreRefs } from "./core";

const PatternComponent = React.forwardRef<RuleCoreRefs, RuleCoreProps>((props, ref) => {

  return <RuleItem {...props} ref={ref} setting={{
    label: '正则表达式',
    type: 'CodeTextArea',
    props: {
      placeholder: '请输入正则表达式'
    }
  }} />;
});

export default PatternComponent;
