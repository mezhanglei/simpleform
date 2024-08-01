import React, { CSSProperties, useMemo } from "react";
import classnames from "classnames";
import './index.less';
import { TableBody, TableRow } from "./components";
import pickAttrs from '../../../utils/pickAttrs';
import BaseSelection from '../../../view/BaseSelection';
import SvgIcon from '../SvgIcon';
import { joinFormPath, CommonFormProps, CustomGenerateWidgetItem } from "../../../formrender";
import TableCell from './TableCell';
import { getCommonOptions, setWidgetItem } from '../../../utils/utils';
import TableMergeUtils from "../../../utils/table-utils";
import { TableCellType } from "../../../utils/table-utils/util";

const prefix = "r-";
export const Classes = {
  Table: `${prefix}table`,
  TableBody: `${prefix}table-body`,
  TableRow: `${prefix}table-row`,
  TableHead: `${prefix}table-head`,
  TableCell: `${prefix}table-cell`,
};

export interface TableProps extends CommonFormProps<unknown, { rows?: Array<Array<CustomGenerateWidgetItem & TableCellType>>; }> {
  className?: string;
  style?: CSSProperties;
  tableLayout?: React.CSSProperties["tableLayout"];
}

const Table = React.forwardRef<HTMLTableElement, TableProps>((props, ref) => {

  const { tableLayout, className, style, ...rest } = props;
  const { _options } = rest || {};
  const { formrender, isEditor, rows = [], path: tablePath } = _options || {};
  const commonOptions = getCommonOptions(_options);
  const rowsPath = joinFormPath(tablePath, 'rows');
  const tableUtils = useMemo(() => new TableMergeUtils(rows, {
    minRetainRow: 1,
    minSplitHcolspan: 1,
    minSplitVrowspan: 1,
    fixRowType: 2,
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
      <TableBody className={Classes.TableBody}>
        {
          rows?.map((cols, rowIndex) => {
            return (
              <TableRow className={Classes.TableRow} key={joinFormPath(tablePath, rowIndex)}>
                {
                  cols?.map((col, colIndex) => {
                    const colProps = { ..._options?.props, ...col?.props, tableUtils };
                    const _childOptions = {
                      ...commonOptions,
                      ...col,
                      props: colProps,
                      index: colIndex,
                      path: joinFormPath(tablePath, 'rows', rowIndex, colIndex),
                    };
                    return <TableCell key={_childOptions?.path} {...colProps} className={Classes.TableCell} rows={rows} rowIndex={rowIndex} column={col} colIndex={colIndex} _options={_childOptions} />;
                  })
                }
              </TableRow>
            );
          })
        }
      </TableBody>
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
