import { useState } from "react";
import { useTranslation } from "react-i18next";

const RAG_API_URL =
  (import.meta.env.VITE_API_RAG_URL as string) || "/api/rag/query";

interface Source {
  title: string;
  slug: string;
  chunk: string;
  score?: number;
}

interface RagResult {
  answer: string;
  sources: Source[];
}

export function RagQuery() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<RagResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmed = query.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(RAG_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed, top_k: 3, use_mmr: true }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(body || `HTTP ${res.status}`);
      }

      const data: RagResult = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 shadow-sm">
        <h1 className="text-lg font-semibold text-gray-800">
          📚 {t("rag.title")}
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">{t("rag.description")}</p>
      </header>

      {/* Input */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex gap-3 max-w-3xl">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !loading) handleSubmit();
            }}
            placeholder={t("rag.inputPlaceholder")}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            disabled={loading}
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !query.trim()}
            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            {loading ? t("rag.asking") : t("rag.ask")}
          </button>
        </div>
        {/* Example queries */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {(t("rag.examples", { returnObjects: true }) as string[]).map(
            (ex: string) => (
              <button
                key={ex}
                onClick={() => {
                  setQuery(ex);
                }}
                className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
              >
                {ex}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {!result && !loading && !error && (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-5xl mb-4">📖</div>
              <p className="text-base">{t("rag.noQuery")}</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="flex justify-center space-x-1.5 mb-4">
                <span className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <p className="text-sm text-gray-400">{t("rag.asking")}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            ⚠️ {error}
            <p className="text-xs text-red-500 mt-1">{t("rag.error")}</p>
          </div>
        )}

        {result && (
          <div className="space-y-6 max-w-3xl">
            {/* Answer */}
            <div className="bg-white border border-gray-200 rounded-xl px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Answer
              </h2>
              <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                {result.answer}
              </p>
            </div>

            {/* Sources */}
            {result.sources.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  {t("rag.sources")}
                </h2>
                <div className="space-y-2">
                  {result.sources.map((src, i) => (
                    <div
                      key={i}
                      className="bg-white border border-gray-200 rounded-lg px-4 py-3"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-blue-700 truncate">
                          {src.title}
                        </span>
                        {src.score !== undefined && (
                          <span className="text-xs text-gray-400 shrink-0 ml-2">
                            {t("rag.score")}: {(src.score * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {src.chunk.slice(0, 200)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
