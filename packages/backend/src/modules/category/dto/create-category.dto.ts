import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsInt, IsIn } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ description: '分类名称' })
  @IsNotEmpty({ message: '分类名称不能为空' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '父级ID', default: 0 })
  @IsOptional()
  @IsInt()
  parentId?: number = 0;

  @ApiPropertyOptional({ description: '排序' })
  @IsOptional()
  @IsInt()
  sort?: number;

  @ApiPropertyOptional({ description: '图标' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: '状态: 0禁用 1正常' })
  @IsOptional()
  @IsIn([0, 1])
  status?: number;
}
