import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { CreditService } from './credit.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [CreditService],
  exports: [CreditService],
})
export class CreditModule {}
