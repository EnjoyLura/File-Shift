import { Injectable } from '@nestjs/common';
import type { ApiResponse } from '@fileshift/shared-types';

@Injectable()
export class AppService {
  getHealth(): ApiResponse<{ status: string; timestamp: string }> {
    return {
      code: 0,
      message: 'success',
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
      },
    };
  }
}
