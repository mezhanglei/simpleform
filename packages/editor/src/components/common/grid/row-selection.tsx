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
function RowSelection(props: CustomRowProps, ref: any) {
  const {
    children,
    style,
    className,
    path,
    widgetItem,
    formrender: editor,
    form: editorForm,
    ...restProps
  } = props;

  const context = widgetItem?.context;
  const { editorConfig } = context?.state || {};

  const addCol = () => {
    const widgetList = widgetItem?.widgetList;
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
      configLabel={widgetItem?.panel?.label}
      className={cls}
      tools={[<SvgIcon key="add" name="add" onClick={addCol} />]}>
      {children}
    </BaseSelection>
  );
};

export default React.forwardRef(RowSelection);
