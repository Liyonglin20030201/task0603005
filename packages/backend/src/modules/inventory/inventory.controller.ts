import { Controller, Get, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { InventoryService } from './inventory.service';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { QueryInventoryDto } from './dto/query-inventory.dto';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { OperationLogMeta } from '../../common/decorators/operation-log.decorator';
import { CurrentAdmin } from '../../common/decorators/current-admin.decorator';
import { PERMISSIONS } from '@ecommerce/shared';

@ApiTags('库存管理')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @RequirePermission(PERMISSIONS.INVENTORY_VIEW)
  @ApiOperation({ summary: '库存列表' })
  findAll(@Query() query: QueryInventoryDto) {
    return this.inventoryService.findAll(query);
  }

  @Get(':productId')
  @RequirePermission(PERMISSIONS.INVENTORY_VIEW)
  @ApiOperation({ summary: '商品库存详情' })
  findByProduct(@Param('productId') productId: number) {
    return this.inventoryService.findByProductId(productId);
  }

  @Put('adjust')
  @RequirePermission(PERMISSIONS.INVENTORY_UPDATE)
  @OperationLogMeta('inventory', 'adjust')
  @ApiOperation({ summary: '调整库存（入库/出库）' })
  adjust(@Body() dto: AdjustInventoryDto, @CurrentAdmin('id') adminId: number) {
    return this.inventoryService.adjust(dto, adminId);
  }

  @Put(':productId/warning')
  @RequirePermission(PERMISSIONS.INVENTORY_UPDATE)
  @OperationLogMeta('inventory', 'updateWarning')
  @ApiOperation({ summary: '设置库存预警阈值' })
  updateWarning(@Param('productId') productId: number, @Body('threshold') threshold: number) {
    return this.inventoryService.updateWarningThreshold(productId, threshold);
  }

  @Get(':productId/logs')
  @RequirePermission(PERMISSIONS.INVENTORY_VIEW)
  @ApiOperation({ summary: '库存变动记录' })
  getLogs(
    @Param('productId') productId: number,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
  ) {
    return this.inventoryService.getLogs(productId, page, pageSize);
  }
}
