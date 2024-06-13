import { convertToString, evalString } from "../../../utils/string";
import { RuleSettingItem } from "./modal";

export const codeToRule = (codeStr?: string) => {
  if (typeof codeStr !== 'string' || !codeStr) return [];
  const codeArr = codeStr?.replace(/\{\{|\}\}/g, '').split(/\s*\(|\)\s*/).filter(Boolean);
  return codeArr.map((item) => {
    const code = item.trim();
    if (['||', '&&'].includes(code)) return code;
    return code.split(/\s*\?|\:\s*/).map((codeItem, index) => index === 0 ? codeItem : evalString(codeItem));
  }) as Array<RuleSettingItem>;
};

const codeJoinLetter = (codeArr?: RuleSettingItem) => {
  if (!(codeArr instanceof Array)) return codeArr;
  const list = [codeArr[0], codeArr[1], codeArr[2]];
  const convertList = list.map((item) => {
    return typeof item === 'string' ? item : convertToString(item) as string;
  });
  return convertList.reduce((prev, curr, index) => {
    if (index === 0) {
      return prev.replace('{0}', curr);
    } else if (index === 1) {
      return prev.replace('{1}', curr);
    } else {
      return prev.replace('{2}', curr);
    }
  }, '({0}?{1}:{2})');
};

export const ruleToCodeStr = (rules?: Array<RuleSettingItem>) => {
  if (!(rules instanceof Array)) return;
  const codeStr = rules.reduce<string>((preStr, current) => {
    const curStr = current instanceof Array ? codeJoinLetter(current) : current;
    return preStr + (curStr || '');
  }, "");
  return codeStr ? `{{${codeStr}}}` : "";
};
