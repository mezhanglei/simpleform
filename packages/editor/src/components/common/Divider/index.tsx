import { Divider, DividerProps } from 'antd';
import React from 'react';
import { CommonWidgetProps } from '../../formrender';

// 分割线(在拖拽过程中会出现渲染报错，所以需要移除children属性)
export const CustomDivider = React.forwardRef<any, CommonWidgetProps & DividerProps & { label?: string }>((props, ref) => {

  const {
    label,
    children,
    ...rest
  } = props;
  return (
    <Divider children={label} {...rest} />
  );
});
