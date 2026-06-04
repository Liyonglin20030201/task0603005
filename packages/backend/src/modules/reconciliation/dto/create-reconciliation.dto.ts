import { IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReconciliationDto {
  @ApiProperty({ description: '平台' })
  @IsString()
  platform: string;

  @ApiProperty({ description: '对账开始日期' })
  @IsDateString()
  periodStart: string;

  @ApiProperty({ description: '对账结束日期' })
  @IsDateString()
  periodEnd: string;
}
