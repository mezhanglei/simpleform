
import pcConfigs from './pc';

// 注册编辑器的组件及组件属性
export default {
  // 注册组件
  widgets: {
    ...pcConfigs.widgets
  },
  // 注册组件的属性
  settings: {
    ...pcConfigs.settings
  }
};
