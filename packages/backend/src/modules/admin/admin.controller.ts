import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { QueryAdminDto } from './dto/query-admin.dto';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { OperationLogMeta } from '../../common/decorators/operation-log.decorator';
import { PERMISSIONS } from '@ecommerce/shared';

@ApiTags('管理员管理')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('admins')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @RequirePermission(PERMISSIONS.ADMIN_CREATE)
  @OperationLogMeta('admin', 'create')
  @ApiOperation({ summary: '创建管理员' })
  create(@Body() createDto: CreateAdminDto) {
    return this.adminService.create(createDto);
  }

  @Get()
  @RequirePermission(PERMISSIONS.ADMIN_VIEW)
  @ApiOperation({ summary: '管理员列表' })
  findAll(@Query() query: QueryAdminDto) {
    return this.adminService.findAll(query);
  }

  @Get(':id')
  @RequirePermission(PERMISSIONS.ADMIN_VIEW)
  @ApiOperation({ summary: '管理员详情' })
  findOne(@Param('id') id: number) {
    return this.adminService.findOne(id);
  }

  @Put(':id')
  @RequirePermission(PERMISSIONS.ADMIN_UPDATE)
  @OperationLogMeta('admin', 'update')
  @ApiOperation({ summary: '更新管理员' })
  update(@Param('id') id: number, @Body() updateDto: UpdateAdminDto) {
    return this.adminService.update(id, updateDto);
  }

  @Delete(':id')
  @RequirePermission(PERMISSIONS.ADMIN_DELETE)
  @OperationLogMeta('admin', 'delete')
  @ApiOperation({ summary: '删除管理员' })
  remove(@Param('id') id: number) {
    return this.adminService.remove(id);
  }
}
