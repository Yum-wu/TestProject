import { useState, useEffect } from "react";

interface DocumentItem {
  title: string;
  source: string;
  file_type: string;
  chunk_count: number;
  status: string;
}

interface DocumentsData {
  documents: DocumentItem[];
  totalDocs: number;
  totalChunks: number;
  loading: boolean;
  error: string | null;
}

const DOCS_URL = "/api/rag/documents";

export function useDocuments(): DocumentsData {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [totalDocs, setTotalDocs] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchDocs() {
      try {
        const res = await fetch(DOCS_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setDocuments(data.documents ?? []);
          setTotalDocs(data.total_docs ?? 0);
          setTotalChunks(data.total_chunks ?? 0);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDocs();
    return () => { cancelled = true; };
  }, []);

  return { documents, totalDocs, totalChunks, loading, error };
}
