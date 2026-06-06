import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminGuard } from './guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('管理后台')
@Controller('v1/admin')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: '系统总览统计' })
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  @ApiOperation({ summary: '用户列表' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  getUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getUsers(page, pageSize, search, status);
  }

  @Patch('users/:id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '修改用户状态' })
  updateUserStatus(
    @Param('id', ParseIntPipe) userId: number,
    @Body('status') status: 'active' | 'disabled',
  ) {
    return this.adminService.updateUserStatus(userId, status);
  }

  @Patch('users/:id/credits')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '调整用户积分' })
  adjustUserCredits(
    @Param('id', ParseIntPipe) userId: number,
    @Body('amount', ParseIntPipe) amount: number,
    @Body('reason') reason?: string,
  ) {
    return this.adminService.adjustUserCredits(userId, amount, reason);
  }

  @Get('tasks')
  @ApiOperation({ summary: '最近任务列表' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  getRecentTasks(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
  ) {
    return this.adminService.getRecentTasks(page, pageSize);
  }
}
