// Aureon — Enterprise AI Knowledge Base Platform
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LanguageSwitcher } from "./i18n/LanguageSwitcher";
import { useSystemHealth } from "./hooks/useSystemHealth";
import { useBenchmark } from "./hooks/useBenchmark";
import { Landing } from "./pages/Landing";
import { Dashboard } from "./pages/Dashboard";
import { Search } from "./pages/Search";
import { Documents } from "./pages/Documents";
import { CrewGenerator } from "./components/CrewGenerator";
import Login from "./pages/Login";
import Analytics from "./pages/Analytics";
import Benchmark from "./pages/Benchmark";
import Admin from "./pages/Admin";

/* ── StatusPill ── */
function StatusPill({ color, label }: { color: string; label: string }) {
  const colorMap: Record<string, string> = {
    green: "bg-green-100 text-green-700",
    blue: "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
    gray: "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorMap[color] || colorMap.gray}`} role="status">
      {label}
    </span>
  );
}

/* ── App Layout ── */
function AppLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  useSystemHealth();
  const { data: benchmark } = useBenchmark();

  const findMetric = (pat: string) =>
    benchmark?.metrics?.find((m: any) => m.label.includes(pat))?.value ?? null;
  const recallVal = findMetric("Recall@3 (Hybrid)");
  const latencyVal = findMetric("Retrieval Latency");

  const navItems = [
    { path: "/dashboard", key: "app.nav.dashboard" },
    { path: "/search", key: "app.nav.search" },
    { path: "/documents", key: "app.nav.documents" },
    { path: "/analytics", key: "app.nav.analytics" },
    { path: "/benchmark", key: "app.nav.benchmark" },
    { path: "/admin", key: "app.nav.admin" },
    { path: "/crew", key: "app.nav.crew" },
  ];

  const isLanding = location.pathname === "/";
  const isLogin = location.pathname === "/login";

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {!isLanding && !isLogin && (
        <nav className="flex items-center bg-white border-b border-gray-200 px-6 py-0" role="navigation">
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="mr-8 py-3 shrink-0 group"
          >
            <span className="text-base font-extrabold bg-gradient-to-r from-blue-600 to-amber-500 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-amber-600 transition-all">
              Aureon
            </span>
          </button>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  location.pathname.startsWith(item.path)
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {t(item.key)}
              </button>
            ))}
          </div>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-3">
            {recallVal && (
              <StatusPill color="green" label={String(recallVal)} />
            )}
            {latencyVal && (
              <StatusPill color="blue" label={String(latencyVal)} />
            )}
            <LanguageSwitcher />
          </div>
        </nav>
      )}

      <div className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/search" element={<Search />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/benchmark" element={<Benchmark />} />
          <Route path="/admin" element={<Admin />} />
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
