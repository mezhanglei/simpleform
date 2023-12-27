import { ReactNode } from "react";
import { FormItemProps, FormProps, FormRule, SimpleForm } from "@simpleform/form";
import { SimpleFormRender } from "./store";

// 组件JSON描述
export interface FormComponent {
  type?: string;
  props?: any & { children?: any | Array<FormComponent> };
}

export type UnionComponent<P> =
  | React.ComponentType<P>
  | React.ForwardRefExoticComponent<P>
  | React.FC<P>
  | keyof React.ReactHTML;

// 表单上的组件联合类型
export type CustomUnionType = FormComponent | Array<FormComponent> | UnionComponent<any> | Function | ReactNode
// 表单对象
export type PropertiesData = { [name: string]: FormNodeProps } | FormNodeProps[]
// 表单域(字符串表达式编译后)
export type GenerateFormNodeProps<T = {}> = FormComponent & FormItemProps & T & {
  ignore?: boolean; // 标记当前节点为非表单节点
  inside?: CustomUnionType; // 节点内层嵌套组件
  outside?: CustomUnionType; // 节点外层嵌套组件
  readOnly?: boolean; // 只读模式
  readOnlyRender?: CustomUnionType; // 只读模式下的组件
  typeRender?: CustomUnionType; // 表单控件自定义渲染
  properties?: PropertiesData;
  hidden?: boolean;
}

// render函数
export type CustomRenderType = (params: GenerateParams<any> & { children?: any }) => any;

// 表单域(字符串表达式编译前)
export type FormNodeProps = {
  [key in keyof GenerateFormNodeProps]: key extends 'rules' ?
  (string | Array<{ [key in keyof FormRule]: FormRule[key] | string }> | GenerateFormNodeProps[key])
  : (key extends 'properties' ? GenerateFormNodeProps[key] : (string | GenerateFormNodeProps[key]))
}

export interface FormChildrenProps<T = {}> {
  form?: SimpleForm;
  formrender?: SimpleFormRender;
  options?: GenerateFormNodeProps<T> | ((params: GenerateFormNodeProps<T>) => GenerateFormNodeProps<T>); // 组件公共传参
  evalPropNames?: Array<string>; // 表达式允许的props
  uneval?: boolean;
  components?: any; // 注册组件
  plugins?: any; // 外部模块
  inside?: CustomUnionType;
  properties?: PropertiesData; // 渲染数据
  // 自定义渲染列表组件
  renderList?: CustomRenderType;
  // 自定义渲染子表单域
  renderItem?: CustomRenderType;
  // 渲染数据回调函数
  onPropertiesChange?: (newValue: PropertiesData, oldValue?: PropertiesData) => void;
}
export type FormRenderProps<T = {}> = Omit<FormProps, 'form'> & FormChildrenProps<T>;

// 组件公共的参数
export interface GenerateParams<T = {}> {
  name?: string;
  path?: string;
  field?: GenerateFormNodeProps<T>;
  parent?: { name?: string; path?: string, field?: GenerateFormNodeProps<T>; };
  formrender?: SimpleFormRender;
  form?: SimpleForm;
};
