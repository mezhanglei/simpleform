import Input from './input';
import RadioGroup from './radioGroup';
import CheckboxGroup from './checkboxGroup';
import Select from './select';
import Switch from './switch';
import TimePicker from './timePicker';
import TimePickerRangePicker from './timePickerRangePicker';
import DatePicker from './datePicker';
import DatePickerRangePicker from './datePickerRangePicker';
import Slider from './slider';
import Rate from './rate';
import ColorPicker from './colorPicker';
import FileUpload from './fileUpload';
import ImageUpload from './imageUpload';
import Cascader from './cascader';
import RichEditor from "./richEditor";
import RichText from "./richText";
// 布局组件
// import tableLayout from './layout/table';
import Grid from './grid';
import GridRow from './grid/row';
import GridCol from './grid/col';
import Divider from './divider';
import Alert from './alert';
// 组合组件
import FormTable from "./formTable";

export default {
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
  "RichText": RichText,
  "RichEditor": RichEditor,
  "GridRow": GridRow,
  "GridCol": GridCol,
};
