import { Constants } from "../constants";
import { ObjectConstructor } from "../constructor";

export function isFunction(val) {
  if (val instanceof ObjectConstructor) {
    return val.properties.name === Constants.GLOBAL_TYPE.Function;
  }
}
export function isObject(val) {
  if (val instanceof ObjectConstructor) {
    return val.properties.name === Constants.GLOBAL_TYPE.Function;
  }
}
export function isArray(val) {
  if (val instanceof ObjectConstructor) {
    return val.properties.name === Constants.GLOBAL_TYPE.Function;
  }
}
export function isString(val) {
  if (val instanceof ObjectConstructor) {
    return val.properties.name === Constants.GLOBAL_TYPE.Function;
  }
}
export function isBoolean(val) {
  if (val instanceof ObjectConstructor) {
    return val.properties.name === Constants.GLOBAL_TYPE.Function;
  }
}
export function isNumber(val) {
  if (val instanceof ObjectConstructor) {
    return val.properties.name === Constants.GLOBAL_TYPE.Function;
  }
}
export function isDate(val) {
  if (val instanceof ObjectConstructor) {
    return val.properties.name === Constants.GLOBAL_TYPE.Function;
  }
}
export function isRegExp(val) {
  if (val instanceof ObjectConstructor) {
    return val.properties.name === Constants.GLOBAL_TYPE.Function;
  }
}
export function isError(val) {
  if (val instanceof ObjectConstructor) {
    return val.properties.name === Constants.GLOBAL_TYPE.Function;
  }
}
export function isMath(val) {
  if (val instanceof ObjectConstructor) {
    return val.properties.name === Constants.GLOBAL_TYPE.Function;
  }
}
export function isJSON(val) {
  if (val instanceof ObjectConstructor) {
    return val.properties.name === Constants.GLOBAL_TYPE.Function;
  }
};
