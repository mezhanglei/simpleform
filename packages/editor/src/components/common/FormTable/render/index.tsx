import React, { useEffect, useMemo } from "react";
import { Button, message, Table, TableProps } from "antd";
import { renderWidgetItem, joinFormPath } from "../../../../formrender";
import './index.less';
import { useTableData } from "../../../../utils/hooks";
import { defaultGetId } from "../../../../utils/utils";
import SvgIcon from '../../SvgIcon';
import { FormTableProps } from "..";
import pickAttrs from '../../../../utils/pickAttrs';

const FormTable = React.forwardRef<any, FormTableProps>((props, ref) => {
  const {
    className,
    columns = [],
    minRows = 0,
    maxRows = 50,
    disabled,
    showBtn,
    pagination = false,
    _options,
    value,
    onChange,
    ...rest
  } = props;
  const form = _options?.form;
  const path = _options?.path;
  const formrender = _options?.formrender;
  const curName = _options?.name || '';
  const items = Array.from({ length: Math.max(minRows || 0) });
  const defaultValue = useMemo(() => items.map(() => ({ key: defaultGetId('row') })), [items]);
  const {
    dataSource: tableData,
    setDataSource,
    addItem,
    deleteItem
  } = useTableData<unknown>(defaultValue);

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
      const { name, label, render, ...restCol } = col;
      return {
        ...restCol,
        dataIndex: name,
        title: label,
        render: (_, record, rowIndex) => {
          const originRender = render?.(_, record, rowIndex);
          const isEditable = !!(restCol?.type || restCol?.typeRender);
          if (!isEditable) {
            return originRender;
          }
          const childName = joinFormPath(curName, rowIndex, name);
          const widget = { ...restCol, index: rowIndex, name: childName, label: '' };
          const _options = { ...widget, path, props: { disabled } };
          return renderWidgetItem(formrender, widget, _options);
        }
      };
    }) as TableProps<any>['columns'] || [];
    if (showBtn) {
      // 添加删除按键
      result.unshift({
        title: '#',
        width: 50,
        render: (_, _record, index) => {
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
        pagination={pagination}
        {...pickAttrs(rest)}
      />
      {showBtn && <Button type="link" className="add-btn" disabled={disabled} onClick={addBtn}>+添加</Button>}
    </>
  );
});

export default FormTable;
