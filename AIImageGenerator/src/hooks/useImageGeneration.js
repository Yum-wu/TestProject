import { useState, useRef, useEffect, useCallback } from "react";
import { generateImage } from "../services/imageAPI";

// 错误类型映射
const ERROR_MESSAGES = {
  timeout: "生成超时，网络可能较慢，请稍后重试",
  network: "网络连接失败，请检查网络后重试",
  server: "服务器错误，请稍后重试",
  invalid: "输入参数无效，请检查描述内容",
  api_key: "API Key无效或未配置，请检查配置",
  rate_limit: "请求过于频繁，请稍后重试",
  content_filter: "描述内容包含敏感词，请修改后重试",
  default: "生成图片失败，请重试",
};

// 错误分类
function classifyError(error) {
  if (!error) return "default";

  const message = error.message || "";
  const messageLower = message.toLowerCase();

  if (message.includes("超时")) return "timeout";
  if (message.includes("网络") || message.includes("fetch")) return "network";
  if (message.includes("服务器") || message.includes("5")) return "server";
  if (message.includes("无效") || message.includes("参数")) return "invalid";
  if (
    messageLower.includes("api_key") ||
    messageLower.includes("apikey") ||
    messageLower.includes("authentication") ||
    messageLower.includes("401")
  )
    return "api_key";
  if (message.includes("429") || message.includes("频繁")) return "rate_limit";
  if (
    message.includes("敏感") ||
    message.includes("违规") ||
    message.includes("filter")
  )
    return "content_filter";
  return "default";
}

export function useImageGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(null);
  const abortControllerRef = useRef(null);

  // 统一的进度条清理函数
  // 注意：这里使用空依赖数组是安全的，因为函数内部通过 progressRef.current 读取最新的 ref 值，
  // 而不是依赖外部状态。ref 的 .current 属性在每次渲染时都会保持最新，不需要重新创建函数。
  const cleanupProgress = useCallback(() => {
    if (progressRef.current) {
      clearInterval(progressRef.current);
      progressRef.current = null;
    }
  }, []);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      cleanupProgress();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [cleanupProgress]);

  const generate = useCallback(async (prompt, size, style) => {
    if (!prompt || !prompt.trim()) {
      setError("请输入图片描述");
      return null;
    }

    // 清理之前的状态
    cleanupProgress();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsGenerating(true);
    setError(null);
    setProgress(0);

    // 启动进度条
    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          cleanupProgress();
          return 90;
        }
        return prev + Math.random() * 10;
      });
    }, 1000);

    try {
      const result = await generateImage(prompt, size, style);

      // 清理进度条
      cleanupProgress();

      // 设置进度到100%，让用户看到完成效果
      setProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 500));

      setGeneratedImage(result);
      setError(null);
      return result;
    } catch (err) {
      // 清理进度条
      cleanupProgress();

      // 错误分类和用户友好提示
      const errorType = classifyError(err);
      const userMessage = ERROR_MESSAGES[errorType] || ERROR_MESSAGES.default;
      setError(userMessage);
      setGeneratedImage(null);

      return null;
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  }, []);

  // 重置状态
  const reset = useCallback(() => {
    cleanupProgress();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setGeneratedImage(null);
    setError(null);
    setProgress(0);
    setIsGenerating(false);
  }, [cleanupProgress]);

  return {
    isGenerating,
    generatedImage,
    error,
    progress,
    generate,
    reset,
    setError,
  };
}
