import React from 'react';
import { FormRender as DefaultFormRender, FormChildren as DefaultFormChildren, createRequest, CustomFormChildrenProps, CustomFormRenderProps } from '../../../src';
import widgets from './components';

export * from '../../../src';

// TODO axios请求配置
const axiosConfig = {

};

export function FormChildren(props: CustomFormChildrenProps) {
  const { components, variables, ...rest } = props;
  return (
    <DefaultFormChildren
      options={{ props: { autoComplete: 'off' } }}
      components={{ ...widgets, ...components }}
      variables={{ ...variables, request: createRequest(axiosConfig) }}
      {...rest}
    />
  );
}

export default function FormRender(props: CustomFormRenderProps) {
  const { components, variables, ...rest } = props;
  return (
    <DefaultFormRender
      options={{ props: { autoComplete: 'off' } }}
      components={{ ...widgets, ...components }}
      variables={{ ...variables, request: createRequest(axiosConfig) }}
      {...rest}
    />
  );
}
