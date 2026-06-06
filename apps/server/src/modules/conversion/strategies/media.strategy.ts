import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import ffmpeg = require('fluent-ffmpeg');
import {
  ConversionStrategy,
  ConversionInput,
  ConversionOutput,
} from './conversion-strategy.interface';

// fluent-ffmpeg 类型补充: timeout 方法存在于运行时但类型定义缺少
declare module 'fluent-ffmpeg' {
  interface FfmpegCommand {
    timeout(seconds: number): this;
  }
}

/** 音视频策略支持的转换类型 */
const MEDIA_TYPES = [
  // 视频格式转换
  'video-to-mp4',
  'video-to-avi',
  'video-to-mkv',
  'video-to-mov',
  'video-to-webm',
  // 音频格式转换
  'audio-to-mp3',
  'audio-to-wav',
  'audio-to-flac',
  'audio-to-aac',
  'audio-to-ogg',
  // 视频提取音频
  'video-extract-audio',
  // 视频工具
  'video-trim',
  'video-screenshot',
  'video-to-gif',
  'video-compress',
  // 音频工具
  'audio-trim',
];

/** 输出格式到扩展名和 MIME */
const FORMAT_MAP: Record<string, { ext: string; mime: string }> = {
  'video-to-mp4': { ext: '.mp4', mime: 'video/mp4' },
  'video-to-avi': { ext: '.avi', mime: 'video/x-msvideo' },
  'video-to-mkv': { ext: '.mkv', mime: 'video/x-matroska' },
  'video-to-mov': { ext: '.mov', mime: 'video/quicktime' },
  'video-to-webm': { ext: '.webm', mime: 'video/webm' },
  'audio-to-mp3': { ext: '.mp3', mime: 'audio/mpeg' },
  'audio-to-wav': { ext: '.wav', mime: 'audio/wav' },
  'audio-to-flac': { ext: '.flac', mime: 'audio/flac' },
  'audio-to-aac': { ext: '.aac', mime: 'audio/aac' },
  'audio-to-ogg': { ext: '.ogg', mime: 'audio/ogg' },
  'video-extract-audio': { ext: '.mp3', mime: 'audio/mpeg' },
  'video-trim': { ext: '.mp4', mime: 'video/mp4' },
  'video-screenshot': { ext: '.jpg', mime: 'image/jpeg' },
  'video-to-gif': { ext: '.gif', mime: 'image/gif' },
  'video-compress': { ext: '.mp4', mime: 'video/mp4' },
  'audio-trim': { ext: '.mp3', mime: 'audio/mpeg' },
};

/** FFmpeg 超时 (秒) */
const FFMPEG_TIMEOUT = 300; // 5 分钟

@Injectable()
export class MediaStrategy implements ConversionStrategy {
  private readonly logger = new Logger(MediaStrategy.name);

  supports(conversionType: string): boolean {
    return MEDIA_TYPES.includes(conversionType);
  }

  async convert(input: ConversionInput): Promise<ConversionOutput> {
    const { inputPath, conversionType, outputDir, options } = input;

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    if (!fs.existsSync(inputPath)) {
      throw new Error(`输入文件不存在: ${inputPath}`);
    }

    const formatInfo = FORMAT_MAP[conversionType];
    if (!formatInfo) {
      throw new Error(`不支持的音视频操作: ${conversionType}`);
    }

    switch (conversionType) {
      case 'video-screenshot':
        return this.screenshot(inputPath, outputDir, formatInfo, options);
      case 'video-to-gif':
        return this.videoToGif(inputPath, outputDir, formatInfo, options);
      case 'video-trim':
      case 'audio-trim':
        return this.trim(inputPath, outputDir, formatInfo, conversionType, options);
      case 'video-extract-audio':
        return this.extractAudio(inputPath, outputDir, formatInfo);
      case 'video-compress':
        return this.videoCompress(inputPath, outputDir, formatInfo, options);
      default:
        return this.formatConvert(inputPath, outputDir, formatInfo, conversionType, options);
    }
  }

  /** 通用格式转换 */
  private formatConvert(
    inputPath: string,
    outputDir: string,
    formatInfo: { ext: string; mime: string },
    conversionType: string,
    options?: Record<string, unknown>,
  ): Promise<ConversionOutput> {
    const outputFileName = `${uuidv4()}${formatInfo.ext}`;
    const outputPath = path.join(outputDir, outputFileName);

    return new Promise((resolve, reject) => {
      const cmd = ffmpeg(inputPath)
        .output(outputPath)
        .on('start', (cmdLine) => this.logger.log(`FFmpeg 启动: ${conversionType}`))
        .on('end', () => {
          const stat = fs.statSync(outputPath);
          this.logger.log(
            `FFmpeg 完成: ${conversionType} → ${outputFileName} (${stat.size} bytes)`,
          );
          resolve({
            outputPath,
            outputMimeType: formatInfo.mime,
            outputFileSize: stat.size,
            outputFileName,
          });
        })
        .on('error', (err) => reject(new Error(`FFmpeg 转换失败: ${err.message}`)));

      // 音频格式特殊处理
      if (conversionType.startsWith('audio-to-')) {
        const targetFormat = formatInfo.ext.slice(1);
        cmd.format(targetFormat);

        const bitrate = (options?.bitrate as string) || '192k';
        cmd.audioBitrate(bitrate);
      } else {
        // 视频格式
        const targetFormat = formatInfo.ext.slice(1);
        cmd.format(targetFormat);

        if (options?.videoBitrate) {
          cmd.videoBitrate(options.videoBitrate as string);
        }
        if (options?.audioBitrate) {
          cmd.audioBitrate(options.audioBitrate as string);
        }
      }

      cmd.run();
    });
  }

  /** 视频截图 */
  private screenshot(
    inputPath: string,
    outputDir: string,
    formatInfo: { ext: string; mime: string },
    options?: Record<string, unknown>,
  ): Promise<ConversionOutput> {
    const timestamp = (options?.timestamp as string) || '00:00:05';
    const outputFileName = `${uuidv4()}.jpg`;
    const outputPath = path.join(outputDir, outputFileName);

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .screenshots({
          count: 1,
          timemarks: [timestamp],
          filename: outputFileName,
          folder: outputDir,
          size: (options?.size as string) || undefined,
        })
        .on('end', () => {
          const stat = fs.statSync(outputPath);
          this.logger.log(`视频截图完成: ${outputFileName}`);
          resolve({
            outputPath,
            outputMimeType: formatInfo.mime,
            outputFileSize: stat.size,
            outputFileName,
          });
        })
        .on('error', (err) => reject(new Error(`截图失败: ${err.message}`)));
    });
  }

  /** 视频转 GIF */
  private videoToGif(
    inputPath: string,
    outputDir: string,
    formatInfo: { ext: string; mime: string },
    options?: Record<string, unknown>,
  ): Promise<ConversionOutput> {
    const start = (options?.start as string) || '00:00:00';
    const duration = (options?.duration as number) || 5;
    const fps = (options?.fps as number) || 10;
    const width = (options?.width as number) || 480;

    const outputFileName = `${uuidv4()}.gif`;
    const outputPath = path.join(outputDir, outputFileName);

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .setStartTime(start)
        .setDuration(duration)
        .output(outputPath)
        .outputOptions([`-vf fps=${fps},scale=${width}:-1:flags=lanczos`, '-gifflags +transdiff'])
        .on('start', () => this.logger.log('FFmpeg GIF 转换启动'))
        .on('end', () => {
          const stat = fs.statSync(outputPath);
          this.logger.log(`GIF 转换完成: ${outputFileName} (${stat.size} bytes)`);
          resolve({
            outputPath,
            outputMimeType: formatInfo.mime,
            outputFileSize: stat.size,
            outputFileName,
          });
        })
        .on('error', (err) => reject(new Error(`GIF 转换失败: ${err.message}`)))
        .timeout(FFMPEG_TIMEOUT)
        .run();
    });
  }

  /** 视频/音频裁剪 */
  private trim(
    inputPath: string,
    outputDir: string,
    formatInfo: { ext: string; mime: string },
    conversionType: string,
    options?: Record<string, unknown>,
  ): Promise<ConversionOutput> {
    const start = (options?.start as string) || '00:00:00';
    const duration = (options?.duration as string) || undefined;
    const end = (options?.end as string) || undefined;

    const outputFileName = `${uuidv4()}${formatInfo.ext}`;
    const outputPath = path.join(outputDir, outputFileName);

    return new Promise((resolve, reject) => {
      const cmd = ffmpeg(inputPath).setStartTime(start).output(outputPath);

      if (duration) {
        cmd.setDuration(duration);
      } else if (end) {
        cmd.setDuration(end);
      }

      // 视频裁剪保留视频+音频流
      if (conversionType === 'video-trim') {
        cmd.outputOptions(['-c:v copy', '-c:a copy']);
      }

      cmd
        .on('start', () => this.logger.log(`FFmpeg 裁剪启动: ${conversionType}`))
        .on('end', () => {
          const stat = fs.statSync(outputPath);
          this.logger.log(`裁剪完成: ${outputFileName}`);
          resolve({
            outputPath,
            outputMimeType: formatInfo.mime,
            outputFileSize: stat.size,
            outputFileName,
          });
        })
        .on('error', (err) => reject(new Error(`裁剪失败: ${err.message}`)))
        .timeout(FFMPEG_TIMEOUT)
        .run();
    });
  }

  /** 视频提取音频 */
  private extractAudio(
    inputPath: string,
    outputDir: string,
    formatInfo: { ext: string; mime: string },
  ): Promise<ConversionOutput> {
    const outputFileName = `${uuidv4()}.mp3`;
    const outputPath = path.join(outputDir, outputFileName);

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .noVideo()
        .audioCodec('libmp3lame')
        .audioBitrate('192k')
        .format('mp3')
        .output(outputPath)
        .on('start', () => this.logger.log('FFmpeg 提取音频启动'))
        .on('end', () => {
          const stat = fs.statSync(outputPath);
          this.logger.log(`提取音频完成: ${outputFileName} (${stat.size} bytes)`);
          resolve({
            outputPath,
            outputMimeType: formatInfo.mime,
            outputFileSize: stat.size,
            outputFileName,
          });
        })
        .on('error', (err) => reject(new Error(`提取音频失败: ${err.message}`)))
        .timeout(FFMPEG_TIMEOUT)
        .run();
    });
  }

  /** 视频压缩 */
  private videoCompress(
    inputPath: string,
    outputDir: string,
    formatInfo: { ext: string; mime: string },
    options?: Record<string, unknown>,
  ): Promise<ConversionOutput> {
    const crf = (options?.crf as number) || 28; // 23=默认, 28=较低质量更小
    const preset = (options?.preset as string) || 'medium';

    const outputFileName = `${uuidv4()}.mp4`;
    const outputPath = path.join(outputDir, outputFileName);

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .outputOptions([`-crf ${crf}`, `-preset ${preset}`])
        .format('mp4')
        .output(outputPath)
        .on('start', () => this.logger.log(`FFmpeg 视频压缩启动 (CRF: ${crf})`))
        .on('end', () => {
          const stat = fs.statSync(outputPath);
          this.logger.log(
            `视频压缩完成: ${outputFileName} (${(stat.size / 1024 / 1024).toFixed(1)} MB)`,
          );
          resolve({
            outputPath,
            outputMimeType: formatInfo.mime,
            outputFileSize: stat.size,
            outputFileName,
          });
        })
        .on('error', (err) => reject(new Error(`视频压缩失败: ${err.message}`)))
        .timeout(FFMPEG_TIMEOUT)
        .run();
    });
  }
}
