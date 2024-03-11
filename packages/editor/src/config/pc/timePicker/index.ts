import Setting from './setting';
import FieldSetting from '../../fieldSetting';

export default {
  panel: {
    icon: 'time-field',
    label: '时间选择器',
  },
  label: '时间选择器',
  type: 'TimePicker',
  valueSetter: "{{(value) => typeof value === 'string' ? dayjs(value, 'HH:mm:ss') : undefined}}",
  valueGetter: "{{(value) => dayjs.isDayjs(value) ? value.format(formvalues.props && formvalues.props.format || 'HH:mm:ss') : undefined}}",
  props: {
    style: { maxWidth: '300px', width: '100%' },
  },
  setting: { ...Setting, ...FieldSetting },
};
