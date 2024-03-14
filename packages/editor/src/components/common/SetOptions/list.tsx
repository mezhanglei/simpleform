import { isEmpty } from "../../../utils/type";
import { Button, Col, Input, message, Row } from "antd";
import React, { ChangeEvent, useEffect } from "react";
import './list.less';
import SvgIcon from "../SvgIcon";
import { useTableData } from "../../../utils/hooks";
import { CommonWidgetProps } from "../../formrender";

interface OptionItem { label?: string, value?: string }
export interface OptionListProps extends CommonWidgetProps<Array<OptionItem>> {
}

const prefixCls = 'options-list';
const classes = {
  item: `${prefixCls}-item`
};

/**
 * 列表
 */
const OptionList = React.forwardRef<HTMLElement, OptionListProps>((props, ref) => {

  const {
    value,
    onChange,
    ...rest
  } = props;

  const intialValue = [{ label: '', value: '' }];
  const {
    dataSource,
    setDataSource,
    addItem,
    updateItem,
    deleteItem
  } = useTableData<OptionItem>(value || intialValue, onChange);

  useEffect(() => {
    setDataSource(value || []);
  }, [value]);

  const labelChange = (e: ChangeEvent<HTMLInputElement>, rowIndex: number) => {
    const val = e?.target?.value;
    updateItem(val, rowIndex, 'label');
  };

  const valueChange = (e: ChangeEvent<HTMLInputElement>, rowIndex: number) => {
    const val = e?.target?.value;
    updateItem(val, rowIndex, 'value');
  };

  const addNewItem = () => {
    const isHaveEmpty = dataSource?.find((item) => isEmpty(item?.label) || isEmpty(item?.value));
    if (isHaveEmpty) {
      message.info('请填写完整');
      return;
    }
    addItem(intialValue);
  };

  const renderItem = (item: OptionItem, index: number) => {
    return (
      <Row key={index} className={classes.item} gutter={12} align="middle">
        <Col span={10}>
          <Input value={item?.label} onChange={(e) => labelChange(e, index)} placeholder="label" style={{ width: '100%' }} />
        </Col>
        <Col span={10}>
          <Input value={item?.value} onChange={(e) => valueChange(e, index)} placeholder="value" style={{ width: '100%' }} />
        </Col>
        <Col span={4}>
          <SvgIcon name="delete" className="icon-delete" onClick={() => deleteItem(index)} />
        </Col>
      </Row>
    );
  };

  return (
    <div>
      {
        dataSource instanceof Array && dataSource?.map((item, index) => {
          return renderItem(item, index);
        })
      }
      <Button type="link" onClick={addNewItem}>
        添加选项
      </Button>
    </div>
  );
});

export default OptionList;
