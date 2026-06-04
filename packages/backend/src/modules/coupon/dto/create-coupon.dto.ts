import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsIn, IsNumber, IsOptional, IsInt, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCouponDto {
  @ApiProperty({ description: '优惠券名称' })
  @IsNotEmpty({ message: '名称不能为空' })
  @IsString()
  name: string;

  @ApiProperty({ description: '优惠券编码' })
  @IsNotEmpty({ message: '编码不能为空' })
  @IsString()
  code: string;

  @ApiProperty({ description: '类型: fixed固定金额 percentage百分比', enum: ['fixed', 'percentage'] })
  @IsNotEmpty({ message: '类型不能为空' })
  @IsIn(['fixed', 'percentage'])
  type: string;

  @ApiProperty({ description: '优惠值' })
  @IsNotEmpty({ message: '优惠值不能为空' })
  @Type(() => Number)
  @IsNumber()
  value: number;

  @ApiPropertyOptional({ description: '最低消费金额', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minAmount?: number;

  @ApiProperty({ description: '发放总量' })
  @IsNotEmpty({ message: '发放总量不能为空' })
  @Type(() => Number)
  @IsInt()
  totalCount: number;

  @ApiProperty({ description: '开始时间' })
  @IsNotEmpty({ message: '开始时间不能为空' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ description: '结束时间' })
  @IsNotEmpty({ message: '结束时间不能为空' })
  @IsDateString()
  endTime: string;

  @ApiPropertyOptional({ description: '状态: 0禁用 1启用', default: 1 })
  @IsOptional()
  @IsIn([0, 1])
  status?: number;
}
