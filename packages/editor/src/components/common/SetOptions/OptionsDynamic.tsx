import React from "react";
import AddSettingModal from "../SettingModal/add";

const OptionsDynamicSetting: React.FC = (props) => {

  return <AddSettingModal {...props} setting={{ type: 'CodeTextArea', }} />;
};

export default OptionsDynamicSetting;
