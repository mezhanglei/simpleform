import { assignProperty } from "./object";
import * as acorn from 'acorn';

const stripLocations_ = function (node, start, end) {
  if (!node) return;
  if (start) {
    node.start = start;
  } else {
    delete node.start;
  }
  if (end) {
    node.end = end;
  } else {
    delete node.end;
  }
  for (let name in node) {
    if (node[name] !== node.loc && node.hasOwnProperty(name)) {
      const prop = node[name];
      if (prop && typeof prop === 'object') {
        stripLocations_(/** @type {!Object} */(prop), start, end);
      }
    }
  }
};

// 遍历返回ast节点的声明标识符（变量/函数）
function traverseAstDeclar(node, callback) {
  let variableCache;
  if (!node.variableCache_) {
    variableCache = Object.create(null);
    switch (node.type) {
      case 'VariableDeclaration':
        for (let i = 0; i < node.declarations.length; i++) {
          variableCache[node.declarations[i].id.name] = true;
        }
        break;
      case 'FunctionDeclaration':
        variableCache[node.id.name] = node;
        break;
      case 'BlockStatement':
      case 'CatchClause':
      case 'DoWhileStatement':
      case 'ForInStatement':
      case 'ForStatement':
      case 'IfStatement':
      case 'LabeledStatement':
      case 'Program':
      case 'SwitchCase':
      case 'SwitchStatement':
      case 'TryStatement':
      case 'WithStatement':
      case 'WhileStatement':
        // 节点构造函数
        const nodeClass = node.constructor;
        for (const name in node) {
          if (name === 'loc') continue; // 忽略位置节点信息
          const prop = node[name];
          if (prop && typeof prop === 'object') {
            let childCache;
            if (Array.isArray(prop)) {
              for (let i = 0; i < prop.length; i++) {
                // 找到变量所在节点
                if (prop[i] && prop[i].constructor === nodeClass) {
                  childCache = traverseAstDeclar(prop[i], callback);
                  for (const name in childCache) {
                    variableCache[name] = childCache[name];
                  }
                }
              }
            } else {
              // 变量声明节点
              if (prop.constructor === nodeClass) {
                childCache = traverseAstDeclar(prop, callback);
                for (const name in childCache) {
                  variableCache[name] = childCache[name];
                }
              }
            }
          }
        }
    }
    node.variableCache_ = variableCache;
  } else {
    variableCache = node.variableCache_;
  }
  callback?.(variableCache);
  return variableCache;
}

// 克隆ast节点
function cloneASTNode(ast) {
  if (!ast) return;
  const nodeConstructor = ast.constructor;
  const newNode = new nodeConstructor({ 'options': {} });
  return assignProperty(newNode, ast) as acorn.Program;
}

// 遍历所有的step开头的函数
function getStepFunctions(Factory, instance) {
  const data = Object.create(null);
  const attrs = Object.getOwnPropertyDescriptors(Factory.prototype);
  for (const methodName in attrs) {
    const methodFun = instance[methodName];
    const m = methodName.match(/^step([A-Z]\w*)$/);
    if (typeof methodFun === 'function' && m) {
      data[m[1]] = instance[methodName].bind(instance);
    }
  }
  return data;
}

// 判断一个ast树是否为严格模式
function isStrict(node, parentScope?) {
  var strict = false;
  if (parentScope && parentScope.strict) {
    strict = true;
  } else {
    var firstNode = node?.body && node.body[0];
    if (firstNode && firstNode.expression &&
      firstNode.expression.type === 'Literal' &&
      firstNode.expression.value === 'use strict') {
      strict = true;
    }
  }
  return strict;
}

function parse_(code, sourceFile, options?: acorn.Options) {
  const curOptions = assignProperty<acorn.Options>({}, options, { sourceFile });
  return typeof code === 'string' ? acorn.parse(code, curOptions) : cloneASTNode(code);
}

function createNode(options: acorn.Options) {
  const ast = parse_('', 'code', options);
  const NodeConstructor = ast?.constructor as any;
  return new NodeConstructor({ 'options': {} });
};

export {
  traverseAstDeclar,
  stripLocations_,
  cloneASTNode,
  getStepFunctions,
  isStrict,
  parse_,
  createNode,
};
