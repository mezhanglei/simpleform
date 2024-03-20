import React from "react";
import classnames from "classnames";
import './index.less';
import ColumnSelection from "./column-selection";
import TableDnd from './dnd';
import { FormTableProps } from "..";
import pickAttrs from '../../../../utils/pickAttrs';
import { CustomFormRenderProps, Form } from "../../../formrender";

const EditorTable = React.forwardRef<HTMLTableElement, FormTableProps>(({
  columns = [],
  disabled,
  className,
  style,
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

  const onFieldsChange: CustomFormRenderProps['onFieldsChange'] = ({ value }) => {
    settingForm && settingForm.setFieldValue('initialValue', value);
  };

  return (
    <div
      className={classnames([Classes.Table, className])}
      {...pickAttrs(rest)}
      style={style}
      ref={ref}>
      <TableDnd {...rest}>
        {
          columns?.map((column, colIndex) => {
            const { label, type, props, ...restColumn } = column;
            const columnInstance = rest?.formrender && rest.formrender.createFormElement({ type: type, props: Object.assign({ disabled, form: rest?.form, formrender: rest?.formrender }, props) });
            return (
              <ColumnSelection key={colIndex} className={Classes.TableSelection} {...rest} column={column} colIndex={colIndex}>
                <div className={Classes.TableCol}>
                  <div className={Classes.TableColHead}>
                    {label}
                  </div>
                  <div className={Classes.TableColBody}>
                    <Form.Item {...restColumn} label="" onFieldsChange={onFieldsChange}>
                      {React.isValidElement(columnInstance) ? ({ bindProps }: any) => React.cloneElement(columnInstance, bindProps) : columnInstance}
                    </Form.Item>
                  </div>
                </div>
              </ColumnSelection>
            );
          })
        }
      </TableDnd>
      {!columns?.length && <span className={Classes.placeholder}>将控件拖拽到此处</span>}
    </div>
  );
});

export default EditorTable;
