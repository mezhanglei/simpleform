
/**
 * 常用mime和文件后缀的映射map
 */
import { isBase64 } from './type';

// 从base64字符串中提取扩展名
export function getExtensionFromBase64(base64?: string) {
  if (typeof base64 !== 'string') return '';
  const matchRes = new RegExp('data:\\S+/(?<ext>.*?);base64,.*');
  const res = matchRes.exec(base64);
  return res && res.groups ? res.groups.ext : '';
}

// 提取字符串中的后缀名， 例如：csv或者doc
export const getUrlSuffix = (url?: string) => {
  if (typeof url !== 'string') return '';
  if (isBase64(url)) {
    return getExtensionFromBase64(url);
  }
  const filename = url.substring(url.lastIndexOf('/') + 1);
  const suffix = filename ? filename.split('.').pop() : '';
  return suffix || '';
};

// 文档的mime映射
export const DOC_MIME = {
  "csv": "text/csv",
  "doc": "application/msword",
  "dot": "application/msword",
  "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "dotx": "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
  "docm": "application/vnd.ms-word.document.macroEnabled.12",
  "dotm": "application/vnd.ms-word.template.macroEnabled.12",
  "xls": "application/vnd.ms-excel",
  "xlt": "application/vnd.ms-excel",
  "xla": "application/vnd.ms-excel",
  "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "xltx": "application/vnd.openxmlformats-officedocument.spreadsheetml.template",
  "xlsm": "application/vnd.ms-excel.sheet.macroEnabled.12",
  "xltm": "application/vnd.ms-excel.template.macroEnabled.12",
  "xlam": "application/vnd.ms-excel.addin.macroEnabled.12",
  "xlsb": "application/vnd.ms-excel.sheet.binary.macroEnabled.12",
  "pdf": "application/pdf",
  "ppt": "application/vnd.ms-powerpoint",
  "pot": "application/vnd.ms-powerpoint",
  "pps": "application/vnd.ms-powerpoint",
  "ppa": "application/vnd.ms-powerpoint",
  "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "potx": "application/vnd.openxmlformats-officedocument.presentationml.template",
  "ppsx": "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
  "ppam": "application/vnd.ms-powerpoint.addin.macroEnabled.12",
  "pptm": "application/vnd.ms-powerpoint.presentation.macroEnabled.12",
  "potm": "application/vnd.ms-powerpoint.presentation.macroEnabled.12",
  "ppsm": "application/vnd.ms-powerpoint.slideshow.macroEnabled.12",
  "rar": "application/x-rar-compressed",
  "zip": "application/zip",
  "gz": "application/gzip",
  "tar": "application/x-tar",
};
export const DOC_MIME_KEYS = Object.keys(DOC_MIME);
export const DOC_MIME_VALUES = Object.values(DOC_MIME);

// 是否为文档文件
export const isDocFile = (file?: File) => {
  if (!file) return;
  const filetype = file.type;
  const joinTypes = DOC_MIME_VALUES.join(';');
  return joinTypes.indexOf(filetype) > -1;
};

// 常用的照片的mime映射表
export const IMAGE_MIME = {
  "gif": "image/gif",
  "jpeg": "image/jpeg",
  "jpg": "image/jpg",
  "png": "image/png",
  "webp": "image/webp",
  "bmp": "image/bmp;image/x-ms-bmp",
};
export const IMAGE_MIME_KEYS = Object.keys(IMAGE_MIME);
export const IMAGE_MIME_VALUES = Object.values(IMAGE_MIME);

// 是否为图片链接
export const isImageUrl = (url?: string) => {
  if (typeof url != 'string') return;
  const fileExtension = getUrlSuffix(url);
  return IMAGE_MIME_KEYS.includes(fileExtension);
};

// 是否为图片文件
export const isImageFile = (file?: File) => {
  if (!file) return;
  const filetype = file.type;
  const joinTypes = IMAGE_MIME_VALUES.join(';');
  return joinTypes.indexOf(filetype) > -1;
};

// 是否为图片文件或路径
export const isImageFileOrUrl = (data: string | File) => {
  if (typeof data === 'string') {
    return isImageUrl(data);
  }
  return isImageFile(data);
};

// 常用的视频的mime映射
export const VIDEO_MIME = {
  "avi": "video/x-msvideo",
  "mkv": "video/x-matroska",
  "wmv": "video/x-ms-wmv",
  "mpeg": "video/mpeg",
  "rm": "application/vnd.rn-realmedia",
  "rmvb": "application/vnd.rn-realmedia-vbr",
  "mp4": "video/mp4",
  "mp4v": "video/mp4",
  "mpg4": "video/mp4",
  "3gp": "video/3gpp",
  "mov": "video/quicktime",
  "m4v": "video/x-m4v",
  "ogv": "video/ogg",
  "webm": "video/webm"
};
export const VIDEO_MIME_KEYS = Object.keys(VIDEO_MIME);
export const VIDEO_MIME_VALUES = Object.values(VIDEO_MIME);

// 是否为视频链接
export const isVideoUrl = (url?: string) => {
  if (typeof url !== 'string') return;
  const fileExtension = getUrlSuffix(url);
  return VIDEO_MIME_KEYS.includes(fileExtension);
};

// 是否为视频文件
export const isVideoFile = (file: File) => {
  if (!file) return;
  const filetype = file.type;
  const joinTypes = VIDEO_MIME_VALUES.join(';');
  return joinTypes.indexOf(filetype) > -1;
};

// 是否为视频文件或路径
export const isVideoFileOrUrl = (data: string | File) => {
  if (typeof data === 'string') {
    return isVideoUrl(data);
  }
  return isVideoFile(data);
};

// 汇总所有的文件格式映射
export const FILE_MIME = { ...DOC_MIME, ...IMAGE_MIME, ...VIDEO_MIME };
export const FILE_MIME_KEYS = Object.keys(FILE_MIME);
export const FILE_MIME_VALUES = Object.values(FILE_MIME);
