const fieldOptions = [
  {
    label: "Name",
    value: "name",
    widget: "text",
    operators: ["===", "contains", "startsWith", "endsWith", "includes"],
  },
  {
    label: "Date",
    value: "date",
    widget: "date",
    operators: ["===", "contains", "startsWith", "endsWith"],
  },
  {
    label: "Color",
    value: "color",
    widget: [
      "select",
      {
        options: [
          {
            label: "Yellow",
            value: "yellow",
          },
          {
            label: "Green",
            value: "green",
          },
          {
            label: "Orange",
            value: "orange",
          },
        ],
      },
    ],
    operators: ["==="],
  },
];

export default fieldOptions;
