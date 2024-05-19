// 转化对象数组为map数据
export interface GetArrMap {
  <T>(arr?: T[], valueKey?: string): Record<string, T>;
  <T>(arr?: T[], valueKey?: string, labelKey?: string): Record<string, T[keyof T]>
}
export const getArrMap = <T>(arr: T[] = [], valueKey?: string, labelKey?: string) => {
  const data = {};
  arr.forEach((item) => item && item[valueKey || ''] !== undefined && (data[item?.[valueKey || '']] = labelKey ? item[labelKey] : item));
  return data as Record<string, T>;
};
