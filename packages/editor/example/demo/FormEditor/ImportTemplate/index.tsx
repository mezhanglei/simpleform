import classnames from 'classnames';
import React, { useEffect, useState } from 'react';
import { Button, Flex, Tag } from 'antd';
import './index.less';
import { CustomOptions, FormDesignData } from '../../FormRender';
import ModalWrapper, { ModalWrapperProps } from '../../../../src/components/common/GlobalModal/modalWrapper';
import demo from './demo';

export interface TemplateItem {
  img: string;
  name: string;
  data: FormDesignData;
};
export interface ImportModalProps extends Partial<ModalWrapperProps> {
  data?: Array<TemplateItem>
  onSelect?: (item?: TemplateItem) => void;
  context?: CustomOptions['context'];
}

// 模板列表
const templateList = [{
  name: 'demo',
  data: demo,
}];

const ImportModal: React.FC<ImportModalProps> = (props) => {

  const {
    children,
    className,
    open,
    context,
    onClose,
    data = templateList,
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
    context.dispatch((old) => ({ ...old, widgetList: item?.data }));
    onSelect && onSelect(item);
    setModalOpen(false);
  };

  const showModal = () => {
    setModalOpen(true);
  };

  return (
    <>
      <Button type='link' onClick={showModal}>导入模板</Button>
      <ModalWrapper
        open={modalOpen}
        onClose={closeModal}
        classNames={{ modal: cls }}
        {...rest}>
        <div className={`${prefixCls}-title`}>导入模板</div>
        <Flex gap="4px 0" wrap="wrap" className={`${prefixCls}-body`}>
          {
            data?.map((item, index) => (
              <Tag key={index} style={{ cursor: 'pointer' }} bordered={false} color="processing" onClick={() => load(item)}>模板1</Tag>
            ))
          }
        </Flex>
      </ModalWrapper>
    </>

  );
};

export default ImportModal;
