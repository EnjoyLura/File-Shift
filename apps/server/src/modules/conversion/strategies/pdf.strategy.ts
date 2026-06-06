import { Injectable, Logger } from '@nestjs/common';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import * as path from 'path';
import * as fs from 'fs';
import {
  ConversionStrategy,
  ConversionInput,
  ConversionOutput,
  generateOutputFileName,
} from './conversion-strategy.interface';

/** PDF 策略支持的转换类型 */
const PDF_TYPES = ['pdf-merge', 'pdf-split', 'pdf-watermark', 'pdf-compress'];

const OUTPUT_MIME = 'application/pdf';

@Injectable()
export class PdfStrategy implements ConversionStrategy {
  private readonly logger = new Logger(PdfStrategy.name);

  supports(conversionType: string): boolean {
    return PDF_TYPES.includes(conversionType);
  }

  async convert(input: ConversionInput): Promise<ConversionOutput> {
    const { conversionType, outputDir, originalName } = input;

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    switch (conversionType) {
      case 'pdf-merge':
        return this.merge(input.inputPaths || [], outputDir, originalName);
      case 'pdf-split':
        return this.split(input.inputPath, outputDir, originalName, input.options);
      case 'pdf-watermark':
        return this.addWatermark(input.inputPath, outputDir, originalName, input.options);
      case 'pdf-compress':
        return this.compress(input.inputPath, outputDir, originalName);
      default:
        throw new Error(`不支持的 PDF 操作: ${conversionType}`);
    }
  }

  /** 合并多个 PDF */
  private async merge(
    inputPaths: string[],
    outputDir: string,
    originalName?: string,
  ): Promise<ConversionOutput> {
    if (!inputPaths || inputPaths.length < 2) {
      throw new Error('PDF 合并至少需要 2 个文件');
    }

    const mergedPdf = await PDFDocument.create();

    for (const pdfPath of inputPaths) {
      if (!fs.existsSync(pdfPath)) {
        throw new Error(`输入文件不存在: ${pdfPath}`);
      }
      const pdfBytes = fs.readFileSync(pdfPath);
      const srcPdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
      const pages = await mergedPdf.copyPages(srcPdf, srcPdf.getPageIndices());
      pages.forEach((page) => mergedPdf.addPage(page));
    }

    const outputFileName = generateOutputFileName('.pdf', originalName);
    const outputPath = path.join(outputDir, outputFileName);
    const pdfBytes = await mergedPdf.save();
    fs.writeFileSync(outputPath, pdfBytes);

    this.logger.log(`PDF 合并完成: ${inputPaths.length} 个文件 → ${outputFileName}`);
    return {
      outputPath,
      outputMimeType: OUTPUT_MIME,
      outputFileSize: pdfBytes.length,
      outputFileName,
    };
  }

  /** 拆分 PDF (按页码范围) */
  private async split(
    inputPath: string,
    outputDir: string,
    originalName?: string,
    options?: Record<string, unknown>,
  ): Promise<ConversionOutput> {
    if (!fs.existsSync(inputPath)) {
      throw new Error(`输入文件不存在: ${inputPath}`);
    }

    const pdfBytes = fs.readFileSync(inputPath);
    const srcPdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const totalPages = srcPdf.getPageCount();

    // 解析页码范围，如 "1-3,5,7-9"
    const pageRangeStr = (options?.pageRange as string) || `1-${totalPages}`;
    const pageIndices = this.parsePageRange(pageRangeStr, totalPages);

    if (pageIndices.length === 0) {
      throw new Error('未选择任何页面');
    }

    const newPdf = await PDFDocument.create();
    const pages = await newPdf.copyPages(srcPdf, pageIndices);
    pages.forEach((page) => newPdf.addPage(page));

    const outputBytes = await newPdf.save();
    const outputFileName = generateOutputFileName('.pdf', originalName);
    const outputPath = path.join(outputDir, outputFileName);
    fs.writeFileSync(outputPath, outputBytes);

    this.logger.log(`PDF 拆分完成: 提取 ${pageIndices.length}/${totalPages} 页`);
    return {
      outputPath,
      outputMimeType: OUTPUT_MIME,
      outputFileSize: outputBytes.length,
      outputFileName,
    };
  }

  /** PDF 水印 */
  private async addWatermark(
    inputPath: string,
    outputDir: string,
    originalName?: string,
    options?: Record<string, unknown>,
  ): Promise<ConversionOutput> {
    if (!fs.existsSync(inputPath)) {
      throw new Error(`输入文件不存在: ${inputPath}`);
    }

    const text = (options?.text as string) || 'FileShift';
    const opacity = (options?.opacity as number) || 0.15;
    const fontSize = (options?.fontSize as number) || 60;

    const pdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const pages = pdfDoc.getPages();
    for (const page of pages) {
      const { width, height } = page.getSize();
      const textWidth = font.widthOfTextAtSize(text, fontSize);
      const x = (width - textWidth) / 2;
      const y = height / 2;

      page.drawText(text, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(0.5, 0.5, 0.5),
        opacity,
        rotate: degrees(-45),
      });
    }

    const outputBytes = await pdfDoc.save();
    const outputFileName = generateOutputFileName('.pdf', originalName);
    const outputPath = path.join(outputDir, outputFileName);
    fs.writeFileSync(outputPath, outputBytes);

    this.logger.log(`PDF 水印完成: ${outputFileName}`);
    return {
      outputPath,
      outputMimeType: OUTPUT_MIME,
      outputFileSize: outputBytes.length,
      outputFileName,
    };
  }

  /** PDF 压缩 (优化对象引用) */
  private async compress(
    inputPath: string,
    outputDir: string,
    originalName?: string,
  ): Promise<ConversionOutput> {
    if (!fs.existsSync(inputPath)) {
      throw new Error(`输入文件不存在: ${inputPath}`);
    }

    const pdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

    // pdf-lib 的 save 本身会做一些优化
    // 配合 useObjectStreams 进一步压缩
    const outputBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });

    const outputFileName = generateOutputFileName('.pdf', originalName);
    const outputPath = path.join(outputDir, outputFileName);
    fs.writeFileSync(outputPath, outputBytes);

    const compressionRatio = ((1 - outputBytes.length / pdfBytes.length) * 100).toFixed(1);
    this.logger.log(`PDF 压缩完成: 压缩率 ${compressionRatio}%`);
    return {
      outputPath,
      outputMimeType: OUTPUT_MIME,
      outputFileSize: outputBytes.length,
      outputFileName,
    };
  }

  /** 解析页码范围字符串，返回 0-based 页码数组 */
  private parsePageRange(rangeStr: string, totalPages: number): number[] {
    const indices: Set<number> = new Set();

    const parts = rangeStr.split(',').map((s) => s.trim());
    for (const part of parts) {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-');
        const start = Math.max(1, parseInt(startStr, 10) || 1);
        const end = Math.min(totalPages, parseInt(endStr, 10) || totalPages);
        for (let i = start; i <= end; i++) {
          indices.add(i - 1); // 转为 0-based
        }
      } else {
        const page = parseInt(part, 10);
        if (page >= 1 && page <= totalPages) {
          indices.add(page - 1);
        }
      }
    }

    return Array.from(indices).sort((a, b) => a - b);
  }
}
