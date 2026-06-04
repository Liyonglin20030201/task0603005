import { IsString, IsEnum, IsOptional, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCampaignDto {
  @ApiProperty({ description: '活动名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '活动类型', enum: ['flash_sale', 'bundle', 'discount', 'free_shipping'] })
  @IsEnum(['flash_sale', 'bundle', 'discount', 'free_shipping'])
  type: string;

  @ApiProperty({ description: '开始时间' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ description: '结束时间' })
  @IsDateString()
  endTime: string;

  @ApiPropertyOptional({ description: '活动规则' })
  @IsOptional()
  rules?: object;

  @ApiPropertyOptional({ description: '预算' })
  @IsOptional()
  @IsNumber()
  budget?: number;

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  description?: string;
}
