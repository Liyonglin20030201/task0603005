import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ description: '角色名' })
  @IsNotEmpty({ message: '角色名不能为空' })
  @IsString()
  name: string;

  @ApiProperty({ description: '角色编码' })
  @IsNotEmpty({ message: '角色编码不能为空' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '权限标识数组' })
  @IsOptional()
  @IsArray()
  permissions?: string[];
}
