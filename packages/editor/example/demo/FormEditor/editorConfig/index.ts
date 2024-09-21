import Input from './Input';
import RadioGroup from './RadioGroup';
import CheckboxGroup from './CheckboxGroup';
import Select from './Select';
import Switch from './Switch';
import TimePicker from './TimePicker';
import TimePickerRangePicker from './TimePickerRangePicker';
import DatePicker from './DatePicker';
import DatePickerRangePicker from './DatePickerRangePicker';
import Slider from './Slider';
import Rate from './Rate';
import Cascader from './Cascader';
import Alert from './Alert';
import FieldSetting from './fieldSetting';
import ComponentsConfig from '../components/config';

// 编辑器组件的配置项
export default {
  Alert,
  Input,
  "Radio.Group": RadioGroup,
  "Checkbox.Group": CheckboxGroup,
  Select,
  Switch,
  TimePicker,
  "TimePicker.RangePicker": TimePickerRangePicker,
  DatePicker,
  "DatePicker.RangePicker": DatePickerRangePicker,
  Slider,
  Rate,
  Cascader,
  ...ComponentsConfig
};

export { FieldSetting };
