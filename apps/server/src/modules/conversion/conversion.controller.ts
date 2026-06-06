import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  DefaultValuePipe,
  ParseIntPipe,
  Res,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import * as archiver from 'archiver';
import { ConversionService } from './conversion.service';
import { UploadService } from '../upload/upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BusinessException } from '../../common/exceptions/business.exception';
import { ERROR_CODES } from '@fileshift/constants';

@ApiTags('转换')
@Controller('v1/conversions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ConversionController {
  private readonly logger = new Logger(ConversionController.name);

  constructor(
    private readonly conversionService: ConversionService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @Throttle({ conversion: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: '创建转换任务' })
  async createTask(
    @CurrentUser('sub') userId: number,
    @Body() body: { fileId: string; type: string; options?: Record<string, unknown> },
  ) {
    return this.conversionService.createTask(userId, body.fileId, body.type, body.options);
  }

  @Post('merge')
  @HttpCode(HttpStatus.OK)
  @Throttle({ conversion: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: '创建 PDF 合并任务 (多文件)' })
  async createMergeTask(
    @CurrentUser('sub') userId: number,
    @Body() body: { fileIds: string[]; type?: string; options?: Record<string, unknown> },
  ) {
    const conversionType = body.type || 'pdf-merge';
    return this.conversionService.createMergeTask(
      userId,
      body.fileIds,
      conversionType,
      body.options,
    );
  }

  @Post('batch')
  @HttpCode(HttpStatus.OK)
  @Throttle({ conversion: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: '批量创建转换任务 (每个文件独立任务)' })
  async batchCreateTasks(
    @CurrentUser('sub') userId: number,
    @Body()
    body: {
      fileIds: string[];
      type: string;
      options?: Record<string, unknown>;
    },
  ) {
    if (!body.fileIds || body.fileIds.length === 0 || body.fileIds.length > 20) {
      throw new BusinessException(
        ERROR_CODES.CONVERSION_TYPE_UNSUPPORTED,
        '批量处理支持 1-20 个文件',
      );
    }

    const results = [];
    for (const fileId of body.fileIds) {
      try {
        const result = await this.conversionService.createTask(
          userId,
          fileId,
          body.type,
          body.options,
        );
        results.push({ fileId, success: true, ...result });
      } catch (err) {
        results.push({
          fileId,
          success: false,
          error: err instanceof Error ? err.message : '创建失败',
        });
      }
    }

    return {
      tasks: results,
      total: results.length,
      succeeded: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
    };
  }

  @Get('batch-download')
  @ApiOperation({ summary: '批量下载 (多个转换结果打包为 ZIP)' })
  async batchDownload(
    @CurrentUser('sub') userId: number,
    @Query('taskNos') taskNosStr: string,
    @Res() res: Response,
  ) {
    if (!taskNosStr) {
      return res.status(400).json({ code: 10000, message: '缺少 taskNos 参数' });
    }

    const taskNos = taskNosStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (taskNos.length === 0 || taskNos.length > 20) {
      return res.status(400).json({ code: 10000, message: '支持 1-20 个任务' });
    }

    // 验证所有任务
    const validFiles: { absPath: string; fileName: string }[] = [];
    for (const taskNo of taskNos) {
      const task = await this.conversionService.findByTaskNo(taskNo);
      if (!task || Number(task.userId) !== userId) continue;
      if (task.status !== 'completed' || !task.outputStoragePath) continue;

      const absPath = this.uploadService.getAbsolutePath(task.outputStoragePath);
      if (fs.existsSync(absPath)) {
        validFiles.push({
          absPath,
          fileName: task.outputFileName || `file-${taskNo}`,
        });
      }
    }

    if (validFiles.length === 0) {
      return res.status(404).json({ code: 12003, message: '没有可下载的文件' });
    }

    // 如果只有一个文件，直接流式下载
    if (validFiles.length === 1) {
      const file = validFiles[0];
      const fileSize = fs.statSync(file.absPath).size;
      res.set({
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${file.fileName.replace(/[^\x20-\x7E]/g, '_')}"; filename*=UTF-8''${encodeURIComponent(file.fileName)}`,
        'Content-Length': fileSize,
      });
      fs.createReadStream(file.absPath).pipe(res);
      return;
    }

    // 多文件打包为 ZIP
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="fileshift-batch-${Date.now()}.zip"`,
    });

    const archive = new archiver.ZipArchive({ zlib: { level: 6 } });
    archive.pipe(res);

    for (const file of validFiles) {
      archive.file(file.absPath, { name: file.fileName });
    }

    await archive.finalize();
  }

  @Get(':taskNo')
  @ApiOperation({ summary: '查询任务状态' })
  async getTaskStatus(@CurrentUser('sub') userId: number, @Param('taskNo') taskNo: string) {
    return this.conversionService.getTaskStatus(taskNo, userId);
  }

  @Delete(':taskNo')
  @ApiOperation({ summary: '删除任务' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTask(@CurrentUser('sub') userId: number, @Param('taskNo') taskNo: string) {
    await this.conversionService.deleteTask(taskNo, userId);
  }

  @Get()
  @ApiOperation({ summary: '获取转换任务列表' })
  async getTaskList(
    @CurrentUser('sub') userId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('category') category?: string,
  ) {
    return this.conversionService.getTaskList(userId, page, pageSize, status, type, category);
  }
}
