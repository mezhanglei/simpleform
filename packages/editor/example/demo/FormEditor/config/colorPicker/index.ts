import { FieldSetting } from '../../../FormRender';
import Setting from './setting';

export default {
  panel: {
    icon: 'color-field',
    label: '颜色选择器',
  },
  label: '颜色选择器',
  type: 'ColorPicker',
  props: {
    style: { width: '100%' }
  },
  setting: { ...Setting, ...FieldSetting },
};
