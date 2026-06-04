import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OperationLog } from '../../modules/log/entities/operation-log.entity';
import { OPERATION_LOG_KEY } from '../decorators/operation-log.decorator';

@Injectable()
export class OperationLogInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    @InjectRepository(OperationLog)
    private logRepo: Repository<OperationLog>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const logMeta = this.reflector.get<{ module: string; action: string }>(
      OPERATION_LOG_KEY,
      context.getHandler(),
    );

    if (!logMeta) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const admin = request.user;

    return next.handle().pipe(
      tap(async () => {
        try {
          const log = this.logRepo.create({
            adminId: admin?.id,
            module: logMeta.module,
            action: logMeta.action,
            targetId: request.params?.id ? parseInt(request.params.id) : null,
            detail: {
              params: request.params,
              query: request.query,
              body: request.body,
            },
            ip: request.ip || request.headers['x-forwarded-for'] || '',
            userAgent: request.headers['user-agent'] || '',
          });
          await this.logRepo.save(log);
        } catch (e) {
          // 日志记录失败不应影响主业务
        }
      }),
    );
  }
}
