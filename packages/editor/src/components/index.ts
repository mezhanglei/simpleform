import pcWidgets from './pc';
import groupWidgets from './group';
import commonWidgets from './common';

// 注册组件
const widgets: any = {
  ...pcWidgets,
  ...groupWidgets,
  ...commonWidgets
};

export default widgets;
