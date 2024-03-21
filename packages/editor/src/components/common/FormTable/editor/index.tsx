import React from "react";
import classnames from "classnames";
import './index.less';
import ColumnSelection from "./column-selection";
import { FormTableProps } from "..";
import pickAttrs from '../../../../utils/pickAttrs';
import { CustomFormRenderProps, Form, joinFormPath } from "../../../formrender";
import FormDnd from "../../../../view/FormDnd";

const EditorTable = React.forwardRef<HTMLTableElement, FormTableProps>(({
  columns = [],
  disabled,
  className,
  style,
  path,
  value,
  onChange,
  ...rest
}, ref) => {

  const prefix = "design-table";
  const Classes = {
    Table: prefix,
    TableBody: `${prefix}-body`,
    TableCol: `${prefix}-col`,
    TableSelection: `${prefix}-selection`,
    TableColHead: `${prefix}-col__head`,
    TableColBody: `${prefix}-col__body`,
    TableDnd: `${prefix}-dnd`,
    placeholder: `${prefix}-placeholder`,
  };

  const widgetItem = rest?.widgetItem;
  const context = widgetItem?.context;
  const { settingForm } = context?.state || {};

  // 监听列控件设置值
  const columnInputChange: CustomFormRenderProps['onValuesChange'] = ({ value }) => {
    settingForm && settingForm.setFieldValue('initialValue', value);
  };

  const columnsPath = joinFormPath(path, 'props.columns');

  return (
    <div
      className={classnames([Classes.Table, className])}
      {...pickAttrs(rest)}
      style={style}
      ref={ref}>
      <FormDnd
        className='table-dnd'
        {...rest}
        dndPath={columnsPath}
        dndList={widgetItem?.props?.columns}
        group={{
          name: "table-columns",
          pull: "clone",
          put: ['sort-field', 'panel']
        }}
      >
        {
          columns?.map((column, colIndex) => {
            const { label, type, props, ...restColumn } = column;
            const columnInstance = rest?.formrender && rest.formrender.createFormElement({ type: type, props: Object.assign({ disabled, form: rest?.form, formrender: rest?.formrender }, props) });
            return (
              <ColumnSelection key={colIndex} className={Classes.TableSelection} {...rest} path={columnsPath} column={column} colIndex={colIndex}>
                <div className={Classes.TableCol}>
                  <div className={Classes.TableColHead}>
                    {label}
                  </div>
                  <div className={Classes.TableColBody}>
                    <Form.Item {...restColumn} label="" onValuesChange={columnInputChange}>
                      {React.isValidElement(columnInstance) ? ({ bindProps }: any) => React.cloneElement(columnInstance, bindProps) : columnInstance}
                    </Form.Item>
                  </div>
                </div>
              </ColumnSelection>
            );
          })
        }
      </FormDnd>
      {!columns?.length && <span className={Classes.placeholder}>将控件拖拽到此处</span>}
    </div>
  );
});

export default EditorTable;
