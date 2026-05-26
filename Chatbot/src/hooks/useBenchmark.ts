import { useState, useEffect } from "react";

export interface BenchmarkMetric {
  label: string;
  value: string | number;
  detail: string;
}

export interface BenchmarkData {
  timestamp: string | null;
  metrics: BenchmarkMetric[];
  services: Record<string, string>;
}

const BENCHMARK_URL =
  (import.meta.env.VITE_API_RAG_URL as string)?.replace(/\/query$/, "") + "/benchmark" ||
  "/api/rag/benchmark";

export function useBenchmark() {
  const [data, setData] = useState<BenchmarkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchBenchmark() {
      try {
        const res = await fetch(BENCHMARK_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const result: BenchmarkData = await res.json();
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchBenchmark();
    return () => { cancelled = true; };
  }, []);

  return { data, loading, error };
}
