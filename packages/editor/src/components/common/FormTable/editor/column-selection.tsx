import React from 'react';
import Icon from '../../SvgIcon';
import { getWidgetItem, setWidgetItem } from '../../../../utils/utils';
import FormTableColSetting from './column-setting';
import BaseSelection, { BaseSelectionProps } from '../../../../view/BaseSelection';
import { joinFormPath, CustomWidgetItem } from '../../../../formrender';

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
  const colmunPath = joinFormPath(path, colIndex);
  const context = widgetItem?.context;
  const { editorConfig } = context?.state || {};

  const onSelect: BaseSelectionProps['onSelect'] = (selected) => {
    const selectedItem = getWidgetItem(editor, selected?.path);
    const configSetting = editorConfig?.[selectedItem?.type || ''].setting;
    const baseSetting = configSetting?.['基础属性']?.filter((item) => item.name !== 'name');
    const mergeSetting = Object.assign(FormTableColSetting, {
      '基础属性': baseSetting,
      '操作属性': configSetting?.['操作属性'],
      '校验规则': configSetting?.['校验规则']
    });
    context?.dispatch && context?.dispatch((old) => ({
      ...old,
      selected: Object.assign({ setting: mergeSetting }, selected)
    }));
  };

  const copyItem = () => {
    const nextColIndex = colIndex + 1;
    const cloneColumns = [...columns];
    const newColumn = {
      ...column
    };
    cloneColumns.splice(nextColIndex, 0, newColumn);
    setWidgetItem(editor, cloneColumns, path);
  };

  return (
    <BaseSelection
      ref={ref}
      {...props}
      path={colmunPath}
      configLabel="表格列"
      onSelect={onSelect}
      tools={[<Icon key="fuzhi" name="fuzhi" onClick={copyItem} />]}>
      {children}
    </BaseSelection>
  );
};

export default React.forwardRef(ColumnSelection);
