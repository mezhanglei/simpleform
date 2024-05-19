import pcWidgets from './pc';
import commonWidgets from './common';
import { CustomFormRenderProps } from '../formrender';

// 注册组件
const widgets: CustomFormRenderProps['components'] = {
  ...pcWidgets,
  ...commonWidgets
};

export default widgets;
