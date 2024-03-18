const baseSetting = [
  {
    label: '字段名',
    name: 'name',
    type: 'Input'
  },
  {
    label: '默认值',
    name: 'initialValue',
    type: 'TimePicker.RangePicker',
    valueSetter: "{{(value)=> value instanceof Array ? value.map((item) => typeof item === 'string' ? dayjs(item, 'HH:mm:ss') : undefined) : undefined}}",
    valueGetter: "{{(value) => value instanceof Array ? value.map((item) => dayjs.isDayjs(item) ? item.format(formvalues.props && formvalues.props.format || 'HH:mm:ss') : undefined) : undefined}}",
    props: {
      format: "{{formvalues.props && formvalues.props.format}}",
      use12Hours: "{{formvalues.props && formvalues.props.use12Hours}}",
    }
  },
  {
    label: '占位字符',
    name: 'props.placeholder',
    type: 'Input',
    initialValue: '请输入'
  },
  {
    label: "显示格式",
    name: 'props.format',
    type: "Select",
    initialValue: 'HH:mm:ss',
    props: {
      style: { width: '100%' },
      options: [
        { label: '时分秒', value: 'HH:mm:ss' },
        { label: '时分', value: 'HH:mm' },
        { label: '分秒', value: 'mm:ss' },
        { label: '小时', value: 'HH' },
        { label: '分钟', value: 'mm' },
        { label: '秒', value: 'ss' },
      ]
    }
  },
  {
    label: "尺寸",
    name: 'props.size',
    type: "Radio.Group",
    initialValue: 'middle',
    props: {
      style: { width: '100%' },
      options: [
        { label: '大', value: 'large' },
        { label: '中', value: 'middle' },
        { label: '小', value: 'small' }
      ]
    }
  }
];

const operationSetting = [
  {
    name: 'hidden',
    type: 'OperateCheckbox',
    inline: true,
    compact: true,
    props: { children: '隐藏' }
  },
  {
    name: 'props.disabled',
    type: 'OperateCheckbox',
    inline: true,
    compact: true,
    props: { children: '禁用' }
  },
  {
    name: 'props.allowClear',
    type: 'OperateCheckbox',
    inline: true,
    compact: true,
    initialValue: true,
    props: { children: '可清除' }
  },
  {
    name: 'props.use12Hours',
    type: 'OperateCheckbox',
    inline: true,
    compact: true,
    props: { children: '12小时制' }
  }
];

const rulesSetting = [
  {
    name: 'rules',
    type: 'RulesGroup',
    compact: true,
    props: {
      includes: ['required'],
    }
  },
];

const setting = {
  '基础属性': baseSetting,
  '操作属性': operationSetting,
  '校验规则': rulesSetting,
};

export default setting;
