import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsInt, IsNumber, IsArray } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ description: '商品名称' })
  @IsNotEmpty({ message: '商品名称不能为空' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'SKU编码' })
  @IsNotEmpty({ message: 'SKU不能为空' })
  @IsString()
  sku: string;

  @ApiProperty({ description: '分类ID' })
  @IsNotEmpty({ message: '分类不能为空' })
  @IsInt()
  categoryId: number;

  @ApiProperty({ description: '售价' })
  @IsNotEmpty({ message: '售价不能为空' })
  @IsNumber({}, { message: '售价必须为数字' })
  price: number;

  @ApiPropertyOptional({ description: '成本价' })
  @IsOptional()
  @IsNumber()
  costPrice?: number;

  @ApiPropertyOptional({ description: '商品描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '商品图片', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ description: '状态: 0下架 1上架', default: 1 })
  @IsOptional()
  @IsInt()
  status?: number = 1;
}
