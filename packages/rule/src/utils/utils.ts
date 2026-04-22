import { nanoid } from "nanoid";
import { defaultGroupProperties } from "../utils/defaultData";
import { BuilderOptions, RBField, RuleBuilderConfig } from "../typings";
import { deepGet, deepSet } from "@simpleform/form";

export const uuid = () => {
  return nanoid(6);
};

// 组件转换
export const transformWidget = (
  widget?: RBField["widget"],
  config?: RuleBuilderConfig
) => {
  const widgetName = Array.isArray(widget) ? widget[0] : widget;
  const widgetProps = Array.isArray(widget) ? widget[1] : undefined;
  const configWidget = widgetName ? config?.widgets?.[widgetName] : null;
  if (!configWidget) return [];
  const { factory, ...defaultProps } = configWidget;
  return [factory, Object.assign({}, defaultProps, widgetProps)] as const;
};

export const addItem = <P>(
  treeData: RuleBuilderConfig["tree"],
  type: string,
  path: BuilderOptions["path"],
  properties: P,
  config?: RuleBuilderConfig
) => {
  const containerPath = path.concat("children");
  const container = deepGet(treeData, containerPath) || ([] as unknown[]);
  if (container instanceof Array) {
    const newProperties =
      type === "group"
        ? { ...defaultGroupProperties(config), ...properties }
        : properties;
    container.push({ type, properties: newProperties });
    return deepSet(treeData, containerPath, container);
  }
};

export const removeItem = (
  treeData: RuleBuilderConfig["tree"],
  path: BuilderOptions["path"]
) => {
  return deepSet(treeData, path);
};

// 设置properties
export const setProperties = (treeData, path, data) => {
  const oldItem = deepGet(treeData, path);
  const newProperties = Object.assign({}, oldItem?.properties, data);
  return deepSet(treeData, path.concat("properties"), newProperties);
};

// 获取properties
export const getProperties = (treeData, path) => {
  const item = deepGet(treeData, path);
  return item;
};
