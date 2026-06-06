import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';
import { CREDIT_COSTS, ERROR_CODES, FILE_EXPIRY_MS } from '@fileshift/constants';
import type { TaskCategory } from '@fileshift/shared-types';
import { ConversionTask } from './entities/conversion-task.entity';
import { UploadedFile } from '../upload/entities/uploaded-file.entity';
import { UploadService } from '../upload/upload.service';
import { CreditService } from '../credit/credit.service';
import { BusinessException } from '../../common/exceptions/business.exception';
import { IMAGE_QUEUE, DOCUMENT_QUEUE } from '../../queue/queue.module';

/** 转换类型到 Category 映射 */
const TYPE_CATEGORY_MAP: Record<string, TaskCategory> = {
  'png-to-jpg': 'image',
  'jpg-to-png': 'image',
  'png-to-webp': 'image',
  'jpg-to-webp': 'image',
  'webp-to-png': 'image',
  'webp-to-jpg': 'image',
  'image-compress': 'image',
  'pdf-to-word': 'document',
  'word-to-pdf': 'document',
  'pdf-to-excel': 'document',
  'excel-to-pdf': 'document',
  'pdf-to-ppt': 'document',
  'ppt-to-pdf': 'document',
  'markdown-to-pdf': 'document',
};

/** 预估转换时间 (秒) */
const ESTIMATED_TIME: Record<string, number> = {
  image: 5,
  document: 30,
  media: 120,
  compress: 10,
  tool: 15,
};

@Injectable()
export class ConversionService {
  private readonly logger = new Logger(ConversionService.name);

  constructor(
    @InjectRepository(ConversionTask)
    private readonly taskRepo: Repository<ConversionTask>,
    private readonly uploadService: UploadService,
    private readonly creditService: CreditService,
    @InjectQueue(IMAGE_QUEUE)
    private readonly imageQueue: Queue,
    @InjectQueue(DOCUMENT_QUEUE)
    private readonly documentQueue: Queue,
  ) {}

  /**
   * 创建转换任务
   */
  async createTask(
    userId: number,
    fileId: string,
    conversionType: string,
    options?: Record<string, unknown>,
  ) {
    // 1. 验证转换类型
    const category = TYPE_CATEGORY_MAP[conversionType];
    if (!category) {
      throw new BusinessException(
        ERROR_CODES.CONVERSION_TYPE_UNSUPPORTED,
        `不支持的转换类型: ${conversionType}`,
      );
    }

    // 2. 获取积分消耗
    const creditsCost = CREDIT_COSTS[conversionType] || 1;

    // 3. 检查积分余额
    await this.creditService.checkBalance(userId, creditsCost);

    // 4. 验证输入文件
    const uploadedFile = await this.uploadService.findByFileId(fileId);
    if (!uploadedFile) {
      throw new BusinessException(ERROR_CODES.FILE_NOT_FOUND, '文件不存在，请重新上传', 404);
    }
    if (Number(uploadedFile.userId) !== userId) {
      throw new BusinessException(ERROR_CODES.FILE_NOT_FOUND, '文件不存在', 404);
    }
    if (!this.uploadService.fileExistsOnDisk(uploadedFile.storagePath)) {
      throw new BusinessException(ERROR_CODES.FILE_NOT_FOUND, '文件已丢失，请重新上传');
    }

    // 5. 原子扣除积分
    const deducted = await this.creditService.deductCredits(userId, creditsCost);
    if (!deducted) {
      throw new BusinessException(ERROR_CODES.CREDIT_INSUFFICIENT, '积分扣除失败，余额不足');
    }

    // 6. 创建任务记录
    const taskNo = this.generateTaskNo();
    const task = this.taskRepo.create({
      taskNo,
      userId,
      type: conversionType,
      category,
      status: 'queued',
      inputFileId: uploadedFile.fileId,
      inputFileName: uploadedFile.originalName,
      inputFileSize: uploadedFile.fileSize,
      inputMimeType: uploadedFile.mimeType,
      creditsCost,
      progress: 0,
    });
    const saved = await this.taskRepo.save(task);

    // 7. 入队
    const jobData = {
      taskId: Number(saved.id),
      taskNo: saved.taskNo,
      userId,
      conversionType,
      inputFileId: uploadedFile.fileId,
      inputStoragePath: uploadedFile.storagePath,
      inputMimeType: uploadedFile.mimeType,
      options,
    };

    try {
      if (category === 'image') {
        await this.imageQueue.add('convert', jobData, {
          jobId: saved.taskNo,
          removeOnComplete: { count: 1000 },
          removeOnFail: { count: 5000 },
        });
      } else {
        await this.documentQueue.add('convert', jobData, {
          jobId: saved.taskNo,
          removeOnComplete: { count: 1000 },
          removeOnFail: { count: 5000 },
        });
      }
    } catch (err) {
      // 入队失败 → 退还积分
      this.logger.error(`任务入队失败: ${saved.taskNo}`, err);
      await this.creditService.refundCredits(userId, creditsCost);
      saved.status = 'failed';
      saved.errorMessage = '任务入队失败，积分已退还';
      await this.taskRepo.save(saved);
      throw new BusinessException(ERROR_CODES.CONVERSION_FAILED, '任务创建失败，请稍后重试');
    }

    this.logger.log(`转换任务已创建: ${saved.taskNo} (${conversionType})`);

    return {
      taskNo: saved.taskNo,
      status: saved.status,
      creditsCost,
      estimatedTime: ESTIMATED_TIME[category] || 30,
      createdAt: saved.createdAt.toISOString(),
    };
  }

  /**
   * 查询任务状态
   */
  async getTaskStatus(taskNo: string, userId: number) {
    const task = await this.taskRepo.findOne({ where: { taskNo } });
    if (!task || Number(task.userId) !== userId) {
      throw new NotFoundException('任务不存在');
    }

    const result: Record<string, any> = {
      id: Number(task.id),
      taskNo: task.taskNo,
      type: task.type,
      category: task.category,
      status: task.status,
      inputFileName: task.inputFileName,
      inputFileSize: task.inputFileSize,
      outputFileName: task.outputFileName,
      outputFileSize: task.outputFileSize,
      creditsCost: task.creditsCost,
      progress: task.progress,
      errorMessage: task.errorMessage,
      createdAt: task.createdAt.toISOString(),
      completedAt: task.completedAt?.toISOString() || null,
      expiresAt: task.expiresAt?.toISOString() || null,
    };

    // 如果任务已完成，附加下载 URL
    if (task.status === 'completed' && task.outputStoragePath) {
      result.downloadUrl = `/api/v1/files/download/${task.taskNo}`;
      result.inputMimeType = task.inputMimeType;
      result.outputMimeType = task.outputMimeType;
    }

    return result;
  }

  /**
   * 获取用户任务列表 (分页)
   */
  async getTaskList(userId: number, page = 1, pageSize = 20) {
    const [list, total] = await this.taskRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      list: list.map((t) => ({
        id: Number(t.id),
        taskNo: t.taskNo,
        type: t.type,
        category: t.category,
        status: t.status,
        inputFileName: t.inputFileName,
        inputFileSize: t.inputFileSize,
        outputFileName: t.outputFileName,
        outputFileSize: t.outputFileSize,
        creditsCost: t.creditsCost,
        progress: t.progress,
        errorMessage: t.errorMessage,
        createdAt: t.createdAt.toISOString(),
        completedAt: t.completedAt?.toISOString() || null,
        expiresAt: t.expiresAt?.toISOString() || null,
      })),
      total,
      page,
      pageSize,
    };
  }

  /**
   * 根据 taskNo 获取任务 (内部使用，不验证用户归属)
   */
  async findByTaskNo(taskNo: string): Promise<ConversionTask | null> {
    return this.taskRepo.findOne({ where: { taskNo } });
  }

  /**
   * 更新任务状态为处理中
   */
  async markProcessing(taskId: number): Promise<void> {
    await this.taskRepo.update(taskId, { status: 'processing', progress: 10 });
  }

  /**
   * 更新任务进度
   */
  async updateProgress(taskId: number, progress: number): Promise<void> {
    await this.taskRepo.update(taskId, { progress });
  }

  /**
   * 标记任务完成
   */
  async markCompleted(
    taskId: number,
    output: {
      outputFileName: string;
      outputStoragePath: string;
      outputFileSize: number;
      outputMimeType: string;
    },
  ): Promise<void> {
    await this.taskRepo.update(taskId, {
      status: 'completed',
      progress: 100,
      outputFileName: output.outputFileName,
      outputStoragePath: output.outputStoragePath,
      outputFileSize: output.outputFileSize,
      outputMimeType: output.outputMimeType,
      completedAt: new Date(),
      expiresAt: new Date(Date.now() + FILE_EXPIRY_MS),
    });
  }

  /**
   * 标记任务失败 + 退还积分
   */
  async markFailed(taskId: number, errorMessage: string): Promise<void> {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) return;

    // 退还积分
    await this.creditService.refundCredits(Number(task.userId), task.creditsCost);

    await this.taskRepo.update(taskId, {
      status: 'failed',
      errorMessage,
      completedAt: new Date(),
    });

    this.logger.warn(`任务失败: ${task.taskNo} - ${errorMessage}`);
  }

  /** 生成任务编号: T + 年月日时分秒 + 4位随机 */
  private generateTaskNo(): string {
    const now = new Date();
    const ts = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
      String(now.getHours()).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0'),
      String(now.getSeconds()).padStart(2, '0'),
    ].join('');
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `T${ts}${rand}`;
  }
}
