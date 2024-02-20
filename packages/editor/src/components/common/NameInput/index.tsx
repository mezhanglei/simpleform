import { Input, InputProps, InputRef } from 'antd';
import React, { CSSProperties, useEffect, useState } from 'react';
import { convertToString, evalString } from '../../../utils/string';

// 
export interface NameInputProps extends InputProps {
  value?: any;
  onChange?: (val: any) => void;
  style?: CSSProperties;
}
const NameInput = React.forwardRef<InputRef, NameInputProps>((props, ref) => {

  const {
    value,
    onChange,
    className,
    ...rest
  } = props;

  const [curValue, setCurValue] = useState<string>();

  useEffect(() => {
    setCurValue(value);
  }, [value]);

  const onBlur: InputProps['onBlur'] = (e) => {
    onChange && onChange(e);
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

export default NameInput;
