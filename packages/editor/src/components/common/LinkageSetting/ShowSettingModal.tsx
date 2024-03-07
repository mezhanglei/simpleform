import { Button } from "antd";
import React, { useEffect, useState } from "react";
import LinkageSettingModal, { SettingModalProps } from "./modal";

// 展示联动弹窗
const ShowSettingModal = (props: SettingModalProps) => {

  const {
    value,
    onChange,
    setting,
    ...rest
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
    <LinkageSettingModal title="添加联动" {...rest} setting={setting} value={codeStr} onChange={handOk} displayElement={
      (showModal) => (
        <div>
          <span>{typeof value === 'string' ? value : null}</span>
          <Button type="link" onClick={showModal}>{value ? "修改联动" : "添加联动"}</Button>
        </div>
      )
    } />
  );
};

export default ShowSettingModal;
