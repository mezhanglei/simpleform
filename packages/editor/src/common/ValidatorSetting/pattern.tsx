import React from "react";
import CodeTextArea from "../CodeTextArea";
import RuleItem, { RuleCoreProps, RuleCoreRefs } from "./core";

const PatternComponent = React.forwardRef<RuleCoreRefs, RuleCoreProps>((props, ref) => {

  return <RuleItem {...props} ref={ref} widgetConfig={{
    label: '正则表达式',
    typeRender: () => <CodeTextArea placeholder="请输入正则表达式" />,
  }} />;
});

export default PatternComponent;
