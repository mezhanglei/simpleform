import FormRenderCore, { FormChildren as FormChildrenCore, FormNodeProps, FormRenderProps, FormChildrenProps, GenerateParams } from '@simpleform/render';
import React from 'react';
import dayjs from 'dayjs';
import '@simpleform/render/lib/css/main.css';
import widgets from '.';
import { ConfigSettingItem, FormEditorContextProps } from '../context';
import createRequest from './common/request';
import { CreateRequestParams } from './common/request/createRequest';

export * from '@simpleform/render';

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
export type CustomFormNodeProps = FormNodeProps & CustomOptions;
// 表单渲染数据的类型
export type FormDesignData = { [key: string]: CustomFormNodeProps } | CustomFormNodeProps[];
// 选中项类型
export type EditorSelection = { attributeName?: string } & GenerateParams<CustomOptions>;

export interface CustomChildrenProps {
  // 请求配置
  requestConfig?: CreateRequestParams;
}
export type CustomFormChildrenProps = FormChildrenProps<CustomOptions> & CustomChildrenProps;
export function FormChildren(props: CustomFormChildrenProps) {
  const { components, plugins, requestConfig, ...rest } = props;
  return (
    <FormChildrenCore
      options={{ props: { autoComplete: 'off' } }}
      components={{ ...widgets, ...components }}
      plugins={{ ...plugins, dayjs, request: createRequest(requestConfig) }}
      {...rest}
    />
  );
}
export type CustomFormRenderProps = FormRenderProps<CustomOptions> & CustomChildrenProps;
export default function FormRender(props: CustomFormRenderProps) {
  const { components, plugins, requestConfig, ...rest } = props;
  return (
    <FormRenderCore
      options={{ props: { autoComplete: 'off' } }}
      components={{ ...widgets, ...components }}
      plugins={{ ...plugins, dayjs, request: createRequest(requestConfig) }}
      {...rest}
    />
  );
}
