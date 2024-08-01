import { CustomUnionType, FormRenderProps, WidgetList } from "./typings";
import { getItemByPath, setItemByPath, moveSameLevel, moveDiffLevel, getKeyValueByIndex, insertItemByIndex } from "./utils/utils";
import { createFormElement, getFormComponent } from "./utils/transform";
import { Form, joinFormPath } from "@simpleform/form";
import { deepClone, isObject } from "./utils";
import { CustomCol, CustomRow } from "./components";

// 浅合并配置信息(只支持对象或数组)
export const mergeDefineConfig = (oldConfig, newConfig) => {
  if (!isObject(newConfig)) return oldConfig;
  const cloneConfig = { ...oldConfig };
  Object.keys(newConfig).forEach((key) => {
    const oldItem = oldConfig && oldConfig[key];
    const newItem = newConfig[key];
    if (oldItem) {
      cloneConfig[key] = oldItem instanceof Array ? [...oldItem, ...newItem] : { ...oldItem, ...newItem };
    } else {
      cloneConfig[key] = newItem;
    }
  });
  return cloneConfig;
};

export type FormRenderListener<V> = (newValue?: V, oldValue?: V) => void;

// 管理formrender过程中的数据
export class SimpleFormRender {
  public config?: {
    variables?: FormRenderProps['variables'];
    registeredComponents?: FormRenderProps['components'];
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
      registeredComponents: {
        'row': CustomRow,
        'col': CustomCol,
        'Form.Item': Form.Item
      }
    };
  }

  // formrender的所有配置
  public defineConfig(data?: SimpleFormRender['config']) {
    this.config = mergeDefineConfig(this.config, data);
  }

  // 返回目标声明组件
  public getFormComponent(target?: CustomUnionType) {
    const components = this.config?.registeredComponents;
    return getFormComponent(target, components);
  }

  // 创建components的实例
  public createFormElement(target?: CustomUnionType, commonProps?: unknown) {
    const components = this.config?.registeredComponents;
    return createFormElement(target, commonProps, components);
  }

  // 获取当前组件的widgetList
  public getWidgetList() {
    return deepClone(this.widgetList) || [];
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
    const cloneData = this.getWidgetList();
    if (cloneData) {
      const newData = setItemByPath(cloneData, data, path);
      this.setWidgetList(newData);
    }
  };

  // 设置指定路径的值
  setItemByIndex = <V>(data?: unknown, index?: number, parent?: string) => {
    const cloneData = this.getWidgetList();
    if (cloneData) {
      const keyValue = getKeyValueByIndex<V>(cloneData, index, parent);
      const path = joinFormPath(parent, keyValue && keyValue[0]);
      const newData = setItemByPath(cloneData, data, path);
      this.setWidgetList(newData);
    }
  };

  // 插入值，默认末尾
  insertItemByIndex = <V>(data?: V | Array<V>, index?: number, parent?: string) => {
    const cloneData = this.getWidgetList();
    if (cloneData) {
      const newData = insertItemByIndex<V>(cloneData, data, index, parent);
      this.setWidgetList(newData);
    }
  };

  // 根据path删除一条
  delItemByPath = (path?: string) => {
    const cloneData = this.getWidgetList();
    if (cloneData) {
      const newData = setItemByPath(cloneData, undefined, path);
      this.setWidgetList(newData);
    }
  };

  // 获取指定路径的项
  getItemByPath = <V>(path?: string) => {
    const cloneData = this.getWidgetList();
    if (cloneData) {
      return getItemByPath<V>(cloneData, path);
    }
  };

  // 获取指定index的项
  getItemByIndex = <V>(index: number, parent?: string) => {
    const cloneData = this.getWidgetList();
    if (cloneData) {
      const keyValue = getKeyValueByIndex<V>(cloneData, index, parent);
      return keyValue && keyValue[1];
    }
  };

  // 从from到to更换位置
  moveItemByPath = (from: { parent?: string, index: number }, to: { parent?: string, index?: number }) => {
    const cloneData = this.getWidgetList();
    if (cloneData) {
      let newData: SimpleFormRender['widgetList'] | undefined;
      if (from?.parent === to?.parent) {
        newData = moveSameLevel(cloneData, from, to);
      } else {
        newData = moveDiffLevel(cloneData, from, to);
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
