export type TaskStatus =
  | 'pending'
  | 'uploading'
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type TaskCategory = 'document' | 'image' | 'media' | 'compress' | 'tool';

export interface ConversionTask {
  id: number;
  taskNo: string;
  type: string;
  category: TaskCategory;
  status: TaskStatus;
  inputFileName: string;
  inputFileSize: number;
  outputFileName: string | null;
  outputFileSize: number | null;
  creditsCost: number;
  progress: number;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
  expiresAt: string | null;
}

export interface CreateConversionRequest {
  fileId: string;
  type: string;
  options?: Record<string, unknown>;
}

/** 文件上传响应 */
export interface UploadResponse {
  fileId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

/** 创建转换任务响应 */
export interface CreateConversionResponse {
  taskNo: string;
  status: TaskStatus;
  creditsCost: number;
  estimatedTime: number;
  createdAt: string;
}

/** 转换任务详情响应 (含下载链接) */
export interface ConversionTaskDetail extends ConversionTask {
  downloadUrl?: string;
  inputMimeType?: string;
  outputMimeType?: string;
}
