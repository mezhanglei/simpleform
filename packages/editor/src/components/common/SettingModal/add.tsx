import { Button } from "antd";
import React, { useEffect, useState } from "react";
import SettingModal, { SettingModalProps } from ".";

// 按钮点击联动弹窗
const AddSettingModal = (props: SettingModalProps) => {

  const {
    value,
    onChange,
    setting,
  } = props;

  const [codeStr, setCodeStr] = useState<string>();

  useEffect(() => {
    setCodeStr(value);
  }, [value]);

  const handOk = (val?: string) => {
    setCodeStr(val);
    onChange && onChange(val);
  };

  return (
    <SettingModal title="添加联动" setting={setting} value={codeStr} onChange={handOk} displayElement={
      (showModal) => (
        <div>
          <span>{typeof value === 'string' ? value : null}</span>
          <Button type="link" onClick={showModal}>{value ? "修改联动" : "添加联动"}</Button>
        </div>
      )
    } />
  );
};

export default AddSettingModal;
