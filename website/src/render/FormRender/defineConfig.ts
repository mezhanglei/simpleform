import {
  Input,
  InputNumber,
  Checkbox,
  DatePicker,
  Mentions,
  Radio,
  Rate,
  Select,
  Slider,
  Switch,
  TimePicker,
  TreeSelect,
} from 'antd';
import dayjs from 'dayjs';
import { CustomFormRenderProps } from '@simpleform/editor';

// 渲染引擎配置项
const defineConfig = {
  // 组件内的变量
  variables: {
    dayjs
  },
  // 注册组件
  components: {
    "Input": Input,
    "Input.TextArea": Input.TextArea,
    "Input.Password": Input.Password,
    "Input.Search": Input.Search,
    "InputNumber": InputNumber,
    "Checkbox": Checkbox,
    'Checkbox.Group': Checkbox.Group,
    "DatePicker": DatePicker,
    "DatePicker.RangePicker": DatePicker.RangePicker,
    "Mentions": Mentions,
    "Mentions.Option": Mentions.Option,
    "Radio": Radio,
    "Radio.Group": Radio.Group,
    "Radio.Button": Radio.Button,
    "Rate": Rate,
    "Select": Select,
    "Select.Option": Select.Option,
    "TreeSelect": TreeSelect,
    "Slider": Slider,
    "Switch": Switch,
    "TimePicker": TimePicker,
    "TimePicker.RangePicker": TimePicker.RangePicker
  },
  // 节点属性默认配置
  options: {
    props: { autoComplete: 'off' }
  }
} as CustomFormRenderProps;

export default defineConfig;
