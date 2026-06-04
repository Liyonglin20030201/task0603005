import { IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class CampaignProductItem {
  @ApiProperty({ description: '商品ID' })
  @IsNumber()
  productId: number;

  @ApiProperty({ description: '活动价格' })
  @IsNumber()
  @Min(0)
  campaignPrice: number;

  @ApiProperty({ description: '活动库存' })
  @IsNumber()
  @Min(1)
  stock: number;
}

export class AddCampaignProductDto {
  @ApiProperty({ description: '商品列表', type: [CampaignProductItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CampaignProductItem)
  products: CampaignProductItem[];
}
