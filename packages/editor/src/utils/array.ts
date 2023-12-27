// 转化对象数组为map数据
export const getArrMap = <T = any>(arr: T[] = [], valueKey?: string, labelKey?: string) => {
  const data: { [key: string]: T } = {};
  // @ts-ignore
  arr.forEach((item, index) => item && item[valueKey || ''] !== undefined && (data[item?.[valueKey || '']] = labelKey ? item[labelKey] : item));
  return data;
};
