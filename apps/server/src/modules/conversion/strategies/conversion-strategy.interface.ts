/** 转换策略接口 */
export interface ConversionStrategy {
  /** 是否支持该转换类型 */
  supports(conversionType: string): boolean;

  /** 执行转换，返回输出文件路径 */
  convert(input: ConversionInput): Promise<ConversionOutput>;
}

export interface ConversionInput {
  /** 输入文件绝对路径 */
  inputPath: string;
  /** 输入文件 MIME 类型 */
  inputMimeType: string;
  /** 转换类型 (如 png-to-jpg) */
  conversionType: string;
  /** 输出目录 */
  outputDir: string;
  /** 可选参数 */
  options?: Record<string, unknown>;
}

export interface ConversionOutput {
  /** 输出文件绝对路径 */
  outputPath: string;
  /** 输出文件 MIME 类型 */
  outputMimeType: string;
  /** 输出文件大小 (字节) */
  outputFileSize: number;
  /** 输出文件名 */
  outputFileName: string;
}
