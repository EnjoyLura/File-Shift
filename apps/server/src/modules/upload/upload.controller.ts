import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile as MulterFile,
  Res,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { diskStorage } from 'multer';
import { StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import {
  ALL_SUPPORTED_MIME_TYPES,
  MAX_FILE_SIZE_FREE,
  FILE_EXPIRY_MS,
  ERROR_CODES,
} from '@fileshift/constants';
import { UploadService } from './upload.service';
import { UploadedFile } from './entities/uploaded-file.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BusinessException } from '../../common/exceptions/business.exception';

/** Multer 临时存储配置（先存到 uploads/temp，后续由 service 移动到最终路径） */
const multerTempStorage = diskStorage({
  destination: (_req, _file, cb) => {
    const tempDir = path.resolve(process.env.UPLOAD_DIR || './uploads', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `tmp-${uniqueSuffix}${ext}`);
  },
});

/** Multer 文件过滤器 */
const multerFileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!ALL_SUPPORTED_MIME_TYPES.includes(file.mimetype as any)) {
    cb(new Error('不支持的文件类型'), false);
    return;
  }
  if (file.size > MAX_FILE_SIZE_FREE) {
    cb(new Error('文件大小超过限制'), false);
    return;
  }
  cb(null, true);
};

@ApiTags('文件')
@Controller('v1/files')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly uploadService: UploadService) {}

  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @Throttle({ upload: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: '上传文件' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multerTempStorage,
      fileFilter: multerFileFilter,
      limits: { fileSize: MAX_FILE_SIZE_FREE },
    }),
  )
  async uploadFile(@CurrentUser('sub') userId: number, @MulterFile() file: Express.Multer.File) {
    if (!file) {
      throw new BusinessException(ERROR_CODES.FILE_UPLOAD_FAILED, '未收到文件，请重新上传');
    }

    const saved = await this.uploadService.saveUploadedFile(userId, file);

    return {
      fileId: saved.fileId,
      fileName: saved.originalName,
      fileSize: saved.fileSize,
      mimeType: saved.mimeType,
      uploadedAt: saved.createdAt.toISOString(),
    };
  }

  /**
   * 下载转换结果文件
   */
  @Get('download/:taskNo')
  @ApiOperation({ summary: '下载转换结果文件' })
  async downloadFile(
    @CurrentUser('sub') userId: number,
    @Param('taskNo') taskNo: string,
    @Res() res: Response,
  ) {
    // 通过 taskNo 查找转换任务 (直接查询数据库)
    let task;
    try {
      task = await this.uploadService.findConversionTask(taskNo);
    } catch {
      return res.status(500).json({ code: 99001, message: '查询任务失败' });
    }

    if (!task) {
      return res.status(404).json({ code: 12003, message: '任务不存在' });
    }

    // 验证用户归属
    if (Number(task.userId) !== userId) {
      return res.status(403).json({ code: 99001, message: '无权访问此文件' });
    }

    // 验证任务状态
    if (task.status !== 'completed' || !task.outputStoragePath) {
      return res.status(400).json({ code: 12003, message: '文件尚未准备好，请等待转换完成' });
    }

    // 验证是否过期
    if (task.expiresAt && new Date(task.expiresAt) < new Date()) {
      return res.status(400).json({ code: 12004, message: '文件已过期，请重新转换' });
    }

    // 获取文件路径
    const absPath = this.uploadService.getAbsolutePath(task.outputStoragePath);
    if (!fs.existsSync(absPath)) {
      return res.status(404).json({ code: 12003, message: '文件不存在，可能已被清理' });
    }

    // 设置响应头并直接流式发送文件
    const fileName = task.outputFileName || 'download';
    const fileSize = fs.statSync(absPath).size;
    res.set({
      'Content-Type': task.outputMimeType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
      'Content-Length': fileSize,
    });

    const fileStream = fs.createReadStream(absPath);
    fileStream.pipe(res);
  }
}
