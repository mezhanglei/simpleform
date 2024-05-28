import classnames from 'classnames';
import React, { ReactNode, useState } from 'react';
import './BaseSelection.less';
import pickAttrs from '../utils/pickAttrs';
import { FormEditorState } from '../context';
import SvgIcon from '../components/common/SvgIcon';
import { delWidgetItem } from '../utils/utils';
import { CommonFormProps } from '../formrender';

export interface BaseSelectionProps extends CommonFormProps, Omit<React.HtmlHTMLAttributes<HTMLDivElement>, 'draggable' | 'onChange' | 'onSelect'> {
  tools?: ReactNode[]; // 工具栏
  configLabel?: string; // 当前组件的名字
  onSelectHandler?: (selected: FormEditorState['selected']) => void;
  children?: React.ReactNode;
}

/**
 * 基础选择框组件
 * @param props 
 * @param ref 
 * @returns 
 */
const BaseSelection = React.forwardRef<HTMLDivElement, BaseSelectionProps>((props, ref) => {
  const {
    children,
    className,
    _options,
    configLabel,
    tools,
    onMouseOver,
    onMouseOut,
    onSelectHandler,
    ...restProps
  } = props;

  const prefixCls = "editor-selection";
  const overCls = `${prefixCls}-over`;
  const context = _options?.context;
  const path = _options?.path;
  const editor = _options?.formrender;
  const [isOver, setIsOver] = useState<boolean>(false);
  const { selected, historyRecord, onEvent } = context?.state || {};
  const isSelected = path ? path === selected?.path : false;

  const nextSelected = {
    path: path
  };

  const chooseItem = () => {
    onEvent && onEvent('select', context);
    if (onSelectHandler) {
      onSelectHandler(nextSelected);
      return;
    }
    context?.dispatch && context?.dispatch((old) => ({
      ...old,
      selected: nextSelected
    }));
  };

  const deleteColumn = (e) => {
    e.stopPropagation();
    context?.dispatch && context?.dispatch((old) => ({ ...old, selected: {} }));
    delWidgetItem(editor, path);
    historyRecord?.save();
  };

  const handleMouseOver = (e) => {
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.classList.add(overCls);
      setIsOver(true);
    }
    onMouseOver && onMouseOver(e);
  };

  const handleMouseOut = (e) => {
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
    <div ref={ref} className={cls} {...pickAttrs(restProps)} onClickCapture={chooseItem} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
      {isOver && !isSelected && configLabel && <div className={classes.label}>{configLabel}</div>}
      {(isOver || isSelected) && <SvgIcon className={classes.close} key="close" name="close" onClick={deleteColumn} />}
      {isSelected && <div className={classes.tools}>{tools}</div>}
      {children}
    </div>
  );
});

export default BaseSelection;
