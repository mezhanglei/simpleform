import React from 'react';
import { FormRender as DefaultFormRender, FormChildren as DefaultFormChildren, FormChildrenProps, FormRenderProps } from '@simpleform/editor';
import '@simpleform/editor/lib/css/main.css';
import { EditorOptions } from '@simpleform/editor';
import defineConfig from './defineConfig';

export * from '@simpleform/editor';

export type CustomFormChildrenProps = FormChildrenProps;
export function FormChildren(props: CustomFormChildrenProps) {
  const { components, variables, ...rest } = props;
  return (
    <DefaultFormChildren
      options={defineConfig.options}
      components={{ ...defineConfig.components, ...components }}
      variables={{ ...defineConfig.variables, ...variables }}
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
      variables={{ ...defineConfig.variables, ...variables }}
      {...rest}
    />
  );
}
