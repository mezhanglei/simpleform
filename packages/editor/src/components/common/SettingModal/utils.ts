import { convertToString, evalString } from '../../../utils/string';
import { AssembleType, RuleSettingItem } from ".";

// 字符串转化为规则列表
export const codeToRule = (codeStr?: string) => {
  if (typeof codeStr !== 'string' || !codeStr) return [];
  let result: RuleSettingItem[] = [];
  // 将字符串转换为RuleData
  const handleStr = (str: string) => {
    if (typeof str !== 'string') return;
    const matchStrWithBracket = str.match(/\((\S*.*?\s*)\)/)?.[0]; // 匹配目标
    const matchStr = str.match(/\((\S*.*?\s*)\)/)?.[1]; // 匹配目标(不带括号)
    if (matchStr) {
      const matchAssemble = str.match(/^\|\||^\&\&/)?.[0] as AssembleType; // 匹配assemble符号
      const item = matchStr?.split('?');
      const code = item[0];
      const valueStr = matchStr.match(/(?<=\?).*(?=:)/)?.[0] as string;
      const value = evalString(valueStr);
      result.push({ assemble: matchAssemble, code, value });
      // 剩余的字符串继续处理
      if (matchStrWithBracket) {
        const restStr = str?.replace(matchStrWithBracket, '');
        handleStr(restStr);
      }
    }
  };
  const removedBracket = codeStr?.replace(/\{\{|\}\}/g, '');
  handleStr(removedBracket);
  return result;
};

// 规则列表转化为字符串
export const ruleToCodeStr = (data?: RuleSettingItem[]) => {
  let codeStr = data?.reduce((preStr, current) => {
    const assembleStr = current?.assemble || "";
    const conditionStr = current?.code || "";
    const controlValue = current?.value;
    const currentStr = conditionStr ? `(${conditionStr} ? ${convertToString(controlValue)} : undefined)` : "";
    return preStr + assembleStr + currentStr;
  }, "");
  codeStr = codeStr ? `{{${codeStr}}}` : "";
  return codeStr;
};
