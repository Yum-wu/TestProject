import { useState, useRef, useCallback, useEffect } from "react";
import Header from "./components/Header";
import InputArea from "./components/InputArea";
import ParameterPanel from "./components/ParameterPanel";
import ButtonPanel from "./components/ButtonPanel";
import ImageDisplay from "./components/ImageDisplay";
import LoadingAnimation from "./components/LoadingAnimation";
import HistorySidebar from "./components/HistorySidebar";
import { useImageGeneration } from "./hooks/useImageGeneration";
import { useHistory } from "./hooks/useHistory";
import { optimizePrompt } from "./utils/promptOptimizer";

function App() {
  const [prompt, setPrompt] = useState("");
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [size, setSize] = useState("1024x1024");
  const [style, setStyle] = useState("写实");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);
  const optimizeTimerRef = useRef(null);
  const errorTimerRef = useRef(null);
  const isOptimizingRef = useRef(false);
  const promptRef = useRef("");
  const styleRef = useRef("写实");

  useEffect(() => {
    isOptimizingRef.current = isOptimizing;
  }, [isOptimizing]);

  useEffect(() => {
    promptRef.current = prompt;
  }, [prompt]);

  useEffect(() => {
    styleRef.current = style;
  }, [style]);

  const { isGenerating, generatedImage, error, progress, generate, setError } =
    useImageGeneration();

  const {
    history,
    showHistory,
    addToHistory,
    deleteFromHistory,
    clearHistory,
    toggleHistory,
    setShowHistory,
  } = useHistory();

  // 保存原始输入
  const handlePromptChange = useCallback((value) => {
    setPrompt(value);
    setOriginalPrompt(value);
    setIsOptimized(false);
  }, []);

  // 处理风格切换（添加白名单验证）
  const handleStyleChange = useCallback(
    (newStyle) => {
      const VALID_STYLES = [
        "写实",
        "动漫",
        "油画",
        "水彩",
        "科幻",
        "幻想",
        "极简",
        "复古",
      ];
      if (!VALID_STYLES.includes(newStyle)) {
        console.warn(`无效的风格: ${newStyle}`);
        return;
      }
      setStyle(newStyle);
      if (isOptimized && originalPrompt) {
        setPrompt(originalPrompt);
        setIsOptimized(false);
      }
    },
    [isOptimized, originalPrompt],
  );

  // 处理生成图片
  const handleGenerate = async () => {
    const result = await generate(prompt, size, style);
    if (result) {
      addToHistory(result);
    }
  };

  // 处理优化提示词
  const handleOptimize = useCallback(() => {
    if (!promptRef.current.trim() || isOptimizingRef.current) return;

    if (optimizeTimerRef.current) {
      clearTimeout(optimizeTimerRef.current);
    }

    setIsOptimizing(true);

    optimizeTimerRef.current = setTimeout(() => {
      const result = optimizePrompt(promptRef.current, styleRef.current);
      if (result.success) {
        setPrompt(result.prompt);
        setIsOptimized(true);
      } else {
        setError(result.message);
        if (errorTimerRef.current) {
          clearTimeout(errorTimerRef.current);
        }
        errorTimerRef.current = setTimeout(() => {
          setError(null);
          errorTimerRef.current = null;
        }, 3000);
      }
      setIsOptimizing(false);
      optimizeTimerRef.current = null;
    }, 1500);
  }, []);

  // 处理选择历史记录
  const handleSelectHistory = useCallback((item) => {
    setPrompt(item.prompt);
    setOriginalPrompt(item.prompt);
    setIsOptimized(false);
    setSize(item.size);
    setStyle(item.style);
    setShowHistory(false);
  }, []);

  return (
    <div className="min-h-screen pb-8">
      <Header />

      <main className="max-w-4xl mx-auto px-4 space-y-8">
        {/* 输入区 */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-6">
          <InputArea
            value={prompt}
            onChange={handlePromptChange}
            onOptimize={handleOptimize}
            isOptimizing={isOptimizing}
          />

          {/* 参数区 */}
          <ParameterPanel
            size={size}
            setSize={setSize}
            style={style}
            setStyle={handleStyleChange}
          />

          {/* 按钮区 */}
          <ButtonPanel
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            prompt={prompt}
          />
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-500/90 text-white p-4 rounded-xl">{error}</div>
        )}

        {/* 加载动画 */}
        {isGenerating && <LoadingAnimation progress={progress} />}

        {/* 图片展示 */}
        {!isGenerating && generatedImage && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <ImageDisplay
              image={generatedImage}
              onHistoryClick={toggleHistory}
            />
          </div>
        )}

        {/* 历史记录按钮 */}
        {history.length > 0 && !generatedImage && (
          <div className="text-center">
            <button
              onClick={toggleHistory}
              className="px-6 py-3 bg-white/90 hover:bg-white text-gray-700 rounded-xl font-medium transition-colors"
            >
              查看历史记录 ({history.length})
            </button>
          </div>
        )}
      </main>

      {/* 历史记录侧边栏 */}
      <HistorySidebar
        history={history}
        showHistory={showHistory}
        onClose={() => setShowHistory(false)}
        onDelete={deleteFromHistory}
        onClear={clearHistory}
        onSelect={handleSelectHistory}
      />
    </div>
  );
}

export default App;
