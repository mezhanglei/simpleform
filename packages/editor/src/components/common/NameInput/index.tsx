import { Input, InputProps, InputRef } from 'antd';
import React, { useEffect, useState } from 'react';

export interface NameInputProps extends InputProps {
}
const NameInput = React.forwardRef<InputRef, NameInputProps>((props, ref) => {

  const {
    value,
    onChange,
    className,
    ...rest
  } = props;

  const [curValue, setCurValue] = useState<InputProps['value']>();

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
