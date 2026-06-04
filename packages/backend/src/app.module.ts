import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import { RoleModule } from './modules/role/role.module';
import { ProductModule } from './modules/product/product.module';
import { CategoryModule } from './modules/category/category.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { OrderModule } from './modules/order/order.module';
import { UserModule } from './modules/user/user.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { ReportModule } from './modules/report/report.module';
import { LogModule } from './modules/log/log.module';
import { ImportExportModule } from './modules/import-export/import-export.module';
import { NotificationModule } from './modules/notification/notification.module';
import { ShipmentModule } from './modules/shipment/shipment.module';
import { ForecastModule } from './modules/forecast/forecast.module';
import { CampaignModule } from './modules/campaign/campaign.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { OperationLogInterceptor } from './common/interceptors/operation-log.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 3306),
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', ''),
        database: configService.get('DB_DATABASE', 'ecommerce_admin'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('DB_SYNC', 'true') === 'true',
        logging: configService.get('DB_LOGGING', 'false') === 'true',
      }),
    }),
    AuthModule,
    AdminModule,
    RoleModule,
    ProductModule,
    CategoryModule,
    InventoryModule,
    OrderModule,
    UserModule,
    CouponModule,
    ReportModule,
    LogModule,
    ImportExportModule,
    NotificationModule,
    ShipmentModule,
    ForecastModule,
    CampaignModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: OperationLogInterceptor },
  ],
})
export class AppModule {}
