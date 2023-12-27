import { insertFormItem } from '../utils/utils';
import React, { CSSProperties } from 'react';
import BaseSelection, { BaseSelectionProps } from '../components/common/BaseSelection';
import SvgIcon from '../components/common/SvgIcon';

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
    name,
    path,
    field,
    parent,
    formrender: editor,
    form: editorForm,
  } = props;

  const currentPath = path;

  const copyItem = () => {
    const nextIndex = (field?.index as number) + 1;
    const newField = currentPath && editor?.getItemByPath(currentPath);
    insertFormItem(editor, newField, nextIndex, { path: parent?.path });
  };

  const deleteItem = (e: any) => {
    e.stopPropagation();
    currentPath && editor?.delItemByPath(currentPath);
  };

  return (
    <BaseSelection
      ref={ref}
      {...props}
      configLabel={field?.panel?.label}
      tools={[<SvgIcon key="fuzhi" name="fuzhi" onClick={copyItem} />, <SvgIcon key="shanchu" name="shanchu" onClick={deleteItem} />]}
    >
      {children}
    </BaseSelection>
  );
};

export default React.forwardRef(ControlSelection);
