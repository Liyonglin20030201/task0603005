import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { OperationLogMeta } from '../../common/decorators/operation-log.decorator';
import { PERMISSIONS } from '@ecommerce/shared';

@ApiTags('分类管理')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @RequirePermission(PERMISSIONS.CATEGORY_CREATE)
  @OperationLogMeta('category', 'create')
  @ApiOperation({ summary: '创建分类' })
  create(@Body() createDto: CreateCategoryDto) {
    return this.categoryService.create(createDto);
  }

  @Get()
  @RequirePermission(PERMISSIONS.CATEGORY_VIEW)
  @ApiOperation({ summary: '分类列表' })
  @ApiQuery({ name: 'tree', required: false, description: '是否返回树形结构' })
  findAll(@Query('tree') tree?: string) {
    return this.categoryService.findAll(tree === 'true');
  }

  @Get(':id')
  @RequirePermission(PERMISSIONS.CATEGORY_VIEW)
  @ApiOperation({ summary: '分类详情' })
  findOne(@Param('id') id: number) {
    return this.categoryService.findOne(id);
  }

  @Put(':id')
  @RequirePermission(PERMISSIONS.CATEGORY_UPDATE)
  @OperationLogMeta('category', 'update')
  @ApiOperation({ summary: '更新分类' })
  update(@Param('id') id: number, @Body() updateDto: UpdateCategoryDto) {
    return this.categoryService.update(id, updateDto);
  }

  @Delete(':id')
  @RequirePermission(PERMISSIONS.CATEGORY_DELETE)
  @OperationLogMeta('category', 'delete')
  @ApiOperation({ summary: '删除分类' })
  remove(@Param('id') id: number) {
    return this.categoryService.remove(id);
  }
}
