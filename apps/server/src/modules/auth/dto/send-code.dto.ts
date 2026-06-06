import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendCodeDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  target: string;

  @ApiProperty({ example: 'register', enum: ['register', 'login', 'reset_password'] })
  @IsIn(['register', 'login', 'reset_password', 'bind'])
  type: 'register' | 'login' | 'reset_password' | 'bind';
}
