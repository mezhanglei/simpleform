import React from "react";
import RuleItem, { RuleCoreProps, RuleCoreRefs } from "./core";

const RequiredComponent = React.forwardRef<RuleCoreRefs, RuleCoreProps>((props, ref) => {

  return <RuleItem {...props} ref={ref} setting={{ label: '启用', valueProp: 'checked', type: 'Switch', props: {} }} />;
});

export default RequiredComponent;
