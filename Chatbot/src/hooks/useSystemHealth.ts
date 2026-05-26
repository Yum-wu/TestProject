import { useState, useEffect } from "react";

export interface SystemHealth {
  status: string;
  llm_configured: boolean;
  index_status: string;
  test_qa_pairs: number;
  hybrid_search_enabled: boolean;
  guardrails_enabled: boolean;
  langsmith_enabled: boolean;
}

const HEALTH_URL =
  (import.meta.env.VITE_API_RAG_URL as string)?.replace(/\/query$/, "") + "/health" ||
  "/api/rag/health";

export function useSystemHealth() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchHealth() {
      try {
        const res = await fetch(HEALTH_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: SystemHealth = await res.json();
        if (!cancelled) setHealth(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchHealth();
    // Poll every 30s for live updates
    const interval = setInterval(fetchHealth, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { health, loading, error };
}
