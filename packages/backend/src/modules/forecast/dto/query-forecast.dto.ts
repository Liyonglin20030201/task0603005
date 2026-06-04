import { IsOptional, IsString, IsNumber, Min, IsBooleanString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class QueryForecastDto extends PaginationDto {
  @ApiPropertyOptional({ description: '商品名称' })
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiPropertyOptional({ description: '分类ID' })
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @ApiPropertyOptional({ description: '补货周期(天)', default: 7 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  leadTime?: number;

  @ApiPropertyOptional({ description: '安全库存天数', default: 3 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  safetyStockDays?: number;

  @ApiPropertyOptional({ description: '仅显示需补货商品' })
  @IsOptional()
  @IsBooleanString()
  onlyLowStock?: string;
}
