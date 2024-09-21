import { Button } from "antd";
import React, { useEffect, useRef, useState } from "react";
import CustomModal, { CustomModalProps } from "../AntdModal";
import RulesEditor, { RulesEditorProps, RulesEditorRef } from "./RulesEditor";

export type ButtonWithRulesProps = CustomModalProps & RulesEditorProps<string>;
// 按钮触发添加规则编辑器
const ButtonWithRules = (props: ButtonWithRulesProps) => {

  const {
    value,
    onChange,
    widgetConfig,
    ...rest
  } = props;

  const [codeStr, setCodeStr] = useState<string>();
  const rulesEditorRef = useRef<RulesEditorRef>(null);

  useEffect(() => {
    setCodeStr(value);
  }, [value]);

  const handOk = (closeModal: () => void) => {
    const val = rulesEditorRef.current?.getValue?.() as string;
    if (codeStr) {
      closeModal();
    }
    setCodeStr(val);
    onChange && onChange(val);
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
          <div>
            <span>{typeof value === 'string' ? value : null}</span>
            <Button type="link" onClick={showModal}>{value ? "修改联动" : "添加联动"}</Button>
          </div>
        )
      }>
      <RulesEditor ref={rulesEditorRef} value={codeStr} widgetConfig={widgetConfig} {...rest} />
    </CustomModal>
  );
};

export default ButtonWithRules;
