const baseSetting = {
  props: {
    properties: {
      action: {
        label: '上传接口路径',
        type: 'Input',
      },
      formdataKey: {
        label: '参数名',
        type: 'Input',
        initialValue: 'file'
      },
      maxCount: {
        label: '最大允许上传个数',
        type: 'InputNumber',
        initialValue: 5
      },
      maxSize: {
        label: '文件大小限制(MB)',
        type: 'InputNumber',
        initialValue: 5
      },
    }
  }
};

const operationSetting = {
  hidden: {
    type: 'OperateCheckbox',
    inline: true,
    compact: true,
    props: { children: '隐藏' }
  },
  props: {
    properties: {
      disabled: {
        type: 'OperateCheckbox',
        inline: true,
        compact: true,
        props: { children: '禁用' }
      },
    }
  }
};

const rulesSetting = {
  rules: {
    type: 'RulesGroup',
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
