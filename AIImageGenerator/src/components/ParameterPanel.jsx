// 参数选择面板组件
export default function ParameterPanel({ size, setSize, style, setStyle }) {
  const sizes = [
    "1024x1024",
    "1440x720",
    "720x1440",
    "1344x768",
    "768x1344",
    "1152x864",
    "864x1152",
  ];
  const styles = [
    "写实",
    "动漫",
    "油画",
    "水彩",
    "科幻",
    "幻想",
    "极简",
    "复古",
  ];

  const handleStyleClick = (newStyle) => {
    if (styles.includes(newStyle)) {
      setStyle(newStyle);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 尺寸选择 */}
      <div className="space-y-3">
        <label className="block text-white font-medium">图片尺寸</label>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`px-4 py-2 rounded-lg transition-all ${
                size === s
                  ? "bg-purple-500 text-white shadow-lg"
                  : "bg-white/80 text-gray-700 hover:bg-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* 风格选择 */}
      <div className="space-y-3">
        <label className="block text-white font-medium">图片风格</label>
        <div className="flex flex-wrap gap-2">
          {styles.map((s) => (
            <button
              key={s}
              onClick={() => handleStyleClick(s)}
              className={`px-4 py-2 rounded-lg transition-all ${
                style === s
                  ? "bg-purple-500 text-white shadow-lg"
                  : "bg-white/80 text-gray-700 hover:bg-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
