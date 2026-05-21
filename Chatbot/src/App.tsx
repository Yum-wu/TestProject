import { useState } from "react";
import { ChatWindow } from "./components/ChatWindow";
import { CrewGenerator } from "./components/CrewGenerator";

type Page = "chat" | "crew";

function App() {
  const [page, setPage] = useState<Page>("chat");

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Navigation */}
      <nav className="flex bg-white border-b border-gray-200 px-4">
        <button
          onClick={() => setPage("chat")}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
            page === "chat"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          AI 聊天
        </button>
        <button
          onClick={() => setPage("crew")}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
            page === "crew"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          文章生成
        </button>
      </nav>

      {/* Page content */}
      <div className="flex-1 overflow-hidden">
        {page === "chat" ? <ChatWindow /> : <CrewGenerator />}
      </div>
    </div>
  );
}

export default App;
