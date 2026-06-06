import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { CreditTransaction } from './entities/credit-transaction.entity';
import { CreditService } from './credit.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User, CreditTransaction])],
  providers: [CreditService],
  exports: [CreditService],
})
export class CreditModule {}
