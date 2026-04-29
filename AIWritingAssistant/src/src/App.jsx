import { useState, useCallback, useEffect, useRef } from "react";
import { WRITING_MODES, OPTIMIZE_PROMPT, LENGTH_MAP } from "./prompts";
import { useStreaming } from "./hooks/useStreaming";
import { useHistory } from "./hooks/useHistory";
import Sidebar from "./components/Sidebar";
import InputPanel from "./components/InputPanel";
import OutputPanel from "./components/OutputPanel";
import "./App.css";

function App() {
  const [optimizedText, setOptimizedText] = useState(null);
  const [selectedOutput, setSelectedOutput] = useState("");
  const lastGenerateParamsRef = useRef(null);
  const { content, isLoading, error, sendRequest, stopGeneration } =
    useStreaming();
  const { records, deleteRecord } = useHistory();

  useEffect(() => {
    if (!isLoading && content && lastGenerateParamsRef.current) {
      const params = lastGenerateParamsRef.current;
      lastGenerateParamsRef.current = null;
      // 保存记录
      const newRecord = {
        ...params,
        output: content,
      };
      // 直接调用 addRecord 的底层逻辑，避免依赖引用变化
      const STORAGE_KEY = "ai-writing-history";
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      existing.unshift(newRecord);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    }
  }, [isLoading, content]);

  const handleGenerate = useCallback(
    ({ mode, input, temperature, maxTokens }) => {
      if (isLoading) {
        stopGeneration();
        return;
      }

      // 清除之前选择的历史记录输出
      setSelectedOutput("");

      const systemPrompt = WRITING_MODES[mode].systemPrompt;

      lastGenerateParamsRef.current = {
        mode,
        input,
        temperature,
        length: maxTokens,
      };

      sendRequest({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: input },
        ],
        temperature,
        maxTokens,
      });
    },
    [isLoading, stopGeneration, sendRequest],
  );

  const handleOptimize = useCallback(
    (input) => {
      if (isLoading) return;

      setOptimizedText("");

      sendRequest({
        messages: [
          { role: "system", content: OPTIMIZE_PROMPT },
          { role: "user", content: input },
        ],
        temperature: 0.5,
        maxTokens: LENGTH_MAP.medium,
        onReplace: (newContent) => {
          setOptimizedText(newContent);
        },
      });
    },
    [isLoading, sendRequest],
  );

  const handleSelectRecord = useCallback((record) => {
    // 加载历史记录内容到输出区
    if (record.output) {
      setSelectedOutput(record.output);
    }
    // InputPanel 可以通过 optimizedText 加载输入内容
    // 但由于历史记录已有输入内容，这里由 InputPanel 自身处理
    // 我们将输入内容传递到 InputPanel
    setOptimizedText(record.input);
  }, []);

  const handleDeleteRecord = useCallback(
    (id) => {
      deleteRecord(id);
    },
    [deleteRecord],
  );

  return (
    <div className="app">
      <header className="app-header">
        <h1>AI 智能写作助手</h1>
      </header>
      <div className="app-body">
        <aside className="app-sidebar">
          <Sidebar
            records={records}
            onSelect={handleSelectRecord}
            onDelete={handleDeleteRecord}
          />
        </aside>
        <main className="app-main">
          <InputPanel
            onGenerate={handleGenerate}
            onOptimize={handleOptimize}
            isLoading={isLoading}
            optimizedText={optimizedText}
          />
        </main>
        <section className="app-output">
          <OutputPanel
            content={selectedOutput || content}
            isLoading={isLoading}
            error={error}
          />
        </section>
      </div>
    </div>
  );
}

export default App;
