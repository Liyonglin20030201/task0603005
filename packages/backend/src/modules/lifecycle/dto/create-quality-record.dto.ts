import { IsNumber, IsString, IsEnum, IsArray, IsOptional, IsDateString, ValidateNested, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CheckItemDto {
  @IsString()
  item: string;

  @IsString()
  standard: string;

  @IsString()
  actual: string;
}

export class CreateQualityRecordDto {
  @ApiProperty({ description: '商品ID' })
  @IsNumber()
  productId: number;

  @ApiPropertyOptional({ description: '批次ID' })
  @IsOptional()
  @IsNumber()
  batchId?: number;

  @ApiProperty({ description: '检验类型' })
  @IsString()
  checkType: string;

  @ApiProperty({ description: '检验结果', enum: ['passed', 'failed', 'conditional'] })
  @IsEnum(['passed', 'failed', 'conditional'])
  result: string;

  @ApiProperty({ description: '质量评分 0-100' })
  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;

  @ApiProperty({ description: '检验员' })
  @IsString()
  inspector: string;

  @ApiProperty({ description: '检验项目' })
  @IsArray()
  checkItems: Array<{ item: string; standard: string; actual: string; passed: boolean }>;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;

  @ApiPropertyOptional({ description: '附件' })
  @IsOptional()
  @IsArray()
  attachments?: string[];

  @ApiPropertyOptional({ description: '检验时间' })
  @IsOptional()
  @IsDateString()
  checkedAt?: string;
}
