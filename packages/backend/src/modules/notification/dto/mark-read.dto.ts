import { IsArray, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MarkReadDto {
  @ApiProperty({ description: '通知ID列表', type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  ids: number[];
}
