import React, { useEffect } from "react";
import { BuilderOptions, RBField, RuleBuilderRule } from "../../typings";
import { bindWrapper } from "@simpleform/form";
import { transformWidget } from "../../utils";

export interface RuleFieldProps extends BuilderOptions, RBField {
  properties?: RuleBuilderRule["properties"];
  onFieldChange?: (...args) => void;
}

const Field = (props: RuleFieldProps) => {
  const {
    path,
    config,
    actions,
    properties,
    label,
    name,
    widget,
    defaultValue,
    onFieldChange,
  } = props;

  // 初始值
  useEffect(() => {
    actions?.setProperties(path, { [name]: defaultValue });
  }, []);

  const [widgetFactory, widgetProps] = transformWidget(widget, config);

  const childNode = widgetFactory?.({
    ...widgetProps,
    path,
    config,
    actions,
    properties,
  });

  return (
    <div className="rule--field">
      {label ? <label>{label}</label> : null}
      {bindWrapper(childNode, {
        bindProps: {
          value: properties?.[name],
          onChange: onFieldChange,
        },
      })}
    </div>
  );
};

export default Field;
