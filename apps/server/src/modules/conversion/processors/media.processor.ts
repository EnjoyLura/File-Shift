import { Logger } from '@nestjs/common';
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import * as path from 'path';
import { MEDIA_QUEUE } from '../../../queue/queue.module';
import { ConversionService } from '../conversion.service';
import { UploadService } from '../../upload/upload.service';
import { MediaStrategy } from '../strategies/media.strategy';

interface ConvertJobData {
  taskId: number;
  taskNo: string;
  userId: number;
  conversionType: string;
  inputFileId: string;
  inputStoragePath: string;
  inputMimeType: string;
  options?: Record<string, unknown>;
}

@Processor(MEDIA_QUEUE, { concurrency: 1 })
export class MediaProcessor extends WorkerHost {
  private readonly logger = new Logger(MediaProcessor.name);

  constructor(
    private readonly conversionService: ConversionService,
    private readonly uploadService: UploadService,
    private readonly mediaStrategy: MediaStrategy,
  ) {
    super();
  }

  async process(job: Job<ConvertJobData>): Promise<void> {
    const { taskId, taskNo, conversionType, inputStoragePath, inputMimeType, options } = job.data;

    this.logger.log(`开始处理音视频任务: ${taskNo} (${conversionType})`);

    try {
      await this.conversionService.markProcessing(taskId);

      const inputAbsPath = this.uploadService.getAbsolutePath(inputStoragePath);
      const outputDir = path.resolve(process.env.UPLOAD_DIR || './uploads', 'output', 'media');

      const result = await this.mediaStrategy.convert({
        inputPath: inputAbsPath,
        inputMimeType,
        conversionType,
        outputDir,
        options,
      });

      const uploadRoot = path.resolve(process.env.UPLOAD_DIR || './uploads');
      const outputRelPath = path.relative(uploadRoot, result.outputPath);

      await this.conversionService.markCompleted(taskId, {
        outputFileName: result.outputFileName,
        outputStoragePath: outputRelPath,
        outputFileSize: result.outputFileSize,
        outputMimeType: result.outputMimeType,
      });

      this.logger.log(`音视频任务完成: ${taskNo}`);
    } catch (err) {
      this.logger.error(`音视频任务失败: ${taskNo}`, err instanceof Error ? err.stack : err);
      await this.conversionService.markFailed(
        taskId,
        err instanceof Error ? err.message : '未知错误',
      );
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<ConvertJobData> | undefined, err: Error) {
    if (job) {
      this.logger.error(`音视频 Worker 失败: ${job.data.taskNo}`, err.stack);
    }
  }
}
