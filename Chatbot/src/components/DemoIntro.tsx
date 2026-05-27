// Revised: v2 — React Router, StatusBadges extraction, benchmark null-safety, metrics restructure
import { useTranslation } from "react-i18next";
import { SystemStatus } from "./SystemStatus";
import type { SystemHealth } from "../hooks/useSystemHealth";
import type { BenchmarkData } from "../hooks/useBenchmark";

interface CapabilityItem {
  icon: string;
  title: string;
  desc: string;
  metric: string;
}

interface DiffItem {
  icon: string;
  text: string;
}

interface DemoIntroProps {
  onNavigate: (page: "chat" | "rag" | "crew") => void;
  health: SystemHealth | null;
  loading: boolean;
  error: string | null;
  benchmark?: BenchmarkData | null;
}

export function DemoIntro({ onNavigate, health, loading, error, benchmark }: DemoIntroProps) {
  const { t } = useTranslation();

  const capabilities = t("demoIntro.capabilities", { returnObjects: true }) as CapabilityItem[];
  const diffItems = t("demoIntro.differentiators", { returnObjects: true }) as DiffItem[];

  // Derive metric values from benchmark (null-safe)
  const findMetric = (pat: string) =>
    benchmark?.metrics?.find(m => m.label.includes(pat))?.value ?? null;

  const recallVal = findMetric("Recall@3 (Hybrid)");
  const retrievalLatency = findMetric("Retrieval Latency");
  const ttft = findMetric("Streaming TTFT") ?? findMetric("TTFT");
  const fullLatency = findMetric("Full RAG Latency") ?? findMetric("RAG Latency");
  const llmCalls = findMetric("LLM Calls");
  const intentClass = findMetric("Intent Classification");
  const mmr = findMetric("MMR");
  const qaPairs = findMetric("Test QA Pairs");

  // Tier 1 — Decision Metrics
  const primaryMetrics = [
    { label: "Answer Accuracy", value: recallVal ?? "TBD", sub: "End-to-end correctness" },
    { label: "Response Latency", value: fullLatency ?? "≤3s", sub: "User-perceived total time" },
    { label: "Cost per Query", value: "~$0.001", sub: "Per-query average (GPT-4o-mini)" },
  ];

  // Tier 2 — Technical Metrics
  const technicalMetrics = [
    { label: "Recall@3 (Hybrid)", value: recallVal ?? "TBD" },
    { label: "Retrieval Latency", value: retrievalLatency ?? "TBD" },
    { label: "TTFT (Streaming)", value: ttft ?? "TBD" },
    { label: "Full RAG Latency", value: fullLatency ?? "TBD" },
    { label: "LLM Calls", value: llmCalls ?? "TBD" },
    { label: "Intent Classification", value: intentClass ?? "TBD" },
    { label: "MMR Optimization", value: mmr ?? "TBD" },
    { label: "Test QA Pairs", value: qaPairs ?? "TBD" },
  ];

  // Override capability metrics with real data
  if (benchmark?.metrics) {
    const denseRecall = findMetric("Recall@3 (Dense)");
    if (recallVal && capabilities[0]?.metric) {
      capabilities[0].metric = `Hybrid: ${recallVal} | Dense: ${denseRecall ?? "—"}`;
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* ── Hero ── */}
      <section className="px-6 pt-16 pb-12 text-center" style={{ background: "var(--gradient-hero)" }}>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 animate-fade-in-up">
          {t("demoIntro.hero.title")}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          {t("demoIntro.hero.subtitle")}
        </p>

        {/* Tier 1 — Decision Metrics (large cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          {primaryMetrics.map((m) => (
            <div key={m.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">{m.label}</p>
              <p className="text-3xl font-bold text-gray-900">{m.value}</p>
              <p className="text-xs text-gray-400 mt-1">{m.sub}</p>
            </div>
          ))}
        </div>

        {/* Tier 2 — Technical Metrics (small cards, 4-column) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          {technicalMetrics.map((m) => (
            <div key={m.label} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">{m.label}</p>
              <p className="text-lg font-semibold text-gray-800">{m.value}</p>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex justify-center gap-4 mt-8 flex-wrap animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <button
            onClick={() => onNavigate("chat")}
            className="text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-300 hover:scale-[1.02]"
            style={{ background: "var(--gradient-button)", boxShadow: "var(--shadow-button)" }}
          >
            {t("demoIntro.cta.chat")}
          </button>
          <button
            onClick={() => onNavigate("rag")}
            className="bg-white text-blue-600 border border-blue-200 px-6 py-2.5 rounded-lg font-medium hover:bg-blue-50 transition-all duration-300 hover:scale-[1.02]"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            {t("demoIntro.cta.rag")}
          </button>
          <button
            onClick={() => onNavigate("crew")}
            className="bg-white text-blue-600 border border-blue-200 px-6 py-2.5 rounded-lg font-medium hover:bg-blue-50 transition-all duration-300 hover:scale-[1.02]"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            {t("demoIntro.cta.crew")}
          </button>
        </div>
      </section>

      {/* ── Capability Cards ── */}
      <section className="px-6 py-12 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {capabilities.map((c) => (
            <div
              key={c.title}
              className="bg-white rounded-xl border border-gray-100 p-6 transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
              style={{ boxShadow: "var(--shadow-card)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-card-hover)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-card)"; }}
            >
              <div className="text-3xl mb-3">{c.icon}</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{c.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-3">{c.desc}</p>
              <span className="inline-block text-xs font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                {c.metric}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── RAG Quality & Observability Dashboard ── */}
      <SystemStatus health={health} loading={loading} error={error} />

      {/* ── Differentiators ── */}
      <section className="bg-gray-900 text-white px-6 py-10">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {diffItems.map((d) => (
            <div key={d.text} className="animate-fade-in-up">
              <div className="text-2xl mb-1">{d.icon}</div>
              <div className="text-sm text-gray-300">{d.text}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
