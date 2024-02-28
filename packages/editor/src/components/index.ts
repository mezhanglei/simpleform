import pcWidgets from './pc';
import commonWidgets from './common';

// 注册组件
const widgets: any = {
  ...pcWidgets,
  ...commonWidgets
};

export default widgets;
