import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ForecastService } from './forecast.service';
import { QueryForecastDto } from './dto/query-forecast.dto';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { PERMISSIONS } from '@ecommerce/shared';

@ApiTags('库存预测')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('forecast')
export class ForecastController {
  constructor(private readonly forecastService: ForecastService) {}

  @Get()
  @RequirePermission(PERMISSIONS.FORECAST_VIEW)
  @ApiOperation({ summary: '获取库存预测列表' })
  getForecastList(@Query() query: QueryForecastDto) {
    return this.forecastService.getForecastList(query);
  }

  @Get('summary')
  @RequirePermission(PERMISSIONS.FORECAST_VIEW)
  @ApiOperation({ summary: '获取预测汇总' })
  getSummary(@Query('leadTime') leadTime?: number) {
    return this.forecastService.getSummary(leadTime || 7);
  }

  @Get(':productId')
  @RequirePermission(PERMISSIONS.FORECAST_VIEW)
  @ApiOperation({ summary: '获取单个商品预测' })
  getForecastByProduct(
    @Param('productId') productId: number,
    @Query('leadTime') leadTime?: number,
    @Query('safetyStockDays') safetyStockDays?: number,
  ) {
    return this.forecastService.getForecastByProduct(productId, leadTime || 7, safetyStockDays || 3);
  }
}
