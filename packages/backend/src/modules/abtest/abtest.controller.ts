import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ABTestService } from './abtest.service';
import { CreateABTestDto } from './dto/create-ab-test.dto';
import { UpdateABTestDto } from './dto/update-ab-test.dto';
import { QueryABTestDto } from './dto/query-ab-test.dto';
import { RecordEventDto } from './dto/record-event.dto';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { OperationLogMeta } from '../../common/decorators/operation-log.decorator';
import { PERMISSIONS } from '@ecommerce/shared';

@ApiTags('A/B测试')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('ab-tests')
export class ABTestController {
  constructor(private readonly abtestService: ABTestService) {}

  @Get('dashboard/summary')
  @RequirePermission(PERMISSIONS.ABTEST_VIEW)
  @ApiOperation({ summary: 'A/B测试仪表盘' })
  getDashboard() {
    return this.abtestService.getDashboard();
  }

  @Get()
  @RequirePermission(PERMISSIONS.ABTEST_VIEW)
  @ApiOperation({ summary: '测试列表' })
  findAll(@Query() query: QueryABTestDto) {
    return this.abtestService.findAll(query);
  }

  @Get(':id')
  @RequirePermission(PERMISSIONS.ABTEST_VIEW)
  @ApiOperation({ summary: '测试详情' })
  findOne(@Param('id') id: number) {
    return this.abtestService.findOne(id);
  }

  @Get(':id/report')
  @RequirePermission(PERMISSIONS.ABTEST_VIEW)
  @ApiOperation({ summary: '测试报告' })
  getReport(@Param('id') id: number) {
    return this.abtestService.getReport(id);
  }

  @Post()
  @RequirePermission(PERMISSIONS.ABTEST_CREATE)
  @OperationLogMeta('abtest', 'create')
  @ApiOperation({ summary: '创建测试' })
  create(@Body() dto: CreateABTestDto, @Request() req: any) {
    return this.abtestService.create(dto, req.user?.id || 0);
  }

  @Put(':id')
  @RequirePermission(PERMISSIONS.ABTEST_UPDATE)
  @OperationLogMeta('abtest', 'update')
  @ApiOperation({ summary: '更新测试' })
  update(@Param('id') id: number, @Body() dto: UpdateABTestDto) {
    return this.abtestService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission(PERMISSIONS.ABTEST_DELETE)
  @OperationLogMeta('abtest', 'delete')
  @ApiOperation({ summary: '删除测试' })
  remove(@Param('id') id: number) {
    return this.abtestService.remove(id);
  }

  @Post(':id/start')
  @RequirePermission(PERMISSIONS.ABTEST_UPDATE)
  @OperationLogMeta('abtest', 'start')
  @ApiOperation({ summary: '启动测试' })
  start(@Param('id') id: number) {
    return this.abtestService.startTest(id);
  }

  @Post(':id/pause')
  @RequirePermission(PERMISSIONS.ABTEST_UPDATE)
  @OperationLogMeta('abtest', 'pause')
  @ApiOperation({ summary: '暂停测试' })
  pause(@Param('id') id: number) {
    return this.abtestService.pauseTest(id);
  }

  @Post(':id/complete')
  @RequirePermission(PERMISSIONS.ABTEST_UPDATE)
  @OperationLogMeta('abtest', 'complete')
  @ApiOperation({ summary: '完成测试' })
  complete(@Param('id') id: number) {
    return this.abtestService.completeTest(id);
  }

  @Post(':id/archive')
  @RequirePermission(PERMISSIONS.ABTEST_UPDATE)
  @OperationLogMeta('abtest', 'archive')
  @ApiOperation({ summary: '归档测试' })
  archive(@Param('id') id: number) {
    return this.abtestService.archiveTest(id);
  }

  @Post('events')
  @RequirePermission(PERMISSIONS.ABTEST_UPDATE)
  @OperationLogMeta('abtest', 'recordEvent')
  @ApiOperation({ summary: '记录事件' })
  recordEvent(@Body() dto: RecordEventDto) {
    return this.abtestService.recordEvent(dto);
  }
}
