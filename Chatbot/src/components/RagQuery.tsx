import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const RAG_API_URL =
  (import.meta.env.VITE_API_RAG_URL as string) || "/api/rag/query";

const RAG_UPLOAD_URL =
  (import.meta.env.VITE_API_RAG_URL as string)?.replace(/\/query$/, "") || "/api/rag/upload";

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

  // Upload state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Uploaded files list
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const fetchUploadedFiles = useCallback(async () => {
    try {
      const res = await fetch(RAG_UPLOAD_URL.replace("/upload", "/uploads"));
      if (!res.ok) return;
      const data = await res.json();
      setUploadedFiles((data.files || []).map((f: { filename: string }) => f.filename));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => { fetchUploadedFiles(); }, [fetchUploadedFiles]);

  const handleDeleteFile = useCallback(async (filename: string) => {
    try {
      const res = await fetch(`${RAG_UPLOAD_URL}/${encodeURIComponent(filename)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setUploadedFiles((prev) => prev.filter((f) => f !== filename));
      setUploadMessage({ type: "success", text: t("rag.upload.deleted", { filename }) });
    } catch (err) {
      setUploadMessage({
        type: "error",
        text: err instanceof Error ? err.message : String(err),
      });
    }
  }, [t]);

  const handleUpload = useCallback(async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "md" && ext !== "txt") {
      setUploadMessage({ type: "error", text: t("rag.upload.badFormat") });
      return;
    }

    setUploading(true);
    setUploadMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(RAG_UPLOAD_URL, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(body || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setUploadMessage({
        type: "success",
        text: t("rag.upload.success", { filename: file.name, chunks: data.chunks_created }),
      });
      fetchUploadedFiles();
    } catch (err) {
      setUploadMessage({
        type: "error",
        text: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setUploading(false);
    }
  }, [t]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-800">
              📚 {t("rag.title")}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">{t("rag.description")}</p>
          </div>
          <button
            onClick={() => setUploadOpen(!uploadOpen)}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors shrink-0 ml-4"
          >
            {uploadOpen ? "▲" : "▼"} {t("rag.upload.toggle")}
          </button>
        </div>
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

      {/* Upload panel */}
      {uploadOpen && (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => document.getElementById("rag-upload-input")?.click()}
            className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
              dragOver
                ? "border-blue-500 bg-blue-50 scale-[1.02] shadow-lg"
                : "border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100"
            }`}
          >
            <input
              id="rag-upload-input"
              type="file"
              accept=".md,.txt"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
                e.target.value = "";
              }}
            />
            {uploading ? (
              <div className="text-sm text-gray-500">
                <span className="inline-block animate-spin mr-2">⏳</span>
                {t("rag.upload.uploading")}
              </div>
            ) : (
              <>
                <div className="text-2xl mb-2">📄</div>
                <p className="text-sm text-gray-600">{t("rag.upload.hint")}</p>
                <p className="text-xs text-gray-400 mt-1">{t("rag.upload.formats")}</p>
                {dragOver && (
                  <div className="absolute inset-0 flex items-center justify-center bg-blue-500/10 rounded-xl">
                    <span className="text-blue-600 font-semibold text-sm">📥 释放以上传</span>
                  </div>
                )}
              </>
            )}
          </div>
          {uploadMessage && (
            <div
              className={`mt-3 text-sm px-3 py-2 rounded-lg ${
                uploadMessage.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {uploadMessage.type === "success" ? "✅ " : "⚠️ "}
              {uploadMessage.text}
            </div>
          )}

          {/* Uploaded files list */}
          {uploadedFiles.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-500 mb-2">{t("rag.upload.files")}</p>
              <div className="space-y-1.5">
                {uploadedFiles.map((fname) => (
                  <div
                    key={fname}
                    className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm"
                  >
                    <span className="text-gray-700 truncate mr-2">📄 {fname}</span>
                    <button
                      onClick={() => handleDeleteFile(fname)}
                      className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-0.5 rounded transition-colors shrink-0"
                    >
                      {t("rag.upload.delete")}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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
              <div className="prose prose-sm max-w-none text-gray-800">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {result.answer}
                </ReactMarkdown>
              </div>
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
