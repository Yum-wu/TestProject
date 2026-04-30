import { useState, useEffect, useRef, memo } from "react";

/* ===== OptimizedImage 组件属性 ===== */
interface OptimizedImageProps {
  /** 图片源地址 */
  src: string;
  /** 图片替代文本 */
  alt: string;
  /** 图片宽度 */
  width?: number;
  /** 图片高度 */
  height?: number;
  /** 额外类名 */
  className?: string;
  /** 加载失败时的 fallback 图片地址 */
  fallbackSrc?: string;
  /** 是否使用懒加载（默认开启） */
  lazy?: boolean;
  /** 懒加载提前加载的边距（像素或 CSS 值） */
  rootMargin?: string;
  /** 对象适配方式 */
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  /** 响应式图片尺寸（srcset） */
  sizes?: string;
  /** 不同分辨率的图片源 */
  srcSet?: string;
}

/**
 * 优化图片组件
 * - 使用 Intersection Observer 实现懒加载
 * - 加载中显示模糊占位符
 * - 加载失败显示 fallback 图片
 * - 支持响应式图片尺寸
 * 使用 React.memo 避免不必要的重渲染
 */
function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  fallbackSrc,
  lazy = true,
  rootMargin = "200px",
  objectFit = "cover",
  sizes,
  srcSet,
}: OptimizedImageProps) {
  const imgRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(!lazy);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  /* Intersection Observer 懒加载 */
  useEffect(() => {
    if (!lazy || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, [lazy, rootMargin]);

  /* 图片加载成功 */
  const handleLoad = () => {
    setIsLoaded(true);
  };

  /* 图片加载失败 */
  const handleError = () => {
    setHasError(true);
  };

  /* 确定最终图片源 */
  const imageSrc = hasError && fallbackSrc ? fallbackSrc : isInView ? src : undefined;

  /* 对象适配样式 */
  const objectFitStyle = { objectFit };

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* 模糊占位符 - 图片加载前显示 */}
      {(!isLoaded || !isInView) && !hasError && (
        <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
      )}

      {/* 实际图片 */}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          srcSet={srcSet}
          sizes={sizes}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          style={objectFitStyle}
          loading={lazy ? "lazy" : "eager"}
        />
      )}

      {/* 加载失败 fallback - 无 fallbackSrc 时显示占位图标 */}
      {hasError && !fallbackSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
          <svg
            className="h-8 w-8 text-neutral-400 dark:text-neutral-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

/* 使用 React.memo 包装，避免图片组件不必要的重渲染 */
export default memo(OptimizedImage);
