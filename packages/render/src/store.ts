import { CustomUnionType, FormRenderProps, WidgetList } from "./typings";
import { getItemByPath, setItemByPath, moveSameLevel, moveDiffLevel, getKeyValueByIndex, insertItemByIndex } from "./utils/utils";
import { createFormElement, getFormComponent, mergeFormOptions } from "./utils/transform";
import { Form, joinFormPath } from "@simpleform/form";
import { deepClone } from "./utils";
import { CustomCol, CustomRow } from "./components";

export type FormRenderListener<V> = (newValue?: V, oldValue?: V) => void;

// 管理formrender过程中的数据
export class SimpleFormRender {
  public config?: {
    variables?: FormRenderProps['variables'];
    components?: FormRenderProps['components'];
  };
  private widgetList: WidgetList;
  private lastWidgetList: WidgetList | undefined;
  private widgetListListeners: FormRenderListener<WidgetList>[] = [];
  constructor(config?: SimpleFormRender['config']) {
    this.widgetList = [];
    this.lastWidgetList = undefined;
    this.getWidgetList = this.getWidgetList.bind(this);
    this.setWidgetList = this.setWidgetList.bind(this);
    this.defineConfig = this.defineConfig.bind(this);
    this.getFormComponent = this.getFormComponent.bind(this);
    this.createFormElement = this.createFormElement.bind(this);
    this.config = config || {
      components: {
        'row': CustomRow,
        'col': CustomCol,
        'Form.Item': Form.Item
      }
    };
  }

  // formrender的所有配置
  public defineConfig(data?: SimpleFormRender['config']) {
    this.config = mergeFormOptions(this.config, data);
  }

  // 返回目标声明组件
  public getFormComponent(target?: CustomUnionType) {
    const components = this.config?.components;
    return getFormComponent(target, components);
  }

  // 创建components的实例
  public createFormElement(target?: CustomUnionType, commonProps?: unknown) {
    const components = this.config?.components;
    return createFormElement(target, commonProps, components);
  }

  // 获取当前组件的widgetList
  public getWidgetList() {
    return deepClone(this.widgetList || []);
  }

  // 设置widgetList
  setWidgetList(data?: SimpleFormRender['widgetList'], option?: { ignore?: boolean }) {
    this.lastWidgetList = this.widgetList;
    this.widgetList = data || [];
    if (option?.ignore) return;
    this.notifyWidgetList();
  }

  // 设置指定路径的值
  setItemByPath = (data?: unknown, path?: string) => {
    const oldData = this.getWidgetList();
    if (oldData) {
      const newData = setItemByPath(oldData, data, path);
      this.setWidgetList(newData);
    }
  };

  // 设置指定路径的值
  setItemByIndex = <V>(data?: unknown, index?: number, parent?: string) => {
    const oldData = this.getWidgetList();
    if (oldData) {
      const keyValue = getKeyValueByIndex<V>(oldData, index, parent);
      const path = joinFormPath(parent, keyValue && keyValue[0]);
      const newData = setItemByPath(oldData, data, path);
      this.setWidgetList(newData);
    }
  };

  // 插入值，默认末尾
  insertItemByIndex = <V>(data?: V | Array<V>, index?: number, parent?: string) => {
    const oldData = this.getWidgetList();
    if (oldData) {
      const newData = insertItemByIndex(oldData, data, index, parent);
      this.setWidgetList(newData);
    }
  };

  // 根据path删除一条
  delItemByPath = (path?: string) => {
    const oldData = this.getWidgetList();
    if (oldData) {
      const newData = setItemByPath(oldData, undefined, path);
      this.setWidgetList(newData);
    }
  };

  // 获取指定路径的项
  getItemByPath = (path?: string) => {
    const oldData = this.getWidgetList();
    if (oldData) {
      return getItemByPath(oldData, path);
    }
  };

  // 获取指定index的项
  getItemByIndex = <V>(index: number, parent?: string) => {
    const oldData = this.getWidgetList();
    if (oldData) {
      const keyValue = getKeyValueByIndex<V>(oldData, index, parent);
      return keyValue && keyValue[1];
    }
  };

  // 从from到to更换位置
  moveItemByPath = (from: { parent?: string, index: number }, to: { parent?: string, index?: number }) => {
    const oldData = this.getWidgetList();
    if (oldData) {
      let newData: SimpleFormRender['widgetList'] | undefined;
      if (from?.parent === to?.parent) {
        newData = moveSameLevel(oldData, from, to);
      } else {
        newData = moveDiffLevel(oldData, from, to);
      }
      this.setWidgetList(newData || []);
    }
  };

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
