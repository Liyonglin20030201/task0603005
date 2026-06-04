import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTrackingDto {
  @ApiProperty({ description: '物流状态', enum: ['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed'] })
  @IsEnum(['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed'])
  status: string;

  @ApiPropertyOptional({ description: '当前位置' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  description?: string;
}
