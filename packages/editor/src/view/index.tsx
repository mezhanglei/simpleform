import React, { CSSProperties } from 'react';
import classnames from 'classnames';
import './index.less';
import RootDnd from './RootDnd';
import ComponentSelection from './selection';
import DefaultFormRender, { CustomFormRenderProps } from '../components/formrender';
import { setFormInitialValue } from '../utils/utils';
import { FormEditorContextProps, useEditorContext } from '../context';
import PlatContainer from '../tools/platContainer';

export interface EditorViewProps {
  className?: string;
  style?: CSSProperties;
  children?: (context: FormEditorContextProps) => React.ReactNode;
}

function EditorView(props: EditorViewProps) {

  const context = useEditorContext();
  const { platType = 'pc', beforeSelected, editor, editorForm, settingForm, properties } = context.state;
  const FormRender = context?.state?.FormRender || DefaultFormRender;

  const {
    style,
    className,
    children,
    ...restProps
  } = props;

  const onPropertiesChange: CustomFormRenderProps['onPropertiesChange'] = (newData) => {
    console.log(newData, '表单');
    context.dispatch((old) => ({ ...old, properties: newData }));
  };

  // 监听选中项改动
  const onFieldsChange: CustomFormRenderProps['onFieldsChange'] = ({ value }) => {
    setFormInitialValue(editor, settingForm, beforeSelected, value);
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
            properties={properties}
            onPropertiesChange={onPropertiesChange}
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
  const isControl = props?.field?.properties ? false : true;
  // 只有输入控件才需要默认添加选区
  if (isControl) {
    return <ComponentSelection {...props} />;
  }
  return children;
};

EditorView.displayName = 'editor-view';
export default EditorView;
