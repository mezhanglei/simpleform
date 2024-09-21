import classnames from 'classnames';
import React, { useEffect, useState } from 'react';
import BaseModal, { BaseModalProps } from './baseModal';

export interface ModalWrapperProps extends BaseModalProps {
  onOk?: (val?: unknown) => void;
  onCancel?: (val?: unknown) => void;
  className?: string;
}

// 弹窗容器
const ModalWrapper = React.forwardRef<HTMLDivElement, ModalWrapperProps>((props, ref) => {

  const {
    children,
    className,
    classNames,
    onClose,
    open,
    showCloseIcon = false,
    onOk,
    onCancel,
    ...rest
  } = props;

  const [modalOpen, setModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setModalOpen(open);
  }, [open]);

  const handleOk = () => {
    closeModal();
    onOk?.();
  };

  const handleCancel = () => {
    closeModal();
    onCancel?.();
  };

  const closeModal = () => {
    setModalOpen(false);
    onClose && onClose();
  };

  const cls = classnames('modal-wrapper', className);

  return (
    <BaseModal
      ref={ref}
      open={modalOpen}
      showCloseIcon={showCloseIcon}
      onClose={handleCancel}
      classNames={{ modal: cls, ...classNames }}
      {...rest}>
      {
        React.isValidElement(children) ? React.cloneElement(children, {
          onConfirm: handleOk,
          onCancel: handleCancel,
        } as React.Attributes)
          : children
      }
    </BaseModal>
  );
});

export default ModalWrapper;
