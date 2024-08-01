import { ColProps } from 'antd';
import classnames from 'classnames';
import React from 'react';
import './col.less';
import { joinFormPath, CustomCol, renderWidgetItem, CustomGenerateWidgetItem } from '../../../formrender';
import BaseDnd from '../../../view/BaseDnd';
import { BaseSelectionProps } from '../../../view/BaseSelection';
import SvgIcon from '../SvgIcon';
import { getCommonOptions, insertWidgetItem } from '../../../utils/utils';
import BaseSelection from '../../../view/BaseSelection';
import { getParent } from '../../../formrender';
import GridColConfig from '../../../config/pc/grid/col';

export type CustomColProps = Omit<ColProps, 'draggable' | 'onSelect'> & BaseSelectionProps & {
  column: ColProps & { children?: CustomGenerateWidgetItem[] };
  colIndex: number;
};
// col组件
const GridCol = React.forwardRef<HTMLDivElement, CustomColProps>((props, ref) => {
  const {
    className,
    style,
    column,
    colIndex,
    ...rest
  } = props;

  const { _options } = rest || {};
  const { isEditor, path, formrender } = _options || {};
  const widgetList = column?.children;
  const commonOptions = getCommonOptions(_options);
  const cls = classnames(className, {
    'edit-col': isEditor
  });

  const addCol = () => {
    const nextIndex = (colIndex || 0) + 1;
    const newItem = {
      ...GridColConfig,
      children: []
    };
    insertWidgetItem(formrender, newItem, nextIndex, getParent(path));
  };

  const childs = widgetList?.map((child, childIndex) => {
    const _childOptions = {
      ...commonOptions,
      index: childIndex,
      path: joinFormPath(path, 'children', childIndex),
    };
    const instance = renderWidgetItem(formrender, child, _childOptions);
    return instance;
  });

  return (
    <CustomCol ref={ref} style={style} className={cls} {...rest}>
      {isEditor ?
        <BaseSelection
          _options={_options}
          className="col-selection"
          configLabel="栅格列"
          tools={[<SvgIcon key="add" name="add" onClick={addCol} />]}
        >
          <BaseDnd
            _options={_options}
            dndPath={joinFormPath(path, 'children')}
            dndList={widgetList}>
            {childs}
          </BaseDnd>
        </BaseSelection>
        :
        childs
      }
    </CustomCol>
  );
});

export default GridCol;
