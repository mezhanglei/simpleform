import React, { CSSProperties } from 'react';
import classnames from 'classnames';
import './index.less';
import { Button, Divider, Radio, Tooltip } from 'antd';
import { FormEditorContextProps, useEditorContext } from '../context';
import SvgIcon from '../components/common/SvgIcon';
import { PlatOptions } from './platContainer';
import { showPreviewModal } from './preview';
import { showExportJsonModal } from './exportJson';

export interface EditorToolsProps {
  className?: string;
  style?: CSSProperties;
  children?: (context: FormEditorContextProps) => React.ReactNode;
  renderTools?: (context: FormEditorContextProps) => React.ReactNode;
}

function EditorTools(props: EditorToolsProps) {

  const context = useEditorContext();
  const { platType = 'pc', properties, historyRecord } = context.state;

  const {
    style,
    className,
    children,
    renderTools,
    ...restProps
  } = props;

  const showPreview = () => {
    showPreviewModal({ properties, plat: platType, context });
  };

  const clearEditor = () => {
    context.dispatch((old) => ({ ...old, properties: undefined }));
    historyRecord?.save();
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
    typeof children === 'function' ?
      children(context)
      :
      <header
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
        <div>
          {renderTools ? renderTools(context) : null}
          <Button type='link' onClick={showPreview}>预览</Button>
          <Button type='link' onClick={clearEditor}>清空</Button>
          <Button type='link' onClick={showExportJson}>生成JSON</Button>
        </div>
      </header>
  );
};

EditorTools.displayName = 'editor-tools';
export default EditorTools;
