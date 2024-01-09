import React from 'react';
import './index.less';
import { Tooltip } from 'react-tooltip';

interface TooltipCustomProps extends React.HtmlHTMLAttributes<HTMLElement> {
  content: string;
}

export default React.forwardRef((props: TooltipCustomProps, ref: any) => {
  const {
    children,
    content,
    className,
    ...rest
  } = props;

  return (
    <>
      <a className={className} id="custom-tooltip" ref={ref}>{children}</a>
      <Tooltip
        className="custom-tooltip"
        anchorSelect="#custom-tooltip"
        content={content}
      />
    </>
  );
});
