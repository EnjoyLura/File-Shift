import { IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: 'Abc123456' })
  @IsString()
  @MinLength(6)
  oldPassword: string;

  @ApiProperty({ example: 'Xyz789012' })
  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d).+$/, {
    message: '密码必须包含字母和数字',
  })
  newPassword: string;
}
