import { Input, InputProps, InputRef } from 'antd';
import React, { CSSProperties, useEffect, useState } from 'react';
import { CommonFormProps } from '../../../formrender';
import { convertToString, evalString } from '../../../utils/string';

// 值的输入框
export interface CodeInputProps extends Omit<InputProps, 'value' | 'onChange'>, CommonFormProps {
  style?: CSSProperties;
}
const CodeInput = React.forwardRef<InputRef, CodeInputProps>((props, ref) => {

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

  const onBlur: InputProps['onBlur'] = (e) => {
    const codeStr = e?.target?.value;
    const code = evalString(codeStr);
    onChange && onChange(code);
  };

  const handleChange: InputProps['onChange'] = (e) => {
    const codeStr = e?.target?.value;
    setCurValue(codeStr);
  };

  return (
    <Input
      ref={ref}
      value={curValue}
      onBlur={onBlur}
      onChange={handleChange}
      {...rest}
    />
  );
});

export default CodeInput;
