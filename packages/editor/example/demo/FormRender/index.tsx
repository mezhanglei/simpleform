import React from 'react';
import { FormRender as DefaultFormRender, FormChildren as DefaultFormChildren, createRequest, CustomFormChildrenProps, CustomFormRenderProps } from '../../../src';
import widgets from './components';

export * from '../../../src';

// TODO axios请求配置
const axiosConfig = {

};

export function FormChildren(props: CustomFormChildrenProps) {
  const { components, plugins, ...rest } = props;
  return (
    <DefaultFormChildren
      options={{ props: { autoComplete: 'off' } }}
      components={{ ...widgets, ...components }}
      plugins={{ ...plugins, request: createRequest(axiosConfig) }}
      {...rest}
    />
  );
}

export default function FormRender(props: CustomFormRenderProps) {
  const { components, plugins, ...rest } = props;
  return (
    <DefaultFormRender
      options={{ props: { autoComplete: 'off' } }}
      components={{ ...widgets, ...components }}
      plugins={{ ...plugins, request: createRequest(axiosConfig) }}
      {...rest}
    />
  );
}
