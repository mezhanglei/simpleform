import { Divider, DividerProps } from 'antd';
import React from 'react';
import { CommonFormProps } from '@simpleform/editor';

// 分割线(在拖拽过程中会出现渲染报错，所以需要移除children属性)
export const CustomDivider: React.FC<CommonFormProps<unknown> & DividerProps & { label?: string }> = (props) => {

  const {
    label,
    children,
    ...rest
  } = props;
  return (
    <Divider children={label} {...rest} />
  );
};
