import { Injectable, Logger } from '@nestjs/common';
import * as sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import {
  ConversionStrategy,
  ConversionInput,
  ConversionOutput,
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
    const { inputPath, conversionType, outputDir } = input;

    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    let pipeline = sharp(inputPath);

    // 图片压缩模式
    if (conversionType === 'image-compress') {
      const metadata = await pipeline.metadata();
      const format = metadata.format || 'jpeg';
      pipeline = this.applyCompression(pipeline, format, input.options);

      const ext = FORMAT_TO_EXT[format] || '.jpg';
      const outputFileName = `${uuidv4()}${ext}`;
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

    // 格式转换模式
    const targetFormat = TYPE_TO_FORMAT[conversionType];
    if (!targetFormat) {
      throw new Error(`不支持的图片转换类型: ${conversionType}`);
    }

    pipeline = pipeline.toFormat(targetFormat);
    pipeline = this.applyCompression(pipeline, targetFormat, input.options);

    const ext = FORMAT_TO_EXT[targetFormat];
    const outputFileName = `${uuidv4()}${ext}`;
    const outputPath = path.join(outputDir, outputFileName);

    await pipeline.toFile(outputPath);
    const stat = fs.statSync(outputPath);

    this.logger.log(`图片转换完成: ${conversionType} → ${outputFileName} (${stat.size} bytes)`);
    return {
      outputPath,
      outputMimeType: FORMAT_TO_MIME[targetFormat],
      outputFileSize: stat.size,
      outputFileName,
    };
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
