import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';
import {
  ConversionStrategy,
  ConversionInput,
  ConversionOutput,
  generateOutputFileName,
} from './conversion-strategy.interface';

const execAsync = promisify(exec);

/** 文档策略支持的转换类型 */
const DOCUMENT_TYPES = [
  'pdf-to-word',
  'word-to-pdf',
  'pdf-to-excel',
  'excel-to-pdf',
  'pdf-to-ppt',
  'ppt-to-pdf',
  'markdown-to-pdf',
];

/** LibreOffice 输出格式参数映射 */
const TYPE_TO_LO_FILTER: Record<string, string> = {
  'pdf-to-word': 'writer_pdf_Export', // 实际是 docx→pdf 的反向，需要特殊处理
  'word-to-pdf': 'writer_pdf_Export',
  'pdf-to-excel': 'calc_pdf_Export',
  'excel-to-pdf': 'calc_pdf_Export',
  'pdf-to-ppt': 'impress_pdf_Export',
  'ppt-to-pdf': 'impress_pdf_Export',
  'markdown-to-pdf': 'writer_pdf_Export',
};

/** 转换类型到输出 MIME 映射 */
const TYPE_TO_OUTPUT_MIME: Record<string, string> = {
  'pdf-to-word': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'word-to-pdf': 'application/pdf',
  'pdf-to-excel': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'excel-to-pdf': 'application/pdf',
  'pdf-to-ppt': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'ppt-to-pdf': 'application/pdf',
  'markdown-to-pdf': 'application/pdf',
};

/** 转换类型到输出扩展名 */
const TYPE_TO_OUTPUT_EXT: Record<string, string> = {
  'pdf-to-word': '.docx',
  'word-to-pdf': '.pdf',
  'pdf-to-excel': '.xlsx',
  'excel-to-pdf': '.pdf',
  'pdf-to-ppt': '.pptx',
  'ppt-to-pdf': '.pdf',
  'markdown-to-pdf': '.pdf',
};

/** LibreOffice 转换超时 (毫秒) */
const LO_TIMEOUT_MS = 120_000;

@Injectable()
export class DocumentStrategy implements ConversionStrategy {
  private readonly logger = new Logger(DocumentStrategy.name);

  supports(conversionType: string): boolean {
    return DOCUMENT_TYPES.includes(conversionType);
  }

  async convert(input: ConversionInput): Promise<ConversionOutput> {
    const { inputPath, conversionType, outputDir, originalName } = input;

    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputExt = TYPE_TO_OUTPUT_EXT[conversionType];
    if (!outputExt) {
      throw new Error(`不支持的文档转换类型: ${conversionType}`);
    }

    // 对于 *-to-pdf 类型，LibreOffice 直接转换
    if (conversionType.endsWith('-to-pdf') || conversionType === 'markdown-to-pdf') {
      return this.convertToPdf(inputPath, outputDir, outputExt, conversionType, originalName);
    }

    // 对于 pdf-to-* 类型，使用 LibreOffice 将 PDF 转为目标格式
    return this.convertFromPdf(inputPath, outputDir, outputExt, conversionType, originalName);
  }

  /** 转换为 PDF */
  private async convertToPdf(
    inputPath: string,
    outputDir: string,
    outputExt: string,
    conversionType: string,
    originalName?: string,
  ): Promise<ConversionOutput> {
    const cmd = [
      'libreoffice',
      '--headless',
      '--convert-to',
      'pdf',
      '--outdir',
      `"${outputDir}"`,
      `"${inputPath}"`,
    ].join(' ');

    this.logger.log(`执行 LibreOffice 转换: ${conversionType}`);
    await execAsync(cmd, { timeout: LO_TIMEOUT_MS });

    // LibreOffice 输出文件名基于输入文件名
    const inputBaseName = path.basename(inputPath, path.extname(inputPath));
    const loOutputPath = path.join(outputDir, `${inputBaseName}.pdf`);

    // 重命名为用户原始文件名
    const outputFileName = generateOutputFileName(outputExt, originalName);
    const outputPath = path.join(outputDir, outputFileName);
    if (fs.existsSync(loOutputPath)) {
      fs.renameSync(loOutputPath, outputPath);
    } else {
      throw new Error(`LibreOffice 未生成输出文件: ${loOutputPath}`);
    }

    const stat = fs.statSync(outputPath);
    this.logger.log(`文档转换完成: ${conversionType} → ${outputFileName} (${stat.size} bytes)`);

    return {
      outputPath,
      outputMimeType: TYPE_TO_OUTPUT_MIME[conversionType],
      outputFileSize: stat.size,
      outputFileName,
    };
  }

  /** 从 PDF 转换为其他格式 */
  private async convertFromPdf(
    inputPath: string,
    outputDir: string,
    outputExt: string,
    conversionType: string,
    originalName?: string,
  ): Promise<ConversionOutput> {
    // LibreOffice 可以将 PDF 导入并导出为其他格式
    // 目标格式名 (去掉 . 前缀)
    const targetFormat = outputExt.slice(1); // docx, xlsx, pptx
    const filter = TYPE_TO_LO_FILTER[conversionType];

    const cmd = [
      'libreoffice',
      '--headless',
      '--convert-to',
      filter ? `${targetFormat}:${filter}` : targetFormat,
      '--outdir',
      `"${outputDir}"`,
      `"${inputPath}"`,
    ].join(' ');

    this.logger.log(`执行 LibreOffice 转换: ${conversionType}`);
    await execAsync(cmd, { timeout: LO_TIMEOUT_MS });

    // LibreOffice 输出文件名基于输入文件名
    const inputBaseName = path.basename(inputPath, path.extname(inputPath));
    const loOutputPath = path.join(outputDir, `${inputBaseName}${outputExt}`);

    // 重命名为用户原始文件名
    const outputFileName = generateOutputFileName(outputExt, originalName);
    const outputPath = path.join(outputDir, outputFileName);
    if (fs.existsSync(loOutputPath)) {
      fs.renameSync(loOutputPath, outputPath);
    } else {
      throw new Error(`LibreOffice 未生成输出文件: ${loOutputPath}`);
    }

    const stat = fs.statSync(outputPath);
    this.logger.log(`文档转换完成: ${conversionType} → ${outputFileName} (${stat.size} bytes)`);

    return {
      outputPath,
      outputMimeType: TYPE_TO_OUTPUT_MIME[conversionType],
      outputFileSize: stat.size,
      outputFileName,
    };
  }
}
