import { IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({ description: '通知类型', enum: ['system', 'inventory_warning', 'order', 'campaign'] })
  @IsEnum(['system', 'inventory_warning', 'order', 'campaign'])
  type: string;

  @ApiProperty({ description: '标题' })
  @IsString()
  title: string;

  @ApiProperty({ description: '内容' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: '级别', enum: ['info', 'warning', 'error'] })
  @IsOptional()
  @IsEnum(['info', 'warning', 'error'])
  level?: string;

  @ApiPropertyOptional({ description: '接收者ID，不填则广播' })
  @IsOptional()
  @IsNumber()
  recipientId?: number;

  @ApiPropertyOptional({ description: '接收角色编码，如 operator/admin，按角色精准推送' })
  @IsOptional()
  @IsString()
  recipientRole?: string;

  @ApiPropertyOptional({ description: '额外数据' })
  @IsOptional()
  metadata?: object;
}
