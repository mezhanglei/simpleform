import { FRContext, FRGenerateNode, FRNode } from '@simpleform/render';
import React from 'react';
import { ConfigWidgetSetting, FormEditorContextProps } from './context';

// 编辑器自定义传参
export interface EditorOptions {
  isEditor?: boolean; // 是否为编辑态
  editorContext?: FormEditorContextProps; // 编辑器上下文环境
  // 配置信息
  panel?: {
    label?: string; // 配置组件的名
    icon?: string; // 配置组件的图标
    nonform?: boolean; // 是否为非表单
    nonselection?: boolean; // 是否禁止添加通用选中框
    includes?: string[]; // 子元素限制可以添加的组件类型
  };
  // 属性表单
  setting?: ConfigWidgetSetting;
  props?: unknown;
}
// 编辑器节点信息（解析联动前）
export type EditorWidgetItem = FRNode & { type?: string };
// 编辑器节点信息（解析联动后）
export type EditorGenerateWidgetItem = FRGenerateNode & { type?: string };
// 组件公共props
export type CommonFormProps<V = unknown> = FRContext & {
  value?: V;
  onChange?: (val?: V) => void;
  disabled?: boolean;
  children?: React.ReactNode;
};
// 表单渲染数据的类型
export type FormDesignData = Array<EditorWidgetItem>;
