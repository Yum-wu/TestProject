// 图片生成API服务（智谱AI真实API）

const ZHIPU_API_KEY = import.meta.env.VITE_ZHIPU_API_KEY;
// 智谱AI API支持浏览器直接调用（CORS已启用）
const ZHIPU_API_URL = "https://open.bigmodel.cn/api/paas/v4/images/generations";

// 带超时的Promise包装
function withTimeout(promise, timeoutMs, errorMessage) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs),
    ),
  ]);
}

// 带重试的fetch
async function fetchWithRetry(url, options, maxRetries = 2) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMsg =
          errorData?.message ||
          errorData?.error?.message ||
          response.statusText;
        throw new Error(`请求失败: ${response.status} - ${errorMsg}`);
      }
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

// 智谱AI真实图片生成API
export async function generateImage(prompt, size, style) {
  if (!ZHIPU_API_KEY) {
    throw new Error("API Key未配置，请检查.env文件");
  }

  if (!prompt || prompt.trim().length === 0) {
    throw new Error("请输入图片描述");
  }

  if (prompt.length > 800) {
    throw new Error("描述太长，请勿超过800个字符");
  }

  const timeoutMs = 60000;
  const apiSize = size || "1024x1024";

  return withTimeout(
    new Promise(async (resolve, reject) => {
      try {
        const response = await fetchWithRetry(
          ZHIPU_API_URL,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${ZHIPU_API_KEY}`,
            },
            body: JSON.stringify({
              model: "cogview-4",
              prompt: prompt.trim(),
              size: apiSize,
            }),
          },
          2,
        );

        const data = await response.json();

        if (data.data && data.data.length > 0 && data.data[0].url) {
          resolve({
            success: true,
            imageUrl: data.data[0].url,
            prompt,
            size: apiSize,
            style,
            timestamp: new Date().toISOString(),
            id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          });
        } else {
          const errorMsg =
            data.message || data.error?.message || "未返回图片URL";
          reject(new Error(`生成失败：${errorMsg}`));
        }
      } catch (error) {
        reject(error);
      }
    }),
    timeoutMs,
    "生成超时，请稍后重试",
  );
}

// 下载图片（带重试和严格验证）
export async function downloadImage(imageUrl, filename) {
  try {
    const response = await fetchWithRetry(imageUrl, {}, 2);

    if (!response.ok) {
      throw new Error(`下载失败: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(blob.type)) {
      throw new Error(`不支持的图片格式: ${blob.type || "未知"}`);
    }

    const maxSize = 10 * 1024 * 1024;
    if (blob.size > maxSize) {
      throw new Error("图片大小超过10MB限制");
    }

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || `ai-image-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error("下载图片失败:", error);
    return false;
  }
}
