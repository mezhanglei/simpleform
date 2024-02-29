import FormRenderCore, { FormChildren as FormChildrenCore, FormNodeProps, FormRenderProps, FormChildrenProps, GenerateParams } from '@simpleform/render';
import React from 'react';
import dayjs from 'dayjs';
import '@simpleform/render/lib/css/main.css';
import widgets from '.';
import { ConfigSettingItem, FormEditorContextProps } from '../context';
import createRequest from './common/request';

export * from '@simpleform/render';
export { createRequest };

// 自定义传参
export interface CustomOptions {
  isEditor?: boolean; // 是否为编辑态
  context?: FormEditorContextProps; // 编辑器上下文环境
  // 配置信息
  panel?: {
    label?: string; // 配置组件的名
    icon?: string; // 配置组件的图标
    includes?: string[]; // 子元素限制可以添加的组件类型
  };
  // 属性表单
  setting?: ConfigSettingItem;
}
// 自定义表单节点信息
export type CustomFormNodeProps<T = FormNodeProps> = T & CustomOptions;
// 表单渲染数据的类型
export type FormDesignData = { [key: string]: CustomFormNodeProps } | CustomFormNodeProps[];
// 选中项类型
export type EditorSelection = { attributeName?: string } & GenerateParams<CustomOptions>;

export type CustomFormChildrenProps = FormChildrenProps<CustomOptions>;
export function FormChildren(props: CustomFormChildrenProps) {
  const { components, plugins, ...rest } = props;
  return (
    <FormChildrenCore
      options={{ props: { autoComplete: 'off' } }}
      components={{ ...widgets, ...components }}
      plugins={{ ...plugins, dayjs }}
      {...rest}
    />
  );
}
export type CustomFormRenderProps = FormRenderProps<CustomOptions>;
export default function FormRender(props: CustomFormRenderProps) {
  const { components, plugins, ...rest } = props;
  return (
    <FormRenderCore
      options={{ props: { autoComplete: 'off' } }}
      components={{ ...widgets, ...components }}
      plugins={{ ...plugins, dayjs }}
      {...rest}
    />
  );
}
