import { ColumnType, TableProps } from 'antd/lib/table';
import React, { CSSProperties } from 'react';
import { EditorSelection, CustomFormNodeProps, GenerateFormNodeProps } from '../../formrender';
import EditorTable from './editor';
import FormTable from './render';

export interface FormTableProps extends Omit<TableProps<any>, 'title'>, EditorSelection {
  minRows?: number; // 表格默认最少行数
  maxRows?: number; // 表格默认最大行数
  disabled?: boolean; // 禁用
  showBtn?: boolean; // 展示或隐藏增减按钮
  columns: CustomColumnType[];
  className?: string;
  style?: CSSProperties;
  value?: any;
  onChange?: (val?: any) => void;
}

export interface CustomColumnType<T = any> extends ColumnType<T>, CustomFormNodeProps<GenerateFormNodeProps> {
  key?: string;
  title: string;
  dataIndex: string;
  type?: string;
  props?: any;
  initialValue?: any;
  render?: (val: unknown, record?: unknown, rowIndex?: number, colIndex?: number) => any;
}

const Table = React.forwardRef<any, FormTableProps>((props, ref) => {
  const {
    field,
  } = props;

  const isEditor = field?.isEditor;
  const columns = field?.props?.columns;

  return (
    isEditor ? <EditorTable {...props} columns={columns} ref={ref} /> : <FormTable {...props} ref={ref} columns={columns} />
  );
});

export default Table;
