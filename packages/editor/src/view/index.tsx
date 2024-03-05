import React, { CSSProperties, useState } from 'react';
import classnames from 'classnames';
import './index.less';
import RootDnd from './RootDnd';
import ComponentSelection from './selection';
import { Button, Divider, Radio, Tooltip } from 'antd';
import PlatContainer, { PlatContainerProps, PlatOptions } from './platContainer';
import { showImportModal } from './importModal';
import { showPreviewModal } from './preview';
import { showExportJsonModal } from './exportJson';
import DefaultFormRender, { CustomFormRenderProps } from '../components/formrender';
import { useEventBusRef } from '../utils/hooks';
import { setFormInitialValue } from '../utils/utils';
import templates from '../templates';
import { useEditorContext } from '../context';
import SvgIcon from '../components/common/SvgIcon';

export interface EditorViewProps {
  className?: string;
  style?: CSSProperties;
}
const prefixCls = `simple-form-editor`;

function EditorView(props: EditorViewProps, ref: any) {

  const context = useEditorContext();
  const { editor, editorForm, settingForm, properties, historyRecord } = context.state;
  const FormRender = context?.state?.FormRender || DefaultFormRender;

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
    context.dispatch((old) => ({ ...old, properties: newData }));
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
        context.dispatch((old) => ({ ...old, properties: item?.data }));
      }
    });
  };

  const showPreview = () => {
    showPreviewModal({ properties, plat: platType, context });
  };
  const clearEditor = () => {
    context.dispatch((old) => ({ ...old, properties: undefined }));
  };
  const showExportJson = () => {
    showExportJsonModal({ data: properties, title: '渲染JSON' });
  };

  // 撤销
  const undo = () => {
    historyRecord.undo((serialized) => {
      context.dispatch((old) => ({ ...old, properties: JSON.parse(serialized || '{}') }));
    });
  };

  // 重做
  const redo = () => {
    historyRecord.redo((serialized) => {
      context.dispatch((old) => ({ ...old, properties: JSON.parse(serialized || '{}') }));
    });
  };

  const canUndo = historyRecord.canUndo();
  const canRedo = historyRecord.canRedo();

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
          <Tooltip
            title="撤销"
          >
            <Button disabled={!canUndo} className="undo-btn" type='link' onClick={undo}>
              <SvgIcon name="undo" />
            </Button>
          </Tooltip>
          <Tooltip
            title="重做"
          >
            <Button disabled={!canRedo} className="redo-btn" type='link' onClick={redo}>
              <SvgIcon name="redo" />
            </Button>
          </Tooltip>
          <Divider className="left-divid" type='vertical' />
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
    return <ComponentSelection {...params} />;
  }
  return children;
};

EditorView.displayName = 'editor-view';
export default React.forwardRef(EditorView);
