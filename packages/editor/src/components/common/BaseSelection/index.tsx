import classnames from 'classnames';
import React, { useState } from 'react';
import './index.less';
import pickAttrs from '../../../utils/pickAttrs';
import { joinFormPath, EditorSelection } from '../../../components/formrender';

export interface BaseSelectionProps extends EditorSelection, Omit<React.HtmlHTMLAttributes<HTMLDivElement>, 'onSelect'> {
  tools?: any[]; // 工具栏
  configLabel?: string; // 当前组件的名字
  onSelect?: (selected: EditorSelection) => void;
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
    name,
    path,
    parent,
    attributeName,
    field,
    formrender: editor,
    form: editorForm,
    configLabel,
    tools,
    onMouseOver,
    onMouseOut,
    onSelect,
    ...restProps
  } = props;

  const [isOver, setIsOver] = useState<boolean>(false);
  const context = field?.context;
  const { selected, eventBus } = context?.state || {};
  const completePath = joinFormPath(path, attributeName) as string;
  const currentPath = joinFormPath(selected?.path, selected?.attributeName);
  const isSelected = completePath ? completePath === currentPath : false;

  const nextSelected = {
    name: name,
    path: path,
    parent: parent,
    attributeName: attributeName,
    field: field,
  };

  const chooseItem = (e: any) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(nextSelected);
      return;
    }
    context?.dispatch && context?.dispatch({
      selected: nextSelected
    });
    // 订阅选中事件
    eventBus && eventBus.emit('select', nextSelected);
  };

  const prefixCls = "editor-selection";
  const overCls = `${prefixCls}-over`;
  const handleMouseOver = (e: any) => {
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.classList.add(overCls);
      setIsOver(true);
    }
    onMouseOver && onMouseOver(e);
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
  };

  return (
    <div ref={ref} className={cls} {...pickAttrs(restProps)} onClick={chooseItem} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
      {isOver && !isSelected && configLabel && <div className={classes.label}>{configLabel}</div>}
      {isSelected && <div className={classes.tools}>{tools}</div>}
      {children}
    </div>
  );
};

export default React.forwardRef(BaseSelection);
