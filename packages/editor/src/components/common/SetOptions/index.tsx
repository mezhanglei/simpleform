import { Select } from "antd";
import React, { useMemo } from "react";
import OptionsList from './OptionsList';
import OptionsRequest from './OptionsRequest';
import './index.less';
import OptionsDynamicSetting from "./OptionsDynamic";
import { EditorCodeMirror } from "../CodeMirror";
import { getFormItem } from "../../../utils/utils";
import { joinFormPath, EditorSelection } from "../../formrender";

/**
 * 数据源的配置组件。
 */

export interface SetOptionsProps extends EditorSelection {
  value?: any;
  onChange?: (val: any) => void;
  includes?: string[]; // 当前可用模块
}

const prefixCls = 'option-source';
const classes = {
  type: `${prefixCls}-type`,
  component: `${prefixCls}-component`
};

const OptionsWidget = {
  list: { label: '选项数据', component: OptionsList },
  json: { label: '静态数据', component: EditorCodeMirror },
  request: { label: '接口请求', component: OptionsRequest },
  dynamic: { label: '联动设置', component: OptionsDynamicSetting },
};
type OptionsData = typeof OptionsWidget;
type OptionsKey = keyof OptionsData;
type OptionsKeyList = Array<OptionsKey>;
const OptionsKeys = Object.keys(OptionsWidget) as OptionsKeyList;

const SetOptions: React.FC<SetOptionsProps> = (props) => {

  const {
    includes = OptionsKeys,
    value,
    onChange,
    field,
    ...rest
  } = props;

  const context = field?.context;
  const { selected, editor } = context?.state || {};
  const buttons = useMemo(() => (OptionsKeys?.filter((key) => includes?.includes(key))), [includes]);
  const optionSelect: OptionsKey = getFormItem(editor, selected?.path, joinFormPath(selected?.attributeName, 'props.optionSelect')) || buttons[0];

  const selectTypeChange = (key?: OptionsKey) => {
    if (key) {
      onChange && onChange(undefined);
      editor?.updateItemByPath(key, selected?.path, joinFormPath(selected?.attributeName, 'props.optionSelect'));
    }
  };

  const handleChange = (value: unknown) => {
    if (!optionSelect) return;
    onChange && onChange(value);
  };

  const Child = optionSelect && OptionsWidget[optionSelect]?.component;

  return (
    <>
      <div className={classes.type}>
        <Select value={optionSelect} style={{ width: "100%" }} onChange={selectTypeChange}>
          {
            buttons.map((key) => (
              <Select.Option key={key} value={key}>
                {OptionsWidget[key].label}
              </Select.Option>
            ))
          }
        </Select>
      </div>
      <div className={classes.component}>
        {Child ? <Child value={value} onChange={handleChange} /> : null}
      </div>
    </>
  );
};

export default SetOptions;
