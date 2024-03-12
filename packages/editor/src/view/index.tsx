import React, { CSSProperties } from 'react';
import classnames from 'classnames';
import './index.less';
import RootDnd from './RootDnd';
import ComponentSelection from './selection';
import DefaultFormRender, { CustomFormRenderProps } from '../components/formrender';
import { useEventBusValue } from '../utils/hooks';
import { setFormInitialValue } from '../utils/utils';
import { useEditorContext } from '../context';
import PlatContainer from '../tools/platContainer';

export interface EditorViewProps {
  className?: string;
  style?: CSSProperties;
}

function EditorView(props: EditorViewProps, ref: any) {

  const context = useEditorContext();
  const { platType, editor, editorForm, settingForm, properties } = context.state;
  const FormRender = context?.state?.FormRender || DefaultFormRender;

  const {
    style,
    className,
    ...restProps
  } = props;

  const selectedRef = useEventBusValue('select');

  const onPropertiesChange: CustomFormRenderProps['onPropertiesChange'] = (newData) => {
    console.log(newData, '表单');
    context.dispatch((old) => ({ ...old, properties: newData }));
  };

  // 监听选中项改动
  const onFieldsChange: CustomFormRenderProps['onFieldsChange'] = ({ value }) => {
    // 必须延时，防止在选中之前变更值
    setTimeout(() => {
      setFormInitialValue(editor, settingForm, selectedRef.current, value);
    }, 50);
  };

  const cls = classnames("editor-view", className);

  return (
    <main ref={ref}
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
export default React.forwardRef(EditorView);
