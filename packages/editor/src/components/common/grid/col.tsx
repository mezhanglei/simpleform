import { ColProps } from 'antd';
import classnames from 'classnames';
import React from 'react';
import ColSelection from './col-selection';
import './col.less';
import { BaseSelectionProps } from '../BaseSelection';
import { CustomCol } from '../../formrender';
import FormDnd from '../../../view/FormDnd';

export type CustomColProps = ColProps & BaseSelectionProps;
// col组件
const GridCol = React.forwardRef<any, CustomColProps>((props, ref) => {
  const {
    className,
    children,
    style,
    ...rest
  } = props;

  const { widgetItem } = rest || {};
  const isEditor = widgetItem?.isEditor;

  const cls = classnames(className, {
    'edit-col': isEditor
  });

  return (
    <CustomCol ref={ref} style={style} className={cls} {...rest}>
      {isEditor ?
        <ColSelection {...rest}>
          <FormDnd {...rest}>
            {children}
          </FormDnd>
        </ColSelection>
        :
        children
      }
    </CustomCol>
  );
});

export default GridCol;
