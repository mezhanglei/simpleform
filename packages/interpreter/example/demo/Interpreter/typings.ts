import * as acorn from 'acorn';

export type FactoryPrototype = {
  class: string
}

export type FactoryInstance = {
  getter: FactoryInstance
  setter: unknown
  properties: {
    prototype: FactoryPrototype
  }
  nativeFunc?: Function
  proto: FactoryPrototype
};

export type ScopeInstance = {
  parentScope?: ScopeInstance
  strict: boolean
  object: FactoryInstance
};

export type NodeState = {
  node: acorn.Node
  scope: ScopeInstance
  done?: boolean
  value?: unknown
};

export type TaskInstance = NodeState & {
  functionRef?: object
  argsArray?: unknown
  time?: number
  pid: number
  interval?: number
};
