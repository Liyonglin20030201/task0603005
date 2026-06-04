import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { OperationLogMeta } from '../../common/decorators/operation-log.decorator';
import { PERMISSIONS } from '@ecommerce/shared';

@ApiTags('用户管理')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @RequirePermission(PERMISSIONS.USER_CREATE)
  @OperationLogMeta('user', 'create')
  @ApiOperation({ summary: '创建用户' })
  create(@Body() createDto: CreateUserDto) {
    return this.userService.create(createDto);
  }

  @Get()
  @RequirePermission(PERMISSIONS.USER_VIEW)
  @ApiOperation({ summary: '用户列表' })
  findAll(@Query() query: QueryUserDto) {
    return this.userService.findAll(query);
  }

  @Get(':id')
  @RequirePermission(PERMISSIONS.USER_VIEW)
  @ApiOperation({ summary: '用户详情' })
  findOne(@Param('id') id: number) {
    return this.userService.findOne(id);
  }

  @Put(':id')
  @RequirePermission(PERMISSIONS.USER_UPDATE)
  @OperationLogMeta('user', 'update')
  @ApiOperation({ summary: '更新用户' })
  update(@Param('id') id: number, @Body() updateDto: UpdateUserDto) {
    return this.userService.update(id, updateDto);
  }

  @Delete(':id')
  @RequirePermission(PERMISSIONS.USER_DELETE)
  @OperationLogMeta('user', 'delete')
  @ApiOperation({ summary: '删除用户' })
  remove(@Param('id') id: number) {
    return this.userService.remove(id);
  }
}
