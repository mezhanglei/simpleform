import React, { useEffect, useMemo } from "react";
import { Button, message, Table, TableProps } from "antd";
import { Form, joinFormPath } from "../../../formrender";
import { TableCell } from "./components";
import './index.less';
import { useTableData } from "../../../../utils/hooks";
import { defaultGetId } from "../../../../utils/utils";
import SvgIcon from '../../SvgIcon';
import { FormTableProps } from "..";
import pickAttrs from '../../../../utils/pickAttrs';

const CustomTableCell = (props: any) => {
  const { name, hidden, formControl, children, ...restProps } = props;
  return (
    <TableCell key={name} {...restProps}>
      {
        React.isValidElement(formControl) ?
          <Form.Item {...restProps} label="" name={name} compact>
            {hidden === true ? null : ({ bindProps }: any) => React.cloneElement(formControl, bindProps)}
          </Form.Item>
          : children
      }
    </TableCell>
  );
};

const FormTable = React.forwardRef<any, FormTableProps>((props, ref) => {
  const {
    className,
    columns = [],
    minRows = 0,
    maxRows = 50,
    disabled,
    showBtn,
    pagination = false,
    form,
    formrender,
    path,
    widgetItem,
    ...rest
  } = props;
  const curName = widgetItem?.name;
  const items = Array.from({ length: Math.max(minRows || 0) });
  const defaultValue = useMemo(() => items.map(() => ({ key: defaultGetId('row') })), [items]);
  const {
    dataSource: tableData,
    setDataSource,
    addItem,
    deleteItem
  } = useTableData<any>(defaultValue);

  useEffect(() => {
    setDataSource(defaultValue);
  }, [minRows]);

  const deleteBtn = (rowIndex: number) => {
    if (disabled) return;
    deleteItem(rowIndex);
    const old = form && form.getFieldValue(curName) || [];
    old.splice(rowIndex, 1);
  };

  const addBtn = () => {
    if (tableData?.length >= maxRows) {
      message.info(`最大行数不能超过${maxRows}`);
      return;
    }
    addItem([{ key: defaultGetId('row') }]);
  };

  const newColumns = useMemo(() => {
    const result = columns?.map((col, colIndex) => {
      const { name, label, type, props, ...restCol } = col;
      const dataIndex = name; // 列属性
      const title = label; // 列标题
      return {
        ...restCol,
        dataIndex: name,
        title: title,
        onCell: (record: unknown, rowIndex?: number) => {
          const colName = joinFormPath(curName, rowIndex, dataIndex); // 表单字段
          const colPath = joinFormPath(path, 'props.columns', colIndex); // column所在的位置
          const columnParams = {
            form,
            formrender,
            path: colPath,
            widgetItem: col,
          };
          const formControl = formrender?.createFormElement({ type, props: Object.assign({ disabled }, columnParams, props) });
          return {
            record,
            name: colName, // 拼接路径
            formControl: formControl,
            ...restCol,
          };
        },
      };
    }) as TableProps<any>['columns'] || [];
    if (showBtn) {
      // 添加删除按键
      result.unshift({
        title: '#',
        width: 50,
        render: (text: any, record, index: number) => {
          if (tableData?.length > minRows) {
            return <SvgIcon name="delete" className="delete-icon" onClick={() => deleteBtn(index)} />;
          }
        }
      });
    }
    return result;
  }, [columns, showBtn, tableData, disabled]);

  return (
    <>
      <Table
        columns={newColumns}
        dataSource={tableData}
        tableLayout="auto"
        ref={ref}
        rowKey="key"
        scroll={{ y: 400 }}
        components={{ body: { cell: CustomTableCell } }}
        pagination={pagination}
        {...pickAttrs(rest)}
      />
      {showBtn && <Button type="link" className="add-btn" disabled={disabled} onClick={addBtn}>+添加</Button>}
    </>
  );
});

export default FormTable;
