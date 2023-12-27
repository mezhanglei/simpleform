import classnames from 'classnames';
import React, { useEffect, useState } from 'react';
import { Button, Col, Row } from 'antd';
import './importModal.less';
import ModalWrapper, { ModalWrapperProps } from '../components/common/GlobalModal/modalWrapper';
import { create } from '../components/common/GlobalModal/createPromise';
import { FormDesignData } from '../components/formrender';

export interface TemplateItem {
  img: string;
  name: string;
  data: FormDesignData;
};
export interface ImportModalProps extends ModalWrapperProps {
  data?: Array<TemplateItem>
  onSelect?: (item?: TemplateItem) => void;
}

export const ImportModal = React.forwardRef<HTMLDivElement, ImportModalProps>((props, ref) => {

  const {
    children,
    className,
    open,
    onClose,
    data = [],
    onSelect,
    ...rest
  } = props;

  const [modalOpen, setModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setModalOpen(open);
  }, [open]);

  const closeModal = () => {
    setModalOpen(false);
  };

  const prefixCls = 'import-modal';
  const cls = classnames(prefixCls, className);

  const load = (item?: TemplateItem) => {
    onSelect && onSelect(item);
    setModalOpen(false);
  };

  return (
    <ModalWrapper
      ref={ref}
      open={modalOpen}
      onClose={closeModal}
      classNames={{ modal: cls }}
      {...rest}>
      <div className={`${prefixCls}-title`}>导入模板</div>
      <Row className={`${prefixCls}-body`} gutter={16}>
        {
          data?.map((item) => (
            <Col className={`${prefixCls}-col`} span={6}>
              <div className={`${prefixCls}-col-img`}>
                <img src={item?.img} />
              </div>
              <div className={`${prefixCls}-col-name`}>
                {item?.name}
              </div>
              <div className={`${prefixCls}-col-cover`}>
                <Button type='primary' onClick={() => load(item)}>加载模板</Button>
              </div>
            </Col>
          ))
        }
      </Row>
    </ModalWrapper>
  );
});

// 展示弹窗
export const showImportModal = (props?: Partial<ImportModalProps>) => {
  const Props = {
    open: true,
    ...props,
  };
  return create(ImportModal, { ...Props });
};
