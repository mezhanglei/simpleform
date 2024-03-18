const baseSetting = [
  {
    label: '字段名',
    name: 'name',
    type: 'Input'
  },
  {
    label: '默认值',
    name: 'initialValue',
    type: 'DatePicker',
    valueSetter: "{{(value)=> (typeof value === 'string' ? dayjs(value) : undefined)}}",
    valueGetter: "{{(value) => (dayjs.isDayjs(value) ? value.format(formvalues.props && formvalues.props.format || 'YYYY-MM-DD') : undefined)}}",
    props: {
      picker: "{{formvalues.props && formvalues.props.picker}}",
      format: "{{formvalues.props && formvalues.props.format}}",
    }
  },
  {
    label: '占位字符',
    name: 'props.placeholder',
    type: 'Input',
    initialValue: '请输入'
  },
  {
    label: "选择器类型",
    name: 'props.picker',
    type: "Select",
    initialValue: 'date',
    props: {
      style: { width: '100%' },
      options: [
        { label: '日', value: 'date' },
        { label: '周', value: 'week' },
        { label: '月', value: 'month' },
        { label: '季度', value: 'quarter' },
        { label: '年', value: 'year' },
      ]
    }
  },
  {
    label: "显示格式",
    name: 'props.format',
    type: "Select",
    initialValue: 'YYYY-MM-DD',
    props: {
      style: { width: '100%' },
      options: [
        { label: '年月日', value: 'YYYY-MM-DD' },
        { label: '年月', value: 'YYYY-MM' },
        { label: '月日', value: 'MM-DD' },
        { label: '年', value: 'YYYY' },
        { label: '月', value: 'MM' },
        { label: '日', value: 'DD' },
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
    props: { children: '可清除' }
  }
];

const rulesSetting = [
  {
    name: 'rules',
    type: 'RulesGroup',
    compact: true,
    props: {
      includes: ['required']
    }
  },
];

const setting = {
  '基础属性': baseSetting,
  '操作属性': operationSetting,
  '校验规则': rulesSetting,
};

export default setting;
