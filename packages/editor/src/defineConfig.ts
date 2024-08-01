import widgets from './components';
import dayjs from 'dayjs';

// 渲染引擎配置项
export default {
  // 组件内的变量
  variables: {
    dayjs
  },
  // 注册组件
  registeredComponents: widgets,
  // 节点属性默认配置
  options: {
    props: { autoComplete: 'off' }
  }
};
