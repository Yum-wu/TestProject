// 输入区域组件
export default function InputArea({
  value,
  onChange,
  onOptimize,
  isOptimizing,
}) {
  return (
    <div className="space-y-3">
      <label className="block text-white font-medium text-lg">图片描述</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="描述你想要生成的图片，例如：一只在樱花树下的猫咪..."
        className="w-full h-32 p-4 rounded-xl border-2 border-white/20 bg-white/95 text-gray-800 text-base resize-none focus:outline-none focus:border-purple-400 transition-colors"
      />
      <button
        onClick={onOptimize}
        disabled={isOptimizing || !value.trim()}
        className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
      >
        {isOptimizing ? "优化中..." : "AI 优化提示词"}
      </button>
    </div>
  );
}
