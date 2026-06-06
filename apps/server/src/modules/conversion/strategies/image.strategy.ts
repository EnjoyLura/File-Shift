import { Injectable, Logger } from '@nestjs/common';
import * as sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';
import {
  ConversionStrategy,
  ConversionInput,
  ConversionOutput,
  generateOutputFileName,
} from './conversion-strategy.interface';

/** 图片策略支持的转换类型 */
const IMAGE_TYPES = [
  'png-to-jpg',
  'jpg-to-png',
  'png-to-webp',
  'jpg-to-webp',
  'webp-to-png',
  'webp-to-jpg',
  'image-compress',
  'image-crop',
  'image-rotate',
  'image-watermark',
  'image-resize',
];

/** 转换类型到输出格式映射 */
const TYPE_TO_FORMAT: Record<string, keyof sharp.FormatEnum> = {
  'png-to-jpg': 'jpeg',
  'jpg-to-png': 'png',
  'png-to-webp': 'webp',
  'jpg-to-webp': 'webp',
  'webp-to-png': 'png',
  'webp-to-jpg': 'jpeg',
};

/** 输出格式到 MIME 映射 */
const FORMAT_TO_MIME: Record<string, string> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

/** 输出格式到扩展名映射 */
const FORMAT_TO_EXT: Record<string, string> = {
  jpeg: '.jpg',
  png: '.png',
  webp: '.webp',
};

@Injectable()
export class ImageStrategy implements ConversionStrategy {
  private readonly logger = new Logger(ImageStrategy.name);

  supports(conversionType: string): boolean {
    return IMAGE_TYPES.includes(conversionType);
  }

  async convert(input: ConversionInput): Promise<ConversionOutput> {
    const { inputPath, conversionType, outputDir, originalName } = input;

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 根据转换类型分派处理
    switch (conversionType) {
      case 'image-crop':
        return this.crop(inputPath, outputDir, originalName, input.options);
      case 'image-rotate':
        return this.rotate(inputPath, outputDir, originalName, input.options);
      case 'image-watermark':
        return this.watermark(inputPath, outputDir, originalName, input.options);
      case 'image-resize':
        return this.resize(inputPath, outputDir, originalName, input.options);
      case 'image-compress':
        return this.compress(inputPath, outputDir, originalName, input.options);
      default:
        return this.formatConvert(
          inputPath,
          outputDir,
          conversionType,
          originalName,
          input.options,
        );
    }
  }

  /** 格式转换 */
  private async formatConvert(
    inputPath: string,
    outputDir: string,
    conversionType: string,
    originalName?: string,
    options?: Record<string, unknown>,
  ): Promise<ConversionOutput> {
    const targetFormat = TYPE_TO_FORMAT[conversionType];
    if (!targetFormat) {
      throw new Error(`不支持的图片转换类型: ${conversionType}`);
    }

    let pipeline = sharp(inputPath).toFormat(targetFormat);
    pipeline = this.applyCompression(pipeline, targetFormat, options);

    const ext = FORMAT_TO_EXT[targetFormat];
    const outputFileName = generateOutputFileName(ext, originalName);
    const outputPath = path.join(outputDir, outputFileName);

    await pipeline.toFile(outputPath);
    const stat = fs.statSync(outputPath);

    this.logger.log(`图片格式转换: ${conversionType} → ${outputFileName}`);
    return {
      outputPath,
      outputMimeType: FORMAT_TO_MIME[targetFormat],
      outputFileSize: stat.size,
      outputFileName,
    };
  }

  /** 图片压缩 */
  private async compress(
    inputPath: string,
    outputDir: string,
    originalName?: string,
    options?: Record<string, unknown>,
  ): Promise<ConversionOutput> {
    let pipeline = sharp(inputPath);
    const metadata = await pipeline.metadata();
    const format = metadata.format || 'jpeg';
    pipeline = this.applyCompression(pipeline, format, options);

    const ext = FORMAT_TO_EXT[format] || '.jpg';
    const outputFileName = generateOutputFileName(ext, originalName);
    const outputPath = path.join(outputDir, outputFileName);

    await pipeline.toFile(outputPath);
    const stat = fs.statSync(outputPath);

    this.logger.log(`图片压缩完成: ${outputFileName} (${stat.size} bytes)`);
    return {
      outputPath,
      outputMimeType: FORMAT_TO_MIME[format] || 'image/jpeg',
      outputFileSize: stat.size,
      outputFileName,
    };
  }

  /** 图片裁剪 */
  private async crop(
    inputPath: string,
    outputDir: string,
    originalName?: string,
    options?: Record<string, unknown>,
  ): Promise<ConversionOutput> {
    const left = (options?.left as number) || 0;
    const top = (options?.top as number) || 0;
    const width = (options?.width as number) || undefined;
    const height = (options?.height as number) || undefined;

    if (!width || !height) {
      throw new Error('裁剪参数缺少 width 或 height');
    }

    const metadata = await sharp(inputPath).metadata();
    const format = metadata.format || 'jpeg';

    const pipeline = sharp(inputPath).extract({
      left,
      top,
      width,
      height,
    });

    const ext = FORMAT_TO_EXT[format] || '.jpg';
    const outputFileName = generateOutputFileName(ext, originalName);
    const outputPath = path.join(outputDir, outputFileName);

    await pipeline.toFile(outputPath);
    const stat = fs.statSync(outputPath);

    this.logger.log(`图片裁剪完成: ${outputFileName} (${width}x${height})`);
    return {
      outputPath,
      outputMimeType: FORMAT_TO_MIME[format] || 'image/jpeg',
      outputFileSize: stat.size,
      outputFileName,
    };
  }

  /** 图片旋转 */
  private async rotate(
    inputPath: string,
    outputDir: string,
    originalName?: string,
    options?: Record<string, unknown>,
  ): Promise<ConversionOutput> {
    const angle = (options?.angle as number) || 0;

    const metadata = await sharp(inputPath).metadata();
    const format = metadata.format || 'jpeg';

    const pipeline = sharp(inputPath).rotate(angle);

    const ext = FORMAT_TO_EXT[format] || '.jpg';
    const outputFileName = generateOutputFileName(ext, originalName);
    const outputPath = path.join(outputDir, outputFileName);

    await pipeline.toFile(outputPath);
    const stat = fs.statSync(outputPath);

    this.logger.log(`图片旋转完成: ${outputFileName} (${angle}°)`);
    return {
      outputPath,
      outputMimeType: FORMAT_TO_MIME[format] || 'image/jpeg',
      outputFileSize: stat.size,
      outputFileName,
    };
  }

  /** 文字水印 */
  private async watermark(
    inputPath: string,
    outputDir: string,
    originalName?: string,
    options?: Record<string, unknown>,
  ): Promise<ConversionOutput> {
    const text = (options?.text as string) || 'FileShift';
    const opacity = (options?.opacity as number) || 0.3;
    const position = (options?.position as string) || 'bottom-right';

    const metadata = await sharp(inputPath).metadata();
    const format = metadata.format || 'jpeg';
    const imgWidth = metadata.width || 800;
    const imgHeight = metadata.height || 600;

    // 根据图片尺寸计算字体大小和水印位置
    const fontSize = Math.max(16, Math.round(imgWidth / 25));
    const padding = Math.round(imgWidth / 20);

    let gravity: string;
    switch (position) {
      case 'top-left':
        gravity = 'northwest';
        break;
      case 'top-right':
        gravity = 'northeast';
        break;
      case 'bottom-left':
        gravity = 'southwest';
        break;
      case 'center':
        gravity = 'center';
        break;
      case 'bottom-right':
      default:
        gravity = 'southeast';
        break;
    }

    // 生成 SVG 水印文字
    const svgText = `
      <svg width="${imgWidth}" height="${imgHeight}">
        <style>
          .watermark { fill: white; font-size: ${fontSize}px; font-family: Arial, sans-serif; opacity: ${opacity}; }
        </style>
        <text
          x="${gravity.includes('west') ? padding : gravity.includes('east') ? imgWidth - padding : imgWidth / 2}"
          y="${gravity.includes('north') ? padding + fontSize : gravity.includes('south') ? imgHeight - padding : imgHeight / 2}"
          text-anchor="${gravity.includes('west') ? 'start' : gravity.includes('east') ? 'end' : 'middle'}"
          class="watermark"
        >${this.escapeXml(text)}</text>
      </svg>
    `;

    const pipeline = sharp(inputPath).composite([
      {
        input: Buffer.from(svgText),
        top: 0,
        left: 0,
      },
    ]);

    const ext = FORMAT_TO_EXT[format] || '.jpg';
    const outputFileName = generateOutputFileName(ext, originalName);
    const outputPath = path.join(outputDir, outputFileName);

    await pipeline.toFile(outputPath);
    const stat = fs.statSync(outputPath);

    this.logger.log(`图片水印完成: ${outputFileName}`);
    return {
      outputPath,
      outputMimeType: FORMAT_TO_MIME[format] || 'image/jpeg',
      outputFileSize: stat.size,
      outputFileName,
    };
  }

  /** 图片缩放 */
  private async resize(
    inputPath: string,
    outputDir: string,
    originalName?: string,
    options?: Record<string, unknown>,
  ): Promise<ConversionOutput> {
    const width = (options?.width as number) || undefined;
    const height = (options?.height as number) || undefined;
    const fit = (options?.fit as keyof sharp.FitEnum) || 'inside';

    const metadata = await sharp(inputPath).metadata();
    const format = metadata.format || 'jpeg';

    const pipeline = sharp(inputPath).resize({ width, height, fit, withoutEnlargement: true });

    const ext = FORMAT_TO_EXT[format] || '.jpg';
    const outputFileName = generateOutputFileName(ext, originalName);
    const outputPath = path.join(outputDir, outputFileName);

    await pipeline.toFile(outputPath);
    const stat = fs.statSync(outputPath);

    this.logger.log(`图片缩放完成: ${outputFileName} (${width}x${height})`);
    return {
      outputPath,
      outputMimeType: FORMAT_TO_MIME[format] || 'image/jpeg',
      outputFileSize: stat.size,
      outputFileName,
    };
  }

  /** 转义 XML 特殊字符 */
  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /** 应用压缩参数 */
  private applyCompression(
    pipeline: sharp.Sharp,
    format: string,
    options?: Record<string, unknown>,
  ): sharp.Sharp {
    const quality = (options?.quality as number) || 80;

    switch (format) {
      case 'jpeg':
        return pipeline.jpeg({ quality, mozjpeg: true });
      case 'png':
        return pipeline.png({ quality, compressionLevel: 9 });
      case 'webp':
        return pipeline.webp({ quality });
      default:
        return pipeline;
    }
  }
}
