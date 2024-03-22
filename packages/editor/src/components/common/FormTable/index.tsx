import { ColumnType, TableProps } from 'antd/lib/table';
import React, { CSSProperties } from 'react';
import { CommonWidgetProps, CustomWidgetItem, GenerateWidgetItem } from '../../../formrender';
import EditorTable from './editor';
import FormTable from './render';

export interface FormTableProps extends Omit<TableProps<any>, 'title' | 'onChange'>, CommonWidgetProps {
  minRows?: number; // 表格默认最少行数
  maxRows?: number; // 表格默认最大行数
  disabled?: boolean; // 禁用
  showBtn?: boolean; // 展示或隐藏增减按钮
  columns: CustomColumnType[];
  className?: string;
  style?: CSSProperties;
}

export interface CustomColumnType<T = any> extends ColumnType<T>, CustomWidgetItem<GenerateWidgetItem> {
  key?: string;
  title: string;
  type?: string;
  props?: any;
  initialValue?: any;
  render?: (val: unknown, record?: unknown, rowIndex?: number, colIndex?: number) => any;
}

const Table = React.forwardRef<any, FormTableProps>((props, ref) => {
  const {
    widgetItem,
  } = props;

  const isEditor = widgetItem?.isEditor;
  const columns = widgetItem?.props?.columns;

  return (
    isEditor ? <EditorTable {...props} columns={columns} ref={ref} /> : <FormTable {...props} ref={ref} columns={columns} />
  );
});

export default Table;
