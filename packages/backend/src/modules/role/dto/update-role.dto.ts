import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, IsIn } from 'class-validator';

export class UpdateRoleDto {
  @ApiPropertyOptional({ description: '角色名' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '权限标识数组' })
  @IsOptional()
  @IsArray()
  permissions?: string[];

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @IsIn([0, 1])
  status?: number;
}
