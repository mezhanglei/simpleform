import React from 'react';
import BaseSelection, { BaseSelectionProps } from '../../../view/BaseSelection';
import { CustomGenerateWidgetItem, joinFormPath, renderWidgetItem, } from "../../../formrender";
import { TableCell, TableCellProps } from './components';
import classnames from 'classnames';
import BaseDnd from '../../../view/BaseDnd';
import { getCommonOptions } from '../../../utils/utils';
import SvgIcon from '../SvgIcon';
import './index.less';
import { Menu, MenuDivider, MenuItem } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import { insertTableCol } from './utils';
import { TableProps } from '.';
import TableMergeUtils from "../../../utils/table-utils";

export type CustomTableCellProps = Omit<TableCellProps, 'draggable' | 'onSelect'> & BaseSelectionProps & {
  rows: NonNullable<TableProps['_options']>['rows'];
  rowIndex: number;
  column: TableCellProps & { children?: CustomGenerateWidgetItem[] };
  colIndex: number;
  tableUtils: TableMergeUtils
};

const CustomTableCell = React.forwardRef<HTMLTableCellElement, CustomTableCellProps>((props, ref) => {
  const {
    className,
    rows,
    rowIndex,
    column,
    colIndex,
    tableUtils,
    ...rest
  } = props;

  const { _options } = rest || {};
  const { isEditor, path, formrender } = _options || {};
  const widgetList = column?.children || [];
  const commonOptions = getCommonOptions(_options);
  const cls = classnames(className, {
    'edit-cell': isEditor
  });

  const childs = widgetList?.map((child, childIndex) => {
    const _childOptions = {
      ...commonOptions,
      index: childIndex,
      path: joinFormPath(path, 'children', childIndex),
    };
    const instance = renderWidgetItem(formrender, child, _childOptions);
    return instance;
  });

  const operateBtn = (
    <Menu menuButton={<span><SvgIcon name="menu" /></span>}>
      <MenuItem key="1" onClick={insertTableCol}>插入左侧列</MenuItem>
      <MenuItem key="2">插入右侧列</MenuItem>
      <MenuItem key="3">插入上方行</MenuItem>
      <MenuItem key="4">插入下方行</MenuItem>
      <MenuDivider />
      <MenuItem key="5" disabled>合并左侧单元格</MenuItem>
      <MenuItem key="6" disabled>合并右侧单元格</MenuItem>
      <MenuItem key="7" disabled>合并整行</MenuItem>
      <MenuDivider />
      <MenuItem key="8" disabled>合并上方单元格</MenuItem>
      <MenuItem key="9" disabled>合并下方单元格</MenuItem>
      <MenuItem key="10" disabled>合并整列</MenuItem>
      <MenuDivider />
      <MenuItem key="11" disabled>撤销行合并</MenuItem>
      <MenuItem key="12" disabled>撤销列合并</MenuItem>
      <MenuItem key="13" disabled>删除整列</MenuItem>
      <MenuItem key="14" disabled>删除整行</MenuItem>
    </Menu>
  );

  return (
    <TableCell ref={ref} className={cls} {...rest}>
      {isEditor ?
        <BaseSelection
          hiddenDel
          _options={_options}
          className="cell-selection"
          configLabel="单元格"
          tools={[operateBtn]}
        >
          <BaseDnd
            _options={_options}
            style={{ height: '100%' }}
            dndPath={joinFormPath(path, 'children')}
            dndList={widgetList}>
            {childs}
          </BaseDnd>
        </BaseSelection>
        :
        childs
      }
    </TableCell>
  );
});

export default CustomTableCell;
