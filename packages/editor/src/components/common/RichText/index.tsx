import React from 'react';
import { EditorSelection } from '../../formrender';
// 按钮弹窗富文本
export const RichText = React.forwardRef<any, EditorSelection>((props, ref) => {

  const {
    widgetItem,
    ...rest
  } = props;
  return (
    <div ref={ref} dangerouslySetInnerHTML={{ __html: widgetItem?.initialValue || '' }} {...rest}>
    </div>
  );
});
