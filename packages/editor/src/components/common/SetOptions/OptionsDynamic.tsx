import React from "react";
import ShowSettingModal from "../LinkageSetting/ShowSettingModal";

const OptionsDynamicSetting: React.FC = (props) => {

  return <ShowSettingModal {...props} setting={{ type: 'CodeTextArea', }} />;
};

export default OptionsDynamicSetting;
