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
  Cascader,
  Alert,
  Divider,
} from 'antd';
import bindRequest from '../bind-request';
import FileUpload from './FileUpload';
import ImageUpload from './ImageUpload';

// ant-design UI组件
const widgets: any = {
  // ui库组件
  "Input": Input, // 输入控件
  "Input.TextArea": Input.TextArea, // 输入文本域
  "Input.Password": Input.Password, // 输入密码组件
  "Input.Search": Input.Search, // 输入搜索组件
  "InputNumber": InputNumber, // 数字输入控件
  "Mentions": Mentions, // 携带@提示的输入控件
  "Mentions.Option": Mentions.Option, // 提示控件的option
  "Checkbox": Checkbox, // 多选组件
  'Checkbox.Group': bindRequest(Checkbox.Group), // 多选列表组件
  "Radio": Radio, // 单选组件
  "Radio.Group": bindRequest(Radio.Group), // 单选列表组件
  "Radio.Button": Radio.Button, // 单选按钮组件
  "DatePicker": DatePicker, // 日期控件
  "DatePicker.RangePicker": DatePicker.RangePicker, // 日期范围控件
  "Rate": Rate, // 星星评分控件
  "Select": bindRequest(Select), // 选择控件
  "Select.Option": Select.Option, // 选择的选项
  "Slider": Slider, // 滑动输入项
  "Switch": Switch, // 切换组件
  "TimePicker": TimePicker, // 时分秒控件
  "TimePicker.RangePicker": TimePicker.RangePicker, // 时分秒范围控件
  "Cascader": bindRequest(Cascader),
  "Alert": Alert, // 提示组件
  "Divider": Divider, // 分割线组件
  // 自定义组件
  "FileUpload": FileUpload, // 文件上传
  "ImageUpload": ImageUpload, // 图片上传
};
export default widgets;
