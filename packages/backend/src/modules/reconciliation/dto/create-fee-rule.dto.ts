import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFeeRuleDto {
  @ApiProperty({ description: '平台' })
  @IsString()
  platform: string;

  @ApiProperty({ description: '费用类型' })
  @IsString()
  feeType: string;

  @ApiProperty({ description: '费率' })
  @IsNumber()
  rate: number;

  @ApiPropertyOptional({ description: '固定金额' })
  @IsOptional()
  @IsNumber()
  fixedAmount?: number;

  @ApiPropertyOptional({ description: '最小金额' })
  @IsOptional()
  @IsNumber()
  minAmount?: number;

  @ApiPropertyOptional({ description: '最大金额' })
  @IsOptional()
  @IsNumber()
  maxAmount?: number;

  @ApiProperty({ description: '生效起始日期' })
  @IsDateString()
  effectiveFrom: string;

  @ApiPropertyOptional({ description: '生效结束日期' })
  @IsOptional()
  @IsDateString()
  effectiveTo?: string;
}
