import React from "react";
import { RuleBuilder } from "./store";

export type ValueOfRecord<T> = NonNullable<NonNullable<T>[keyof T]>;

export type BuilderOptions = {
  path: Array<string | number>;
  actions?: Record<string, (...args: unknown[]) => void>;
  config?: RuleBuilderConfig;
};

export type RBFactory = (
  props?: BuilderOptions & {
    properties?: any;
    onChange?: (...args) => void;
  }
) => React.ReactNode;

export type RBField = {
  label?: React.ReactNode;
  name: string;
  defaultValue?: any;
  widget: string | [string, ValueOfRecord<RuleBuilderConfig["widgets"]>] | any;
};

export interface RuleBuilderConfig {
  tree?: RuleBuilderGroup; // 规则树渲染数据源
  conjunctions?: Record<string, { label: string }>; // 关系符号配置
  operators?: Record<string, { label: string }>; // 操作符配置
  widgets?: Record<string, { factory?: RBFactory } & Record<string, any>>; // 组件配置
  fields?: ((options) => Array<RBField>) | Array<RBField>; // 规则行的字段列表
  // 组件固定配置项
  settings?: {
    defaultConjunction?: string; // 默认连接符
    maxNesting?: number; // 默认的最大嵌套深度
    addGroup: { text?: string; factory?: RBFactory }; // 新增规则组按钮
    addRule: { text?: string; factory?: RBFactory }; // 新增规则行按钮
    deleteGroup: { text?: string; factory?: RBFactory }; // 删除规则组按钮
    deleteRule: { text?: string; factory?: RBFactory }; // 删除规则行按钮
  };
}

export interface RuleBuilderItem {
  type: string;
  properties: any;
}

export interface RuleBuilderGroup {
  type: string;
  children: Array<RuleBuilderItem | RuleBuilderGroup>;
  properties: { conjunction: string };
}

export interface RuleBuilderProps extends RuleBuilderConfig {
  builder?: RuleBuilder;
  onRenderChange?: (
    newData?: RuleBuilderGroup,
    oldData?: RuleBuilderGroup
  ) => void;
}
