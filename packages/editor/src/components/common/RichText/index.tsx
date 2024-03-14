import React from 'react';
import { CommonWidgetProps } from '../../formrender';
// 按钮弹窗富文本
export const RichText = React.forwardRef<any, CommonWidgetProps<string>>((props, ref) => {

  const {
    value,
    onChange,
    ...rest
  } = props;

  return (
    <div ref={ref} dangerouslySetInnerHTML={{ __html: value || '' }} {...rest}>
    </div>
  );
});
