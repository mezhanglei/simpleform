import React from 'react';
import { Col, ColProps, Row, RowProps } from "antd";
import { FRContext } from '../typings';
import './grid.less';
import classnames from 'classnames';

// 列宽
export const getColProps = (props: ColProps, inline?: boolean) => {
  const { xs, sm, md, lg, span, ...restProps } = props || {};
  const maxspan = 24;
  // 计算layout带来的影响
  const getValue = (inline?: boolean, value?: ColProps['xs']) => {
    if (!inline) {
      return value ?? (span || maxspan);
    }
  };
  return {
    xs: getValue(inline, xs),
    sm: getValue(inline, sm),
    md: getValue(inline, md),
    lg: getValue(inline, lg),
    ...restProps
  };
};

export interface CustomRowProps extends RowProps, FRContext {
  children?: React.ReactNode;
}
// row组件
export const CustomRow = React.forwardRef<HTMLDivElement, CustomRowProps>((props, ref) => {
  const {
    _options,
    children,
    className,
    ...rest
  } = props;
  const cls = classnames('custom-row', className);
  return (
    <Row ref={ref} className={cls} {...rest}>
      {children}
    </Row>
  );
});

export interface CustomColProps extends ColProps, FRContext {
  children?: React.ReactNode;
}
// col组件
export const CustomCol = React.forwardRef<HTMLDivElement, CustomColProps>((props, ref) => {
  const {
    _options,
    className,
    children,
    ...rest
  } = props;
  const calcProps = getColProps(rest, _options?.inline);
  const cls = classnames('custom-col', className);
  return (
    <Col ref={ref} className={cls} {...calcProps}>
      {children}
    </Col>
  );
});
