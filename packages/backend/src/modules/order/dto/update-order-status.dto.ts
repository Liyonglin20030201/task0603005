import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({ description: '目标状态' })
  @IsNotEmpty({ message: '目标状态不能为空' })
  @IsString()
  status: string;

  @ApiPropertyOptional({ description: '原因（取消/退款时使用）' })
  @IsOptional()
  @IsString()
  reason?: string;
}
