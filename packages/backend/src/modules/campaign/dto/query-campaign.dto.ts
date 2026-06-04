import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class QueryCampaignDto extends PaginationDto {
  @ApiPropertyOptional({ description: '活动名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '活动类型' })
  @IsOptional()
  @IsEnum(['flash_sale', 'bundle', 'discount', 'free_shipping'])
  type?: string;

  @ApiPropertyOptional({ description: '活动状态' })
  @IsOptional()
  @IsEnum(['draft', 'active', 'paused', 'ended'])
  status?: string;
}
