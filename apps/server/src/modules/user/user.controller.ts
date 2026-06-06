import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreditService } from '../credit/credit.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('用户')
@Controller('v1/user')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly creditService: CreditService,
  ) {}

  @Get('profile')
  @ApiOperation({ summary: '获取当前用户信息' })
  getProfile(@CurrentUser('sub') userId: number) {
    return this.userService.getProfile(userId);
  }

  @Patch('profile')
  @ApiOperation({ summary: '更新用户信息' })
  updateProfile(@CurrentUser('sub') userId: number, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(userId, dto);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '修改密码' })
  changePassword(@CurrentUser('sub') userId: number, @Body() dto: ChangePasswordDto) {
    return this.userService.changePassword(userId, dto);
  }

  @Get('credit-transactions')
  @ApiOperation({ summary: '获取积分流水记录' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  getCreditTransactions(
    @CurrentUser('sub') userId: number,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.creditService.getTransactions(userId, page || 1, pageSize || 20);
  }

  @Get('invite-stats')
  @ApiOperation({ summary: '获取邀请统计' })
  getInviteStats(@CurrentUser('sub') userId: number) {
    return this.userService.getInviteStats(userId);
  }

  @Get('invite-history')
  @ApiOperation({ summary: '获取邀请历史' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  getInviteHistory(
    @CurrentUser('sub') userId: number,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.userService.getInviteHistory(userId, page || 1, pageSize || 20);
  }
}
