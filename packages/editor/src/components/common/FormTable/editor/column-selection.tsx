import React from 'react';
import Icon from '../../SvgIcon';
import { getWidgetItem, setWidgetItem } from '../../../../utils/utils';
import FormTableColSetting from './column-setting';
import BaseSelection, { BaseSelectionProps } from '../../../../view/BaseSelection';
import { joinFormPath, CustomGenerateWidgetItem } from '../../../../formrender';

export interface ColumnSelectionProps extends BaseSelectionProps {
  colIndex: number;
  column: CustomGenerateWidgetItem;
}
/**
 * 给表单中的控件外围添加选中框
 * @param props 
 * @param ref 
 * @returns 
 */
const ColumnSelection = React.forwardRef<HTMLDivElement, ColumnSelectionProps>((props, ref) => {
  const {
    children,
    _options,
    colIndex,
    column,
  } = props;

  const editor = _options?.formrender;
  const path = _options?.path;
  const columns = (_options?.props?.columns || []) as Array<ColumnSelectionProps['column']>;
  const colmunPath = joinFormPath(path, colIndex);
  const context = _options?.context;
  const { editorConfig } = context?.state || {};

  const onSelectHandler: BaseSelectionProps['onSelectHandler'] = (selected) => {
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
      _options={{ ..._options, path: colmunPath }}
      configLabel="表格列"
      onSelectHandler={onSelectHandler}
      tools={[<Icon key="fuzhi" name="fuzhi" onClick={copyItem} />]}>
      {children}
    </BaseSelection>
  );
});

export default ColumnSelection;
