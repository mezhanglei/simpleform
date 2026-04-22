import { RuleBuilderConfig } from "../typings";

export const defaultGroupProperties = (config?: RuleBuilderConfig) => ({
  conjunction:
    config?.settings?.defaultConjunction ||
    Object.keys(config?.conjunctions || {})[0],
});

export const getChildren = (count: number, config: RuleBuilderConfig) =>
  Array.from({ length: count }).map(() => ({
    type: "rule",
    properties: {},
  }));

export const defaultData = (
  config: RuleBuilderConfig,
  childrenNum = 2
) => ({
  type: "group",
  children: getChildren(childrenNum, config),
  properties: defaultGroupProperties(config),
});
