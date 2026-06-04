import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class QueryABTestDto extends PaginationDto {
  @ApiPropertyOptional({ description: '测试名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '测试类型' })
  @IsOptional()
  @IsEnum(['price', 'page_layout', 'promotion', 'copy', 'image', 'recommendation'])
  type?: string;

  @ApiPropertyOptional({ description: '测试状态' })
  @IsOptional()
  @IsEnum(['draft', 'running', 'paused', 'completed', 'archived'])
  status?: string;
}
