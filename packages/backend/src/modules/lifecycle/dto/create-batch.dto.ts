import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBatchDto {
  @ApiProperty({ description: '商品ID' })
  @IsNumber()
  productId: number;

  @ApiProperty({ description: '批次号' })
  @IsString()
  batchNo: string;

  @ApiProperty({ description: '数量' })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: '成本价' })
  @IsNumber()
  costPrice: number;

  @ApiProperty({ description: '供应商' })
  @IsString()
  supplier: string;

  @ApiProperty({ description: '生产日期' })
  @IsDateString()
  productionDate: string;

  @ApiPropertyOptional({ description: '过期日期' })
  @IsOptional()
  @IsDateString()
  expirationDate?: string;
}
