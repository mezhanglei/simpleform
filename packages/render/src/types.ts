import React, { ReactNode } from "react";
import { FormItemProps, FormProps, FormRule, SimpleForm } from "@simpleform/form";
import { SimpleFormRender } from "./store";

// 组件JSON描述
export interface CustomWidget {
  type?: string;
  props?: Record<string, any> & { children?: any | Array<CustomWidget> };
  widgetList?: WidgetList;
}

export type UnionComponent<P> =
  React.ComponentType<P>
  | React.ForwardRefExoticComponent<P>
  | keyof React.ReactHTML;

// 表单上的组件联合类型
export type CustomUnionType = CustomWidget | Array<CustomWidget> | UnionComponent<any> | Function | ReactNode
// 表单对象
export type WidgetList = Array<WidgetItem>
// 表单域(字符串表达式编译后)
export type GenerateWidgetItem<T extends Record<string, any> = {}> = CustomWidget & FormItemProps & T & {
  inside?: CustomUnionType; // 节点内层嵌套组件
  outside?: CustomUnionType; // 节点外层嵌套组件
  readOnly?: boolean; // 只读模式
  readOnlyRender?: CustomUnionType; // 只读模式下的组件
  typeRender?: CustomUnionType; // 表单控件自定义渲染
  hidden?: boolean;
}

// render函数
export type CustomRenderType = (params: GenerateParams<any> & { children?: any }) => any;

// 表单域(字符串表达式编译前)
export type WidgetItem = {
  [key in keyof GenerateWidgetItem]: key extends 'rules' ?
  (string | Array<{ [key in keyof FormRule]: FormRule[key] | string }> | GenerateWidgetItem[key])
  : (string | GenerateWidgetItem[key])
}

export interface FormChildrenProps<T extends Record<string, any> = {}> {
  form?: SimpleForm;
  formrender?: SimpleFormRender;
  options?: GenerateWidgetItem<T> | ((params: GenerateWidgetItem<T>) => GenerateWidgetItem<T>); // 组件公共传参
  uneval?: boolean;
  components?: Record<string, any>; // 注册组件
  plugins?: Record<string, any>; // 外部模块
  inside?: CustomUnionType;
  widgetList?: WidgetList; // 渲染数据
  // 自定义渲染列表组件
  renderList?: CustomRenderType;
  // 自定义渲染子表单域
  renderItem?: CustomRenderType;
  // 渲染数据回调函数
  onRenderChange?: (newValue: WidgetList, oldValue?: WidgetList) => void;
}
export type FormRenderProps<T extends Record<string, any> = {}> = Omit<FormProps, 'form'> & FormChildrenProps<T>;

// 组件公共的参数
export interface GenerateParams<T extends Record<string, any> = {}> {
  path?: string;
  widgetItem?: GenerateWidgetItem<T>;
  formrender?: SimpleFormRender;
  form?: SimpleForm;
};
