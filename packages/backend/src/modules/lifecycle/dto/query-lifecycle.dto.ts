import { IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class QueryLifecycleDto extends PaginationDto {
  @ApiPropertyOptional({ description: '商品ID' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  productId?: number;

  @ApiPropertyOptional({ description: '当前阶段' })
  @IsOptional()
  @IsEnum(['development', 'testing', 'pre_sale', 'on_sale', 'promotion', 'clearance', 'discontinued'])
  currentStage?: string;
}

export class QueryBatchDto extends PaginationDto {
  @ApiPropertyOptional({ description: '商品ID' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  productId?: number;

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @IsEnum(['active', 'quarantine', 'recalled', 'expired', 'depleted'])
  status?: string;
}

export class QueryQualityRecordDto extends PaginationDto {
  @ApiPropertyOptional({ description: '商品ID' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  productId?: number;

  @ApiPropertyOptional({ description: '批次ID' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  batchId?: number;

  @ApiPropertyOptional({ description: '检验结果' })
  @IsOptional()
  @IsEnum(['passed', 'failed', 'conditional'])
  result?: string;
}
