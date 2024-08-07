import { ColumnType, TableProps } from 'antd/lib/table';
import React, { CSSProperties } from 'react';
import { CommonFormProps, CustomGenerateWidgetItem } from '../../../formrender';
import EditorTable from './editor';
import FormTable from './render';

export interface FormTableProps<V = unknown> extends Omit<TableProps<any>, 'title' | 'onChange'>, CommonFormProps<V> {
  minRows?: number; // 表格默认最少行数
  maxRows?: number; // 表格默认最大行数
  disabled?: boolean; // 禁用
  buttons?: Array<'add' | 'delete'>; // 展示或隐藏增减按钮
  columns: CustomColumnType<V>[];
  className?: string;
  style?: CSSProperties;
}

export interface CustomColumnType<V = unknown> extends ColumnType<V>, CustomGenerateWidgetItem {
  key?: string;
  title: string;
  render?: (val: unknown, record?: V, rowIndex?: number, colIndex?: number) => React.ReactNode;
}

const Table = React.forwardRef<any, FormTableProps>((props, ref) => {
  const {
    _options,
  } = props;

  const isEditor = _options?.isEditor;
  const columns = _options?.props?.columns as FormTableProps['columns'];

  return (
    isEditor ? <EditorTable {...props} columns={columns} ref={ref} /> : <FormTable {...props} ref={ref} columns={columns} />
  );
});

export default Table;
