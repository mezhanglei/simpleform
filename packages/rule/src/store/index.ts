import reducer, { actionCreators } from "./actions";
import { RuleBuilderConfig, RuleBuilderGroup } from "../typings";
import { deepClone } from "../utils/object";

const bindClassPrototype = (target, instance) => {
  const attrs = Object.getOwnPropertyDescriptors(target?.prototype);
  for (const key in attrs) {
    const attr = instance[key];
    if (typeof attr === "function" && key !== "constructor") {
      instance[key] = instance[key].bind(instance);
    }
  }
};

const defaultConfig = {};

export type RuleBuilderTreeListener<V> = (newValue?: V, oldValue?: V) => void;
export class RuleBuilder {
  public config?: RuleBuilderConfig;
  public tree?: RuleBuilderGroup;
  public lastTree: RuleBuilderGroup | undefined;
  private treeListeners: RuleBuilderTreeListener<RuleBuilderGroup>[] = [];
  static defaultConfig = defaultConfig;
  constructor(config?: RuleBuilder["config"]) {
    this.tree = undefined;
    this.lastTree = undefined;
    this.config = { ...defaultConfig, ...config };
    bindClassPrototype(RuleBuilder, this);
  }

  // 配置项
  public defineConfig(
    payload?: RuleBuilder["config"] | ((config?: unknown) => Partial<unknown>)
  ) {
    if (typeof payload === "function") {
      this.config = payload(this.config);
    } else {
      this.config = {
        ...this.config,
        ...payload,
      };
    }
  }

  // 返回tree的操作方法
  public getActions() {
    return Object.fromEntries(
      Object.keys(actionCreators)?.map((actionName) => {
        const actionFun = actionCreators[actionName];
        return [
          actionName,
          (...args) => {
            this.setTree(
              reducer(this.tree, this.config, actionName, actionFun(...args))
            );
          },
        ];
      })
    );
  }

  // 返回tree
  public getTree() {
    return deepClone(this.tree);
  }

  // 设置tree
  public setTree(data?: RuleBuilder["tree"], option?: { ignore?: boolean }) {
    this.lastTree = this.tree;
    this.tree = data;
    if (option?.ignore) return;
    this.notifyTree();
  }

  // 订阅表单渲染数据的变动
  public subscribeTree(listener: RuleBuilder["treeListeners"][number]) {
    this.treeListeners.push(listener);
    return () => {
      this.unsubscribeTree();
    };
  }

  // 卸载
  public unsubscribeTree() {
    this.treeListeners = [];
  }

  // 同步表单渲染数据的变化
  private notifyTree() {
    this.treeListeners.forEach((onChange) => {
      const cloneData = this.getTree();
      onChange && onChange(cloneData, this.lastTree);
    });
  }
}
