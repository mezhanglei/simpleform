const baseSetting = [
  {
    label: '栅格间隔',
    name: 'props.gutter',
    type: 'InputNumber',
    valueGetter: "{{((val) => val || 0)}}"
  },
  {
    label: "水平排列",
    name: 'props.justify',
    type: "Select",
    initialValue: 'start',
    props: {
      style: { width: '100%' },
      options: [
        { label: '从头开始', value: 'start' },
        { label: '从尾部开始', value: 'end' },
        { label: '居中排列', value: 'center' },
        { label: '均匀分布(中间间隔相等)', value: 'space-around' },
        { label: '居中均匀分布', value: 'space-between' },
        { label: '均匀分布(每个间隔相等)', value: 'space-evenly' },
      ]
    }
  },
  {
    label: "垂直对齐",
    name: 'props.align',
    type: "Select",
    initialValue: 'top',
    props: {
      style: { width: '100%' },
      options: [
        { label: '顶部对齐', value: 'top' },
        { label: '居中', value: 'middle' },
        { label: '底部对齐', value: 'bottom' },
      ]
    }
  }
];

const setting = {
  '基础属性': baseSetting,
};

export default setting;
