import { Input } from 'antd';
import { TextAreaProps } from 'antd/lib/input';
import { TextAreaRef } from 'antd/lib/input/TextArea';
import React, { useEffect, useState } from 'react';
import { CommonFormProps } from '../../../formrender';
import { convertToString, evalString } from '../../../utils/string';

// 函数代码编辑器
export interface CodeTextAreaProps extends Omit<TextAreaProps, 'value'|'onChange'>,CommonFormProps {
}
const CodeTextArea = React.forwardRef<TextAreaRef, CodeTextAreaProps>((props, ref) => {

  const {
    value,
    onChange,
    className,
    ...rest
  } = props;

  const [curValue, setCurValue] = useState<string>();

  useEffect(() => {
    setCurValue(convertToString(value));
  }, [value]);

  const onBlur: TextAreaProps['onBlur'] = (e) => {
    const codeStr = e?.target?.value;
    const code = evalString(codeStr);
    onChange && onChange(code);
  };

  const handleChange: TextAreaProps['onChange'] = (e) => {
    const codeStr = e?.target?.value;
    setCurValue(codeStr);
  };

  return (
    <Input.TextArea
      ref={ref}
      value={curValue}
      onBlur={onBlur}
      onChange={handleChange}
      {...rest}
    />
  );
});

export default CodeTextArea;
