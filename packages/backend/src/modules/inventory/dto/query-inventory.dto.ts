import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class QueryInventoryDto extends PaginationDto {
  @ApiPropertyOptional({ description: '商品名称搜索' })
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiPropertyOptional({ description: '是否低于预警线' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  belowWarning?: boolean;
}
