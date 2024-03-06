import React, { CSSProperties } from 'react';
import classnames from 'classnames';
import './index.less';
import { Button, Divider, Radio, Tooltip } from 'antd';
import { useEditorContext } from '../context';
import SvgIcon from '../components/common/SvgIcon';
import { PlatOptions } from './platContainer';
import { showImportModal } from './importModal';
import { showPreviewModal } from './preview';
import { showExportJsonModal } from './exportJson';

export interface EditorToolsProps {
  className?: string;
  style?: CSSProperties;
}

function EditorTools(props: EditorToolsProps, ref: any) {

  const context = useEditorContext();
  const { templates, platType, properties, historyRecord } = context.state;

  const {
    style,
    className,
    ...restProps
  } = props;

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
    historyRecord?.undo((serialized) => {
      context.dispatch((old) => ({ ...old, properties: JSON.parse(serialized || '{}') }));
    });
  };

  // 重做
  const redo = () => {
    historyRecord?.redo((serialized) => {
      context.dispatch((old) => ({ ...old, properties: JSON.parse(serialized || '{}') }));
    });
  };

  const canUndo = historyRecord?.canUndo();
  const canRedo = historyRecord?.canRedo();

  const cls = classnames('editor-tools', className);

  return (
    <header ref={ref}
      className={cls}
      style={style}
      {...restProps}>
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
          onChange={(e) => context.dispatch((old) => ({ ...old, platType: e?.target?.value }))}
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
  );
};

EditorTools.displayName = 'editor-tools';
export default React.forwardRef(EditorTools);
