import React, { CSSProperties } from 'react';
import classnames from 'classnames';
import './index.less';
import RootDnd from './RootDnd';
import CommonSelection from './selection';
import FormRender, { joinFormPath } from '@simpleform/render';
import { setWidgetItem } from '../utils';
import { FormEditorContextProps, useEditorContext } from '../context';
import PlatContainer from '../tools/platContainer';

export interface EditorViewProps {
  className?: string;
  style?: CSSProperties;
  children?: (editorContext: FormEditorContextProps) => React.ReactElement;
}

function EditorView(props: EditorViewProps) {

  const editorContext = useEditorContext();
  const renderConfig = editorContext?.state?.renderConfig;
  const { platType = 'pc', selected, editor, editorForm, settingForm, widgetList } = editorContext?.state || {};

  const {
    style,
    className,
    children,
    ...restProps
  } = props;

  const onRenderChange = (newData) => {
    console.log(newData, '表单');
    editorContext?.dispatch((old) => ({
      ...old,
      widgetList: newData || []
    }));
  };

  // 监听编辑区域的初始表单值
  const onFieldsChange = (_) => {
    setWidgetItem(editor, _?.value, joinFormPath(selected?.path, 'initialValue'));
    settingForm && settingForm.setFieldValue('initialValue', _?.value);
  };

  const cls = classnames("editor-view", className);

  return (
    typeof children === 'function' ?
      children(editorContext)
      :
      <main
        className={cls}
        style={style}
        {...restProps}
      >
        <PlatContainer plat={platType}>
          <FormRender
            {...renderConfig}
            wrapper={RootDnd}
            options={{ ...renderConfig?.options, isEditor: true, editorContext }}
            formrender={editor}
            form={editorForm}
            widgetList={widgetList}
            onRenderChange={onRenderChange}
            onFieldsChange={onFieldsChange}
            renderItem={renderItem}
          />
        </PlatContainer>
      </main>
  );
};

// 编辑区默认的选中框渲染
const renderItem = (children, params) => {
  const _options = params?._options || {};
  const nonselection = _options?.panel?.nonselection;
  if (nonselection) {
    return children;
  }
  return <CommonSelection data-path={_options.path} {...params} children={children} />;
};

EditorView.displayName = 'editor-view';
export default EditorView;
