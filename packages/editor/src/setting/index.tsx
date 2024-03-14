import React, { CSSProperties } from 'react';
import classnames from 'classnames';
import { Tabs } from 'antd';
import ComponentSetting from './component';
import './index.less';
import { FormEditorContextProps, useEditorContext } from '../context';

export interface EditorSettingProps {
  className?: string
  style?: CSSProperties
  children?: (context: FormEditorContextProps) => React.ReactNode;
}
const prefixCls = `simple-form-setting`;
function EditorSetting(props: EditorSettingProps) {
  const {
    style,
    className,
    children
  } = props;

  const TabsData = [{
    key: 'component',
    tab: '组件配置',
    component: ComponentSetting
  }];

  const context = useEditorContext();

  const cls = classnames(prefixCls, className);

  return (
    typeof children === 'function' ?
      children(context)
      :
      <div className={cls} style={style}>
        <Tabs className='setting-tabs'>
          {
            TabsData?.map((item) => {
              const { component: TabChildren, ...rest } = item;
              return (
                <Tabs.TabPane {...rest}>
                  <TabChildren />
                </Tabs.TabPane>
              );
            })
          }
        </Tabs>
      </div>
  );
};

EditorSetting.displayName = 'editor-setting';
export default EditorSetting;
