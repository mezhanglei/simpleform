import React, { CSSProperties, FocusEventHandler, useImperativeHandle, useRef } from "react";
import classNames from 'classnames';
import './index.less';
import { Button } from "antd";
import { js_beautify } from 'js-beautify';
import CustomModal from "../AntdModal";
import { javascript } from '@codemirror/lang-javascript';
import CodeMirror, { ViewUpdate } from '@uiw/react-codemirror';
import { json } from "@codemirror/lang-json";
import { CommonFormProps } from "../../typings";
import { convertToString, evalString } from "../../utils";

const prefixCls = 'custom-editor';
const classes = {
  editor: prefixCls,
  disabled: `${prefixCls}-disabled`,
  modal: `${prefixCls}-modal`,
};
export interface EditorCodeMirrorProps extends CommonFormProps {
  readOnly?: boolean; // 只读
  disabled?: boolean; // 禁止编辑
  className?: string;
  style?: CSSProperties;
}
export interface EditorCodeMirrorRef {
  getValue?: () => unknown;
}
// 代码编辑器(不可以编辑函数)
export const EditorCodeMirror = React.forwardRef<EditorCodeMirrorRef, EditorCodeMirrorProps>((props, ref) => {

  const {
    value,
    onChange,
    readOnly,
    className,
  } = props;

  const editorRef = useRef<ViewUpdate>(null);

  useImperativeHandle(ref, () => ({
    getValue: () => {
      const cm = editorRef.current?.view;
      const codeStr = cm?.state.doc.toString() || '';
      const val = evalString(codeStr);
      return val;
    }
  }));

  const onBlur: FocusEventHandler = () => {
    const cm = editorRef.current?.view;
    const codeStr = cm?.state.doc.toString() || '';
    const val = evalString(codeStr);
    onChange?.(val);
  };

  const codeStr = convertToString(value);
  const formatStr = codeStr && js_beautify(codeStr, {
    indent_size: 2
  });

  return (
    <CodeMirror
      ref={editorRef}
      value={formatStr}
      editable={readOnly ? false : true}
      className={classNames(classes.editor, className, readOnly ? classes.disabled : '')}
      extensions={[javascript(), json()]}
      onBlur={onBlur}
    />
  );
});

// 代码编辑器弹窗
export const EditorCodeMirrorModal = (props: EditorCodeMirrorProps) => {

  const {
    value,
    onChange,
    readOnly,
    disabled,
  } = props;

  const codemirrorRef = useRef<EditorCodeMirrorRef>(null);

  const handleOk = (closeModal: () => void) => {
    const codemirror = codemirrorRef.current;
    if (!codemirror) return;
    const val = codemirror.getValue?.() || '';
    closeModal();
    onChange && onChange(val);
  };

  const codeStr = convertToString(value);

  return (
    <CustomModal modalProps={{ title: '编辑数据' }} onOk={handleOk} displayElement={
      (showModal) => (
        <div>
          <span>{codeStr}</span>
          <Button type="link" disabled={disabled} onClick={showModal}>编辑数据</Button>
        </div>
      )
    }>
      <EditorCodeMirror
        ref={codemirrorRef}
        value={value}
        readOnly={readOnly}
      />
    </CustomModal>
  );
};
