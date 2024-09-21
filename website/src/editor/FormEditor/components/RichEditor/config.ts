import Setting from './setting';
import FieldSetting from '../../editorConfig/fieldSetting';

export default {
  panel: {
    icon: 'rich-editor-field',
    label: '富文本编辑器',
  },
  label: '富文本编辑器',
  type: 'RichEditor',
  props: {
    style: { width: '100%' },
  },
  setting: { ...Setting, ...FieldSetting }
};
