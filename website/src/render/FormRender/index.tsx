import DefaultFormRender, {
  FormChildren as DefaultFormChildren,
  FormChildrenProps,
} from '@simpleform/render';
import '@simpleform/render/lib/css/main.css';
import React from 'react';
import defineConfig from './defineConfig';

export * from '@simpleform/render';

export type CustomFormChildrenProps = FormChildrenProps & { cols?: number };
export function FormChildren(props: CustomFormChildrenProps) {
  const { cols, options, ...rest } = props;
  const flexW = `${100 / (cols || 1)}%`;
  return (
    <DefaultFormChildren
      {...defineConfig}
      wrapper={{ type: 'row', props: { gutter: 16 } }}
      options={{
        ...defineConfig.options,
        ...options,
        outside: { type: 'col', props: { flex: flexW, style: { width: 0 } } },
      }}
      {...rest}
    />
  );
}
export type CustomFormRenderProps = FormChildrenProps & { cols?: number };
export default function FormRender(props: CustomFormRenderProps) {
  const { cols, options, ...rest } = props;
  const flexW = `${100 / (cols || 1)}%`;
  return (
    <DefaultFormRender
      {...defineConfig}
      wrapper={{ type: 'row', props: { gutter: 16 } }}
      options={{
        ...defineConfig.options,
        ...options,
        outside: { type: 'col', props: { flex: flexW, style: { width: 0 } } },
      }}
      {...rest}
    />
  );
}
