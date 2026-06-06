import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { ALL_SUPPORTED_MIME_TYPES, MAX_FILE_SIZE_FREE, ERROR_CODES } from '@fileshift/constants';
import { UploadedFile } from './entities/uploaded-file.entity';
import { ConversionTask } from '../conversion/entities/conversion-task.entity';
import { BusinessException } from '../../common/exceptions/business.exception';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadDir: string;

  constructor(
    @InjectRepository(UploadedFile)
    private readonly fileRepo: Repository<UploadedFile>,
    @InjectRepository(ConversionTask)
    private readonly taskRepo: Repository<ConversionTask>,
    private readonly configService: ConfigService,
  ) {
    this.uploadDir = this.configService.get<string>('UPLOAD_DIR', './uploads');
    // 确保上传根目录存在
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * 保存上传文件记录
   * Multer 已将文件写入磁盘，此方法记录到 DB 并返回元信息
   */
  async saveUploadedFile(userId: number, file: Express.Multer.File): Promise<UploadedFile> {
    // 验证 MIME 类型
    if (!ALL_SUPPORTED_MIME_TYPES.includes(file.mimetype as any)) {
      throw new BusinessException(
        ERROR_CODES.FILE_TYPE_UNSUPPORTED,
        `不支持的文件类型: ${file.mimetype}`,
      );
    }

    // 验证文件大小
    if (file.size > MAX_FILE_SIZE_FREE) {
      throw new BusinessException(ERROR_CODES.FILE_TOO_LARGE, '文件大小超过限制 (最大 20MB)', 413);
    }

    // 生成 UUID 并构建存储路径
    const fileId = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase();
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const relativeDir = path.join(String(year), month);
    const fileName = `${fileId}${ext}`;
    const relativePath = path.join(relativeDir, fileName);

    // 确保子目录存在
    const fullDir = path.join(this.uploadDir, relativeDir);
    if (!fs.existsSync(fullDir)) {
      fs.mkdirSync(fullDir, { recursive: true });
    }

    // 将 Multer 临时文件移动到最终路径
    const finalPath = path.join(this.uploadDir, relativePath);
    if (file.path && file.path !== finalPath) {
      fs.renameSync(file.path, finalPath);
    }

    // 写入数据库
    const entity = this.fileRepo.create({
      fileId,
      userId,
      originalName: file.originalname,
      storagePath: relativePath,
      fileSize: file.size,
      mimeType: file.mimetype,
    });
    const saved = await this.fileRepo.save(entity);
    this.logger.log(`文件上传成功: ${fileId} (${file.originalname})`);
    return saved;
  }

  /**
   * 根据 fileId 获取文件记录
   */
  async findByFileId(fileId: string): Promise<UploadedFile | null> {
    return this.fileRepo.findOne({ where: { fileId } });
  }

  /**
   * 获取文件的绝对磁盘路径
   */
  getAbsolutePath(relativePath: string): string {
    return path.resolve(this.uploadDir, relativePath);
  }

  /**
   * 检查文件是否在磁盘上存在
   */
  fileExistsOnDisk(relativePath: string): boolean {
    const absPath = this.getAbsolutePath(relativePath);
    return fs.existsSync(absPath);
  }

  /**
   * 删除磁盘上的文件
   */
  deleteFile(relativePath: string): void {
    const absPath = this.getAbsolutePath(relativePath);
    try {
      if (fs.existsSync(absPath)) {
        fs.unlinkSync(absPath);
      }
    } catch (err) {
      this.logger.warn(`删除文件失败: ${relativePath}`, err);
    }
  }

  /**
   * 根据 taskNo 查找转换任务 (供下载端点使用)
   */
  async findConversionTask(taskNo: string): Promise<ConversionTask | null> {
    return this.taskRepo.findOne({ where: { taskNo } });
  }
}
