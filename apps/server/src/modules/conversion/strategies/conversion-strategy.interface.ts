/** 转换策略接口 */
export interface ConversionStrategy {
  /** 是否支持该转换类型 */
  supports(conversionType: string): boolean;

  /** 执行转换，返回输出文件路径 */
  convert(input: ConversionInput): Promise<ConversionOutput>;
}

export interface ConversionInput {
  /** 输入文件绝对路径 */
  inputPath: string;
  /** 输入文件绝对路径数组 (多文件操作如 PDF 合并) */
  inputPaths?: string[];
  /** 输入文件 MIME 类型 */
  inputMimeType: string;
  /** 转换类型 (如 png-to-jpg) */
  conversionType: string;
  /** 输出目录 */
  outputDir: string;
  /** 用户原始文件名 (用于生成输出文件名) */
  originalName?: string;
  /** 可选参数 */
  options?: Record<string, unknown>;
}

export interface ConversionOutput {
  /** 输出文件绝对路径 */
  outputPath: string;
  /** 输出文件 MIME 类型 */
  outputMimeType: string;
  /** 输出文件大小 (字节) */
  outputFileSize: number;
  /** 输出文件名 */
  outputFileName: string;
}

import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

/**
 * 根据原始文件名和目标扩展名生成输出文件名
 * 如原始文件名为 "photo.png"，目标扩展名为 ".jpg"，则输出 "photo.jpg"
 * 如果没有原始文件名，则使用 UUID
 */
export function generateOutputFileName(ext: string, originalName?: string): string {
  if (originalName) {
    const baseName = path.basename(originalName, path.extname(originalName));
    // 移除可能导致文件名不安全的字符，保留中文、英文、数字、空格、下划线、连字符
    const safeName = baseName.replace(/[\\/:*?"<>|]/g, '_');
    return `${safeName}${ext}`;
  }
  return `${uuidv4()}${ext}`;
}
