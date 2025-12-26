import DefaultFormRender, { FormChildren as DefaultFormChildren, FormRenderProps, FormChildrenProps } from '@simpleform/render';
import '@simpleform/render/lib/css/main.css';
import React from 'react';
import defineConfig from './defineConfig';

export * from '@simpleform/render';

export type CustomFormChildrenProps = FormChildrenProps;
export function FormChildren(props: CustomFormChildrenProps) {
  return (
    <DefaultFormChildren
      options={defineConfig.options}
      {...defineConfig}
      {...props}
    />
  );
}
export type CustomFormRenderProps = FormRenderProps;
export default function FormRender(props: CustomFormRenderProps) {
  return (
    <DefaultFormRender
      options={defineConfig.options}
      {...defineConfig}
      {...props}
    />
  );
};
