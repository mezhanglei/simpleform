import React from 'react';
import SvgIcon from '../SvgIcon';
import { insertWidgetItem } from '../../../utils/utils';
import BaseSelection from '../../../view/BaseSelection';
import classnames from 'classnames';
import './col-selection.less';
import { CustomColProps } from './col';
import { getParent } from '../../../formrender';


const ColSelection = React.forwardRef<HTMLDivElement, CustomColProps>((props, ref) => {
  const {
    children,
    className,
    _options
  } = props;

  const index = _options?.index;
  const context = _options?.context;
  const editor = _options?.formrender;
  const path = _options?.path;

  const { editorConfig } = context?.state || {};

  const addCol = () => {
    const colIndex = index || 0;
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
      configLabel={_options?.panel?.label}
      className={cls}
      tools={[<SvgIcon key="add" name="add" onClick={addCol} />]}>
      {children}
    </BaseSelection>
  );
});

export default ColSelection;
