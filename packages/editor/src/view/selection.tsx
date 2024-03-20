import { getListIndex, insertWidgetItem } from '../utils/utils';
import React, { CSSProperties } from 'react';
import BaseSelection, { BaseSelectionProps } from './BaseSelection';
import SvgIcon from '../components/common/SvgIcon';
import { getParent } from '../components/formrender';

export interface ControlSelectionProps extends BaseSelectionProps {
  children?: any;
  style?: CSSProperties;
  className?: string;
}
/**
 * 给表单中的控件外围添加选中框
 * @param props 
 * @param ref 
 * @returns 
 */
function ControlSelection(props: ControlSelectionProps, ref: any) {
  const {
    children,
    style,
    className,
    path,
    widgetItem,
    formrender: editor,
    form: editorForm,
  } = props;

  const context = widgetItem?.context;
  const { historyRecord } = context?.state || {};

  const copyItem = () => {
    const currentIndex = getListIndex(editor, path);
    const nextIndex = currentIndex + 1;
    const newItem = path && editor?.getItemByPath(path);
    insertWidgetItem(editor, newItem, nextIndex, getParent(path));
    historyRecord?.save();
  };

  return (
    <BaseSelection
      ref={ref}
      {...props}
      configLabel={widgetItem?.panel?.label}
      tools={[<SvgIcon key="fuzhi" name="fuzhi" onClick={copyItem} />]}
    >
      {children}
    </BaseSelection>
  );
};

export default React.forwardRef(ControlSelection);
