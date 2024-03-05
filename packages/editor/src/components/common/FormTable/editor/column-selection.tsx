import React from 'react';
import Icon from '../../SvgIcon';
import { defaultGetId, setFormItem } from '../../../../utils/utils';
import FormTableColSetting from './column-setting';
import { pickObject } from '../../../../utils/object';
import BaseSelection, { BaseSelectionProps } from '../../BaseSelection';
import { deepSet, CustomFormNodeProps, EditorSelection } from '../../../formrender';

export interface ColumnSelectionProps extends BaseSelectionProps {
  colIndex: number;
  column: CustomFormNodeProps;
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
    field,
    parent,
    formrender: editor,
    form: editorForm,
    colIndex,
    column,
    // ...restProps
  } = props;

  const columns = field?.props?.columns || [];
  const columnsPath = `props.columns`;
  const attributeName = `${columnsPath}[${colIndex}]`;
  const currentPath = path;
  const context = field?.context;
  const { editorConfig } = context?.state || {};

  const onSelect = (selected: EditorSelection) => {
    const type = column?.type;
    const appendSetting = type && editorConfig?.settings ? editorConfig?.settings[type] : undefined;
    const controlSetting = pickObject(appendSetting, (key) => key !== '公共属性');
    const mergeSetting = Object.assign({}, FormTableColSetting, controlSetting);
    const { field, ...rest } = selected;
    const newField = Object.assign({ setting: mergeSetting }, field);
    context?.dispatch && context?.dispatch((old) => ({
      ...old,
      selected: Object.assign({ field: newField }, rest)
    }));
  };

  const copyItem = () => {
    const nextColIndex = colIndex + 1;
    const oldColumns = [...columns];
    const newColumn = {
      ...column,
      title: column?.label,
      dataIndex: defaultGetId(column?.type),
    };
    oldColumns.splice(nextColIndex, 0, newColumn);
    const newField = deepSet(field, columnsPath, oldColumns);
    setFormItem(editor, newField, currentPath);
  };

  const deleteColumn = (e: any) => {
    e.stopPropagation();
    context?.dispatch && context?.dispatch((old) => ({ ...old, selected: {} }));
    setFormItem(editor, undefined, currentPath, attributeName);
  };

  return (
    <BaseSelection
      ref={ref}
      {...props}
      configLabel="表格列"
      attributeName={attributeName}
      onSelect={onSelect}
      tools={[<Icon key="fuzhi" name="fuzhi" onClick={copyItem} />, <Icon key="shanchu" name="shanchu" onClick={deleteColumn} />]}>
      {children}
    </BaseSelection>
  );
};

export default React.forwardRef(ColumnSelection);
