import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ConversionService } from './conversion.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('转换')
@Controller('v1/conversions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ConversionController {
  constructor(private readonly conversionService: ConversionService) {}

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

  @Get(':taskNo')
  @ApiOperation({ summary: '查询任务状态' })
  async getTaskStatus(@CurrentUser('sub') userId: number, @Param('taskNo') taskNo: string) {
    return this.conversionService.getTaskStatus(taskNo, userId);
  }

  @Get()
  @ApiOperation({ summary: '获取转换任务列表' })
  async getTaskList(
    @CurrentUser('sub') userId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
  ) {
    return this.conversionService.getTaskList(userId, page, pageSize);
  }
}
