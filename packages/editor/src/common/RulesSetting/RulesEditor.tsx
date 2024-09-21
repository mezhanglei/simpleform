import React, { useEffect, useImperativeHandle, useState } from "react";
import './RulesEditor.less';
import {
  CommonFormProps,
  EditorGenerateWidgetItem
} from "../../typings";

export interface RulesEditorProps<V> extends CommonFormProps<V> {
  widgetConfig?: EditorGenerateWidgetItem;
}

export interface RulesEditorRef {
  getValue?: () => unknown;
}

/**
 * 规则编辑器
 */
const RulesEditor = React.forwardRef<RulesEditorRef, RulesEditorProps<string>>((props, ref) => {

  const {
    value,
    onChange,
    widgetConfig,
    _options
  } = props;

  useImperativeHandle(ref, () => ({
    getValue: () => {
      // return val;
    }
  }));

  const handleOk = (closeModal: () => void) => {
    closeModal();
    // onChange && onChange(codeStr);
  };


  return (
    <div>2024-10-01号之前更新完成</div>
  );
});

export default RulesEditor;
