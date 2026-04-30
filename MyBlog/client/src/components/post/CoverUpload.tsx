import { useState, useRef } from "react";
import Button from "../common/Button";

/* ===== CoverUpload 组件属性 ===== */
interface CoverUploadProps {
  /** 当前封面图 URL */
  coverUrl?: string;
  /** 上传回调 */
  onUpload: (file: File) => void;
  /** 删除回调 */
  onRemove?: () => void;
  /** 是否上传中 */
  uploading?: boolean;
  /** 额外类名 */
  className?: string;
}

/**
 * 封面图上传组件
 * 支持拖拽上传、点击上传、预览、删除
 */
export default function CoverUpload({
  coverUrl,
  onUpload,
  onRemove,
  uploading = false,
  className = "",
}: CoverUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* 处理文件选择 */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
    /* 重置 input 以便选择相同文件 */
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* 处理拖拽进入 */
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  /* 处理拖拽离开 */
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  /* 处理拖拽悬停 */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  /* 处理文件放下 */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      onUpload(file);
    }
  };

  /* 已有封面图时显示预览 */
  if (coverUrl) {
    return (
      <div className={`relative group rounded-xl overflow-hidden ${className}`}>
        <img
          src={coverUrl}
          alt="封面图"
          className="w-full h-48 sm:h-56 object-cover"
        />

        {/* 悬浮操作层 */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            更换封面
          </Button>
          {onRemove && (
            <Button variant="danger" size="sm" onClick={onRemove}>
              删除
            </Button>
          )}
        </div>

        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    );
  }

  /* 无封面图时显示上传区域 */
  return (
    <div className={className}>
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center
          w-full h-48 sm:h-56
          rounded-xl border-2 border-dashed cursor-pointer
          transition-all duration-200
          ${
            isDragging
              ? "border-primary-500 bg-primary-50 dark:bg-primary-950/20"
              : "border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800/50 hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-950/10"
          }
        `}
      >
        {uploading ? (
          /* 上传中状态 */
          <div className="flex flex-col items-center gap-2">
            <svg
              className="h-8 w-8 text-primary-500 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              上传中...
            </p>
          </div>
        ) : (
          /* 默认上传状态 */
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-500 mb-3">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              点击或拖拽上传封面图
            </p>
            <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
              支持 JPG、PNG、WebP，建议尺寸 1200x630
            </p>
          </>
        )}

        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
