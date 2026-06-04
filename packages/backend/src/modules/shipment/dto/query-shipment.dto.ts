import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class QueryShipmentDto extends PaginationDto {
  @ApiPropertyOptional({ description: '快递单号' })
  @IsOptional()
  @IsString()
  trackingNo?: string;

  @ApiPropertyOptional({ description: '快递公司' })
  @IsOptional()
  @IsString()
  carrier?: string;

  @ApiPropertyOptional({ description: '物流状态' })
  @IsOptional()
  @IsEnum(['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed'])
  status?: string;

  @ApiPropertyOptional({ description: '订单号' })
  @IsOptional()
  @IsString()
  orderNo?: string;
}
