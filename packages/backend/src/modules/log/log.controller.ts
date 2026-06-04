import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { LogService } from './log.service';
import { QueryLogDto } from './dto/query-log.dto';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { PERMISSIONS } from '@ecommerce/shared';

@ApiTags('操作日志')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('logs')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Get()
  @RequirePermission(PERMISSIONS.LOG_VIEW)
  @ApiOperation({ summary: '操作日志列表' })
  findAll(@Query() query: QueryLogDto) {
    return this.logService.findAll(query);
  }
}
