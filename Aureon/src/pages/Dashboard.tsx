import { useTranslation } from "react-i18next";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { useBenchmark } from "../hooks/useBenchmark";

export function Dashboard() {
  const { t } = useTranslation();
  const { stats, recentQueries } = useDashboardStats();
  const { data: benchmark } = useBenchmark();

  const findMetric = (pat: string) =>
    benchmark?.metrics?.find((m: any) => m.label.includes(pat))?.value ?? null;
  const ttftVal = findMetric("Streaming TTFT") || findMetric("TTFT") || "—";
  const retrievalLatency = findMetric("Retrieval Latency") || "—";

  return (
    <div className="h-full overflow-y-auto px-6 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t("dashboard.title")}</h1>

      {/* Row 1 — 3 big metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t("dashboard.metrics.retrieval_latency")}</p>
          <p className="text-3xl font-bold text-gray-900">{retrievalLatency}</p>
          <p className="text-xs text-gray-400 mt-1">avg retrieval time</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t("dashboard.metrics.ttft")}</p>
          <p className="text-3xl font-bold text-gray-900">{ttftVal}</p>
          <p className="text-xs text-gray-400 mt-1">time to first token</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t("dashboard.metrics.cache_hit")}</p>
          <p className="text-3xl font-bold text-gray-900">
            {stats ? `${(stats.cache_hit_rate * 100).toFixed(0)}%` : "—"}
          </p>
          <p className="text-xs text-gray-400 mt-1">semantic cache</p>
        </div>
      </div>

      {/* Row 2 — two panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* System Health */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">{t("dashboard.health.title")}</h2>
          <div className="space-y-3">
            {[
              { label: t("dashboard.health.llm"), ok: true, detail: "GLM-4-Flash" },
              { label: t("dashboard.health.vector_db"), ok: true, detail: "Chroma" },
              { label: t("dashboard.health.embedding"), ok: true, detail: "BGE 512d" },
              { label: t("dashboard.health.cache"), ok: true, detail: "Redis" },
              { label: t("dashboard.health.tracing"), ok: true, detail: "LangSmith" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${item.ok ? "bg-green-500" : "bg-red-400"}`} />
                  <span className="text-sm text-gray-600">{item.label}</span>
                </div>
                <span className="text-xs text-gray-400">{item.detail}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Queries */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">{t("dashboard.recent_queries.title")}</h2>
          {recentQueries.length > 0 ? (
            <div className="space-y-2">
              {recentQueries.map((q, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-700 truncate max-w-[200px]">{q.query}</span>
                  <span className="text-xs text-gray-400 shrink-0 ml-2">{q.sources_count} src · {(q.latency_ms / 1000).toFixed(1)}s</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">{t("dashboard.recent_queries.empty")}</p>
          )}
        </div>
      </div>

      {/* Row 3 — bottom stats */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500">{t("dashboard.stats.indexed_docs")}</p>
            <p className="text-xl font-bold text-gray-800">{stats?.total_indexed_docs ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">{t("dashboard.stats.total_chunks")}</p>
            <p className="text-xl font-bold text-gray-800">{stats?.total_chunks ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">{t("dashboard.stats.avg_latency")}</p>
            <p className="text-xl font-bold text-gray-800">
              {stats ? `${stats.avg_retrieval_latency_ms}ms` : "—"}
            </p>
          </div>
        </div>
        {stats && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-1">{t("dashboard.query_volume")}: <strong className="text-gray-800">{stats.query_count_24h}</strong></p>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((stats.query_count_24h / 200) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
