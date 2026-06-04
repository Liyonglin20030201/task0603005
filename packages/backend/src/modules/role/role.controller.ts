import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { OperationLogMeta } from '../../common/decorators/operation-log.decorator';
import { PERMISSIONS } from '@ecommerce/shared';

@ApiTags('角色管理')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @RequirePermission(PERMISSIONS.ROLE_CREATE)
  @OperationLogMeta('role', 'create')
  @ApiOperation({ summary: '创建角色' })
  create(@Body() createDto: CreateRoleDto) {
    return this.roleService.create(createDto);
  }

  @Get()
  @RequirePermission(PERMISSIONS.ROLE_VIEW)
  @ApiOperation({ summary: '角色列表' })
  findAll(@Query() query: QueryRoleDto) {
    return this.roleService.findAll(query);
  }

  @Get(':id')
  @RequirePermission(PERMISSIONS.ROLE_VIEW)
  @ApiOperation({ summary: '角色详情' })
  findOne(@Param('id') id: number) {
    return this.roleService.findOne(id);
  }

  @Put(':id')
  @RequirePermission(PERMISSIONS.ROLE_UPDATE)
  @OperationLogMeta('role', 'update')
  @ApiOperation({ summary: '更新角色' })
  update(@Param('id') id: number, @Body() updateDto: UpdateRoleDto) {
    return this.roleService.update(id, updateDto);
  }

  @Delete(':id')
  @RequirePermission(PERMISSIONS.ROLE_DELETE)
  @OperationLogMeta('role', 'delete')
  @ApiOperation({ summary: '删除角色' })
  remove(@Param('id') id: number) {
    return this.roleService.remove(id);
  }
}
