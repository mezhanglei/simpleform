import { Col, Select, Input, Row } from "antd";
import React, { useEffect } from "react";
import './index.less';
import { useTableData } from "../../../utils/hooks";
import SvgIcon from "../SvgIcon";
import DefaultFormRender, { CustomFormNodeProps, EditorSelection, FieldChangedParams } from "../../formrender";
import { codeToRule, ruleToCodeStr } from "./utils";
import CustomModal, { CustomModalProps } from "../AntdModal";

// 集合类型
export type AssembleType = '&&' | '||'
// 规则条件的渲染数据类型
export type RuleSettingItem = {
  assemble?: AssembleType;
  code?: string;
  value?: unknown;
}
export interface SettingModalProps extends CustomModalProps, EditorSelection {
  value?: string;
  onChange?: (codeStr?: string) => void;
  setting?: CustomFormNodeProps;
}

const prefixCls = 'dynamic-rules';
const classes = {
  cls: `${prefixCls}`,
  item: `${prefixCls}-item`,
  row: `${prefixCls}-item-row`,
  assemble: `${prefixCls}-item-assemble`,
  itemPrefix: `${prefixCls}-item-prefix`,
  itemSuffix: `${prefixCls}-item-suffix`,
  icon: `${prefixCls}-item-icon`,
};

const assembleOptions = [{
  label: '或',
  value: '||'
}];

/**
 * 联动规则设置
 */
const SettingModal = React.forwardRef<HTMLElement, SettingModalProps>((props, ref) => {

  const {
    value,
    onChange,
    setting,
    title,
    displayElement,
    field,
    ...rest
  } = props;

  const initialValue: RuleSettingItem[] = [{}];

  const {
    dataSource,
    setDataSource,
    addItem,
    updateItem,
    deleteItem
  } = useTableData<RuleSettingItem>(initialValue);

  const context = field?.context;
  const FormRender = context?.state?.FormRender || DefaultFormRender;

  useEffect(() => {
    const currentValue = typeof value === 'string' ? value : undefined;
    const ruleData = codeToRule(currentValue);
    setDataSource(ruleData.length ? ruleData : initialValue);
  }, [value]);

  const handleOk = (closeModal: () => void) => {
    closeModal();
    const codeStr = ruleToCodeStr(dataSource);
    onChange && onChange(codeStr);
  };

  const assembleChange = (val: any, rowIndex: number) => {
    updateItem(val, rowIndex, "assemble");
  };

  const codeChange = (val: any, rowIndex: number) => {
    updateItem(val, rowIndex, "code");
  };

  const valueChange = ({ value }: FieldChangedParams, index: number) => {
    updateItem(value, index, "value");
  };

  const addNewItem = () => {
    addItem([{ assemble: '||' }]);
  };

  const renderItem = (item: RuleSettingItem, index: number) => {
    const { assemble, code, value } = item || {};
    return (
      <div key={index} className={classes.item}>
        {
          assemble ?
            <Select className={classes.assemble} value={assemble} options={assembleOptions} onChange={(val) => assembleChange(val, index)} />
            : null
        }
        <Row gutter={8} className={classes.row} align="middle">
          <Col span={1}>
            <span className={classes.itemPrefix}>当</span>
          </Col>
          <Col span={8}>
            <Input.TextArea placeholder="formvalues['表单字段'] == 值" value={code} onChange={(e) => codeChange(e?.target?.value, index)} />
          </Col>
          <Col span={5}>
            <span className={classes.itemSuffix}>时，设置为</span>
          </Col>
          <Col flex={1} style={{ width: '0' }}>
            <FormRender
              tagName="div"
              initialValues={{ controlValue: value }}
              properties={{ controlValue: { compact: true, ...(setting || {}) } }}
              onFieldsChange={(params: any) => valueChange(params, index)}
            />
          </Col>
          <Col span={2}>
            {
              index === 0 ?
                <SvgIcon name="add" className={classes.icon} onClick={addNewItem} />
                :
                <SvgIcon name="delete" className={classes.icon} onClick={() => deleteItem(index)} />
            }
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <CustomModal onOk={handleOk} className={classes.cls} title={title} displayElement={displayElement}>
      {
        dataSource instanceof Array && dataSource?.map((item, index) => renderItem(item, index))
      }
    </CustomModal>
  );
});

export default SettingModal;
