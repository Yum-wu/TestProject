import { useState, useEffect } from "react";

interface StatsResponse {
  cache_hit_rate: number;
  query_count_24h: number;
  avg_retrieval_latency_ms: number;
  total_indexed_docs: number;
  total_chunks: number;
}

interface RecentQuery {
  query: string;
  sources_count: number;
  latency_ms: number;
  timestamp: string;
}

interface DashboardData {
  stats: StatsResponse | null;
  recentQueries: RecentQuery[];
  loading: boolean;
  error: string | null;
}

const STATS_URL = "/api/rag/stats";
const RECENT_URL = "/api/rag/queries/recent?limit=5";

export function useDashboardStats(): DashboardData {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [recentQueries, setRecentQueries] = useState<RecentQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      try {
        const [statsRes, recentRes] = await Promise.all([
          fetch(STATS_URL),
          fetch(RECENT_URL),
        ]);

        if (statsRes.ok) {
          const statsData: StatsResponse = await statsRes.json();
          if (!cancelled) setStats(statsData);
        }

        if (recentRes.ok) {
          const recentData = await recentRes.json();
          if (!cancelled) setRecentQueries(recentData.queries ?? []);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAll();
    const interval = setInterval(fetchAll, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { stats, recentQueries, loading, error };
}
