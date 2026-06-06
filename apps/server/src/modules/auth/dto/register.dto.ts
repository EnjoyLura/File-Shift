import { IsEmail, IsString, MinLength, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Abc123456' })
  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d).+$/, {
    message: '密码必须包含字母和数字',
  })
  password: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(4)
  code: string;

  @ApiPropertyOptional({ example: 'ABC12345' })
  @IsOptional()
  @IsString()
  inviteCode?: string;
}
