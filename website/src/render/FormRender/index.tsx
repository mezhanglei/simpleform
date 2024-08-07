import DefaultFormRender, { FormChildren as DefaultFormChildren, FormRenderProps, FormChildrenProps } from '@simpleform/render';
import '@simpleform/render/lib/css/main.css';
import React from 'react';
import defineConfig from './defineConfig';

export * from '@simpleform/render';

export type CustomFormChildrenProps = FormChildrenProps;
export function FormChildren(props: CustomFormChildrenProps) {
  const { components, variables, ...rest } = props;
  return (
    <DefaultFormChildren
      options={defineConfig.options}
      components={{ ...defineConfig.components, ...components }}
      variables={{ ...variables, ...defineConfig.variables }}
      {...rest}
    />
  );
}
export type CustomFormRenderProps = FormRenderProps;
export default function FormRender(props: CustomFormRenderProps) {
  const { components, variables, ...rest } = props;
  return (
    <DefaultFormRender
      options={defineConfig.options}
      components={{ ...defineConfig.components, ...components }}
      variables={{ ...variables, ...defineConfig.variables }}
      {...rest}
    />
  );
};
