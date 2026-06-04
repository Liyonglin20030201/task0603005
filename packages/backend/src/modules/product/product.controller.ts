import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { OperationLogMeta } from '../../common/decorators/operation-log.decorator';
import { PERMISSIONS } from '@ecommerce/shared';

@ApiTags('商品管理')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @RequirePermission(PERMISSIONS.PRODUCT_CREATE)
  @OperationLogMeta('product', 'create')
  @ApiOperation({ summary: '创建商品' })
  create(@Body() createDto: CreateProductDto) {
    return this.productService.create(createDto);
  }

  @Get()
  @RequirePermission(PERMISSIONS.PRODUCT_VIEW)
  @ApiOperation({ summary: '商品列表' })
  findAll(@Query() query: QueryProductDto) {
    return this.productService.findAll(query);
  }

  @Get(':id')
  @RequirePermission(PERMISSIONS.PRODUCT_VIEW)
  @ApiOperation({ summary: '商品详情' })
  findOne(@Param('id') id: number) {
    return this.productService.findOne(id);
  }

  @Put(':id')
  @RequirePermission(PERMISSIONS.PRODUCT_UPDATE)
  @OperationLogMeta('product', 'update')
  @ApiOperation({ summary: '更新商品' })
  update(@Param('id') id: number, @Body() updateDto: UpdateProductDto) {
    return this.productService.update(id, updateDto);
  }

  @Delete(':id')
  @RequirePermission(PERMISSIONS.PRODUCT_DELETE)
  @OperationLogMeta('product', 'delete')
  @ApiOperation({ summary: '删除商品' })
  remove(@Param('id') id: number) {
    return this.productService.remove(id);
  }
}
