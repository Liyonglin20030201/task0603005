import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength, IsInt, IsEmail, IsIn } from 'class-validator';

export class UpdateAdminDto {
  @ApiPropertyOptional({ description: '密码' })
  @IsOptional()
  @MinLength(6, { message: '密码长度不能小于6位' })
  password?: string;

  @ApiPropertyOptional({ description: '昵称' })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiPropertyOptional({ description: '邮箱' })
  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;

  @ApiPropertyOptional({ description: '手机号' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: '头像' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ description: '角色ID' })
  @IsOptional()
  @IsInt()
  roleId?: number;

  @ApiPropertyOptional({ description: '状态: 0禁用 1正常' })
  @IsOptional()
  @IsIn([0, 1])
  status?: number;
}
