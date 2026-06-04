import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateChannelDto {
  @ApiProperty({ description: '渠道名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '平台', enum: ['taobao', 'jd', 'pdd', 'douyin', 'weixin', 'self'] })
  @IsEnum(['taobao', 'jd', 'pdd', 'douyin', 'weixin', 'self'])
  platform: string;

  @ApiProperty({ description: 'App Key' })
  @IsString()
  appKey: string;

  @ApiProperty({ description: 'App Secret' })
  @IsString()
  appSecret: string;

  @ApiPropertyOptional({ description: 'Webhook URL' })
  @IsOptional()
  @IsString()
  webhookUrl?: string;
}
