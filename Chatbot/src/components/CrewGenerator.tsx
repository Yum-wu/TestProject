import { useState, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const CREW_API = "http://localhost:8001/api/crew";

interface CrewEvent {
  type: "agent_action" | "result" | "error" | "done";
  agent?: string;
  detail?: string;
  final_output?: string;
  duration_ms?: number;
  message?: string;
}

interface LogEntry {
  id: number;
  agent: string;
  status: "running" | "complete" | "error";
  detail: string;
  timestamp: number;
}

export function CrewLog({ entries }: { entries: LogEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
        Agent Progress
      </h3>
      <div className="space-y-1">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-start gap-3 text-sm px-3 py-2 rounded-lg bg-white border border-gray-100"
          >
            <span className="mt-0.5">
              {entry.status === "running" && (
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              )}
              {entry.status === "complete" && (
                <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
              )}
              {entry.status === "error" && (
                <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
              )}
            </span>
            <div className="flex-1 min-w-0">
              <span className="font-medium text-gray-800">{entry.agent}</span>
              <p className="text-gray-500 truncate">{entry.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CrewGenerator() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [article, setArticle] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const logIdRef = useRef(0);

  const addLog = useCallback(
    (agent: string, status: LogEntry["status"], detail: string) => {
      setLogs((prev) => [
        ...prev,
        { id: ++logIdRef.current, agent, status, detail, timestamp: Date.now() },
      ]);
    },
    []
  );

  const handleGenerate = async () => {
    const trimmed = topic.trim();
    if (!trimmed || trimmed.length < 2) {
      setError("Topic must be at least 2 characters");
      return;
    }

    setLoading(true);
    setLogs([]);
    setArticle(null);
    setDuration(null);
    setError(null);
    logIdRef.current = 0;

    try {
      const response = await fetch(`${CREW_API}/generate/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: trimmed }),
      });

      if (!response.ok) {
        const errBody = await response.text().catch(() => "");
        throw new Error(
          errBody || `Request failed (${response.status})`
        );
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Cannot read response stream");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || !trimmedLine.startsWith("data:")) continue;

          const data = trimmedLine.slice(5).trim();
          try {
            const event: CrewEvent = JSON.parse(data);
            handleEvent(event);
          } catch {
            // skip unparseable events
          }
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Network error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEvent = (event: CrewEvent) => {
    switch (event.type) {
      case "agent_action":
        addLog(
          event.agent || "Agent",
          "running",
          event.detail?.slice(0, 120) || "Working..."
        );
        break;
      case "result":
        setArticle(event.final_output || "");
        setDuration(event.duration_ms || null);
        break;
      case "error":
        setError(event.message || "Unknown error");
        break;
      case "done":
        // stream complete
        break;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Input area */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <label
          htmlFor="topic-input"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Article Topic
        </label>
        <div className="flex gap-3">
          <input
            id="topic-input"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !loading) handleGenerate();
            }}
            placeholder="Enter a topic for the AI agent team to write about..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            disabled={loading}
            minLength={2}
            maxLength={500}
          />
          <button
            onClick={handleGenerate}
            disabled={loading || topic.trim().length < 2}
            className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading && logs.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            Initializing AI agent team...
          </div>
        )}

        <CrewLog entries={logs} />

        {duration !== null && loading && (
          <div className="text-center text-xs text-gray-400">
            Running: Researcher → Writer → Editor
          </div>
        )}

        {article && (
          <div className="space-y-4">
            {duration !== null && (
              <div className="text-xs text-gray-400 text-right">
                Completed in {(duration / 1000).toFixed(1)}s
              </div>
            )}
            <div className="bg-white border border-gray-200 rounded-lg px-6 py-4 prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {article}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
