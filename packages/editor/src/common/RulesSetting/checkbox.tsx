import { Checkbox, CheckboxProps, Switch } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import './checkbox.less';
import SvgIcon from "../SvgIcon";
import CustomModal, { CustomModalProps } from "../AntdModal";
import RulesEditor, { RulesEditorProps, RulesEditorRef } from "./RulesEditor";

export type CheckboxWithRulesProps = CustomModalProps & CheckboxProps & RulesEditorProps<boolean | string>
// checkbox框触发规则编辑器
const CheckboxWithRules = (props: CheckboxWithRulesProps) => {

  const {
    value,
    onChange,
    children,
    widgetConfig = { typeRender: () => <Switch />, valueProp: 'checked' },
    ...rest
  } = props;

  const [checked, setChecked] = useState<boolean>(false);
  const [codeStr, setCodeStr] = useState<string>();
  const rulesEditorRef = useRef<RulesEditorRef>(null);

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

  // 确认
  const handOk = (closeModal: () => void) => {
    const val = rulesEditorRef.current?.getValue?.() as string;
    setCodeStr(val);
    if (codeStr) {
      closeModal();
    }
    // 选中状态则直接更改值
    if (checked) {
      setChecked(true);
      onChange && onChange(val);
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
    <CustomModal
      onOk={handOk}
      modalProps={{
        title: "添加联动",
        destroyOnClose: false
      }}
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
      }>
      <RulesEditor value={codeStr} widgetConfig={widgetConfig} {...rest} />
    </CustomModal>
  );
};

export default CheckboxWithRules;
