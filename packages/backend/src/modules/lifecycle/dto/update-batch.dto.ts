import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBatchDto {
  @ApiPropertyOptional({ description: '状态', enum: ['active', 'quarantine', 'recalled', 'expired', 'depleted'] })
  @IsOptional()
  @IsEnum(['active', 'quarantine', 'recalled', 'expired', 'depleted'])
  status?: string;

  @ApiPropertyOptional({ description: '剩余数量' })
  @IsOptional()
  @IsNumber()
  remainingQuantity?: number;
}
