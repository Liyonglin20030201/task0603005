import { IsString, IsDateString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSettlementDto {
  @ApiProperty({ description: '平台' })
  @IsString()
  platform: string;

  @ApiProperty({ description: '结算开始日期' })
  @IsDateString()
  periodStart: string;

  @ApiProperty({ description: '结算结束日期' })
  @IsDateString()
  periodEnd: string;

  @ApiProperty({ description: '总金额' })
  @IsNumber()
  grossAmount: number;

  @ApiProperty({ description: '订单数' })
  @IsNumber()
  orderCount: number;

  @ApiPropertyOptional({ description: '退款订单数' })
  @IsOptional()
  @IsNumber()
  refundCount?: number;

  @ApiPropertyOptional({ description: '退款金额' })
  @IsOptional()
  @IsNumber()
  refundAmount?: number;
}
