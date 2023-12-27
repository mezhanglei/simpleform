
import pcConfigs from './pc';
import groupsConfigs from './group';

// 编辑器配置
export default {
  // 注册组件
  widgets: {
    ...pcConfigs.widgets,
    ...groupsConfigs.widgets
  },
  // 注册组件的属性
  settings: {
    ...pcConfigs.settings,
    ...groupsConfigs.settings
  },
  // 组件面板配置
  panel: {
    '布局组件': ['Grid', 'Divider', 'Alert'],
    '控件组合': ['FormTable'],
    '基础控件': [
      "Input",
      "Radio.Group",
      "Checkbox.Group",
      "Select",
      "Switch",
      "TimePicker",
      "TimePicker.RangePicker",
      "DatePicker",
      "DatePicker.RangePicker",
      "Slider",
      "Rate",
      "ColorPicker",
      "Cascader",
      "FileUpload",
      "ImageUpload",
      "RichEditor",
      "RichText",
    ],
    '业务组件': ['example']
  },
};
