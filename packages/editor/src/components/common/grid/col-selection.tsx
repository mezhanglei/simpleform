import React from 'react';
import SvgIcon from '../SvgIcon';
import { getListIndex, insertWidgetItem } from '../../../utils/utils';
import BaseSelection from '../BaseSelection';
import classnames from 'classnames';
import './col-selection.less';
import { CustomColProps } from './col';
import { getParent } from '../../formrender';

/**
 * 给表单中的控件外围添加选中框
 * @param props 
 * @param ref 
 * @returns 
 */
function ColSelection(props: CustomColProps, ref: any) {
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
    const colIndex = getListIndex(editor, path);
    const nextIndex = colIndex + 1;
    const newItem = {
      ...editorConfig?.['GridCol'],
      props: { span: 12 },
      widgetList: []
    };
    insertWidgetItem(editor, newItem, nextIndex, getParent(path));
  };

  const deleteItem = () => {
    path && editor?.delItemByPath(path);
  };

  const prefixCls = "col-selection";
  const cls = classnames(prefixCls, className);

  return (
    <BaseSelection
      ref={ref}
      {...props}
      configLabel={widgetItem?.panel?.label}
      className={cls}
      tools={[<SvgIcon key="add" name="add" onClick={addCol} />, <SvgIcon key="shanchu" name="shanchu" onClick={deleteItem} />]}>
      {children}
    </BaseSelection>
  );
};

export default React.forwardRef(ColSelection);
