import { IsString, IsEnum, IsOptional, IsNumber, IsArray, ValidateNested, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateVariantDto {
  @ApiProperty({ description: '变体名称' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '变体描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '流量占比(%)' })
  @IsNumber()
  @Min(1)
  @Max(100)
  trafficPercent: number;

  @ApiProperty({ description: '是否为对照组' })
  @IsBoolean()
  isControl: boolean;

  @ApiPropertyOptional({ description: '变体配置' })
  @IsOptional()
  config?: object;
}

export class CreateABTestDto {
  @ApiProperty({ description: '测试名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '测试类型', enum: ['price', 'page_layout', 'promotion', 'copy', 'image', 'recommendation'] })
  @IsEnum(['price', 'page_layout', 'promotion', 'copy', 'image', 'recommendation'])
  type: string;

  @ApiProperty({ description: '假设' })
  @IsString()
  hypothesis: string;

  @ApiProperty({ description: '主要指标', enum: ['conversion_rate', 'click_rate', 'revenue', 'aov', 'bounce_rate', 'engagement'] })
  @IsEnum(['conversion_rate', 'click_rate', 'revenue', 'aov', 'bounce_rate', 'engagement'])
  primaryMetric: string;

  @ApiPropertyOptional({ description: '次要指标' })
  @IsOptional()
  @IsArray()
  secondaryMetrics?: string[];

  @ApiPropertyOptional({ description: '目标样本量', default: 1000 })
  @IsOptional()
  @IsNumber()
  @Min(100)
  targetSampleSize?: number;

  @ApiPropertyOptional({ description: '置信水平', default: 0.95 })
  @IsOptional()
  @IsNumber()
  @Min(0.8)
  @Max(0.99)
  confidenceLevel?: number;

  @ApiProperty({ description: '变体列表', type: [CreateVariantDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  variants: CreateVariantDto[];
}
