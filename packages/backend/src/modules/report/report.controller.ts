import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ReportService } from './report.service';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { PERMISSIONS } from '@ecommerce/shared';

@ApiTags('数据报表')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('dashboard')
  @RequirePermission(PERMISSIONS.REPORT_VIEW)
  @ApiOperation({ summary: '仪表盘概览数据' })
  getDashboard() {
    return this.reportService.getDashboard();
  }

  @Get('sales')
  @RequirePermission(PERMISSIONS.REPORT_VIEW)
  @ApiOperation({ summary: '销售报表（按日期）' })
  getSalesReport(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.reportService.getSalesReport(startDate, endDate);
  }

  @Get('order-status')
  @RequirePermission(PERMISSIONS.REPORT_VIEW)
  @ApiOperation({ summary: '订单状态分布' })
  getOrderStatusReport() {
    return this.reportService.getOrderStatusReport();
  }

  @Get('top-products')
  @RequirePermission(PERMISSIONS.REPORT_VIEW)
  @ApiOperation({ summary: '热销商品排行' })
  getTopProducts(@Query('limit') limit: number = 10) {
    return this.reportService.getTopProducts(limit);
  }

  @Get('inventory')
  @RequirePermission(PERMISSIONS.REPORT_VIEW)
  @ApiOperation({ summary: '库存报表' })
  getInventoryReport() {
    return this.reportService.getInventoryReport();
  }
}
