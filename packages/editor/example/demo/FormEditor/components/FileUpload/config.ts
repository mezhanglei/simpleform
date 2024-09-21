import FieldSetting from '../../editorConfig/fieldSetting';
import Setting from './setting';

export default {
  panel: {
    icon: 'file-upload-field',
    label: '文件上传',
  },
  label: '文件上传',
  type: 'FileUpload',
  props: {
    uploadCallback: "{{(data) => ({ fileId: data.fileId })}}"
  },
  setting: { ...Setting, ...FieldSetting },
};
