import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CampaignService } from './campaign.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { QueryCampaignDto } from './dto/query-campaign.dto';
import { AddCampaignProductDto } from './dto/add-campaign-product.dto';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { OperationLogMeta } from '../../common/decorators/operation-log.decorator';
import { PERMISSIONS } from '@ecommerce/shared';

@ApiTags('营销活动')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('campaigns')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Get()
  @RequirePermission(PERMISSIONS.CAMPAIGN_VIEW)
  @ApiOperation({ summary: '活动列表' })
  findAll(@Query() query: QueryCampaignDto) {
    return this.campaignService.findAll(query);
  }

  @Get(':id')
  @RequirePermission(PERMISSIONS.CAMPAIGN_VIEW)
  @ApiOperation({ summary: '活动详情' })
  findOne(@Param('id') id: number) {
    return this.campaignService.findOne(id);
  }

  @Post()
  @RequirePermission(PERMISSIONS.CAMPAIGN_CREATE)
  @OperationLogMeta('campaign', 'create')
  @ApiOperation({ summary: '创建活动' })
  create(@Body() dto: CreateCampaignDto) {
    return this.campaignService.create(dto);
  }

  @Put(':id')
  @RequirePermission(PERMISSIONS.CAMPAIGN_UPDATE)
  @OperationLogMeta('campaign', 'update')
  @ApiOperation({ summary: '更新活动' })
  update(@Param('id') id: number, @Body() dto: UpdateCampaignDto) {
    return this.campaignService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission(PERMISSIONS.CAMPAIGN_DELETE)
  @OperationLogMeta('campaign', 'delete')
  @ApiOperation({ summary: '删除活动' })
  remove(@Param('id') id: number) {
    return this.campaignService.remove(id);
  }

  @Post(':id/products')
  @RequirePermission(PERMISSIONS.CAMPAIGN_UPDATE)
  @OperationLogMeta('campaign', 'addProducts')
  @ApiOperation({ summary: '添加活动商品' })
  addProducts(@Param('id') id: number, @Body() dto: AddCampaignProductDto) {
    return this.campaignService.addProducts(id, dto);
  }

  @Delete(':id/products/:productId')
  @RequirePermission(PERMISSIONS.CAMPAIGN_UPDATE)
  @OperationLogMeta('campaign', 'removeProduct')
  @ApiOperation({ summary: '移除活动商品' })
  removeProduct(@Param('id') id: number, @Param('productId') productId: number) {
    return this.campaignService.removeProduct(id, productId);
  }

  @Put(':id/activate')
  @RequirePermission(PERMISSIONS.CAMPAIGN_UPDATE)
  @OperationLogMeta('campaign', 'activate')
  @ApiOperation({ summary: '激活活动' })
  activate(@Param('id') id: number) {
    return this.campaignService.activate(id);
  }

  @Put(':id/pause')
  @RequirePermission(PERMISSIONS.CAMPAIGN_UPDATE)
  @OperationLogMeta('campaign', 'pause')
  @ApiOperation({ summary: '暂停活动' })
  pause(@Param('id') id: number) {
    return this.campaignService.pause(id);
  }

  @Put(':id/end')
  @RequirePermission(PERMISSIONS.CAMPAIGN_UPDATE)
  @OperationLogMeta('campaign', 'end')
  @ApiOperation({ summary: '结束活动' })
  end(@Param('id') id: number) {
    return this.campaignService.end(id);
  }
}
