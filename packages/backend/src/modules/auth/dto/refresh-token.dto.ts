import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: '刷新Token' })
  @IsNotEmpty({ message: 'refreshToken不能为空' })
  @IsString()
  refreshToken: string;
}
