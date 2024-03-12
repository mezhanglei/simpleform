import Setting from './setting';
import FieldSetting from '../../fieldSetting';

export default {
  panel: {
    icon: 'checkbox-field',
    label: '多选框',
  },
  label: '多选框',
  type: 'Checkbox.Group',
  valueSetter: "{{(value)=> (value instanceof Array ? value : [])}}",
  props: {
    options: [{ label: '选项1', value: '1' }, { label: '选项2', value: '2' }]
  },
  setting: { ...Setting, ...FieldSetting },
};
