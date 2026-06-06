/** 各转换类型积分消耗 */
export const CREDIT_COSTS: Record<string, number> = {
  // 文档转换
  'pdf-to-word': 3,
  'word-to-pdf': 2,
  'pdf-to-excel': 5,
  'excel-to-pdf': 2,
  'pdf-to-ppt': 5,
  'ppt-to-pdf': 2,
  'pdf-to-image': 2,
  'image-to-pdf': 2,
  'markdown-to-pdf': 2,
  'markdown-to-html': 1,

  // 图片转换
  'png-to-jpg': 1,
  'jpg-to-png': 1,
  'png-to-webp': 1,
  'jpg-to-webp': 1,
  'webp-to-png': 1,
  'webp-to-jpg': 1,
  'heic-to-jpg': 1,
  'png-to-ico': 1,

  // 音视频转换
  'video-to-mp4': 5,
  'video-to-avi': 5,
  'video-to-mkv': 5,
  'video-to-mov': 5,
  'video-to-webm': 5,
  'audio-to-mp3': 3,
  'audio-to-wav': 3,
  'audio-to-flac': 3,
  'audio-to-aac': 3,
  'audio-to-ogg': 3,
  'mp4-to-avi': 5,
  'avi-to-mp4': 5,
  'mp4-to-mkv': 5,
  'mp4-to-mov': 5,
  'mp3-to-wav': 3,
  'wav-to-mp3': 3,
  'video-extract-audio': 3,
  'video-trim': 3,
  'audio-trim': 2,

  // 压缩
  'image-compress': 1,
  'video-compress': 5,
  'pdf-compress': 2,

  // 小工具
  'pdf-merge': 2,
  'pdf-split': 2,
  'pdf-watermark': 3,
  // 图片工具
  'image-crop': 1,
  'image-rotate': 1,
  'image-watermark': 2,
  'image-resize': 1,
  // 视频工具
  'video-screenshot': 2,
  'video-to-gif': 3,
};

/** 注册赠送积分 */
export const REGISTER_GIFT_CREDITS = 50;

/** 邀请人奖励积分 */
export const INVITE_REWARD_CREDITS = 20;

/** 被邀请人额外奖励积分 */
export const INVITEE_BONUS_CREDITS = 10;
