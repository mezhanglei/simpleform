import { Checkbox, CheckboxProps } from "antd";
import React, { useEffect, useState } from "react";
import SvgIcon from "../SvgIcon";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import LinkageSettingModal, { SettingModalProps } from "./modal";
import './checkbox.less';
import { CommonFormProps } from "../../../formrender";

// checkbox点击联动弹窗
const OperateCheckbox = (props: SettingModalProps & CheckboxProps & CommonFormProps<boolean | string>) => {

  const {
    value,
    onChange,
    children,
    widgetConfig = { type: 'Switch', valueProp: 'checked' },
    ...rest
  } = props;

  const [checked, setChecked] = useState<boolean>(false);
  const [codeStr, setCodeStr] = useState<string>();

  useEffect(() => {
    if (typeof value === 'string') {
      setChecked(true);
      setCodeStr(value);
    } else {
      setChecked(typeof value === 'boolean' ? value : false);
      setCodeStr(undefined);
    }
  }, [value]);

  // checkbox的变化
  const checkboxChange = (e: CheckboxChangeEvent) => {
    const checked = e?.target?.checked;
    if (codeStr) {
      setChecked(checked);
      if (checked) {
        onChange && onChange(codeStr);
      } else {
        onChange && onChange();
      }
    } else {
      setChecked(checked);
      onChange && onChange(checked);
    }
  };

  // 联动值的变化
  const handOk = (data?: string) => {
    setCodeStr(data);
    // 选中状态则直接更改值
    if (checked) {
      setChecked(true);
      onChange && onChange(data);
    }
  };

  const clearCodeStr = () => {
    // 选中状态则更改值
    if (checked) {
      onChange && onChange();
    }
    setCodeStr('');
  };

  return (
    <LinkageSettingModal
      {...rest}
      title="添加联动"
      widgetConfig={widgetConfig}
      onChange={handOk}
      value={codeStr}
      displayElement={
        (showModal) => (
          <div className="operate-setting-checkbox">
            <Checkbox checked={checked} onChange={checkboxChange} {...rest}>
              {children}
            </Checkbox>
            <SvgIcon onClick={showModal} name="edit" title="编辑" />
            {codeStr && <SvgIcon onClick={clearCodeStr} title="清除" name="qingchu" />}
          </div>
        )
      } />
  );
};

export default OperateCheckbox;
