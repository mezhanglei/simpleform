import DefaultFormRender, { FormChildren as DefaultFormChildren, FormRenderProps, FormChildrenProps, GenerateParams, WidgetItem } from '@simpleform/render';
import React from 'react';
import dayjs from 'dayjs';
import '@simpleform/render/lib/css/main.css';
import widgets from './components';
import { ConfigWidgetSetting, FormEditorContextProps } from './context';
import createRequest from './utils/request';
import bindRequest from './components/bind-request';

export * from '@simpleform/render';
export { createRequest, bindRequest };

// 自定义传参
export interface CustomOptions {
  isEditor?: boolean; // 是否为编辑态
  context?: FormEditorContextProps; // 编辑器上下文环境
  // 配置信息
  panel?: {
    label?: string; // 配置组件的名
    icon?: string; // 配置组件的图标
    nonform?: boolean; // 非表单控件
    includes?: string[]; // 子元素限制可以添加的组件类型
  };
  // 属性表单
  setting?: ConfigWidgetSetting;
}
// 自定义表单节点信息
export type CustomWidgetItem<T = WidgetItem> = T & CustomOptions;
// 表单渲染数据的类型
export type FormDesignData = Array<CustomWidgetItem>;
// 控件的公共输入项props
export type CommonWidgetProps<T = any> = {
  value?: T;
  onChange?: (val?: T) => void;
  disabled?: boolean;
} & GenerateParams<CustomOptions>;

export type CustomFormChildrenProps = FormChildrenProps<CustomOptions>;
export function FormChildren(props: CustomFormChildrenProps) {
  const { components, plugins, ...rest } = props;
  return (
    <DefaultFormChildren
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
    <DefaultFormRender
      options={{ props: { autoComplete: 'off' } }}
      components={{ ...widgets, ...components }}
      plugins={{ ...plugins, dayjs }}
      {...rest}
    />
  );
}
