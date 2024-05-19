import classnames from 'classnames';
import React from 'react';
import './platContainer.less';

export const PlatOptions = [
  { label: 'PC', value: 'pc' },
  { label: 'Phone', value: 'phone' }
];

export type PlatType = typeof PlatOptions[number]["value"]
export interface PlatContainerProps extends React.HtmlHTMLAttributes<HTMLDivElement> {
  plat: PlatType;
}

const PlatContainer = React.forwardRef<HTMLDivElement, PlatContainerProps>((props, ref) => {
  const {
    plat,
    className,
    children
  } = props;

  const renderPhone = (
    <>
      <div className='mobile-head'></div>
      <div className="mobile-content">
        <div className='phone-bar'></div>
        <div className='phone-screen'>
          {children}
        </div>
      </div>
      <div className='mobile-foot'></div>
    </>
  );

  return (
    <div ref={ref} className={classnames('form-container', className, {
      [plat]: plat
    })}>
      {plat === 'phone' ? renderPhone : children}
    </div>
  );
});

export default PlatContainer;
