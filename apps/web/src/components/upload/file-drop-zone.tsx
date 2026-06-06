'use client';

import { useCallback, useState, useRef } from 'react';

interface FileDropZoneProps {
  accept?: string;
  maxSize?: number; // MB
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  /** 是否允许多文件选择 */
  multiple?: boolean;
}

export function FileDropZone({
  accept,
  maxSize = 20,
  onFileSelect,
  disabled,
  multiple = false,
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      for (const file of Array.from(files)) {
        if (file.size > maxSize * 1024 * 1024) {
          alert(`${file.name} 超过 ${maxSize}MB 限制，已跳过`);
          continue;
        }
        onFileSelect(file);
      }
    },
    [maxSize, onFileSelect],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      handleFiles(e.dataTransfer.files);
    },
    [disabled, handleFiles],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) handleFiles(e.target.files);
      if (inputRef.current) inputRef.current.value = '';
    },
    [handleFiles],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50 hover:bg-muted/50'
      } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />
      <svg
        className="mb-3 h-10 w-10 text-muted-foreground"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        />
      </svg>
      <p className="mb-1 text-sm font-medium">
        {isDragging
          ? '松开鼠标上传文件'
          : multiple
            ? '点击或拖拽文件到此处 (可多选)'
            : '点击或拖拽文件到此处'}
      </p>
      <p className="text-xs text-muted-foreground">
        最大文件大小: {maxSize}MB
        {accept && ` · 支持格式: ${accept}`}
      </p>
    </div>
  );
}
