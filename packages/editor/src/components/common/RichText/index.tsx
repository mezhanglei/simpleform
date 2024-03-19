import React from 'react';
import { CommonWidgetProps } from '../../formrender';
// 按钮弹窗富文本
export const RichText = React.forwardRef<any, CommonWidgetProps>((props, ref) => {

  const {
    widgetItem,
    ...rest
  } = props;
  return (
    <div ref={ref} dangerouslySetInnerHTML={{ __html: widgetItem?.initialValue || '' }} {...rest}>
    </div>
  );
});
