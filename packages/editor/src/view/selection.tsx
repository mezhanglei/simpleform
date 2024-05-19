import { getWidgetItem, insertWidgetItem } from '../utils/utils';
import React from 'react';
import BaseSelection, { BaseSelectionProps } from './BaseSelection';
import SvgIcon from '../components/common/SvgIcon';
import { getParent } from '../formrender';

const ControlSelection = React.forwardRef<HTMLDivElement, BaseSelectionProps>((props, ref) => {
  const {
    children,
    _options,
  } = props;

  const path = _options?.path;
  const index = _options?.index;
  const editor = _options?.formrender;
  const context = _options?.context;
  const { historyRecord } = context?.state || {};

  const copyItem = () => {
    const currentIndex = index || -1;
    const nextIndex = currentIndex + 1;
    const newItem = getWidgetItem(editor, path);
    insertWidgetItem(editor, newItem, nextIndex, getParent(path));
    historyRecord?.save();
  };

  return (
    <BaseSelection
      ref={ref}
      {...props}
      configLabel={_options?.panel?.label}
      tools={[<SvgIcon key="fuzhi" name="fuzhi" onClick={copyItem} />]}
    >
      {children}
    </BaseSelection>
  );
});

export default ControlSelection;
