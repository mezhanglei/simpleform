import Setting from './setting';
import FieldSetting from '../fieldSetting';

export default {
  panel: {
    icon: 'cascader-field',
    label: '级联选择器',
  },
  label: '级联选择器',
  type: 'Cascader',
  props: {
    style: { width: '100%' },
    options: [
      {
        value: 'zhejiang',
        label: 'Zhejiang',
        children: [
          {
            value: 'hangzhou',
            label: 'Hangzhou',
            children: [
              {
                value: 'xihu',
                label: 'West Lake',
              },
            ],
          },
        ],
      },
      {
        value: 'jiangsu',
        label: 'Jiangsu',
        children: [
          {
            value: 'nanjing',
            label: 'Nanjing',
            children: [
              {
                value: 'zhonghuamen',
                label: 'Zhong Hua Men',
              },
            ],
          },
        ],
      },
    ]
  },
  setting: { ...Setting, ...FieldSetting },
};
