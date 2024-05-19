import React from 'react';
import RowSelection from './row-selection';
import { RowProps } from 'antd';
import classnames from 'classnames';
import './row.less';
import { CustomRow } from '../../../formrender';
import { BaseSelectionProps } from '../../../view/BaseSelection';

export type CustomRowProps = RowProps & BaseSelectionProps;

const GridRow = React.forwardRef<HTMLDivElement, CustomRowProps>((props, ref) => {
  const {
    children,
    className,
    style,
    ...rest
  } = props;

  const { _options } = rest || {};
  const isEditor = _options?.isEditor;
  const cls = classnames(className, {
    'edit-row': isEditor
  });

  return (
    <CustomRow ref={ref} style={style} className={cls} {...rest}>
      {isEditor ?
        <RowSelection {...rest}>
          {children}
        </RowSelection>
        :
        children
      }
    </CustomRow>
  );
});

export default GridRow;
