/** 支持的文件 MIME 类型白名单 */
export const SUPPORTED_MIME_TYPES = {
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/markdown',
    'text/html',
  ],
  image: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/bmp',
    'image/tiff',
    'image/svg+xml',
    'image/heic',
    'image/x-icon',
  ],
  media: [
    'video/mp4',
    'video/x-msvideo',
    'video/x-matroska',
    'video/quicktime',
    'video/x-flv',
    'audio/mpeg',
    'audio/wav',
    'audio/aac',
    'audio/flac',
    'audio/ogg',
  ],
} as const;

/** 所有支持的 MIME 类型（扁平数组） */
export const ALL_SUPPORTED_MIME_TYPES = [
  ...SUPPORTED_MIME_TYPES.document,
  ...SUPPORTED_MIME_TYPES.image,
  ...SUPPORTED_MIME_TYPES.media,
];

/** 单文件最大尺寸 - 免费用户 20MB */
export const MAX_FILE_SIZE_FREE = 20 * 1024 * 1024;

/** 单文件最大尺寸 - 付费用户 100MB */
export const MAX_FILE_SIZE_PAID = 100 * 1024 * 1024;

/** 转换文件过期时间 - 24小时(ms) */
export const FILE_EXPIRY_MS = 24 * 60 * 60 * 1000;

/** 批量处理最大文件数 */
export const MAX_BATCH_FILES = 20;
