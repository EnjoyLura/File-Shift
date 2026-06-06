import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * 业务异常类 - 支持自定义业务错误码透传
 *
 * 使用示例:
 *   throw new BusinessException(ERROR_CODES.FILE_TOO_LARGE, '文件大小超过限制', 413);
 *   throw new BusinessException(ERROR_CODES.CREDIT_INSUFFICIENT, '积分不足');
 */
export class BusinessException extends HttpException {
  public readonly businessCode: number;

  constructor(businessCode: number, message: string, httpStatus: number = HttpStatus.BAD_REQUEST) {
    super({ code: businessCode, message }, httpStatus);
    this.businessCode = businessCode;
  }
}
