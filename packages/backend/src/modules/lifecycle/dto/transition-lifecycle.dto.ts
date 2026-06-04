import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TransitionLifecycleDto {
  @ApiProperty({ description: '目标阶段', enum: ['development', 'testing', 'pre_sale', 'on_sale', 'promotion', 'clearance', 'discontinued'] })
  @IsString()
  @IsEnum(['development', 'testing', 'pre_sale', 'on_sale', 'promotion', 'clearance', 'discontinued'])
  stage: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}
