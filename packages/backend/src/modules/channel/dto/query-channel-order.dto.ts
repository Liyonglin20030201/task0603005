import { IsOptional, IsString, IsEnum, IsDateString, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class QueryChannelOrderDto extends PaginationDto {
  @ApiPropertyOptional({ description: '渠道ID' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  channelId?: number;

  @ApiPropertyOptional({ description: '平台' })
  @IsOptional()
  @IsEnum(['taobao', 'jd', 'pdd', 'douyin', 'weixin', 'self'])
  platform?: string;

  @ApiPropertyOptional({ description: '同步状态' })
  @IsOptional()
  @IsEnum(['pending', 'synced', 'failed'])
  syncStatus?: string;

  @ApiPropertyOptional({ description: '平台订单号' })
  @IsOptional()
  @IsString()
  platformOrderNo?: string;

  @ApiPropertyOptional({ description: '开始日期' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
