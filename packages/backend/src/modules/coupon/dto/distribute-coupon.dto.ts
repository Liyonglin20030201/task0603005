import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsArray, ArrayNotEmpty } from 'class-validator';

export class DistributeCouponDto {
  @ApiProperty({ description: '优惠券ID' })
  @IsNotEmpty({ message: '优惠券ID不能为空' })
  @IsInt()
  couponId: number;

  @ApiProperty({ description: '用户ID列表', type: [Number] })
  @IsArray()
  @ArrayNotEmpty({ message: '用户ID列表不能为空' })
  @IsInt({ each: true })
  userIds: number[];
}
