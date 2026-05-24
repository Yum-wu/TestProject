import { useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { KeyboardEvent } from "react";

interface InputAreaProps {
  onSend: (content: string) => void;
  isLoading: boolean;
  onStop: () => void;
}

/** Input area — Enter to send, Shift+Enter for newline, auto-resize */
export function InputArea({ onSend, isLoading, onStop }: InputAreaProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [input, isLoading, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleInput = useCallback((e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    target.style.height = "auto";
    target.style.height = Math.min(target.scrollHeight, 128) + "px";
  }, []);

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-3">
      <div className="flex items-end gap-3 max-w-3xl mx-auto">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={t("chat.inputPlaceholder")}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32"
          style={{ minHeight: "44px" }}
        />
        {isLoading ? (
          <button
            onClick={onStop}
            className="rounded-xl bg-red-500 px-4 py-2.5 text-sm text-white hover:bg-red-600 transition-colors shrink-0"
          >
            {t("chat.stop")}
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="rounded-xl bg-blue-500 px-4 py-2.5 text-sm text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {t("chat.send")}
          </button>
        )}
      </div>
    </div>
  );
}
