import React, { CSSProperties, useMemo } from "react";
import classnames from "classnames";
import './index.less';
import pickAttrs from '../../../utils/pickAttrs';
import BaseSelection from '../../../view/BaseSelection';
import SvgIcon from '../SvgIcon';
import { joinFormPath, CommonFormProps, CustomGenerateWidgetItem } from "../../../formrender";
import TableCell from './TableCell';
import { getCommonOptions, setWidgetItem } from '../../../utils/utils';
import TableMergeUtils from "../../../utils/tableUtils";
import { TableCellType } from "../../../utils/tableUtils/util";
import cellConfig from '../../../config/pc/layoutTable/cell';

const prefix = "r-";
export const Classes = {
  Table: `${prefix}table`,
  TableBody: `${prefix}table-body`,
  TableRow: `${prefix}table-row`,
  TableHead: `${prefix}table-head`,
  TableCell: `${prefix}table-cell`,
};

export type LayoutTableRows = Array<Array<CustomGenerateWidgetItem & TableCellType>>;

export interface LayoutTableProps extends CommonFormProps<unknown, { rows: LayoutTableRows }> {
  className?: string;
  style?: CSSProperties;
  tableLayout?: React.CSSProperties["tableLayout"];
}

const Table = React.forwardRef<HTMLTableElement, LayoutTableProps>((props, ref) => {

  const { tableLayout, className, style, ...rest } = props;
  const { _options } = rest || {};
  const { formrender, isEditor, rows = [], path: tablePath } = _options || {};
  const commonOptions = getCommonOptions(_options);
  const rowsPath = joinFormPath(tablePath, 'rows');
  const tableUtils = useMemo(() => new TableMergeUtils<{
    children: LayoutTableRows
  }>(rows, {
    minRetainRow: 1,
    minSplitHcolspan: 1,
    minSplitVrowspan: 1,
    fixRowType: 2,
    CELL_DEFAULT_CONFIG: {
      ...cellConfig
    },
    onUpdate(newData) {
      setWidgetItem(formrender, newData?.rows, rowsPath);
    }
  }), [rows]);

  const appendTableRow = () => {
    tableUtils.insertRow(0, 0, 1);
  };

  const appendTableCol = () => {
    tableUtils.insertCol(0, 0, 1);
  };

  const childs = (
    <table
      className={classnames([Classes.Table, className])}
      style={{ tableLayout: tableLayout, ...style }}
      {...pickAttrs(rest)}
      ref={ref}
    >
      <tbody className={Classes.TableBody}>
        {
          rows?.map((cols, rowIndex) => {
            return (
              <tr className={Classes.TableRow} key={joinFormPath(tablePath, rowIndex)}>
                {
                  cols?.map((col, colIndex) => {
                    const _childOptions = {
                      ...commonOptions,
                      index: colIndex,
                      path: joinFormPath(tablePath, 'rows', rowIndex, colIndex),
                    };
                    return <TableCell key={_childOptions?.path} {...col} tableUtils={tableUtils} className={Classes.TableCell} rows={rows} rowIndex={rowIndex} cols={cols} colIndex={colIndex} _options={_childOptions} />;
                  })
                }
              </tr>
            );
          })
        }
      </tbody>
    </table>
  );

  return (
    isEditor ?
      <BaseSelection
        {...rest}
        className="table-selection"
        data-path={_options?.path}
        configLabel={_options?.panel?.label}
        tools={[<SvgIcon key="insert-row" name="insert-row" onClick={appendTableRow} />, <SvgIcon key="insert-col" name="insert-col" onClick={appendTableCol} />]}
      >
        {childs}
      </BaseSelection>
      : childs
  );
});

export default Table;
