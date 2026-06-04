import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class QueryAdminDto extends PaginationDto {
  @ApiPropertyOptional({ description: '用户名搜索' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ description: '状态筛选' })
  @IsOptional()
  @IsInt()
  status?: number;

  @ApiPropertyOptional({ description: '角色ID筛选' })
  @IsOptional()
  @IsInt()
  roleId?: number;
}
