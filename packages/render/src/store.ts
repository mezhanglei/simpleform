import { deepClone } from "./utils/object";
import { CustomUnionType, FormRenderProps, WidgetList } from "./typings";
import { getItemByPath, setItemByPath, moveSameLevel, moveDiffLevel, getKeyValueByIndex, insertItemByIndex } from "./utils/utils";
import { createFormElement, getFormComponent } from "./utils/transform";
import { joinFormPath } from "@simpleform/form";

export type FormRenderListener<V> = (newValue?: V, oldValue?: V) => void;

// 管理formrender过程中的数据
export class SimpleFormRender {
  public variables: FormRenderProps['variables'];
  public registeredComponents: FormRenderProps['components'];
  private widgetList: WidgetList;
  private lastWidgetList: WidgetList | undefined;
  private widgetListListeners: FormRenderListener<WidgetList>[] = [];
  constructor() {
    this.widgetList = [];
    this.lastWidgetList = undefined;
    this.getWidgetList = this.getWidgetList.bind(this);
    this.setWidgetList = this.setWidgetList.bind(this);
    this.addModule = this.addModule.bind(this);
    this.getFormComponent = this.getFormComponent.bind(this);
    this.createFormElement = this.createFormElement.bind(this);
    this.variables = {};
    this.registeredComponents = {};
  }

  // 增加js模块
  public addModule(data: FormRenderProps['variables']) {
    this.variables = Object.assign({}, this.variables, data);
  };
  // 注册组件
  public registry(data: FormRenderProps['components']) {
    this.registeredComponents = Object.assign({}, this.registeredComponents, data);
  };

  // 返回目标声明组件
  public getFormComponent(target?: CustomUnionType) {
    const registeredComponents = this.registeredComponents;
    return getFormComponent(target, registeredComponents);
  }

  // 创建components的实例
  public createFormElement(target?: CustomUnionType, commonProps?: unknown) {
    const registeredComponents = this.registeredComponents;
    return createFormElement(target, commonProps, registeredComponents);
  }

  // 获取当前组件的widgetList
  public getWidgetList() {
    return deepClone(this.widgetList || []);
  }

  // 设置widgetList
  setWidgetList(data?: SimpleFormRender['widgetList']) {
    this.lastWidgetList = this.widgetList;
    this.widgetList = data || [];
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
