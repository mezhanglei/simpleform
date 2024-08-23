import React, { useEffect, useMemo, useState } from "react";
import { Button, message, Table, TableProps } from "antd";
import { renderWidgetItem, joinFormPath } from "../../../../formrender";
import './index.less';
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
    buttons = ['add', 'delete'],
    pagination = false,
    _options,
    value,
    onChange,
    ...rest
  } = props;
  const form = _options?.form;
  const curName = _options?.name || '';
  const formrender = _options?.formrender;
  const items = Array.from({ length: Math.max(minRows || 0) });
  const defaultValue = useMemo(() => items.map(() => ({ key: defaultGetId('row') })), [items]);
  const [dataSource, setDataSource] = useState<object[]>([]);

  useEffect(() => {
    setDataSource(defaultValue);
  }, [minRows]);

  const deleteBtn = (rowIndex: number) => {
    if (disabled) return;
    dataSource.splice(rowIndex, 1);
    const newData = [...dataSource];
    setDataSource(newData);
  };

  const addBtn = () => {
    if (dataSource?.length >= maxRows) {
      message.info(`最大行数不能超过${maxRows}`);
      return;
    }
    const newData = dataSource.concat([{ key: defaultGetId('row') }]);
    setDataSource(newData);
  };

  const newColumns = columns?.map((col) => {
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
        const widget = { ...restCol, name: childName, label: '' };
        const _options = { form, formrender, index: rowIndex, props: { disabled } };
        return renderWidgetItem(formrender, widget, _options);
      }
    };
  }) as TableProps<any>['columns'] || [];

  if (buttons?.includes('delete')) {
    // 添加删除按键
    newColumns.unshift({
      title: '#',
      width: 50,
      render: (_, _record, index) => {
        if (dataSource?.length > minRows) {
          return <SvgIcon name="delete" className="delete-icon" onClick={() => deleteBtn(index)} />;
        }
      }
    });
  }

  return (
    <>
      <Table
        columns={newColumns}
        dataSource={dataSource}
        tableLayout="auto"
        ref={ref}
        rowKey="key"
        scroll={{ y: 400 }}
        pagination={pagination}
        {...pickAttrs(rest)}
      />
      {buttons?.includes('add') && <Button type="link" className="add-btn" disabled={disabled} onClick={addBtn}>+添加</Button>}
    </>
  );
});

export default FormTable;
