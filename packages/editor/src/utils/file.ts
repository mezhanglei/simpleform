import { saveAs } from 'file-saver';

// 保存文件
export const saveAsFile = (fileContent: string | File, fileName: string) => {
  const fileBlob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
  saveAs(fileBlob, fileName);
};
