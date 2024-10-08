import classnames from 'classnames';
import React, { useEffect, useState } from 'react';
import { Button } from 'antd';
import { saveAsFile, convertToString, copyToClipboard } from '../utils';
import js_beautify from 'js-beautify';
import { EditorCodeMirror, ModalWrapper, ModalWrapperProps } from '../common/index';
import './exportJson.less';
import renderModal from '../utils/renderModal';

export interface ExportJsonModalProps extends ModalWrapperProps {
  data?: object;
  title: string;
}

export const ExportJsonModal = React.forwardRef<HTMLDivElement, ExportJsonModalProps>((props, ref) => {

  const {
    children,
    className,
    open,
    onClose,
    data,
    title,
    ...rest
  } = props;

  const [modalOpen, setModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setModalOpen(open);
  }, [open]);

  const closeModal = () => {
    setModalOpen(false);
    onClose && onClose();
  };

  const copyJs = (e) => {
    const codeStr = convertToString(data);
    const formatStr = codeStr && js_beautify(codeStr, {
      indent_size: 2
    });
    copyToClipboard(formatStr, e);
  };

  const copyJson = (e) => {
    const codeStr = JSON.stringify(data);
    const formatStr = codeStr && js_beautify(codeStr, {
      indent_size: 2
    });
    copyToClipboard(formatStr, e);
  };

  const downloadJS = () => {
    const str = JSON.stringify(data);
    const formatStr = str && js_beautify(str, {
      indent_size: 2
    });
    const fileId = new Date().toLocaleTimeString();
    saveAsFile(formatStr, `formData_${fileId}.json`);
  };

  const prefixCls = 'export-json-modal';
  const cls = classnames(prefixCls, className);

  return (
    <ModalWrapper
      ref={ref}
      open={modalOpen}
      onClose={closeModal}
      classNames={{ modal: cls }}
      {...rest}>
      <div className={`${prefixCls}-title`}>{title}</div>
      <div className={`${prefixCls}-body`}>
        <EditorCodeMirror
          className={`${prefixCls}-content`}
          value={JSON.stringify(data)}
          readOnly
        />
      </div>
      <div className={`${prefixCls}-footer`}>
        <Button type='default' onClick={copyJs}>复制JS对象</Button>
        <Button type='default' onClick={copyJson}>复制JSON</Button>
        <Button type='primary' onClick={downloadJS}>导出文件</Button>
        <Button type='default' onClick={closeModal}>关闭</Button>
      </div>
    </ModalWrapper>
  );
});

// 展示弹窗
export const showExportJsonModal = (props: Partial<ExportJsonModalProps>) => {
  const Props = {
    open: true,
    ...props,
  };
  return renderModal(ExportJsonModal, { ...Props });
};
