import Input from './input/widget';
import InputSetting from './input/setting';
import RadioGroup from './radioGroup/widget';
import RadioGroupSetting from './radioGroup/setting';
import CheckboxGroup from './checkboxGroup/widget';
import CheckboxGroupSetting from './checkboxGroup/setting';
import Select from './select/widget';
import SelectSetting from './select/setting';
import Switch from './switch/widget';
import SwitchSetting from './switch/setting';
import TimePicker from './timePicker/widget';
import TimePickerSetting from './timePicker/setting';
import TimePickerRangePicker from './timePickerRangePicker/widget';
import TimePickerRangePickerSetting from './timePickerRangePicker/setting';
import DatePicker from './datePicker/widget';
import DatePickerSetting from './datePicker/setting';
import DatePickerRangePicker from './datePickerRangePicker/widget';
import DatePickerRangePickerSetting from './datePickerRangePicker/setting';
import Slider from './slider/widget';
import SliderSetting from './slider/setting';
import Rate from './rate/widget';
import RateSetting from './rate/setting';
import ColorPicker from './colorPicker/widget';
import ColorPickerSetting from './colorPicker/setting';
import FileUpload from './fileUpload/widget';
import FileUploadSetting from './fileUpload/setting';
import ImageUpload from './imageUpload/widget';
import ImageUploadSetting from './imageUpload/setting';
import Cascader from './cascader/widget';
import CascaderSetting from './cascader/setting';
import RichEditor from "./richEditor/widget";
import RichText from "./richText/widget";
import RichTextSetting from "./richText/setting";
// 布局组件
// import tableLayout from './layout/table';
import Grid from './grid/widget';
import GridRowSetting from './grid/row-setting';
import GridColSetting from './grid/col-setting';
import Divider from './divider/widget';
import DividerSetting from './divider/setting';
import Alert from './alert/widget';
import AlertSetting from './alert/setting';
// 组合组件
import FormTable from "./formTable/widget";
import FormTableSetting from "./formTable/setting";
// 表单域的属性设置
import DefaultFieldSetting from '../fieldSetting';

export default {
  widgets: {
    // 布局组件
    // tableLayout,
    "Grid": Grid,
    "Divider": Divider,
    "Alert": Alert,
    // 控件组合
    "FormTable": FormTable,
    // 基础控件
    "Input": Input,
    "Radio.Group": RadioGroup,
    "Checkbox.Group": CheckboxGroup,
    "Select": Select,
    "Switch": Switch,
    "TimePicker": TimePicker,
    "TimePicker.RangePicker": TimePickerRangePicker,
    "DatePicker": DatePicker,
    "DatePicker.RangePicker": DatePickerRangePicker,
    "Slider": Slider,
    "Rate": Rate,
    "ColorPicker": ColorPicker,
    "Cascader": Cascader,
    "FileUpload": FileUpload,
    "ImageUpload": ImageUpload,
    "RichEditor": RichEditor,
    "RichText": RichText
  },
  settings: {
    "Input": { ...InputSetting, ...DefaultFieldSetting },
    "Input.TextArea": { ...InputSetting, ...DefaultFieldSetting },
    "InputNumber": { ...InputSetting, ...DefaultFieldSetting },
    "Input.Password": { ...InputSetting, ...DefaultFieldSetting },
    "Radio.Group": { ...RadioGroupSetting, ...DefaultFieldSetting },
    "Checkbox.Group": { ...CheckboxGroupSetting, ...DefaultFieldSetting },
    "Select": { ...SelectSetting, ...DefaultFieldSetting },
    "Switch": { ...SwitchSetting, ...DefaultFieldSetting },
    "TimePicker": { ...TimePickerSetting, ...DefaultFieldSetting },
    "TimePicker.RangePicker": { ...TimePickerRangePickerSetting, ...DefaultFieldSetting },
    "DatePicker": { ...DatePickerSetting, ...DefaultFieldSetting },
    "DatePicker.RangePicker": { ...DatePickerRangePickerSetting, ...DefaultFieldSetting },
    "Slider": { ...SliderSetting, ...DefaultFieldSetting },
    "Rate": { ...RateSetting, ...DefaultFieldSetting },
    "ColorPicker": { ...ColorPickerSetting, ...DefaultFieldSetting },
    "FileUpload": { ...FileUploadSetting, ...DefaultFieldSetting },
    "ImageUpload": { ...ImageUploadSetting, ...DefaultFieldSetting },
    "Cascader": { ...CascaderSetting, ...DefaultFieldSetting },
    "FormTable": { ...FormTableSetting, ...DefaultFieldSetting },
    "Divider": DividerSetting,
    "Alert": AlertSetting,
    "RichText": RichTextSetting,
    "RichEditor": DefaultFieldSetting,
    "GridRow": GridRowSetting,
    "GridCol": GridColSetting,
  }
};
