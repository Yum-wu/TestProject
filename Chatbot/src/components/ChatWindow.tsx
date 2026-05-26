import { useTranslation } from "react-i18next";
import { useChat } from "../hooks/useChat";
import { MessageList } from "./MessageList";
import { InputArea } from "./InputArea";

/** Main chat window — combines header, error toast, message list, and input area */
export function ChatWindow() {
  const { t } = useTranslation();
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    stopGeneration,
    clearError,
  } = useChat();

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="flex items-center justify-between bg-white border-b border-gray-200 px-6 py-3 shadow-sm">
        <h1 className="text-lg font-semibold text-gray-800">
          <span role="img" aria-label="robot">🤖</span> {t("chat.title")}
        </h1>
        <button
          onClick={clearChat}
          className="text-sm text-gray-500 hover:text-red-500 transition-colors px-3 py-1 rounded-lg hover:bg-red-50"
        >
          {t("chat.clear")}
        </button>
      </header>

      {error && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-2 text-sm text-red-600 flex items-center justify-between">
          <span><span role="img" aria-label="warning">⚠️</span> {error}</span>
          <button
            onClick={clearError}
            className="text-red-400 hover:text-red-600"
          >
            ✕
          </button>
        </div>
      )}

      {hasMessages ? (
        <MessageList messages={messages} isLoading={isLoading} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center px-4">
            <div className="text-5xl mb-4" role="img" aria-label="chat">💬</div>
            <p className="text-base font-medium">{t("chat.emptyTitle")}</p>
            <p className="text-sm mt-1">{t("chat.emptySubtitle")}</p>
            <p className="text-xs mt-2 text-gray-300 max-w-xs mx-auto">{t("chat.emptyHint")}</p>
          </div>
        </div>
      )}

      <InputArea
        onSend={sendMessage}
        isLoading={isLoading}
        onStop={stopGeneration}
      />
    </div>
  );
}
