import { useChat } from "../hooks/useChat";
import { MessageList } from "./MessageList";
import { InputArea } from "./InputArea";

/** 主聊天窗口组件，组合标题栏、错误提示、消息列表和输入区域 */
export function ChatWindow() {
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    stopGeneration,
    clearError,
  } = useChat();

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="flex items-center justify-between bg-white border-b border-gray-200 px-6 py-3 shadow-sm">
        <h1 className="text-lg font-semibold text-gray-800">🤖 AI 聊天助手</h1>
        <button
          onClick={clearChat}
          className="text-sm text-gray-500 hover:text-red-500 transition-colors px-3 py-1 rounded-lg hover:bg-red-50"
        >
          清空对话
        </button>
      </header>

      {error && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-2 text-sm text-red-600 flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button
            onClick={clearError}
            className="text-red-400 hover:text-red-600"
          >
            ✕
          </button>
        </div>
      )}

      <MessageList messages={messages} isLoading={isLoading} />
      <InputArea
        onSend={sendMessage}
        isLoading={isLoading}
        onStop={stopGeneration}
      />
    </div>
  );
}
