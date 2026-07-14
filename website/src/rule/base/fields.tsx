import fieldOptions from "./fieldOptions";

const fields = ({ properties, config }) => {
  const allOperator = Object.keys(config?.operators || {}).map((key) => {
    const configOperator = config?.operators?.[key];
    return {
      ...configOperator,
      value: key,
    };
  });
  const curField = fieldOptions?.find(
    (item) => properties?.field === item?.value
  );
  const operators =
    allOperator?.filter((item) => curField?.operators?.includes(item?.value)) ||
    [];

  return [
    {
      label: "字段",
      name: "field",
      defaultValue: "name",
      widget: ["select", { options: fieldOptions }],
    },
    {
      label: "操作符",
      name: "operator",
      widget: ["select", { options: operators }],
    },
    {
      name: "value",
      widget: curField?.widget,
    },
  ];
};

export default fields;
