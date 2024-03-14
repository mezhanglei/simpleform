import React, { CSSProperties, FocusEventHandler, useEffect, useImperativeHandle, useRef, useState } from "react";
import classNames from 'classnames';
import './index.less';
import { Button } from "antd";
import { js_beautify } from 'js-beautify';
import CustomModal from "../AntdModal";
import { convertToString, evalString } from '../../../utils/string';
import { javascript } from '@codemirror/lang-javascript';
import CodeMirror, { ViewUpdate } from '@uiw/react-codemirror';
import { json } from "@codemirror/lang-json";
import { CommonWidgetProps } from "../../formrender";

const prefixCls = 'custom-editor';
const classes = {
  editor: prefixCls,
  disabled: `${prefixCls}-disabled`,
  modal: `${prefixCls}-modal`,
};
export interface EditorCodeMirrorProps extends CommonWidgetProps {
  readOnly?: boolean; // 只读
  disabled?: boolean; // 禁止编辑
  className?: string;
  style?: CSSProperties;
}
export interface EditorCodeMirrorRef {
  getStr?: () => string;
  getCode?: () => any;
}
// 代码编辑器(不可以编辑函数)
export const EditorCodeMirror = React.forwardRef<EditorCodeMirrorRef, EditorCodeMirrorProps>((props, ref) => {

  const {
    value,
    onChange,
    readOnly,
    className,
    ...rest
  } = props;

  const editorRef = useRef<ViewUpdate>(null);

  useImperativeHandle(ref, () => ({
    // 获取字符串
    getStr: () => {
      const cm = editorRef.current?.view;
      const codeStr = cm?.state.doc.toString() || '';
      return codeStr;
    },
    // 获取值
    getCode: () => {
      const cm = editorRef.current?.view;
      const codeStr = cm?.state.doc.toString() || '';
      const code = evalString(codeStr);
      return code;
    },
  }));

  const onBlur: FocusEventHandler = () => {
    const cm = editorRef.current?.view;
    const codeStr = cm?.state.doc.toString() || '';
    const code = evalString(codeStr);
    onChange && onChange(code);
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

  const [codeStr, setCodeStr] = useState<string>('');
  const codemirrorRef = useRef<EditorCodeMirrorRef>(null);

  useEffect(() => {
    const code = convertToString(value);
    setCodeStr(code ?? '');
  }, [value]);

  const handleOk = (closeModal: () => void) => {
    const codemirror = codemirrorRef.current;
    if (!codemirror) return;
    const code = codemirror.getCode() || '';
    const codeStr = codemirror.getStr() || '';
    closeModal();
    setCodeStr(codeStr);
    onChange && onChange(code);
  };

  return (
    <CustomModal title="编辑数据" onOk={handleOk} displayElement={
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
