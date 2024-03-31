import React, { useEffect, useState } from 'react';
import { Button, Flex, Tag, Modal, ModalProps } from 'antd';
import './index.less';
import { CustomOptions, FormDesignData } from '../../FormRender';
import templates from './data';

export interface TemplateItem {
  img: string;
  name: string;
  data: FormDesignData;
};
export interface ImportModalProps extends Partial<ModalProps> {
  data?: Array<TemplateItem>
  onSelect?: (item?: TemplateItem) => void;
  context?: CustomOptions['context'];
}

const ImportModal: React.FC<ImportModalProps> = (props) => {

  const {
    open,
    context,
    data = templates,
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

  const load = (item?: TemplateItem) => {
    context?.dispatch((old) => ({ ...old, widgetList: item?.data }));
    onSelect && onSelect(item);
    setModalOpen(false);
  };

  const showModal = () => {
    setModalOpen(true);
  };

  return (
    <>
      <Button type='link' onClick={showModal}>导入模板</Button>
      <Modal
        open={modalOpen}
        onCancel={closeModal}
        footer={null}
        {...rest}>
        <div className={`${prefixCls}-title`}>导入模板</div>
        <Flex gap="4px 0" wrap="wrap" className={`${prefixCls}-body`}>
          {
            data?.map((item, index) => (
              <Tag key={index} style={{ cursor: 'pointer' }} bordered={false} color="processing" onClick={() => load(item)}>模板1</Tag>
            ))
          }
        </Flex>
      </Modal>
    </>

  );
};

export default ImportModal;
