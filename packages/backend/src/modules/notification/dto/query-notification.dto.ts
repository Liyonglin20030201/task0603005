import { IsOptional, IsEnum, IsString, IsBooleanString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class QueryNotificationDto extends PaginationDto {
  @ApiPropertyOptional({ description: '通知类型' })
  @IsOptional()
  @IsEnum(['system', 'inventory_warning', 'order', 'campaign'])
  type?: string;

  @ApiPropertyOptional({ description: '级别' })
  @IsOptional()
  @IsEnum(['info', 'warning', 'error'])
  level?: string;

  @ApiPropertyOptional({ description: '是否已读' })
  @IsOptional()
  @IsBooleanString()
  isRead?: string;

  @ApiPropertyOptional({ description: '开始日期' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期' })
  @IsOptional()
  @IsString()
  endDate?: string;
}
