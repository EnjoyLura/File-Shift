import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';
import type { ApiResponse } from '@fileshift/shared-types';

@ApiTags('系统')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: '健康检查' })
  getHealth(): ApiResponse<{ status: string; timestamp: string }> {
    return this.appService.getHealth();
  }
}
