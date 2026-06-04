import { IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RecordEventDto {
  @ApiProperty({ description: '测试ID' })
  @IsNumber()
  testId: number;

  @ApiProperty({ description: '变体ID' })
  @IsNumber()
  variantId: number;

  @ApiProperty({ description: '事件类型', enum: ['impression', 'click', 'conversion', 'purchase'] })
  @IsString()
  eventType: string;

  @ApiProperty({ description: '用户ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: '会话ID' })
  @IsString()
  sessionId: string;

  @ApiPropertyOptional({ description: '事件值' })
  @IsOptional()
  @IsNumber()
  value?: number;

  @ApiPropertyOptional({ description: '元数据' })
  @IsOptional()
  metadata?: object;
}
