import React from "react";
import { DateWidget, SelectWidget, TextWidget } from "./widgets";

export default {
  conjunctions: {
    and: {
      label: "And",
    },
    or: {
      label: "Or",
    },
  },
  operators: {
    "===": {
      label: "Equals",
    },
    "!==": {
      label: "Not Equals",
    },
    ">": {
      label: "greater than",
    },
    ">=": {
      label: "greater than or equal",
    },
    "<": {
      label: "less than",
    },
    "<=": {
      label: "less than or equal",
    },
    contains: {
      label: "Contains",
    },
    startsWith: {
      label: "Starts with",
    },
    endsWith: {
      label: "Ends with",
    },
    includes: {
      label: "includes",
    },
  },
  widgets: {
    text: {
      factory: (props) => <TextWidget {...props} />,
    },
    select: {
      factory: (props) => <SelectWidget {...props} />,
    },
    date: {
      factory: (props) => <DateWidget {...props} />,
    },
  },
  settings: {
    maxNesting: 0,
    addGroup: { text: "添加组" },
    addRule: { text: "添加规则" },
    deleteGroup: { text: "删除" },
    deleteRule: { text: "删除" },
  },
};
