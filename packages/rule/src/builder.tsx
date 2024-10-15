import React, { useEffect, useState } from 'react';
import { useRuleBuilder, useRuleBuilderTree } from './hooks';
import { RuleBuilder } from './store';
import { RuleBuilderProps } from './typings';
import { deepClone } from './utils/object';
import Immutable from 'immutable';
import Item from './components/Item';


export default function Builder(props: RuleBuilderProps) {
  const curBuilder = useRuleBuilder();
  const {
    tree: propTree,
    config,
    builder = curBuilder,
    onRenderChange
  } = props;
  
  builder.defineConfig(config);

  const [tree, setTree] = useRuleBuilderTree(builder, onRenderChange);

  // 从props中同步, 不触发监听
  useEffect(() => {
    if (!builder) return;
    const cloneData = propTree;
    setTree(cloneData);
    builder.setTree(cloneData, { ignore: true });
  }, [propTree]);





  const id = tree?.get('id');
  return tree && (
    <Item
      key={id}
      id={id}
      path={Immutable.List.of(id)}
      type={tree?.get('type')}
      properties={tree?.get('properties')}
      config={config}
      actions={builder?.getActions()}
    >
      {tree?.get('children')}
    </Item>
  );
};
