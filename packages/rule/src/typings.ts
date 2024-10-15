import { RuleBuilder } from "./store";

export interface RuleBuilderConfig { }

export interface RuleBuilderTreeChildren {

}

export interface RuleBuilderTree {
  type: 'group'
  id: string
  children: {},
  properties: {}
};

export interface RuleBuilderProps {
  tree?: RuleBuilderTree
  config?: RuleBuilderConfig
  builder?: RuleBuilder
  onRenderChange?: (newData?: RuleBuilderTree, oldData?: RuleBuilderTree) => void;
};
