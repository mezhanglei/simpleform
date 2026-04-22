import React from "react";
import { BuilderOptions, RBFactory, RuleBuilderRule } from "../../typings";
import Field from "./Field";
import { getValueFromEvent } from "@simpleform/form";

export interface RuleProps extends BuilderOptions {
  children?: React.ReactNode;
  properties: RuleBuilderRule["properties"];
}

const Rule: React.FC<RuleProps> = (props) => {
  const { path, properties, actions, config } = props;

  const settings = config?.settings;
  const fields =
    typeof config?.fields === "function"
      ? config?.fields({ path, properties, actions, config })
      : config?.fields;

  const removeSelf = () => {
    actions?.removeRule(path);
  };

  const createEle = (defaultEle: React.ReactNode, factory?: RBFactory) => {
    if (!factory) return defaultEle;
    return factory?.({ path, properties, actions, config });
  };

  const handleChange = (name, e) => {
    const val = getValueFromEvent(e);
    actions?.setProperties(path, { [name]: val });
  };

  return (
    <div className="rule">
      <div className="rule--header">
        <div className="rule--actions">
          {createEle(
            <button className="action action--DELETE" onClick={removeSelf}>
              {settings?.deleteRule?.text}
            </button>,
            settings?.deleteRule?.factory
          )}
        </div>
      </div>
      <div className="rule--body">
        {fields?.map((field) => {
          return (
            <Field
              key={field?.name}
              {...field}
              path={path}
              properties={properties}
              actions={actions}
              config={config}
              onFieldChange={(e) => handleChange(field?.name, e)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Rule;
