import { useState, useEffect, useCallback } from 'react';

interface UsageData {
  timeRange: string;
  total: number;
  perHour: number;
  byIntent: Record<string, number>;
  trend: { change: number; period: string };
}

interface LatencyData {
  timeRange: string;
  avg: number;
  p95: number;
  p99: number;
  breakdown: { retrieval: number; llm_first_token: number; llm_generation: number };
  trend: { avg_change: number; period: string };
}

interface TokenData {
  timeRange: string;
  input: number;
  output: number;
  total: number;
  cost: number;
  costPerQuery: number;
  model: string;
  trend: { input_change: number; output_change: number; period: string };
}

interface CacheData {
  hitRate: number;
  saves: number;
  latencyReduction: number;
  memoryUsage: string;
}

interface AnalyticsHook {
  usage: UsageData | null;
  latency: LatencyData | null;
  tokens: TokenData | null;
  cache: CacheData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useAnalytics(timeRange: string = '24h'): AnalyticsHook {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [latency, setLatency] = useState<LatencyData | null>(null);
  const [tokens, setTokens] = useState<TokenData | null>(null);
  const [cache, setCache] = useState<CacheData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [usageRes, latencyRes, tokensRes, cacheRes] = await Promise.all([
        fetch(`/api/rag/analytics/usage?time_range=${timeRange}`),
        fetch(`/api/rag/analytics/latency?time_range=${timeRange}`),
        fetch(`/api/rag/analytics/tokens?time_range=${timeRange}`),
        fetch('/api/rag/analytics/cache'),
      ]);

      if (!usageRes.ok || !latencyRes.ok || !tokensRes.ok || !cacheRes.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const [usageData, latencyData, tokensData, cacheData] = await Promise.all([
        usageRes.json(),
        latencyRes.json(),
        tokensRes.json(),
        cacheRes.json(),
      ]);

      setUsage(usageData);
      setLatency(latencyData);
      setTokens(tokensData);
      setCache(cacheData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  return {
    usage,
    latency,
    tokens,
    cache,
    loading,
    error,
    refresh: fetchData,
  };
}
