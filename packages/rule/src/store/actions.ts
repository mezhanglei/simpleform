import {
  addItem,
  removeItem,
  setProperties,
  getProperties,
} from "../utils/utils";

// 更新state的action
export const actionCreators = {
  setTree: (tree) => ({
    tree: tree,
  }),
  addRule: (path, properties) => ({
    path,
    properties,
  }),
  removeRule: (path) => ({
    path,
  }),
  addGroup: (path, properties) => ({
    path,
    properties,
    children: [],
  }),
  removeGroup: (path) => ({
    path,
  }),
  setProperties: (path, data) => ({
    path,
    data,
  }),
  getProperties: (path) => ({
    path,
  }),
};

export default (state, config, actionName, payload) => {
  switch (actionName) {
    case "setTree":
      return payload.tree;

    case "addGroup":
      return addItem(state, "group", payload.path, payload.properties, config);

    case "removeGroup":
      return removeItem(state, payload.path);

    case "addRule":
      return addItem(state, "rule", payload.path, payload.properties, config);

    case "removeRule":
      return removeItem(state, payload.path);

    case "setProperties":
      return setProperties(state, payload.path, payload?.data);

    case "getProperties":
      return getProperties(state, payload.path);

    default:
      return state;
  }
};
