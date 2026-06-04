import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsArray, ValidateNested, IsOptional, IsString, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @ApiProperty({ description: '商品ID' })
  @IsNotEmpty()
  @IsInt()
  productId: number;

  @ApiProperty({ description: '数量' })
  @IsNotEmpty()
  @IsInt()
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ description: '用户ID' })
  @IsNotEmpty({ message: '用户ID不能为空' })
  @IsInt()
  userId: number;

  @ApiProperty({ description: '订单项', type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiPropertyOptional({ description: '优惠券ID' })
  @IsOptional()
  @IsInt()
  couponId?: number;

  @ApiPropertyOptional({ description: '收货地址' })
  @IsOptional()
  @IsObject()
  address?: object;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}
