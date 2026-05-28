import { useTranslation } from "react-i18next";
import type { SystemHealth } from "../hooks/useSystemHealth";
import { useBenchmark } from "../hooks/useBenchmark";

interface SystemStatusProps {
  health: SystemHealth | null;
  loading: boolean;
  error: string | null;
}

function metricBadge(value: string | number): string {
  const v = String(value);
  if (v.includes("%")) return v.startsWith("9") || v.startsWith("96") ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700";
  if (v.includes("ms")) return "bg-blue-100 text-blue-700";
  if (v.includes("s")) return "bg-yellow-100 text-yellow-700";
  return "bg-gray-100 text-gray-600";
}

export function SystemStatus({ health, loading, error }: SystemStatusProps) {
  const { t } = useTranslation();
  const { data: benchmark, loading: bmLoading, error: bmError } = useBenchmark();

  // Live system indicators
  // Derive hybrid search from available fields (backend may not return hybrid_search_enabled)
  const hasHybrid = (health?.streaming_retrieval?.includes("BM25") && health?.sync_retrieval?.includes("Chroma"))
    || health?.hybrid_search_enabled === true;

  const indicators = [
    { label: "LLM", ok: health?.llm_configured ?? false, detail: benchmark?.services?.llm ?? health?.model ?? "GLM-4-Flash" },
    { label: "Hybrid Search", ok: hasHybrid, detail: benchmark?.services?.hybrid_search ?? `${health?.streaming_retrieval ?? "—"} + ${health?.sync_retrieval ?? "—"}` },
    { label: "Guardrails", ok: health?.guardrails_enabled ?? false, detail: benchmark?.services?.guardrails ?? "Hallucination + Citation" },
    { label: "LangSmith", ok: health?.langsmith_enabled ?? false, detail: benchmark?.services?.langsmith ?? "Tracing + Metrics" },
    { label: "Index", ok: health?.index_status === "ok", detail: benchmark?.services?.index ?? "Chroma + BM25" },
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
          {bmLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="w-3 h-3 rounded-full bg-gray-300 animate-pulse" />
              Loading...
            </div>
          )}
          {bmError && (
            <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {t("systemStatus.unreachable", "Backend unreachable")}: {bmError}
            </div>
          )}
          {benchmark?.metrics ? (
            <div className="space-y-3">
              {benchmark.metrics.map((m) => (
                <div key={m.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{m.label}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${metricBadge(m.value)}`}>
                    {m.value}
                  </span>
                </div>
              ))}
            </div>
          ) : !bmLoading && !bmError ? (
            <div className="text-sm text-gray-400">
              {t("systemStatus.noBenchmark", "No benchmark data. Run eval first.")}
            </div>
          ) : null}
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
                } catch {
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
