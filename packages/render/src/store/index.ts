import { FormRenderNodeProps, FormRenderProps } from '../typings';
import { getItemByPath } from '../utils/utils';
import { deepClone } from '../utils';
import { CustomCol, CustomRow } from '../components';
import reducer, { actionCreators } from './actions';
import { Form } from '@simpleform/form';

/* eslint-disable */

const bindClassPrototype = (target, instance) => {
  const attrs = Object.getOwnPropertyDescriptors(target.prototype);
  for (const key in attrs) {
    const attr = instance[key];
    if (typeof attr === 'function' && key !== 'constructor') {
      instance[key] = instance[key].bind(instance);
    }
  }
};

export type FormRenderListener<V> = (newValue?: V, oldValue?: V) => void;

const defaultConfig = {
  formConfig: {
    Form,
    Item: Form.Item,
  },
  components: {
    row: CustomRow,
    col: CustomCol,
  },
}

// 管理formrender过程中的数据
export class SimpleFormRender {
  public config: Omit<FormRenderProps, 'formConfig' | 'components'> & {
    formConfig: NonNullable<FormRenderProps['formConfig']>;
    components: NonNullable<FormRenderProps['components']>;
  };
  private widgetList: FormRenderProps['widgetList'];
  private lastWidgetList: FormRenderProps['widgetList'] | undefined;
  private widgetListListeners: FormRenderListener<FormRenderProps['widgetList']>[] = [];
  static defaultConfig = defaultConfig;
  constructor(config?: SimpleFormRender['config']) {
    this.widgetList = [];
    this.lastWidgetList = undefined;
    this.config = { ...defaultConfig, ...config };
    bindClassPrototype(SimpleFormRender, this);
  }

  // 配置项
  public defineConfig(payload?: Partial<SimpleFormRender['config']> | ((config?: SimpleFormRender['config']) => SimpleFormRender['config'])) {
    if (typeof payload === 'function') {
      this.config = payload(this.config);
    } else {
      this.config = {
        ...defaultConfig,
        ...payload,
        components: { ...defaultConfig.components, ...payload?.components }
      };
    }
  }

  // 获取当前组件的widgetList
  public getWidgetList() {
    return deepClone(this.widgetList || []);
  }

  // 设置widgetList
  public setWidgetList(data?: SimpleFormRender['widgetList'], option?: { ignore?: boolean }) {
    this.lastWidgetList = this.widgetList;
    this.widgetList = data || [];
    if (option?.ignore) return;
    this.notifyWidgetList();
  }

  // 获取指定路径的项
  public getItemByPath = (path?: FormRenderNodeProps['path']) => {
    const oldData = this.getWidgetList();
    if (oldData) {
      return getItemByPath(oldData, path);
    }
  };

  // 返回widgetList的操作方法
  public getActions() {
    return Object.fromEntries(
      Object.keys(actionCreators)?.map((actionName) => {
        const actionFun = actionCreators[actionName];
        return [
          actionName,
          (...args) => {
            this.setWidgetList(reducer(this.widgetList, actionName, actionFun(...args)));
          },
        ];
      })
    );
  }

  // 订阅表单渲染数据的变动
  public subscribeWidgetList(listener: SimpleFormRender['widgetListListeners'][number]) {
    this.widgetListListeners.push(listener);
    return () => {
      this.widgetListListeners = [];
    };
  }

  // 卸载
  public unsubscribeWidgetList() {
    this.widgetListListeners = [];
  }

  // 同步表单渲染数据的变化
  private notifyWidgetList() {
    this.widgetListListeners.forEach((onChange) => {
      const cloneData = this.getWidgetList();
      onChange && onChange(cloneData, this.lastWidgetList);
    });
  }
}
