import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';
    let code = 99000;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exResponse = exception.getResponse();

      if (typeof exResponse === 'string') {
        message = exResponse;
      } else if (typeof exResponse === 'object' && exResponse !== null) {
        const res = exResponse as Record<string, unknown>;
        message = (res.message as string) || exception.message;
        // 将 validation 错误数组转为字符串
        if (Array.isArray(res.message)) {
          message = (res.message as string[]).join('; ');
        }
        // 支持业务错误码透传 (BusinessException)
        if (typeof res.code === 'number') {
          code = res.code as number;
        } else {
          // 映射 HTTP 状态码到通用错误码
          switch (status) {
            case 400:
              code = 10001;
              break;
            case 401:
              code = 10002;
              break;
            case 403:
              code = 10003;
              break;
            case 404:
              code = 10004;
              break;
            case 409:
              code = 10005;
              break;
            case 429:
              code = 10006;
              break;
            default:
              code = 99000;
          }
        }
      }
    } else {
      this.logger.error('未捕获异常', exception instanceof Error ? exception.stack : exception);
    }

    response.status(status).json({
      code,
      message,
      data: null,
    });
  }
}
