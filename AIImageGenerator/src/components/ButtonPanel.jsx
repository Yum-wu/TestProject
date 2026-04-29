// 按钮区域组件
export default function ButtonPanel({ onGenerate, isGenerating, prompt }) {
  return (
    <div className="flex gap-4 justify-center">
      <button
        onClick={onGenerate}
        disabled={isGenerating || !prompt.trim()}
        className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-xl font-bold text-lg shadow-xl transition-all transform hover:scale-105 disabled:scale-100"
      >
        {isGenerating ? "生成中..." : "生成图片"}
      </button>
    </div>
  );
}
