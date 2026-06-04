import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class QueryRoleDto extends PaginationDto {
  @ApiPropertyOptional({ description: '角色名搜索' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '状态筛选' })
  @IsOptional()
  @IsInt()
  status?: number;
}
