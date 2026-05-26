import { useTranslation } from "react-i18next";
import type { SystemHealth } from "../hooks/useSystemHealth";

interface SystemStatusProps {
  health: SystemHealth | null;
  loading: boolean;
  error: string | null;
}

export function SystemStatus({ health, loading, error }: SystemStatusProps) {
  const { t } = useTranslation();

  // Known metrics (from evaluation runs)
  const metrics = [
    { label: "Recall@3 (Hybrid)", value: "96.08%", badge: "bg-green-100 text-green-700" },
    { label: "Recall@3 (Dense)", value: "90.2%", badge: "bg-green-100 text-green-700" },
    { label: "Retrieval Latency", value: "~11ms", badge: "bg-blue-100 text-blue-700" },
    { label: "Full RAG Latency", value: "~12-14s", badge: "bg-yellow-100 text-yellow-700" },
    { label: "Test QA Pairs", value: health?.test_qa_pairs ?? "—", badge: "bg-gray-100 text-gray-600" },
  ];

  // Live system indicators
  const indicators = [
    { label: "LLM", ok: health?.llm_configured ?? false, detail: "GLM-4-Flash" },
    { label: "Hybrid Search", ok: health?.hybrid_search_enabled ?? false, detail: "BM25 + Dense" },
    { label: "Guardrails", ok: health?.guardrails_enabled ?? false, detail: "Hallucination + Citation" },
    { label: "LangSmith", ok: health?.langsmith_enabled ?? false, detail: "Tracing + Metrics" },
    { label: "Index", ok: health?.index_status === "ok", detail: "Chroma + BM25" },
  ];

  return (
    <section className="px-6 py-10 max-w-5xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        {t("systemStatus.title", "System Status")}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Performance Metrics ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
            {t("systemStatus.metrics", "Metrics")}
          </h3>
          <div className="space-y-3">
            {metrics.map((m) => (
              <div key={m.label} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{m.label}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${m.badge}`}>
                  {m.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Service Health ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
            {t("systemStatus.services", "Services")}
          </h3>

          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="w-3 h-3 rounded-full bg-gray-300 animate-pulse" />
              Loading...
            </div>
          )}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {t("systemStatus.unreachable", "Backend unreachable")}: {error}
            </div>
          )}

          {health && !error && (
            <div className="space-y-3">
              {indicators.map((ind) => (
                <div key={ind.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        ind.ok ? "bg-green-500" : "bg-red-400"
                      }`}
                    />
                    <span className="text-sm text-gray-600">{ind.label}</span>
                  </div>
                  <span className="text-xs text-gray-400">{ind.detail}</span>
                </div>
              ))}
            </div>
          )}

          {!health && !loading && !error && (
            <div className="text-sm text-gray-400">
              {t("systemStatus.noData", "Connect backend to see status")}
            </div>
          )}
        </div>

        {/* ── Quick Actions ── */}
        <div className="lg:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            {t("systemStatus.actions", "Actions")}
          </h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => window.open("https://smith.langchain.com", "_blank")}
              className="text-xs px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm font-medium"
            >
              {t("systemStatus.openLangSmith", "Open LangSmith")}
            </button>
            <button
              onClick={async () => {
                try {
                  const res = await fetch("/api/rag/health");
                  const data = await res.json();
                  alert(JSON.stringify(data, null, 2));
                } catch (e) {
                  alert("Backend unreachable");
                }
              }}
              className="text-xs px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm font-medium"
            >
              {t("systemStatus.checkHealth", "Check Health API")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
