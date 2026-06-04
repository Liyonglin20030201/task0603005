import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsOptional, IsString } from 'class-validator';

export class AdjustInventoryDto {
  @ApiProperty({ description: '商品ID' })
  @IsNotEmpty({ message: '商品ID不能为空' })
  @IsInt()
  productId: number;

  @ApiProperty({ description: '调整数量（正数入库，负数出库）' })
  @IsNotEmpty({ message: '数量不能为空' })
  @IsInt()
  quantity: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}
