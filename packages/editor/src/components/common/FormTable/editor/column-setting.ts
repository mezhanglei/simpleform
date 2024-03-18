const baseSetting = [
  {
    label: '字段名',
    name: 'dataIndex',
    type: 'Input'
  },
  {
    label: '标题',
    name: 'label',
    type: 'Input'
  },
  {
    label: '列宽',
    name: 'width',
    type: 'InputNumber',
    props: {
      min: 0,
      max: 300
    }
  },
  {
    label: '对齐方式',
    name: 'align',
    type: "Select",
    props: {
      style: { width: '100%' },
      allowClear: true,
      options: [
        { label: '左边对齐', value: 'left' },
        { label: '居中', value: 'center' },
        { label: '右边对齐', value: 'right' },
      ]
    }
  },
];

const setting = {
  '列属性': baseSetting,
};

export default setting;
