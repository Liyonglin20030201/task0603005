import {
  Controller,
  Get,
  Post,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { ImportExportService } from './import-export.service';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { OperationLogMeta } from '../../common/decorators/operation-log.decorator';
import { PERMISSIONS } from '@ecommerce/shared';

@ApiTags('导入导出')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('import-export')
export class ImportExportController {
  constructor(private readonly service: ImportExportService) {}

  @Get('products/export')
  @RequirePermission(PERMISSIONS.IMPORT_EXPORT)
  @OperationLogMeta('import-export', 'exportProducts')
  @ApiOperation({ summary: '导出商品数据' })
  exportProducts(@Res() res: Response) {
    return this.service.exportProducts(res);
  }

  @Post('products/import')
  @RequirePermission(PERMISSIONS.IMPORT_EXPORT)
  @OperationLogMeta('import-export', 'importProducts')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '导入商品数据' })
  async importProducts(@UploadedFile() file: Express.Multer.File) {
    return this.service.importProducts(file.buffer);
  }

  @Get('orders/export')
  @RequirePermission(PERMISSIONS.IMPORT_EXPORT)
  @OperationLogMeta('import-export', 'exportOrders')
  @ApiOperation({ summary: '导出订单数据' })
  exportOrders(@Res() res: Response, @Query('status') status?: string) {
    return this.service.exportOrders(res, status);
  }

  @Get('users/export')
  @RequirePermission(PERMISSIONS.IMPORT_EXPORT)
  @OperationLogMeta('import-export', 'exportUsers')
  @ApiOperation({ summary: '导出用户数据' })
  exportUsers(@Res() res: Response) {
    return this.service.exportUsers(res);
  }
}
