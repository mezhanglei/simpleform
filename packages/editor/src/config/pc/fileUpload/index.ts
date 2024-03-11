import Setting from './setting';
import FieldSetting from '../../fieldSetting';

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
