// 加载动画组件
export default function LoadingAnimation({ progress }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      {/* 旋转圆环 */}
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-4 border-white/30 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
      </div>

      {/* 进度条 */}
      <div className="w-64 space-y-2">
        <div className="h-3 bg-white/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-white text-center font-medium">
          AI 正在创作中... {Math.round(progress)}%
        </p>
      </div>

      {/* 提示文字 */}
      <div className="text-white/80 text-sm space-y-1 text-center">
        <p>构思画面构图...</p>
        <p>调整色彩搭配...</p>
        <p>优化细节渲染...</p>
      </div>
    </div>
  );
}
