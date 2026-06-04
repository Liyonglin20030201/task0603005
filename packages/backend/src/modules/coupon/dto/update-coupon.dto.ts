import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn, IsNumber, IsInt, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCouponDto {
  @ApiPropertyOptional({ description: '优惠券名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '类型: fixed固定金额 percentage百分比', enum: ['fixed', 'percentage'] })
  @IsOptional()
  @IsIn(['fixed', 'percentage'])
  type?: string;

  @ApiPropertyOptional({ description: '优惠值' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  value?: number;

  @ApiPropertyOptional({ description: '最低消费金额' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minAmount?: number;

  @ApiPropertyOptional({ description: '发放总量' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  totalCount?: number;

  @ApiPropertyOptional({ description: '开始时间' })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiPropertyOptional({ description: '结束时间' })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiPropertyOptional({ description: '状态: 0禁用 1启用' })
  @IsOptional()
  @IsIn([0, 1])
  status?: number;
}
