import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminGuard } from './guards/admin.guard';
import { User } from '../user/entities/user.entity';
import { ConversionTask } from '../conversion/entities/conversion-task.entity';
import { CreditTransaction } from '../credit/entities/credit-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, ConversionTask, CreditTransaction])],
  controllers: [AdminController],
  providers: [AdminService, AdminGuard],
})
export class AdminModule {}
