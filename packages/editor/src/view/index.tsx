import React, { CSSProperties, useState } from 'react';
import classnames from 'classnames';
import './index.less';
import RootDnd from './RootDnd';
import ComponentSelection from './selection';
import { Button, Divider, Radio } from 'antd';
import PlatContainer, { PlatContainerProps, PlatOptions } from './platContainer';
import { showImportModal } from './importModal';
import { showPreviewModal } from './preview';
import { showExportJsonModal } from './exportJson';
import FormRender, { CustomFormRenderProps } from '../components/formrender';
import { useEventBusRef } from '../utils/hooks';
import { setFormInitialValue } from '../utils/utils';
import templates from '../templates';
import { useEditorContext } from '../context';

export interface EditorViewProps {
  className?: string;
  style?: CSSProperties;
}
const prefixCls = `simple-form-editor`;

function EditorView(props: EditorViewProps, ref: any) {

  const context = useEditorContext();
  const { editor, editorForm, settingForm, properties } = context.state;

  const {
    style,
    className,
    ...restProps
  } = props;

  const cls = classnames(prefixCls, className);
  const [platType, setPlatType] = useState<PlatContainerProps['plat']>('pc');
  const selectedRef = useEventBusRef('select');

  const onPropertiesChange: CustomFormRenderProps['onPropertiesChange'] = (newData) => {
    console.log(newData, '表单');
    context.dispatch({ properties: newData });
  };

  // 监听选中项改动
  const onFieldsChange: CustomFormRenderProps['onFieldsChange'] = ({ value }) => {
    // 必须延时，防止在选中之前变更值
    setTimeout(() => {
      const selected = selectedRef.current;
      setFormInitialValue(editor, settingForm, selected, value);
    }, 50);
  };

  const importJson = () => {
    showImportModal({
      data: templates,
      onSelect: (item) => {
        context.dispatch({ properties: item?.data });
      }
    });
  };

  const showPreview = () => {
    showPreviewModal({ properties, plat: platType });
  };
  const clearEditor = () => {
    context.dispatch({ properties: undefined });
  };
  const showExportJson = () => {
    showExportJsonModal({ data: properties, title: '渲染JSON' });
  };

  return (
    <div
      ref={ref}
      className={cls}
      style={style}
      {...restProps}
      onClick={() => {
      }}>
      <header className="editor-header">
        <div className="left-toolbar">
          {/* <Tooltip
            appendTo={document.body}
            theme="light"
            content="撤销"
          >
            <Button className="undo-btn" type='link'>
              <Icon name="undo" />
            </Button>
          </Tooltip>
          <Tooltip
            appendTo={document.body}
            theme="light"
            content="重做"
          >
            <Button className="redo-btn" type='link'>
              <Icon name="redo" />
            </Button>
          </Tooltip>
          <Divider className="left-divid" type='vertical' /> */}
          <Radio.Group
            options={PlatOptions}
            onChange={(e) => setPlatType(e?.target?.value)}
            value={platType}
            optionType="button"
            buttonStyle="solid"
          />
        </div>
        {templates?.length ? <Button type='link' onClick={importJson}>导入模板</Button> : null}
        <Button type='link' onClick={showPreview}>预览</Button>
        <Button type='link' onClick={clearEditor}>清空</Button>
        <Button type='link' onClick={showExportJson}>生成JSON</Button>
      </header>
      <main className="editor-main">
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
    </div>
  );
};

// 编辑区默认的选中框渲染
const renderItem: CustomFormRenderProps['renderItem'] = (params) => {
  const { children } = params;
  const isControl = params?.field?.properties ? false : true;
  // 只有输入控件才需要默认添加选区
  if (isControl) {
    return <ComponentSelection {...params} data-type="ignore" />;
  }
  return children;
};

EditorView.displayName = 'editor-view';
export default React.forwardRef(EditorView);
