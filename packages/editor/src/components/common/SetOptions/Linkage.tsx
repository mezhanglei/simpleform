import React from "react";
import { SettingModalProps } from "../LinkageSetting/modal";
import ShowSettingModal from "../LinkageSetting/ShowSettingModal";

// 联动设置
const LinkageSetting: React.FC<SettingModalProps> = (props) => {

  return <ShowSettingModal {...props} widgetConfig={{ type: 'CodeTextArea', }} />;
};

export default LinkageSetting;
