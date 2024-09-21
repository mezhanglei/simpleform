import React from "react";
import CodeTextArea from "../CodeTextArea";
import ButtonWithRules, { ButtonWithRulesProps } from "../RulesSetting/button";

// 联动设置
const LinkageSetting: React.FC<ButtonWithRulesProps> = (props) => {

  return <ButtonWithRules {...props} widgetConfig={{ typeRender: () => <CodeTextArea /> }} />;
};

export default LinkageSetting;
