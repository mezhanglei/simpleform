import React, { ReactNode } from "react";
import { FormItemProps, FormProps } from "@simpleform/form";
import { SimpleFormRender } from "./store";

// 组件类型
export type ReactComponent<P> = React.ComponentType<P> | React.ForwardRefExoticComponent<P>
// 组件JSON描述
export interface CustomWidget<P = {}> {
  type?: string;
  props?: Record<string, unknown> & { children?: CustomUnionType };
  widgetList?: WidgetList<P>; // 嵌套的子节点(会覆盖props.children)
}
// 注册组件
export interface RegisteredComponents<P = any> {
  [key: string]: ReactComponent<P>;
}
// 节点联合类型
export type CustomUnionType = CustomWidget | Array<CustomWidget> | ReactComponent<unknown> | Function | ReactNode;
// 表单对象
export type WidgetList<P = {}> = Array<WidgetItem<P>>
// 组件节点(字符串表达式编译后)
export type GenerateWidgetItem<P = {}> = CustomWidget<P> & FormItemProps & {
  inside?: CustomUnionType; // 节点的内层
  outside?: CustomUnionType; // 节点的外层
  readOnly?: boolean; // 只读模式
  readOnlyRender?: CustomUnionType; // 只读模式下的组件
  typeRender?: CustomUnionType; // 表单控件自定义渲染
  hidden?: boolean;
} & P
// 组件节点(字符串表达式编译前)
export type WidgetItem<P = {}> = {
  [key in keyof GenerateWidgetItem<P>]: (string | GenerateWidgetItem<P>[key])
}
// 组件注入参数
export type WidgetOptions<P = {}> = GenerateWidgetItem<P> & Pick<FormChildrenProps, 'form' | 'formrender'> & {
  index?: number;
  path?: string;
}
export type WidgetContextProps<P = {}> = { _options?: WidgetOptions<P> };
export type CustomRenderType = <C, P = {}>(children?: C, params?: WidgetContextProps<P>) => C;
export type FormChildrenProps<P = {}> = Pick<FormProps, 'form'> & Pick<GenerateWidgetItem<P>, 'inside'> & {
  formrender?: SimpleFormRender;
  options?: GenerateWidgetItem<P> | ((item: GenerateWidgetItem<P>) => GenerateWidgetItem<P>);
  uneval?: boolean;
  components?: RegisteredComponents; // 注册组件
  plugins?: Record<string, unknown>; // 外部模块
  widgetList?: WidgetList<P>; // 渲染数据
  renderList?: CustomRenderType;
  renderItem?: CustomRenderType;
  onRenderChange?: (newData?: WidgetList<P>, oldData?: WidgetList<P>) => void;
}
export type FormRenderProps<P = {}> = FormProps & FormChildrenProps<P>;
