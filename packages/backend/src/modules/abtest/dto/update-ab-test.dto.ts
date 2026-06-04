import { PartialType } from '@nestjs/swagger';
import { CreateABTestDto } from './create-ab-test.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateABTestDto extends PartialType(CreateABTestDto) {
  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @IsEnum(['draft', 'running', 'paused', 'completed', 'archived'])
  status?: string;
}
