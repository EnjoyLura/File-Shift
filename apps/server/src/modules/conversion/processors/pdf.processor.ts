import { Logger } from '@nestjs/common';
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import * as path from 'path';
import { PDF_QUEUE } from '../../../queue/queue.module';
import { ConversionService } from '../conversion.service';
import { UploadService } from '../../upload/upload.service';
import { PdfStrategy } from '../strategies/pdf.strategy';

interface ConvertJobData {
  taskId: number;
  taskNo: string;
  userId: number;
  conversionType: string;
  inputFileId: string;
  inputStoragePath: string;
  inputMimeType: string;
  /** 多文件操作的存储路径数组 */
  inputStoragePaths?: string[];
  inputFileName?: string;
  options?: Record<string, unknown>;
}

@Processor(PDF_QUEUE, { concurrency: 3 })
export class PdfProcessor extends WorkerHost {
  private readonly logger = new Logger(PdfProcessor.name);

  constructor(
    private readonly conversionService: ConversionService,
    private readonly uploadService: UploadService,
    private readonly pdfStrategy: PdfStrategy,
  ) {
    super();
  }

  async process(job: Job<ConvertJobData>): Promise<void> {
    const {
      taskId,
      taskNo,
      conversionType,
      inputStoragePath,
      inputStoragePaths,
      inputMimeType,
      inputFileName,
      options,
    } = job.data;

    this.logger.log(`开始处理 PDF 任务: ${taskNo} (${conversionType})`);

    try {
      await this.conversionService.markProcessing(taskId);

      const uploadRoot = path.resolve(process.env.UPLOAD_DIR || './uploads');

      // 解析多文件路径 (PDF 合并)
      let inputPaths: string[] | undefined;
      if (inputStoragePaths && inputStoragePaths.length > 0) {
        inputPaths = inputStoragePaths.map((p) => this.uploadService.getAbsolutePath(p));
      }

      const inputAbsPath = this.uploadService.getAbsolutePath(inputStoragePath);
      const outputDir = path.resolve(uploadRoot, 'output', 'pdf');

      const result = await this.pdfStrategy.convert({
        inputPath: inputAbsPath,
        inputPaths,
        inputMimeType,
        conversionType,
        outputDir,
        originalName: inputFileName,
        options,
      });

      const outputRelPath = path.relative(uploadRoot, result.outputPath);

      await this.conversionService.markCompleted(taskId, {
        outputFileName: result.outputFileName,
        outputStoragePath: outputRelPath,
        outputFileSize: result.outputFileSize,
        outputMimeType: result.outputMimeType,
      });

      this.logger.log(`PDF 任务完成: ${taskNo}`);
    } catch (err) {
      this.logger.error(`PDF 任务失败: ${taskNo}`, err instanceof Error ? err.stack : err);
      await this.conversionService.markFailed(
        taskId,
        err instanceof Error ? err.message : '未知错误',
      );
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<ConvertJobData> | undefined, err: Error) {
    if (job) {
      this.logger.error(`PDF Worker 失败: ${job.data.taskNo}`, err.stack);
    }
  }
}
