import React from 'react';
import './index.less';
// 批量引入svg组件
const svgs = {};
// @ts-ignore
const context = require['context']('./svg', false, /\.svg$/);
context.keys().forEach((filename: string) => {
  const componentName = filename.replace(/^\.\/(.*)\.svg$/, '$1');
  const Com = context(filename).default;
  // @ts-ignore
  svgs[componentName] = Com;
});

const SvgIcon = React.forwardRef<SVGSVGElement, { name: string; className?: string; } & React.HtmlHTMLAttributes<SVGSVGElement>>((props, ref) => {
  const { name, className, ...rest } = props;
  const svgClass = className ? 'svg-icon ' + className : 'svg-icon';
  // @ts-ignore
  const SvgIconChild = name ? svgs[name] : null;
  return SvgIconChild ? <SvgIconChild className={svgClass} ref={ref} {...rest} /> : null;
});

export default SvgIcon;
