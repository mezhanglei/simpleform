import { ColProps } from 'antd';
import classnames from 'classnames';
import React from 'react';
import ColSelection from './col-selection';
import './col.less';
import { joinFormPath, CustomCol } from '../../../formrender';
import BaseDnd from '../../../view/BaseDnd';
import { BaseSelectionProps } from '../../../view/BaseSelection';

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
        <ColSelection {...rest} >
          <BaseDnd
            {...rest}
            dndPath={joinFormPath(rest?.path, 'widgetList')}
            dndList={widgetItem?.widgetList || []}>
            {children}
          </BaseDnd>
        </ColSelection>
        :
        children
      }
    </CustomCol>
  );
});

export default GridCol;
