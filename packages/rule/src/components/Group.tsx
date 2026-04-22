import React from "react";
import { BuilderOptions, RBFactory, RuleBuilderGroup } from "../typings";
export interface GroupProps extends BuilderOptions {
  children?: React.ReactNode;
  properties: RuleBuilderGroup["properties"];
}

const Group: React.FC<GroupProps> = (props) => {
  const { path, children, properties, actions, config } = props;

  const settings = config?.settings;
  const currentNesting = path?.filter((p) => p === "children")?.length; // 层级深度
  const maxNesting = settings?.maxNesting;
  const allowFurtherNesting =
    typeof maxNesting === "undefined" || currentNesting < maxNesting;
  const allowRemoval = currentNesting >= 1;
  const conjunction = properties?.conjunction;

  const setConjunction = (conjunction) => {
    actions?.setProperties(path, { conjunction });
  };

  const removeSelf = () => {
    actions?.removeGroup(path);
  };

  const addGroup = () => {
    actions?.addGroup(path);
  };

  const addRule = () => {
    actions?.addRule(path);
  };

  const createEle = (defaultEle: React.ReactNode, factory?: RBFactory) => {
    if (!factory) return defaultEle;
    return factory?.({ path, properties, actions, config });
  };

  return (
    <div className="group">
      <div className="group--header">
        <div className="group--conjunctions">
          {Object.entries(config?.conjunctions || {}).map(([key, item]) => {
            const checked = key === conjunction;
            return (
              <div
                key={key}
                className={`conjunction conjunction--${key.toUpperCase()}`}
                data-state={checked ? "active" : "inactive"}
              >
                <label htmlFor={item.label} onClick={() => setConjunction(key)}>
                  {item.label}
                </label>
                <input
                  id={item.label}
                  type="radio"
                  value={key}
                  checked={checked}
                  onChange={() => { }}
                />
              </div>
            );
          })}
        </div>
        <div className="group--actions">
          {allowFurtherNesting
            ? createEle(
              <button className="action action--ADD-GROUP" onClick={addGroup}>
                {settings?.addGroup?.text}
              </button>,
              settings?.addGroup?.factory
            )
            : null}
          {createEle(
            <button className="action action--ADD-RULE" onClick={addRule}>
              {settings?.addRule?.text}
            </button>,
            settings?.addRule?.factory
          )}
          {allowRemoval
            ? createEle(
              <button className="action action--DELETE" onClick={removeSelf}>
                {settings?.deleteGroup?.text}
              </button>,
              settings?.deleteGroup?.factory
            )
            : null}
        </div>
      </div>
      {children ? <div className="group--children">{children}</div> : null}
    </div>
  );
};

export default Group;
