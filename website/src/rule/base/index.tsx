import Builder, { defaultData, useRuleBuilder, useRuleBuilderTree } from '@simpleform/rule';
import '@simpleform/rule/lib/css/main.css';
import React from 'react';
import config from './config';
import fields from './fields';

export default function Demo() {
  const state = defaultData(config);
  const builder = useRuleBuilder();
  const [builderTree] = useRuleBuilderTree(builder);
  return (
    <div className="query-builder">
      <div>规则：{JSON.stringify(builderTree)}</div>
      <Builder {...config} builder={builder} tree={state} fields={fields} />
    </div>
  );
}
