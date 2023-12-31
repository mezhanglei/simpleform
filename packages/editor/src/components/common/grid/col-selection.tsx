import React from 'react';
import SvgIcon from '../SvgIcon';
import { insertFormItem } from '../../../utils/utils';
import BaseSelection from '../BaseSelection';
import classnames from 'classnames';
import './col-selection.less';
import { CustomColProps } from './col';

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
    name,
    path,
    field,
    parent,
    formrender: editor,
    form: editorForm,
    ...restProps
  } = props;

  const currentPath = path;

  const addCol = () => {
    const nextIndex = (field?.index as number) + 1;
    const newField = {
      type: 'GridCol',
      props: { span: 12 },
      ignore: true,
      properties: {
      }
    };
    insertFormItem(editor, newField, nextIndex, { path: parent?.path });
  };

  const deleteItem = () => {
    currentPath && editor?.delItemByPath(currentPath);
  };

  const prefixCls = "col-selection";
  const cls = classnames(prefixCls, className);

  return (
    <BaseSelection
      ref={ref}
      {...props}
      configLabel="栅格列"
      className={cls}
      tools={[<SvgIcon key="add" name="add" onClick={addCol} />, <SvgIcon key="shanchu" name="shanchu" onClick={deleteItem} />]}>
      {children}
    </BaseSelection>
  );
};

export default React.forwardRef(ColSelection);
