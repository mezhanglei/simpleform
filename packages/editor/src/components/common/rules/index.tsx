import React, { useEffect, useRef, useState } from "react";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import './index.less';
import RequiredComponent from "./required";
import MinOrMaxComponent from "./minOrMax";
import PatternComponent from "./pattern";
import { Checkbox } from "antd";
import { InputFormRule, InputFormRuleKey } from "./core";
import { pickObject } from "../../../utils/object";


/**
 * 校验规则的配置组件。
 */

export interface RulesGroupProps {
  includes?: Array<InputFormRuleKey>;
  value?: Array<InputFormRule>;
  onChange?: (val?: Array<InputFormRule>) => void;
}
type RulesMap = { [key in InputFormRuleKey]: InputFormRule };
type RulesKeys = Array<InputFormRuleKey>;
const prefixCls = 'rules-add';
const classes = {
  rules: prefixCls,
  item: `${prefixCls}-item`,
  rule: `${prefixCls}-rule`,
};

// 校验规则组件
const RuleWidget = {
  required: { label: '必填', component: RequiredComponent },
  pattern: { label: '正则表达式', component: PatternComponent },
  max: { label: '上限', component: MinOrMaxComponent },
  min: { label: '下限', component: MinOrMaxComponent },
};
const RuleKeys = Object.keys(RuleWidget) as RulesKeys;

const RulesGroup = React.forwardRef<HTMLElement, RulesGroupProps>((props, ref) => {

  const {
    includes = RuleKeys,
    value,
    onChange,
    ...rest
  } = props;

  const ruleModalRefs = useRef<any>([]);
  const [rulesMap, setRulesMap] = useState<RulesMap>();
  const [checked, setChecked] = useState<RulesKeys>([]);

  const setRulesMapFormValue = (rules?: Array<InputFormRule>) => {
    const data: any = {};
    if (rules instanceof Array) {
      rules.forEach((rule) => {
        const keys = Object.keys(rule);
        const code = RuleKeys.find((key) => keys.includes(key));
        if (code) {
          data[code] = rule;
        }
      });
    }
    setRulesMap(data);
  };

  const getRules = (rulesMap?: RulesMap, checked?: RulesKeys) => {
    const result = pickObject(rulesMap, checked || []);
    const rules = Object.values(result || {});
    return rules;
  };

  const setCheckedFromValue = (rules?: Array<InputFormRule>) => {
    const data: RulesKeys = [];
    if (rules instanceof Array) {
      rules.forEach((rule) => {
        const keys = Object.keys(rule);
        const code = RuleKeys.find((key) => keys.includes(key));
        if (code) {
          data.push(code);
        }
      });
    }
    setChecked(data);
  };

  useEffect(() => {
    setRulesMapFormValue(value);
    setCheckedFromValue(value);
  }, [value]);

  const handleCheckbox = (e: CheckboxChangeEvent, name: InputFormRuleKey, index: number) => {
    const isChecked = e?.target?.checked;
    const cloneChecked = [...checked];
    if (isChecked) {
      if (rulesMap && rulesMap[name]) {
        cloneChecked.push(name);
        setChecked(cloneChecked);
        onChange && onChange(getRules(rulesMap, cloneChecked));
      } else {
        // 没有值则先弹窗编辑
        if (ruleModalRefs.current[index]) {
          ruleModalRefs.current[index].showRuleModal();
        }
      }
    } else {
      const result = cloneChecked.filter((code) => code !== name);
      setChecked(result);
      onChange && onChange(getRules(rulesMap, result));
    }
  };

  const ruleChange = (name: InputFormRuleKey, val?: InputFormRule) => {
    const cloneRulesMap = { ...rulesMap };
    if (val) {
      cloneRulesMap[name] = val;
    } else {
      delete cloneRulesMap[name];
    }
    const result = Object.values(cloneRulesMap);
    onChange && onChange(result);
  };

  return (
    <div className={classes.rules}>
      <Checkbox.Group value={checked}>
        {
          includes.map((name, index) => {
            const itemProps = RuleWidget[name];
            const { label, component: Child } = itemProps || {};
            return (
              <div key={name} className={classes.item}>
                <Checkbox value={name} onChange={(e) => handleCheckbox(e, name, index)} />
                <Child {...rest} ref={(target) => ruleModalRefs.current[index] = target} className={classes.rule} label={label} name={name} value={rulesMap && rulesMap[name]} onChange={(val) => ruleChange(name, val)} />
              </div>
            );
          })
        }
      </Checkbox.Group>
    </div>
  );
});

export default RulesGroup;
