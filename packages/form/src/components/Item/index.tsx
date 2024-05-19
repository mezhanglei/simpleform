import React, { CSSProperties, useRef } from 'react';
import classnames from 'classnames';
import './index.less';
import pickAttrs from '../../utils/pickAttrs';
import { isEmpty } from '../../utils/type';
import SvgIcon from '../SvgIcon';
import Tooltip from '../Tooltip';

export type Layout = ('horizontal' | 'vertical') & string;
export interface ItemProps {
  label?: React.ReactNode;
  inline?: boolean;
  layout?: Layout;
  compact?: boolean;
  readOnly?: boolean;
  // label节点
  colon?: boolean;
  required?: boolean;
  showLabel?: boolean;
  labelWidth?: CSSProperties['width'];
  labelAlign?: CSSProperties['textAlign'];
  labelStyle?: CSSProperties;
  gutter?: number;
  tooltip?: string;
  // 内容节点
  error?: React.ReactNode;
  suffix?: React.ReactNode; // 右边节点
  footer?: React.ReactNode; // 底部节点
  className?: string;
  children?: React.ReactNode;
  style?: CSSProperties;
}

const prefixCls = 'field-item';
const createItemCls = (code: string) => (`${prefixCls}--${code}`);

export const Item = React.forwardRef<HTMLDivElement, ItemProps>((props, ref) => {
  const {
    /** LabelBaseProps */
    colon,
    required,
    showLabel = true,
    labelWidth,
    labelAlign,
    gutter,
    tooltip,
    /** ControlBaseProps */
    error,
    suffix,
    footer,
    ...itemProps
  } = props;

  const {
    label,
    labelStyle,
    inline,
    layout = "horizontal",
    compact,
    readOnly,
    className,
    style,
    children,
    ...rest
  } = itemProps;

  const controlRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLLabelElement>(null);

  const cls = classnames(
    prefixCls,
    layout && createItemCls(layout),
    required === true && createItemCls('required'),
    compact === true && createItemCls('compact'),
    error && createItemCls('error'),
    inline === true && createItemCls('inline'),
    readOnly === true && createItemCls('readOnly'),
    className ? className : ''
  );

  const labelCls = classnames(
    `label__container`,
    required === true ? `label__container--required` : ''
  );

  const controlHeight = controlRef.current?.offsetHeight || 0;
  const labelHeight = labelRef.current?.offsetHeight || 0;
  const labelMt = controlHeight - labelHeight > 0 && layout === "horizontal" && controlHeight <= 36 ? (controlHeight - labelHeight) / 2 : undefined;
  const mergeLabelStyle = {
    marginRight: gutter,
    width: labelWidth,
    textAlign: labelAlign,
    marginTop: labelMt,
    ...labelStyle
  };

  const contentCls = classnames(
    `control__container`,
    error ? `control__container--error` : ''
  );

  return (
    <div ref={ref} className={cls} style={style} {...pickAttrs(rest)}>
      {
        !isEmpty(label) && showLabel ? (
          <div className={labelCls} style={mergeLabelStyle}>
            <label ref={labelRef}>
              {colon === true ? <>{label}:</> : label}
              {tooltip && (
                <Tooltip content={tooltip}>
                  <SvgIcon name="wenhao" className="label__tooltip" />
                </Tooltip>)
              }
            </label>
          </div>
        ) : null
      }
      <div className={contentCls}>
        <div ref={controlRef} className="item__control">
          {children}
          {!isEmpty(suffix) && <div className="item__suffix">{suffix}</div>}
        </div>
        {!isEmpty(footer) && <div className="item__footer">{footer}</div>}
        <div className="item__message">{error}</div>
      </div>
    </div>
  );
});
