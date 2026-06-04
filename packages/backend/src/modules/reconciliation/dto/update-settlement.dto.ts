import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSettlementDto {
  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: '银行账户' })
  @IsOptional()
  @IsString()
  bankAccount?: string;

  @ApiPropertyOptional({ description: '结算时间' })
  @IsOptional()
  @IsDateString()
  settledAt?: string;
}
