import { downloadImage } from "../services/imageAPI";

// 图片展示组件
export default function ImageDisplay({ image, onHistoryClick }) {
  const handleDownload = async () => {
    if (image?.imageUrl) {
      await downloadImage(image.imageUrl, `ai-image-${Date.now()}.jpg`);
    }
  };

  if (!image) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">生成结果</h2>

      {/* 图片容器 */}
      <div className="relative rounded-xl overflow-hidden shadow-2xl bg-white/10">
        <img
          src={image.imageUrl}
          alt="AI生成的图片"
          className="w-full h-auto"
        />
      </div>

      {/* 图片信息 */}
      <div className="bg-white/90 rounded-xl p-4 space-y-2">
        <p className="text-gray-700">
          <span className="font-medium">提示词:</span> {image.prompt}
        </p>
        <div className="flex gap-4 text-sm text-gray-600">
          <span>尺寸: {image.size}</span>
          <span>风格: {image.style}</span>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-4">
        <button
          onClick={handleDownload}
          className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors"
        >
          下载图片
        </button>
        {onHistoryClick && (
          <button
            onClick={onHistoryClick}
            className="px-6 py-3 bg-white/90 hover:bg-white text-gray-700 rounded-xl font-medium transition-colors"
          >
            查看历史
          </button>
        )}
      </div>
    </div>
  );
}
