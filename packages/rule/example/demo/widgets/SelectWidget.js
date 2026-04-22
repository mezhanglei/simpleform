import React from 'react';

export const SelectWidget = props => {

  return (
    <select {...props}>
      {props.options?.map((item) => (
        <option key={item?.value} value={item?.value} selected={item?.value === props?.value}>
          {item?.label}
        </option>
      ))}
    </select>
  );
};
