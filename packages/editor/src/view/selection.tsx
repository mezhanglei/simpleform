import { getWidgetItem, insertWidgetItem } from '../utils';
import React from 'react';
import BaseSelection, { BaseSelectionProps } from './BaseSelection';
import { SvgIcon } from '../common';
import { getParent } from '@simpleform/render';

const CommonSelection = React.forwardRef<HTMLDivElement, BaseSelectionProps>((props, ref) => {
  const {
    children,
    _options,
  } = props;

  const path = _options?.path;
  const index = _options?.index;
  const editor = _options?.formrender;
  const editorContext = _options?.editorContext;
  const { historyRecord } = editorContext?.state || {};

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

export default CommonSelection;
