import { IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShipmentDto {
  @ApiProperty({ description: '订单ID' })
  @IsNumber()
  orderId: number;

  @ApiProperty({ description: '快递单号' })
  @IsString()
  trackingNo: string;

  @ApiProperty({ description: '快递公司' })
  @IsString()
  carrier: string;

  @ApiPropertyOptional({ description: '预计送达时间' })
  @IsOptional()
  @IsString()
  estimatedDelivery?: string;
}
