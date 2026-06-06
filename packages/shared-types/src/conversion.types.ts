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
