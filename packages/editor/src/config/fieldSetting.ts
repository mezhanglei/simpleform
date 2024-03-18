// 默认的表单域显示组件的属性
const baseSetting = [
  {
    label: '标签名称',
    name: 'label',
    type: 'Input'
  },
  {
    label: "标签布局",
    name: 'layout',
    type: "Radio.Group",
    initialValue: "horizontal",
    props: {
      style: { width: '100%' },
      options: [
        { key: 'horizontal', value: "horizontal", label: "水平" },
        { key: 'vertical', value: "vertical", label: "垂直" },
      ]
    }
  },
  {
    label: '标签水平排列',
    name: 'labelAlign',
    type: "Select",
    initialValue: 'right',
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
  {
    label: '标签间距',
    name: 'gutter',
    type: 'InputNumber',
    props: {
      min: 0,
      max: 300
    }
  },
  {
    label: '标签宽度',
    name: 'labelWidth',
    type: 'InputNumber',
    initialValue: 120,
    props: {
      min: 0,
      max: 300
    }
  },
  {
    label: '后缀',
    name: 'suffix',
    type: 'Input'
  },
  {
    label: '描述',
    name: 'footer',
    type: 'Input'
  },
  {
    label: '携带冒号',
    name: 'colon',
    type: 'Switch',
    valueProp: 'checked',
    initialValue: false,
  }
];

const setting = {
  '公共属性': baseSetting
};

export default setting;
