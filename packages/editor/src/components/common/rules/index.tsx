import React, { useEffect, useRef, useState } from "react";
import { Checkbox } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import './index.less';
import { CommonFormProps, pickObject } from "../../../formrender";
import RequiredComponent from "./required";
import MinOrMaxComponent from "./minOrMax";
import PatternComponent from "./pattern";
import { InputFormRule } from "./core";


// 校验规则组件
const RuleWidget = {
  required: { label: '必填', component: RequiredComponent },
  pattern: { label: '正则表达式', component: PatternComponent },
  max: { label: '上限', component: MinOrMaxComponent },
  min: { label: '下限', component: MinOrMaxComponent },
};
export type InputFormRuleKey = keyof typeof RuleWidget & string;
export type RulesKeyList = Array<InputFormRuleKey>;
export interface RulesGroupProps extends CommonFormProps<Array<InputFormRule>> {
  includes?: Array<InputFormRuleKey>;
}


const prefixCls = 'rules-add';
const classes = {
  rules: prefixCls,
  item: `${prefixCls}-item`,
  rule: `${prefixCls}-rule`,
};

const RuleKeys = Object.keys(RuleWidget) as RulesKeyList;

/**
 * 校验规则的配置组件。
 */
const RulesGroup: React.FC<RulesGroupProps> = (props) => {

  const {
    includes = RuleKeys,
    value,
    onChange,
    ...rest
  } = props;

  const ruleModalRefs = useRef<any>([]);
  const [rulesMap, setRulesMap] = useState<Record<InputFormRuleKey, InputFormRule>>();
  const [checked, setChecked] = useState<RulesKeyList>([]);

  const setRulesMapFormValue = (rules?: Array<InputFormRule>) => {
    const data: Record<string, InputFormRule> = {};
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

  const getRules = (rulesMap?: Record<InputFormRuleKey, InputFormRule>, checked?: RulesKeyList) => {
    const result = pickObject(rulesMap, checked || []);
    const rules = Object.values(result || {});
    return rules;
  };

  const setCheckedFromValue = (rules?: Array<InputFormRule>) => {
    const data: RulesKeyList = [];
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
};

export default RulesGroup;
