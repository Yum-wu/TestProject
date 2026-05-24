import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChatWindow } from "./components/ChatWindow";
import { RagQuery } from "./components/RagQuery";
import { CrewGenerator } from "./components/CrewGenerator";
import { DemoIntro } from "./components/DemoIntro";
import { LanguageSwitcher } from "./i18n/LanguageSwitcher";

type Page = "home" | "chat" | "rag" | "crew";

function App() {
  const { t } = useTranslation();
  const [page, setPage] = useState<Page>("home");

  const tabs: { key: Page; labelKey: string }[] = [
    { key: "chat", labelKey: "app.nav.chat" },
    { key: "rag", labelKey: "app.nav.rag" },
    { key: "crew", labelKey: "app.nav.crew" },
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Navigation */}
      <nav className="flex items-center bg-white border-b border-gray-200 px-4">
        <div className="flex-1 flex">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setPage(tab.key)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                page === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>
        {/* Performance badges — hidden on mobile */}
        <div className="hidden sm:flex items-center gap-3 mr-3">
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
            Recall 94%
          </span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
            Token ↓61%
          </span>
        </div>
        <LanguageSwitcher />
      </nav>

      {/* Page content */}
      <div className="flex-1 overflow-hidden">
        {page === "home" && <DemoIntro onNavigate={setPage} />}
        {page === "chat" && <ChatWindow />}
        {page === "rag" && <RagQuery />}
        {page === "crew" && <CrewGenerator />}
      </div>
    </div>
  );
}

export default App;
