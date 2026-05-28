import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Source {
  title: string;
  slug: string;
  chunk?: string;
  score?: number;
}

interface Citation {
  index: number;
  source: Source;
}

interface HistoryItem {
  query: string;
  timestamp: number;
  sourcesCount: number;
}

const CHAT_API = "/api/chat/enhanced/stream";
const RAG_API_URL = (import.meta.env.VITE_API_RAG_URL as string)?.replace(/\/query$/, "") || "/api/rag";
const RAG_STREAM = `${RAG_API_URL}/query/stream`;

const HISTORY_KEY = "aureon:search_history";

export function Search() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [answer, setAnswer] = useState("");
  const [, setSources] = useState<Source[]>([]);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [expandedCitation, setExpandedCitation] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const answerRef = useRef<HTMLDivElement>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch { /* ignore */ }

    // If URL has ?q=xxx, auto-search
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      setTimeout(() => performSearch(q), 100);
    }
  }, []);

  const saveToHistory = (q: string, count: number) => {
    const item: HistoryItem = { query: q, timestamp: Date.now(), sourcesCount: count };
    const updated = [item, ...history.filter(h => h.query !== q)].slice(0, 20);
    setHistory(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  };

  const performSearch = useCallback(async (q?: string) => {
    const searchQuery = q || query;
    const trimmed = searchQuery.trim();
    if (!trimmed || loading) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setAnswer("");
    setSources([]);
    setCitations([]);
    setExpandedCitation(null);

    let answerText = "";
    let allSources: Source[] = [];

    try {
      // Route: short general queries → chat, longer queries → RAG
      const isRagQuery = trimmed.includes("?") || trimmed.length > 5;
      const url = isRagQuery ? RAG_STREAM : CHAT_API;
      const body = isRagQuery
        ? JSON.stringify({ query: trimmed, top_k: 3, use_mmr: true })
        : JSON.stringify({ message: trimmed });

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data:")) continue;

          try {
            const event = JSON.parse(trimmed.slice(5).trim());

            if (event.type === "sources" && event.sources) {
              allSources = event.sources;
              setSources(event.sources);
            } else if (event.type === "citation" && event.source) {
              const citation: Citation = {
                index: citations.length + 1,
                source: event.source,
              };
              setCitations(prev => [...prev, citation]);
            } else if (event.type === "text" && event.content) {
              answerText += event.content;
              setAnswer(answerText);
            }
          } catch {
            continue;
          }
        }
      }

      if (allSources.length > 0) {
        saveToHistory(trimmed, allSources.length);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }, [query, loading, citations]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <div className="flex h-full">
      {/* Main search area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Search input — centered */}
        <div className="px-6 py-6 border-b border-gray-100">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setShowHistory(true)}
                placeholder={t("search.placeholder")}
                className="w-full px-5 py-3.5 pr-12 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Results area */}
        <div className="flex-1 overflow-y-auto px-6 py-4" ref={answerRef}>
          {!answer && !loading && (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <p className="text-base">{t("search.empty")}</p>
                <div className="flex gap-2 mt-4 justify-center">
                  {["What is hybrid search?", "How does RAG work?", "Explain BM25"].map((sq) => (
                    <button
                      key={sq}
                      onClick={() => { setQuery(sq); performSearch(sq); }}
                      className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                    >
                      {sq}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {loading && !answer && (
            <div className="flex items-center justify-center h-full">
              <div className="flex space-x-1.5">
                <span className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          {answer && (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Answer */}
              <div className="bg-white border border-gray-100 rounded-xl px-5 py-4 shadow-sm">
                <div className="prose prose-sm max-w-none text-gray-800">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {answer}
                  </ReactMarkdown>
                </div>
                {loading && (
                  <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse" />
                )}
              </div>

              {/* Citations */}
              {citations.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    {t("search.sources")}
                  </h3>
                  <div className="space-y-2">
                    {citations.map((c) => (
                      <div key={c.index}>
                        <button
                          onClick={() => setExpandedCitation(expandedCitation === c.index ? null : c.index)}
                          className="flex items-center gap-2 w-full text-left px-4 py-2.5 bg-white border border-gray-100 rounded-lg hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
                        >
                          <span className="w-5 h-5 rounded bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-medium shrink-0">
                            {c.index}
                          </span>
                          <span className="text-sm text-gray-700 truncate">{c.source.title}</span>
                          {c.source.score !== undefined && (
                            <span className="text-xs text-gray-400 ml-auto shrink-0">
                              {(c.source.score * 100).toFixed(0)}%
                            </span>
                          )}
                        </button>
                        {expandedCitation === c.index && c.source.chunk && (
                          <div className="mt-1 ml-7 px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-xs text-gray-500">
                            {c.source.chunk.slice(0, 300)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Search History sidebar */}
      {showHistory && history.length > 0 && (
        <div
          className="w-64 border-l border-gray-100 bg-white p-4 overflow-y-auto shrink-0 hidden md:block"
          onMouseLeave={() => setShowHistory(false)}
        >
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            {t("search.history")}
          </h3>
          <div className="space-y-2">
            {history.map((h, i) => (
              <button
                key={i}
                onClick={() => { setQuery(h.query); setShowHistory(false); performSearch(h.query); }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <p className="text-sm text-gray-700 truncate">{h.query}</p>
                <p className="text-xs text-gray-400 mt-0.5">{h.sourcesCount} sources · {formatTime(h.timestamp)}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
