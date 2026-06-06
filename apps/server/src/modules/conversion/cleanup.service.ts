import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, In } from 'typeorm';
import { ConversionTask } from './entities/conversion-task.entity';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(
    @InjectRepository(ConversionTask)
    private readonly taskRepo: Repository<ConversionTask>,
    private readonly uploadService: UploadService,
  ) {}

  /**
   * 每小时执行一次：清理过期的转换输出文件
   */
  @Cron('0 * * * *')
  async cleanupExpiredFiles(): Promise<void> {
    this.logger.log('开始清理过期文件...');

    const now = new Date();
    const expiredTasks = await this.taskRepo.find({
      where: {
        status: 'completed',
        expiresAt: LessThan(now),
      },
      take: 500, // 每次最多处理 500 条
    });

    if (expiredTasks.length === 0) {
      this.logger.log('没有过期文件需要清理');
      return;
    }

    let cleanedCount = 0;
    for (const task of expiredTasks) {
      // 删除输出文件
      if (task.outputStoragePath) {
        this.uploadService.deleteFile(task.outputStoragePath);
      }
      // 标记为已清理
      task.outputStoragePath = null;
      task.outputFileName = null;
      task.outputFileSize = null;
      cleanedCount++;
    }

    // 批量更新
    await this.taskRepo.save(expiredTasks);
    this.logger.log(`清理完成: ${cleanedCount} 个过期文件已删除`);
  }

  /**
   * 每天凌晨 3 点：清理超过 7 天的临时上传文件（未关联到任务的）
   */
  @Cron('0 3 * * *')
  async cleanupOrphanedUploads(): Promise<void> {
    this.logger.log('开始清理孤立上传文件...');

    // 查找 7 天前上传的文件
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // 只清理没有关联转换任务的上传文件
    // 这里简化处理：通过 SQL 查找不在 conversion_tasks.inputFileId 中的上传文件
    try {
      const result = await this.taskRepo.manager.query(
        `
        DELETE uf FROM uploaded_files uf
        LEFT JOIN conversion_tasks ct ON ct.input_file_id = uf.file_id
        WHERE ct.id IS NULL AND uf.created_at < ?
        LIMIT 1000
      `,
        [sevenDaysAgo.toISOString()],
      );

      this.logger.log(`清理孤立上传文件完成: ${result?.affectedRows || 0} 条记录`);
    } catch (err) {
      this.logger.error('清理孤立上传文件失败', err);
    }
  }
}
