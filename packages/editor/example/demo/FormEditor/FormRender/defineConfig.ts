import widgets from '../components';
import dayjs from 'dayjs';
import { createRequest } from '@simpleform/editor';

// TODO axios请求配置
const axiosConfig = {

};

// 渲染引擎配置项
export default {
  // 组件内的变量
  variables: {
    dayjs,
    request: createRequest(axiosConfig)
  },
  // 注册组件
  components: widgets,
  // 节点属性默认配置
  options: {
    props: { autoComplete: 'off' }
  }
};
