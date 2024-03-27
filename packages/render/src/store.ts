import { deepClone } from "./utils/object";
import { CustomUnionType, GenerateParams, WidgetItem, WidgetList } from "./types";
import { getItemByPath, setItemByPath, moveSameLevel, moveDiffLevel, getKeyValueByIndex, insertItemByIndex } from "./utils/utils";
import { createFormElement, getFormComponent } from "./utils/transform";
import { joinFormPath } from "@simpleform/form";

export type FormRenderListener = (newValue?: any, oldValue?: any) => void;

// 管理formrender过程中的数据
export class SimpleFormRender {
  public plugins: any;
  public components: any;
  private widgetList: WidgetList;
  private lastWidgetList: WidgetList | undefined;
  private widgetListListeners: FormRenderListener[] = [];
  constructor() {
    this.widgetList = [];
    this.lastWidgetList = undefined;
    this.getWidgetList = this.getWidgetList.bind(this);
    this.setWidgetList = this.setWidgetList.bind(this);
    this.addPlugin = this.addPlugin.bind(this);
    this.getFormComponent = this.getFormComponent.bind(this);
    this.createFormElement = this.createFormElement.bind(this);
    this.plugins = {};
    this.components = {};
  }

  // 增加plugin
  public addPlugin(data: any) {
    this.plugins = Object.assign({}, this.plugins, data);
  };
  // 注册组件
  public registry(data: any) {
    this.components = Object.assign({}, this.components, data);
  };

  // 返回目标声明组件
  public getFormComponent(target?: CustomUnionType) {
    const typeMap = this.components;
    return getFormComponent(target, typeMap);
  }

  // 创建components的实例
  public createFormElement(target?: CustomUnionType, commonProps?: GenerateParams) {
    const typeMap = this.components;
    return createFormElement(target, typeMap, commonProps);
  }

  // 获取当前组件的widgetList
  public getWidgetList() {
    return deepClone(this.widgetList || []);
  }

  // 设置widgetList
  setWidgetList(data?: WidgetList) {
    this.lastWidgetList = this.widgetList;
    this.widgetList = data || [];
    this.notifyWidgetList();
  }

  // 设置指定路径的值
  setItemByPath = (data?: any, path?: string) => {
    const cloneData = this.getWidgetList();
    if (cloneData) {
      let newData = setItemByPath(cloneData, data, path);
      this.setWidgetList(newData);
    }
  };

  // 设置指定路径的值
  setItemByIndex = (data?: any, index?: number, parent?: string) => {
    const cloneData = this.getWidgetList();
    if (cloneData) {
      const keyValue = getKeyValueByIndex(cloneData, index, parent);
      const path = joinFormPath(parent, keyValue && keyValue[0]);
      const newData = setItemByPath(cloneData, data, path);
      this.setWidgetList(newData);
    }
  };

  // 插入值，默认末尾
  insertItemByIndex = (data?: WidgetItem | Array<WidgetItem>, index?: number, parent?: string) => {
    const cloneData = this.getWidgetList();
    if (cloneData) {
      const newData = insertItemByIndex(cloneData, data, index, parent);
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
  getItemByPath = (path?: string) => {
    const cloneData = this.getWidgetList();
    if (cloneData) {
      return getItemByPath(cloneData, path);
    }
  };

  // 获取指定index的项
  getItemByIndex = (index: number, parent?: string) => {
    const cloneData = this.getWidgetList();
    if (cloneData) {
      const keyValue = getKeyValueByIndex(cloneData, index, parent);
      return keyValue && keyValue[1];
    }
  };

  // 从from到to更换位置
  moveItemByPath = (from: { parent?: string, index: number }, to: { parent?: string, index?: number }) => {
    const cloneData = this.getWidgetList();
    if (cloneData) {
      let newData: any;
      if (from?.parent === to?.parent) {
        newData = moveSameLevel(cloneData, from, to);
      } else {
        newData = moveDiffLevel(cloneData, from, to);
      }
      this.setWidgetList(newData);
    }
  };

  // 订阅表单渲染数据的变动
  public subscribeWidgetList(listener: FormRenderListener) {
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
