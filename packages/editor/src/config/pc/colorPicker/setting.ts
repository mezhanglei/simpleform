const baseSetting = {
  initialValue: {
    label: '默认值',
    type: 'Input',
  },
};

const operationSetting = {
  hidden: {
    type: 'DynamicSettingCheckbox',
    inline: true,
    compact: true,
    props: { children: '隐藏' }
  },
  props: {
    properties: {
      disabled: {
        type: 'DynamicSettingCheckbox',
        inline: true,
        compact: true,
        props: { children: '禁用' }
      },
    }
  }
};

const rulesSetting = {
  rules: {
    type: 'RulesComponent',
    compact: true,
    props: {
      includes: ['required']
    }
  },
};

const setting = {
  '基础属性': baseSetting,
  '操作属性': operationSetting,
  '校验规则': rulesSetting,
};

export default setting;
