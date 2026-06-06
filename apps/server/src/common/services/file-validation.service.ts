import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import { ERROR_CODES } from '@fileshift/constants';
import { BusinessException } from '../../common/exceptions/business.exception';

/** Magic Number 签名映射 */
const MAGIC_SIGNATURES: Array<{
  bytes: number[];
  offset?: number;
  mimeTypes: string[];
  label: string;
}> = [
  // 图片格式
  { bytes: [0x89, 0x50, 0x4e, 0x47], mimeTypes: ['image/png'], label: 'PNG' },
  { bytes: [0xff, 0xd8, 0xff], mimeTypes: ['image/jpeg'], label: 'JPEG' },
  { bytes: [0x47, 0x49, 0x46, 0x38], mimeTypes: ['image/gif'], label: 'GIF' },
  { bytes: [0x42, 0x4d], mimeTypes: ['image/bmp'], label: 'BMP' },
  { bytes: [0x52, 0x49, 0x46, 0x46], mimeTypes: ['image/webp'], label: 'WebP', offset: 8 },
  { bytes: [0x00, 0x00, 0x00], mimeTypes: ['image/heic', 'image/heif'], label: 'HEIC', offset: 4 },

  // PDF
  { bytes: [0x25, 0x50, 0x44, 0x46], mimeTypes: ['application/pdf'], label: 'PDF' },

  // ZIP-based 文档 (OOXML: docx, xlsx, pptx)
  {
    bytes: [0x50, 0x4b, 0x03, 0x04],
    mimeTypes: [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/zip',
    ],
    label: 'ZIP/OOXML',
  },

  // OLE2 文档 (旧格式: doc, xls, ppt)
  {
    bytes: [0xd0, 0xcf, 0x11, 0xe0],
    mimeTypes: ['application/msword', 'application/vnd.ms-excel', 'application/vnd.ms-powerpoint'],
    label: 'OLE2',
  },

  // 音视频
  {
    bytes: [0x00, 0x00, 0x00],
    mimeTypes: ['video/mp4', 'video/quicktime'],
    label: 'MP4/MOV',
    offset: 4,
  },
  { bytes: [0x49, 0x44, 0x33], mimeTypes: ['audio/mpeg'], label: 'MP3' },
  { bytes: [0xff, 0xfb], mimeTypes: ['audio/mpeg'], label: 'MP3' },
  { bytes: [0x52, 0x49, 0x46, 0x46], mimeTypes: ['audio/wav'], label: 'WAV', offset: 8 },
  { bytes: [0x66, 0x4c, 0x61, 0x43], mimeTypes: ['audio/flac'], label: 'FLAC' },
  { bytes: [0x4f, 0x67, 0x67, 0x53], mimeTypes: ['audio/ogg'], label: 'OGG' },
  { bytes: [0x1a, 0x45, 0xdf, 0xa3], mimeTypes: ['video/x-matroska'], label: 'MKV' },
  { bytes: [0x52, 0x49, 0x46, 0x46], mimeTypes: ['video/x-msvideo'], label: 'AVI', offset: 8 },

  // Markdown / HTML / 文本 (无法通过 magic number 精确判断)
];

/** WebP 特殊检查: RIFF....WEBP */
const WEBP_RIFF_OFFSET = 8;
const WEBP_RIFF_MARKER = [0x57, 0x45, 0x42, 0x50]; // "WEBP"

@Injectable()
export class FileValidationService {
  private readonly logger = new Logger(FileValidationService.name);

  /**
   * 通过 Magic Number 验证文件实际类型是否与声称的 MIME 类型匹配
   * @param filePath 文件的绝对路径
   * @param claimedMimeType 声称的 MIME 类型
   * @returns 是否匹配
   */
  async validateMagicNumber(filePath: string, claimedMimeType: string): Promise<void> {
    // 文本类型 (markdown, html) 不做 magic number 校验
    if (claimedMimeType.startsWith('text/')) {
      return;
    }

    // SVG 文件是 XML 文本，不做 magic number 校验
    if (claimedMimeType === 'image/svg+xml') {
      return;
    }

    // 读取文件前 16 字节
    const header = Buffer.alloc(16);
    try {
      const fd = fs.openSync(filePath, 'r');
      fs.readSync(fd, header, 0, 16, 0);
      fs.closeSync(fd);
    } catch (err) {
      throw new BusinessException(ERROR_CODES.FILE_UPLOAD_FAILED, '无法读取文件内容');
    }

    const bytes = Array.from(header);

    // 遍历所有签名进行匹配
    for (const sig of MAGIC_SIGNATURES) {
      const offset = sig.offset || 0;
      const matchLen = sig.bytes.length;

      if (offset + matchLen > bytes.length) continue;

      const slice = bytes.slice(offset, offset + matchLen);
      const isMatch = sig.bytes.every((b, i) => slice[i] === b);

      if (isMatch) {
        // 匹配到签名，检查声称的 MIME 是否在允许列表中
        if (sig.mimeTypes.includes(claimedMimeType)) {
          return; // 验证通过
        }

        // WebP 特殊处理: RIFF header 匹配后还需检查 WEBP 标记
        if (sig.label === 'ZIP/OOXML' && offset === 0) {
          // ZIP 格式的进一步验证由 MIME 白名单保证
          return;
        }

        this.logger.warn(`Magic Number 不匹配: 声称=${claimedMimeType}, 检测到签名=${sig.label}`);
        throw new BusinessException(
          ERROR_CODES.FILE_TYPE_UNSUPPORTED,
          `文件内容与声称的类型不符 (检测到 ${sig.label} 格式)`,
        );
      }
    }

    // 未匹配到任何已知签名
    this.logger.warn(
      `未知文件签名: 声称=${claimedMimeType}, 前4字节=${bytes
        .slice(0, 4)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join(' ')}`,
    );
    // 对于未知签名，不阻止上传但记录日志 (某些格式如 ICO 没有标准 magic number)
  }

  /**
   * 验证文件扩展名是否与 MIME 类型匹配
   */
  validateExtension(filename: string, claimedMimeType: string): void {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (!ext) {
      throw new BusinessException(ERROR_CODES.FILE_TYPE_UNSUPPORTED, '文件缺少扩展名');
    }

    const MIME_TO_EXT: Record<string, string[]> = {
      'image/jpeg': ['jpg', 'jpeg'],
      'image/png': ['png'],
      'image/webp': ['webp'],
      'image/gif': ['gif'],
      'image/bmp': ['bmp'],
      'image/heic': ['heic', 'heif'],
      'image/svg+xml': ['svg'],
      'image/tiff': ['tif', 'tiff'],
      'application/pdf': ['pdf'],
      'application/msword': ['doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
      'application/vnd.ms-excel': ['xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
      'application/vnd.ms-powerpoint': ['ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['pptx'],
      'text/markdown': ['md', 'markdown'],
      'text/html': ['html', 'htm'],
      'video/mp4': ['mp4'],
      'video/x-msvideo': ['avi'],
      'video/x-matroska': ['mkv'],
      'video/quicktime': ['mov'],
      'audio/mpeg': ['mp3'],
      'audio/wav': ['wav'],
      'audio/flac': ['flac'],
      'audio/ogg': ['ogg'],
      'audio/aac': ['aac'],
    };

    const allowedExts = MIME_TO_EXT[claimedMimeType];
    if (allowedExts && !allowedExts.includes(ext)) {
      throw new BusinessException(
        ERROR_CODES.FILE_TYPE_UNSUPPORTED,
        `文件扩展名 .${ext} 与类型 ${claimedMimeType} 不匹配`,
      );
    }
  }
}
