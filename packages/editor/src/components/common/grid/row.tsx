import React from 'react';
import RowSelection from './row-selection';
import { RowProps } from 'antd';
import classnames from 'classnames';
import './row.less';
import { BaseSelectionProps } from '../BaseSelection';
import { CustomRow } from '../../formrender';

export type CustomRowProps = RowProps & BaseSelectionProps;

const GridRow = React.forwardRef<any, CustomRowProps>((props, ref) => {
  const {
    children,
    className,
    style,
    ...rest
  } = props;

  const { field } = rest || {};
  const isEditor = field?.isEditor;
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
