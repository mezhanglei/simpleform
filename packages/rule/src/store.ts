import { mergeFormOptions } from "./utils";
import reducer from './reducer';
import defaultRoot from './utils/defaultRoot';
import { RuleBuilderTree } from "./typings";
import { deepClone } from "./utils/object";
import { map } from 'ramda';
import * as actionCreators from './actions';

export type RuleBuilderTreeListener<V> = (newValue?: V, oldValue?: V) => void;
export class RuleBuilder<T = unknown> {

  public config?: unknown;
  public tree?: RuleBuilderTree;
  private lastTree: RuleBuilderTree | undefined;
  private treeListeners: RuleBuilderTreeListener<RuleBuilderTree>[] = [];
  constructor(config?: RuleBuilder['config']) {
    this.defineConfig = this.defineConfig.bind(this);
    this.config = config || {
    };
    this.lastTree = undefined;
    // this.tree = reducer(defaultRoot(this.config), undefined);
  }

  // 配置项
  public defineConfig(payload?: RuleBuilder['config'] | ((config?: unknown) => Partial<unknown>)) {
    if (typeof payload === 'function') {
      this.config = payload(this.config);
    } else {
      this.config = mergeFormOptions(this.config, payload);
    }
  }

  // 返回tree的操作方法
  public getActions() {
    return Object.fromEntries(map(actionKey => {
      const actionFun = actionCreators[actionKey];
      return [actionKey, (...args) => {
        this.setTree(reducer(this.tree, actionFun(...args)(this.tree, this.config)));
      }];
    }, Object.keys(actionCreators)));
  }

  // 返回tree
  public getTree() {
    return this.tree;
  }

  // 设置tree
  public setTree(data?: RuleBuilder['tree'], option?: { ignore?: boolean }) {
    this.lastTree = this.tree;
    this.tree = data;
    if (option?.ignore) return;
    this.notifyTree();
  }

  // 订阅表单渲染数据的变动
  public subscribeTree(listener: RuleBuilder['treeListeners'][number]) {
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
      onChange && onChange(cloneData, cloneData);
    });
  }
}
