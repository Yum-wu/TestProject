// Revised: v2 — React Router, StatusBadges extraction, benchmark null-safety, metrics restructure
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ChatWindow } from "./components/ChatWindow";
import { RagQuery } from "./components/RagQuery";
import { CrewGenerator } from "./components/CrewGenerator";
import { DemoIntro } from "./components/DemoIntro";
import { LanguageSwitcher } from "./i18n/LanguageSwitcher";
import { useSystemHealth } from "./hooks/useSystemHealth";
import { useBenchmark } from "./hooks/useBenchmark";

/* ── StatusPill ── */
function StatusPill({ color, label, compact = false }: {
  color: "green" | "blue" | "purple" | "gray" | "red";
  label: string;
  compact?: boolean;
}) {
  const colorMap = {
    green: "bg-green-100 text-green-700",
    blue: "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
    gray: "bg-gray-100 text-gray-500",
    red: "bg-red-100 text-red-600",
  };

  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorMap[color]} ${compact ? "max-w-[80px] truncate" : ""}`}
      role="status"
    >
      {label}
    </span>
  );
}

/* ── StatusBadges ── */
function StatusBadges({ health, healthError, benchmark, bmLoading, bmError }: {
  health: any;
  healthError: string | null;
  benchmark: any;
  bmLoading: boolean;
  bmError: string | null;
}) {
  const benchmarkReady = !bmLoading && !bmError && benchmark?.metrics && benchmark.metrics.length > 0;

  const recallVal = benchmark?.metrics?.find((m: any) => m.label.includes("Recall@3 (Hybrid)"))?.value ?? null;
  const latencyVal = benchmark?.metrics?.find((m: any) => m.label.includes("Retrieval Latency"))?.value ?? null;

  // State A — Loading
  if (!health && !healthError) {
    return (
      <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-medium animate-pulse" role="status">
        Loading...
      </span>
    );
  }

  // State B — Error / Benchmark unavailable
  if (healthError || !benchmarkReady) {
    return (
      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium" role="status">
        Service Unavailable
      </span>
    );
  }

  // State C — Normal
  return (
    <>
      {/* Desktop: full badges */}
      <div className="hidden md:flex items-center gap-2 mr-3">
        <StatusPill color="green" label={String(recallVal)} />
        <StatusPill color="blue" label={String(latencyVal)} />
        <StatusPill color={health.langsmith_enabled ? "blue" : "gray"} label={health.langsmith_enabled ? "LangSmith" : "No Trace"} />
        <StatusPill color={health.guardrails_enabled ? "purple" : "gray"} label={health.guardrails_enabled ? "Guard" : "No Guard"} />
        <StatusPill color={benchmarkReady ? "green" : "gray"} label={benchmarkReady ? "Eval ✓" : "No Eval"} />
      </div>

      {/* Mobile: compact — recall + latency only */}
      <div className="flex md:hidden items-center gap-1 mr-2">
        <StatusPill color="green" label={String(recallVal)} compact />
        <StatusPill color="blue" label={String(latencyVal)} compact />
      </div>
    </>
  );
}

/* ── App Layout (must be inside BrowserRouter) ── */
function AppLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { health, loading, error } = useSystemHealth();
  const { data: benchmark, loading: bmLoading, error: bmError } = useBenchmark();

  const tabs = [
    { key: "/", labelKey: "app.nav.home" },
    { key: "/chat", labelKey: "app.nav.chat" },
    { key: "/rag", labelKey: "app.nav.rag" },
    { key: "/crew", labelKey: "app.nav.crew" },
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50 bg-noise">
      {/* Navigation */}
      <nav className="flex items-center bg-white border-b border-gray-200 px-4" role="tablist" aria-label="页面导航">
        <div className="flex-1 flex overflow-x-auto scrollbar-none gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => navigate(tab.key)}
              role="tab"
              aria-selected={location.pathname === tab.key}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                location.pathname === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>

        <StatusBadges health={health} healthError={error} benchmark={benchmark} bmLoading={bmLoading} bmError={bmError} />
        <LanguageSwitcher />
      </nav>

      {/* Page content */}
      <div className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={
            <DemoIntro
              onNavigate={(page) => navigate(`/${page}`)}
              health={health}
              loading={loading}
              error={error}
              benchmark={benchmark}
            />
          } />
          <Route path="/chat" element={<ChatWindow />} />
          <Route path="/rag" element={<RagQuery />} />
          <Route path="/crew" element={<CrewGenerator />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
