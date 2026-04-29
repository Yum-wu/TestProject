// 历史记录侧边栏组件
export default function HistorySidebar({
  history,
  showHistory,
  onClose,
  onDelete,
  onClear,
  onSelect,
}) {
  if (!showHistory) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose}>
      <div
        className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">历史记录</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* 清空按钮 */}
        {history.length > 0 && (
          <div className="p-4 border-b">
            <button
              onClick={onClear}
              className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              清空历史
            </button>
          </div>
        )}

        {/* 历史列表 */}
        <div className="p-4 space-y-4">
          {history.length === 0 ? (
            <p className="text-gray-500 text-center py-8">暂无历史记录</p>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="bg-gray-50 rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onSelect(item)}
              >
                <img
                  src={item.imageUrl}
                  alt={item.prompt}
                  className="w-full h-40 object-cover"
                />
                <div className="p-3">
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {item.prompt}
                  </p>
                  <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                    <span>{item.size}</span>
                    <div className="flex gap-2 items-center">
                      {item.style && (
                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs">
                          {item.style}
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(item.id);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
