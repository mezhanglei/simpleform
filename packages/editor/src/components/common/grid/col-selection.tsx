import React from 'react';
import SvgIcon from '../SvgIcon';
import { insertWidgetItem } from '../../../utils/utils';
import BaseSelection from '../../../view/BaseSelection';
import classnames from 'classnames';
import './col-selection.less';
import { CustomColProps } from './col';
import { getParent } from '../../../formrender';


function ColSelection(props: CustomColProps, ref: any) {
  const {
    children,
    style,
    className,
    index,
    path,
    widgetItem,
    formrender: editor,
    form: editorForm,
    ...restProps
  } = props;

  const context = widgetItem?.context;

  const { editorConfig } = context?.state || {};

  const addCol = () => {
    const colIndex = index;
    const nextIndex = colIndex + 1;
    const newItem = {
      ...editorConfig?.['GridCol'],
      props: { span: 12 },
      widgetList: []
    };
    insertWidgetItem(editor, newItem, nextIndex, getParent(path));
  };

  const prefixCls = "col-selection";
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

export default React.forwardRef(ColSelection);
