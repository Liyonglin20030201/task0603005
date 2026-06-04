import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class QueryCouponDto extends PaginationDto {
  @ApiPropertyOptional({ description: '优惠券名称搜索' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '类型筛选' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: '状态筛选' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;
}
