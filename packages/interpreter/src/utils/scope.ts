import ScopeConstructor from "src/constructor/Scope";
import Context from "../Context";
import { isStrict } from "./node";

const createScope = (node?, parentScope: null | ScopeConstructor = null) => {
  const strict = isStrict(node, parentScope);
  const object = new Context.Object(null);
  const scope = new Context.Scope(parentScope, strict, object);
  return scope;
};

/**
* Create a new special scope dictionary, but
* doesn't assume that the scope is for a function body.
* This is used for 'catch' clauses, 'with' statements,
* and named function expressions.
*/
const createSpecialScope = (parentScope, opt_object?) => {
  if (!parentScope) {
    throw Error('parentScope required');
  }
  const object = opt_object || new Context.Object(null);
  return new Context.Scope(parentScope, parentScope.strict, object);
};

export {
  createScope,
  createSpecialScope
};
