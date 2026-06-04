import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { QueryCouponDto } from './dto/query-coupon.dto';
import { DistributeCouponDto } from './dto/distribute-coupon.dto';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { OperationLogMeta } from '../../common/decorators/operation-log.decorator';
import { PERMISSIONS } from '@ecommerce/shared';

@ApiTags('优惠券管理')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  @RequirePermission(PERMISSIONS.COUPON_CREATE)
  @OperationLogMeta('coupon', 'create')
  @ApiOperation({ summary: '创建优惠券' })
  create(@Body() createDto: CreateCouponDto) {
    return this.couponService.create(createDto);
  }

  @Post('distribute')
  @RequirePermission(PERMISSIONS.COUPON_UPDATE)
  @OperationLogMeta('coupon', 'distribute')
  @ApiOperation({ summary: '发放优惠券' })
  distribute(@Body() distributeDto: DistributeCouponDto) {
    return this.couponService.distribute(distributeDto);
  }

  @Get()
  @RequirePermission(PERMISSIONS.COUPON_VIEW)
  @ApiOperation({ summary: '优惠券列表' })
  findAll(@Query() query: QueryCouponDto) {
    return this.couponService.findAll(query);
  }

  @Get('user/:userId')
  @RequirePermission(PERMISSIONS.COUPON_VIEW)
  @ApiOperation({ summary: '获取用户优惠券' })
  getUserCoupons(@Param('userId') userId: number) {
    return this.couponService.getUserCoupons(userId);
  }

  @Get(':id')
  @RequirePermission(PERMISSIONS.COUPON_VIEW)
  @ApiOperation({ summary: '优惠券详情' })
  findOne(@Param('id') id: number) {
    return this.couponService.findOne(id);
  }

  @Put(':id')
  @RequirePermission(PERMISSIONS.COUPON_UPDATE)
  @OperationLogMeta('coupon', 'update')
  @ApiOperation({ summary: '更新优惠券' })
  update(@Param('id') id: number, @Body() updateDto: UpdateCouponDto) {
    return this.couponService.update(id, updateDto);
  }

  @Delete(':id')
  @RequirePermission(PERMISSIONS.COUPON_DELETE)
  @OperationLogMeta('coupon', 'delete')
  @ApiOperation({ summary: '删除优惠券' })
  remove(@Param('id') id: number) {
    return this.couponService.remove(id);
  }
}
