import { Logger } from '@nestjs/common';
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import * as path from 'path';
import { DOCUMENT_QUEUE } from '../../../queue/queue.module';
import { ConversionService } from '../conversion.service';
import { UploadService } from '../../upload/upload.service';
import { DocumentStrategy } from '../strategies/document.strategy';

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

@Processor(DOCUMENT_QUEUE, { concurrency: 2 })
export class DocumentProcessor extends WorkerHost {
  private readonly logger = new Logger(DocumentProcessor.name);

  constructor(
    private readonly conversionService: ConversionService,
    private readonly uploadService: UploadService,
    private readonly documentStrategy: DocumentStrategy,
  ) {
    super();
  }

  async process(job: Job<ConvertJobData>): Promise<void> {
    const { taskId, taskNo, conversionType, inputStoragePath, inputMimeType, options } = job.data;

    this.logger.log(`开始处理文档任务: ${taskNo} (${conversionType})`);

    try {
      // 更新状态为处理中
      await this.conversionService.markProcessing(taskId);

      // 获取输入文件绝对路径
      const inputAbsPath = this.uploadService.getAbsolutePath(inputStoragePath);

      // 确定输出目录
      const outputDir = path.resolve(process.env.UPLOAD_DIR || './uploads', 'output', 'document');

      // 执行转换
      const result = await this.documentStrategy.convert({
        inputPath: inputAbsPath,
        inputMimeType,
        conversionType,
        outputDir,
        options,
      });

      // 计算相对路径
      const uploadRoot = path.resolve(process.env.UPLOAD_DIR || './uploads');
      const outputRelPath = path.relative(uploadRoot, result.outputPath);

      // 更新任务状态为完成
      await this.conversionService.markCompleted(taskId, {
        outputFileName: result.outputFileName,
        outputStoragePath: outputRelPath,
        outputFileSize: result.outputFileSize,
        outputMimeType: result.outputMimeType,
      });

      this.logger.log(`文档任务完成: ${taskNo}`);
    } catch (err) {
      this.logger.error(`文档任务失败: ${taskNo}`, err instanceof Error ? err.stack : err);
      await this.conversionService.markFailed(
        taskId,
        err instanceof Error ? err.message : '未知错误',
      );
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<ConvertJobData> | undefined, err: Error) {
    if (job) {
      this.logger.error(`文档 Worker 失败: ${job.data.taskNo}`, err.stack);
    }
  }
}
