import { message, Modal, Upload, UploadProps } from 'antd';
import { RcFile } from 'antd/lib/upload';
import React, { useEffect, useState } from 'react';
import { UploadFile } from 'antd/lib/upload/interface';
import { getBase64 } from './util';
import { CommonFormProps, objectToFormData, IMAGE_MIME_KEYS, isImageFile } from '@simpleform/editor';
import { AxiosInstance } from 'axios';

// 扩展后的文件类型
export type FileItem = UploadFile & RcFile;
export interface ImageUploadProps extends Omit<UploadProps, 'onChange'>, CommonFormProps<Array<FileItem>> {
  formdataKey: string; // FormData的key
  maxSize?: number; // 每张图片的限制上传大小
  uploadCallback?: (data: unknown) => Record<string, unknown>; // 上传请求函数回调
}
const ImageUpload = React.forwardRef<unknown, ImageUploadProps>((props, ref) => {

  const {
    maxSize = 5,
    // 组件原生props
    value,
    onChange,
    action,
    headers,
    data, // 额外参数
    accept = 'image/gif,image/jpeg,image/jpg,image/png,image/webp,image/bmp',
    listType = 'picture-card',
    maxCount = 5,
    multiple = true,
    children,
    formdataKey = 'file',
    _options,
    uploadCallback,
    ...rest
  } = props;

  const [fileList, setFileList] = useState<Array<FileItem>>([]);
  const [imageVisible, setImageVisible] = useState<boolean>();
  const [imageTitle, setImageTitle] = useState<string>();
  const [imageSrc, setImageSrc] = useState<string>();
  const [loading, setLoading] = useState<boolean>();
  const formrender = _options?.formrender;
  const defineConfig = formrender?.config;
  const request = defineConfig?.variables?.request as AxiosInstance;

  useEffect(() => {
    setFileList(JSON.parse(JSON.stringify(value || [])));
  }, [value]);

  const checkFile = (file: RcFile) => {
    const fileSize = file.size / 1024 / 1024;
    if (fileSize > maxSize) {
      message.error(`附件大小应小于${maxSize}M`);
      return Upload.LIST_IGNORE;
    }
    if (fileSize === 0) {
      message.error(`文件不能为空`);
      return Upload.LIST_IGNORE;
    }
    const isDoc = isImageFile(file);
    if (!isDoc) {
      message.error(`请上传正确的图片格式: ${IMAGE_MIME_KEYS?.join('，')}`);
      return Upload.LIST_IGNORE;
    }
  };

  // 远程上传
  const UploadProps: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file as RcFile);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
      return rest?.onRemove && rest?.onRemove(file);
    },
    beforeUpload: async (data) => {
      const file = data as RcFile;
      if (checkFile(file) == Upload.LIST_IGNORE) {
        return Upload.LIST_IGNORE;
      }
    },
    customRequest: async (option) => {
      const file = option?.file as RcFile;
      if (!file || typeof action !== 'string') return;
      const cloneData = [...fileList];
      const insertIndex = cloneData?.length;
      const formdata = objectToFormData(data);
      formdata.append(formdataKey, file);
      setLoading(true);
      request?.(action, {
        method: 'post',
        data: formdata,
        headers: headers,
        onUploadProgress: (event) => {
          const complete = event?.total && (event.loaded / event?.total * 100 | 0);
          cloneData[insertIndex] = { ...file, percent: complete };
          setFileList(cloneData);
        }
      }).then((res) => {
        const data = res.data;
        const params = typeof uploadCallback === 'function' ? uploadCallback(data) : {};
        cloneData[insertIndex] = { ...file, status: 'success' as FileItem['status'], ...params };
        if (!cloneData[insertIndex].url) {
          getBase64(file).then((url) => {
            cloneData[insertIndex].thumbUrl = url;
          }).finally(() => {
            onChange && onChange(cloneData);
            setFileList(cloneData);
          });
        } else {
          onChange && onChange(cloneData);
          setFileList(cloneData);
        }
      }).catch(() => {
        cloneData[insertIndex] = { ...file, status: 'error' };
        setFileList(cloneData);
        message.error(`${file.name}上传失败`);
      }).finally(() => {
        setLoading(false);
      });
    }
  };

  const handlePreview = async (data: UploadFile) => {
    const file = data as FileItem;
    if (!file.url && !file.preview) {
      const fileChoose = file.originFileObj || file; // 源文件或当前的文件
      file.preview = await getBase64(fileChoose);
    }
    setImageSrc(file.url || file.preview);
    setImageVisible(true);
    const filename = getFileName(file);
    setImageTitle(filename);
  };

  const handleCancel = () => {
    setImageVisible(false);
  };

  // 获取文件名
  const getFileName = (file?: FileItem) => {
    const defaultFileName = file?.url && (file.url.substring(file.url.lastIndexOf('/') + 1));
    return file?.name || defaultFileName;
  };

  const uploadButton = children || (
    <div>
      <div style={{ marginTop: 8 }}>上传图片</div>
    </div>
  );

  return (
    <>
      <Upload
        ref={ref}
        multiple={multiple}
        fileList={fileList instanceof Array ? fileList : []}
        accept={accept}
        listType={listType}
        onPreview={handlePreview}
        maxCount={maxCount}
        {...UploadProps}
        {...rest}
      >
        {fileList?.length >= maxCount ? null : uploadButton}
      </Upload>
      <Modal
        visible={imageVisible}
        title={imageTitle}
        footer={null}
        onCancel={handleCancel}
      >
        <img alt="example" style={{ width: '100%' }} src={imageSrc} />
      </Modal>
    </>
  );
});

export default ImageUpload;
