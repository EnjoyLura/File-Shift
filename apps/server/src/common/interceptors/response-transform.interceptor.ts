import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data) => {
        // 如果响应已经被包裹（有 code 字段），直接返回
        if (data !== null && typeof data === 'object' && 'code' in data && 'data' in data) {
          return data;
        }

        // 包裹为统一响应格式
        return {
          code: 0,
          message: 'success',
          data,
        };
      }),
    );
  }
}
