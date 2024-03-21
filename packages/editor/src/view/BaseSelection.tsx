import classnames from 'classnames';
import React, { useState } from 'react';
import './BaseSelection.less';
import pickAttrs from '../utils/pickAttrs';
import { FormEditorState } from '../context';
import SvgIcon from '../components/common/SvgIcon';
import { CommonWidgetProps } from '../components/formrender';
import { delWidgetItem } from '../utils/utils';

export interface BaseSelectionProps extends CommonWidgetProps, Omit<React.HtmlHTMLAttributes<HTMLDivElement>, 'onSelect' | 'onChange'> {
  tools?: any[]; // 工具栏
  configLabel?: string; // 当前组件的名字
  onSelect?: (selected: FormEditorState['selected']) => void;
}

/**
 * 基础选择框组件
 * @param props 
 * @param ref 
 * @returns 
 */
function BaseSelection(props: BaseSelectionProps, ref: any) {
  const {
    children,
    className,
    path,
    widgetItem,
    formrender: editor,
    form: editorForm,
    configLabel,
    tools,
    onMouseOver,
    onMouseOut,
    onSelect,
    ...restProps
  } = props;

  const prefixCls = "editor-selection";
  const overCls = `${prefixCls}-over`;
  const [isOver, setIsOver] = useState<boolean>(false);
  const context = widgetItem?.context;
  const { selected, historyRecord } = context?.state || {};
  const isSelected = path ? path === selected?.path : false;

  const nextSelected = {
    path: path
  };

  const chooseItem = (e: any) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(nextSelected);
      return;
    }
    context?.dispatch && context?.dispatch((old) => ({
      ...old,
      selected: nextSelected
    }));
  };

  const deleteColumn = (e: any) => {
    e.stopPropagation();
    context?.dispatch && context?.dispatch((old) => ({ ...old, selected: {} }));
    delWidgetItem(editor, path);
    historyRecord?.save();
  };

  const handleMouseOver = (e: any) => {
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.classList.add(overCls);
      setIsOver(true);
    }
    onMouseOver && onMouseOver(e);
    context?.dispatch && context?.dispatch((old) => ({
      ...old,
      beforeSelected: nextSelected
    }));
  };

  const handleMouseOut = (e: any) => {
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.classList.remove(overCls);
      setIsOver(false);
    }
    onMouseOut && onMouseOut(e);
  };

  const cls = classnames(prefixCls, className, {
    [`${prefixCls}-active`]: isSelected,
  });

  const classes = {
    mask: `${prefixCls}-mask`,
    tools: `${prefixCls}-tools`,
    label: `${prefixCls}-label`,
    close: `${prefixCls}-close`,
  };

  return (
    <div ref={ref} className={cls} {...pickAttrs(restProps)} onClick={chooseItem} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
      {isOver && !isSelected && configLabel && <div className={classes.label}>{configLabel}</div>}
      {(isOver || isSelected) && <SvgIcon className={classes.close} key="close" name="close" onClick={deleteColumn} />}
      {isSelected && <div className={classes.tools}>{tools}</div>}
      {children}
    </div>
  );
};

export default React.forwardRef(BaseSelection);
