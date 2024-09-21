import Setting from './setting';
import FieldSetting from '../../editorConfig/fieldSetting';

export default {
  panel: {
    icon: 'picture-upload-field',
    label: '图片上传',
  },
  label: '图片上传',
  type: 'ImageUpload',
  props: {
    uploadCallback: "{{(data) => ({ fileId: data.fileId })}}"
  },
  setting: { ...Setting, ...FieldSetting },
};
