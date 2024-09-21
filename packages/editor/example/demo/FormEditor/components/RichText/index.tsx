import React from 'react';
import { CommonFormProps } from '@simpleform/editor';
// 按钮弹窗富文本
export const RichText = React.forwardRef<HTMLDivElement, CommonFormProps<string>>((props, ref) => {

  const {
    value,
    onChange,
    _options,
    ...rest
  } = props;
  return (
    <div ref={ref} dangerouslySetInnerHTML={{ __html: _options?.initialValue as string || '' }} {...rest} />
  );
});
