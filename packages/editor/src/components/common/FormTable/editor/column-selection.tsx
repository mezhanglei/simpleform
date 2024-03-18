import React from 'react';
import Icon from '../../SvgIcon';
import { defaultGetId, setWidgetItem } from '../../../../utils/utils';
import FormTableColSetting from './column-setting';
import { pickObject } from '../../../../utils/object';
import BaseSelection, { BaseSelectionProps } from '../../BaseSelection';
import { joinFormPath, CustomWidgetItem, EditorSelection } from '../../../formrender';

export interface ColumnSelectionProps extends BaseSelectionProps {
  colIndex: number;
  column: CustomWidgetItem;
}
/**
 * 给表单中的控件外围添加选中框
 * @param props 
 * @param ref 
 * @returns 
 */
function ColumnSelection(props: ColumnSelectionProps, ref: any) {
  const {
    children,
    style,
    className,
    path,
    widgetItem,
    formrender: editor,
    form: editorForm,
    colIndex,
    column,
    ...restProps
  } = props;

  const columns = widgetItem?.props?.columns || [];
  const colmunsPath = joinFormPath(path, 'props.columns');
  const colmunPath = joinFormPath(colmunsPath, colIndex);
  const context = widgetItem?.context;
  const { editorConfig } = context?.state || {};

  const onSelect = (selected: EditorSelection) => {
    const selectedItem = editor?.getItemByPath(selected?.path);
    const configSetting = editorConfig?.[selectedItem?.type || ''].setting;
    const controlSetting = pickObject(configSetting, (key) => key !== '公共属性');
    const mergeSetting = Object.assign({}, FormTableColSetting, controlSetting);
    context?.dispatch && context?.dispatch((old) => ({
      ...old,
      selected: Object.assign({ appendSetting: mergeSetting }, selected)
    }));
  };

  const copyItem = () => {
    const nextColIndex = colIndex + 1;
    const cloneColumns = [...columns];
    const newColumn = {
      ...column,
      title: column?.label,
      dataIndex: defaultGetId(column?.type),
    };
    cloneColumns.splice(nextColIndex, 0, newColumn);
    setWidgetItem(editor, cloneColumns, colmunsPath);
  };

  const deleteColumn = (e: any) => {
    e.stopPropagation();
    context?.dispatch && context?.dispatch((old) => ({ ...old, selected: {} }));
    const cloneColumns = [...columns];
    cloneColumns.splice(colIndex, 1);
    setWidgetItem(editor, cloneColumns, colmunsPath);
  };

  return (
    <BaseSelection
      ref={ref}
      {...props}
      path={colmunPath}
      configLabel="表格列"
      onSelect={onSelect}
      tools={[<Icon key="fuzhi" name="fuzhi" onClick={copyItem} />, <Icon key="shanchu" name="shanchu" onClick={deleteColumn} />]}>
      {children}
    </BaseSelection>
  );
};

export default React.forwardRef(ColumnSelection);
