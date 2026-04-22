import React from "react";
import { RuleBuilder } from "./store";

export type ValueOfRecord<T> = NonNullable<NonNullable<T>[keyof T]>;

export type RBFactory = <V = any>(
  props?: BuilderOptions & {
    properties?: V;
    onChange?: (...args) => void;
  }
) => React.ReactNode;

export type RBField = {
  label?: React.ReactNode;
  name: string;
  defaultValue?: any;
  widget: string | [string, ValueOfRecord<RuleBuilderConfig["widgets"]>] | any;
};

export type ConjunctionType = "and" | "or";
export interface RuleBuilderConfig {
  tree?: RuleBuilderGroup;
  conjunctions?: Record<string, { label: string }>;
  operators?: Record<string, { label: string; cardinality?: number }>; // cardinality集合大小，用于比较符右边的值
  widgets?: Record<string, { factory?: RBFactory } & Record<string, any>>;
  settings?: {
    defaultConjunction?: string; // 默认连接符
    maxNesting?: number; // 默认的最大嵌套深度
    addGroup: { text?: string; factory?: RBFactory };
    addRule: { text?: string; factory?: RBFactory };
    deleteGroup: { text?: string; factory?: RBFactory };
    deleteRule: { text?: string; factory?: RBFactory };
  };
  fields?: ((options) => Array<RBField>) | Array<RBField>;
}

export interface RuleBuilderRule {
  type: string;
  properties: any;
}

export interface RuleBuilderGroup {
  type: string;
  children: Array<RuleBuilderRule | RuleBuilderGroup>;
  properties: { conjunction: string };
}

export type BuilderOptions = {
  path: Array<string | number>;
  actions?: Record<string, (...args: unknown[]) => void>;
  config?: RuleBuilderConfig;
};

export interface RuleBuilderProps extends RuleBuilderConfig {
  builder?: RuleBuilder;
  onRenderChange?: (
    newData?: RuleBuilderGroup,
    oldData?: RuleBuilderGroup
  ) => void;
}
