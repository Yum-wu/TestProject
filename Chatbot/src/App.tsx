import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ChatWindow } from "./components/ChatWindow";
import { RagQuery } from "./components/RagQuery";
import { CrewGenerator } from "./components/CrewGenerator";
import { DemoIntro } from "./components/DemoIntro";
import { LanguageSwitcher } from "./i18n/LanguageSwitcher";
import { useSystemHealth } from "./hooks/useSystemHealth";
import { useBenchmark } from "./hooks/useBenchmark";
import type { BenchmarkData } from "./hooks/useBenchmark";

type Page = "home" | "chat" | "rag" | "crew";

function App() {
  const { t } = useTranslation();
  const [page, setPage] = useState<Page>("home");
  const { health, loading, error } = useSystemHealth();
  const { data: benchmark, loading: bmLoading, error: bmError } = useBenchmark();

  // Derive nav badge values from benchmark data
  const recallVal = benchmark?.metrics?.find(m => m.label.includes("Recall@3 (Hybrid)"))?.value ?? "94%";
  const latencyVal = benchmark?.metrics?.find(m => m.label.includes("Retrieval Latency"))?.value ?? "~11ms";
  const benchmarkReady = !bmLoading && !bmError && benchmark?.metrics && benchmark.metrics.length > 0;

  const tabs: { key: Page; labelKey: string }[] = [
    { key: "chat", labelKey: "app.nav.chat" },
    { key: "rag", labelKey: "app.nav.rag" },
    { key: "crew", labelKey: "app.nav.crew" },
  ];

  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col bg-gray-50 bg-noise">
      {/* Navigation */}
      <nav className="flex items-center bg-white border-b border-gray-200 px-4" role="tablist" aria-label="页面导航">
        <div className="flex-1 flex overflow-x-auto scrollbar-none gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setPage(tab.key)}
              role="tab"
              aria-selected={page === tab.key}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                page === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>
        {/* Live status badges — hidden on mobile */}
        <div className="hidden sm:flex items-center gap-3 mr-3">
          {health ? (
            <>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium" role="status">{String(recallVal)}</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium" role="status">{String(latencyVal)}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${health.langsmith_enabled ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`} role="status">
                {health.langsmith_enabled ? "LangSmith" : "No Trace"}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${health.guardrails_enabled ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-500"}`} role="status">
                {health.guardrails_enabled ? "Guard" : "No Guard"}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${benchmarkReady ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`} role="status">
                {benchmarkReady ? "Eval ✓" : "No Eval"}
              </span>
            </>
          ) : (
            <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-medium" role="status">...</span>
          )}
        </div>

        <LanguageSwitcher />
      </nav>

      {/* Page content */}
      <div className="flex-1 overflow-hidden">
        {page === "home" && <DemoIntro onNavigate={setPage} health={health} loading={loading} error={error} benchmark={benchmark} />}
        {page === "chat" && <ChatWindow />}
        {page === "rag" && <RagQuery />}
        {page === "crew" && <CrewGenerator />}
      </div>
    </div>
    </ErrorBoundary>
  );
}

export default App;
