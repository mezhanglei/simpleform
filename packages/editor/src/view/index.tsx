import React, { CSSProperties } from 'react';
import classnames from 'classnames';
import './index.less';
import RootDnd from './RootDnd';
import ComponentSelection from './selection';
import DefaultFormRender, { CustomFormRenderProps, getInitialValues, joinFormPath } from '../components/formrender';
import { setWidgetItem } from '../utils/utils';
import { FormEditorContextProps, useEditorContext } from '../context';
import PlatContainer from '../tools/platContainer';

export interface EditorViewProps {
  className?: string;
  style?: CSSProperties;
  children?: (context: FormEditorContextProps) => React.ReactElement;
}

function EditorView(props: EditorViewProps) {

  const context = useEditorContext();
  const { platType = 'pc', beforeSelected, editor, editorForm, settingForm, widgetList } = context?.state || {};
  const FormRender = context?.state?.FormRender || DefaultFormRender;

  const {
    style,
    className,
    children,
    ...restProps
  } = props;

  const onRenderChange: CustomFormRenderProps['onRenderChange'] = (newData) => {
    console.log(newData, '表单');
    context?.dispatch((old) => ({
      ...old,
      widgetList: newData || []
    }));
    // 从渲染数据中同步表单值
    const initialValues = getInitialValues(newData) || {};
    editorForm?.setFieldsValue(initialValues);
  };

  // 监听选中项改动
  const onFieldsChange: CustomFormRenderProps['onFieldsChange'] = ({ value }) => {
    setWidgetItem(editor, value, joinFormPath(beforeSelected?.path, 'initialValue'));
    settingForm && settingForm.setFieldValue('initialValue', value);
  };

  const cls = classnames("editor-view", className);

  return (
    typeof children === 'function' ?
      children(context)
      :
      <main
        className={cls}
        style={style}
        {...restProps}
        onClick={() => {
        }}>
        <PlatContainer plat={platType}>
          <FormRender
            options={{ isEditor: true, context: context }}
            formrender={editor}
            form={editorForm}
            widgetList={widgetList}
            onRenderChange={onRenderChange}
            onFieldsChange={onFieldsChange}
            inside={RootDnd}
            renderItem={renderItem}
          />
        </PlatContainer>
      </main>
  );
};

// 编辑区默认的选中框渲染
const renderItem: CustomFormRenderProps['renderItem'] = (props) => {
  const { children } = props;
  const isItem = props?.widgetItem?.widgetList ? false : true;
  // 单个组件批量添加选区
  if (isItem) {
    return <ComponentSelection data-path={props.path} {...props} key={props?.widgetItem?.uuid} />;
  }
  return children;
};

EditorView.displayName = 'editor-view';
export default EditorView;
