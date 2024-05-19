import React from 'react';
import SvgIcon from '../SvgIcon';
import { insertWidgetItem } from '../../../utils/utils';
import BaseSelection from '../../../view/BaseSelection';
import classnames from 'classnames';
import './row-selection.less';
import { CustomRowProps } from './row';
import { joinFormPath } from '../../../formrender';

/**
 * 给表单中的控件外围添加选中框
 * @param props 
 * @param ref 
 * @returns 
 */
const RowSelection = React.forwardRef<HTMLDivElement, CustomRowProps>((props, ref) => {
  const {
    children,
    className,
    _options
  } = props;

  const context = _options?.context;
  const path = _options?.path;
  const editor = _options?.formrender;
  const { editorConfig } = context?.state || {};

  const addCol = () => {
    const widgetList = _options?.widgetList;
    const nextIndex = widgetList?.length || 0;
    const newItem = {
      ...editorConfig?.['GridCol'],
      props: { span: 12 },
      widgetList: []
    };
    const colParentPath = joinFormPath(path, 'widgetList');
    insertWidgetItem(editor, newItem, nextIndex, colParentPath);
  };

  const prefixCls = "row-selection";
  const cls = classnames(prefixCls, className);

  return (
    <BaseSelection
      ref={ref}
      {...props}
      configLabel={_options?.panel?.label}
      className={cls}
      tools={[<SvgIcon key="add" name="add" onClick={addCol} />]}>
      {children}
    </BaseSelection>
  );
});

export default RowSelection;
