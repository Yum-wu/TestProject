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

const BASE_URL =
  import.meta.env.VITE_API_RAG_URL
    ? (import.meta.env.VITE_API_RAG_URL as string).replace(/\/query$/, "")
    : "/api/rag";

export function useBenchmark() {
  const [data, setData] = useState<BenchmarkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchBenchmark() {
      try {
        // 1st: GET /benchmark (reads benchmark_results.json)
        let res = await fetch(`${BASE_URL}/benchmark`);
        let body: any = null;

        if (res.ok) {
          body = await res.json();
        } else {
          // 2nd fallback: GET /benchmark/history (take latest run)
          res = await fetch(`${BASE_URL}/benchmark/history?limit=1`);
          if (res.ok) {
            body = await res.json();
            const runs = body.runs ?? [];
            body = runs.length > 0 ? runs[0] : null;
          } else {
            throw new Error(`HTTP ${res.status}`);
          }
        }

        if (!cancelled) setData(body);
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
